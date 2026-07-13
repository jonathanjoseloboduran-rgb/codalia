"""
import_exercises.py
Importa los ejercicios generados (en python-course-app/exercises*.json):
 1. Fusiona los checkpoints (el más nuevo pisa al más viejo)
 2. Remapea claves: source_lesson (frontmatter) → lessonId de la app
 3. Valida cada ejercicio ejecutando la solución contra sus tests
 4. Conserva los ejercicios existentes hechos a mano
 5. Escribe src/data/exercises.json

Uso:  python scripts/import_exercises.py
"""

import json, re, sys, subprocess, io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = Path('C:/Users/Jonathan Lobo/Documents/python-course-app')
SOURCES = ['exercises.json', 'exercises (1).json', 'exercises (2).json']  # orden: viejo → nuevo
COURSE = ROOT / 'src' / 'data' / 'course_es.json'
OUT = ROOT / 'src' / 'data' / 'exercises.json'

# 1. Fusionar checkpoints
merged = {}
for name in SOURCES:
    p = SRC_DIR / name
    if p.exists():
        data = json.loads(p.read_text(encoding='utf-8'))
        merged.update(data)
        print(f'{name}: {len(data)} lecciones')
print(f'Fusionado: {len(merged)} lecciones con ejercicio\n')

# 2. Mapa source_lesson → lessonId de la app. Se construye desde course_es y
#    se completa con course_raw.json (el original conserva TODOS los frontmatter).
src_to_app = {}
for course_file in [COURSE, SRC_DIR / 'course_raw.json']:
    if not course_file.exists():
        continue
    course = json.loads(course_file.read_text(encoding='utf-8'))
    for c in course['courses']:
        for ch in c['chapters']:
            for l in ch['lessons']:
                m = re.search(r'source_lesson:\s*"([^"]+)"', l.get('raw_content', ''))
                if m and m.group(1) not in src_to_app:
                    src_to_app[m.group(1)] = l['id']
print(f'Mapa de IDs: {len(src_to_app)} lecciones\n')

# 3. Validar cada ejercicio (solución debe pasar sus tests)
def validate(ex):
    tests = ex.get('tests', [])
    if not (ex.get('prompt') and ex.get('solution') and ex.get('starter') and tests):
        return 'estructura incompleta'
    harness = ex['solution'] + '\n\nimport json as _j\n_T = _j.loads(r"""' + json.dumps(tests) + '""")\n'
    harness += 'for _t in _T:\n    assert eval(_t["call"]) == eval(_t["expected"]), _t["call"]\nprint("OK")\n'
    try:
        r = subprocess.run([sys.executable, '-c', harness], capture_output=True, text=True, timeout=8)
        if r.returncode == 0 and 'OK' in r.stdout:
            return None
        return (r.stderr or 'falló').strip().splitlines()[-1][:100]
    except Exception as e:
        return str(e)[:100]

# Cargar los existentes (hechos a mano — tienen prioridad)
existing = json.loads(OUT.read_text(encoding='utf-8')) if OUT.exists() else {}
print(f'Ejercicios existentes (se conservan): {len(existing)}\n')

ok, bad, unmapped, skipped = 0, 0, 0, 0
result = dict(existing)

for src_id, ex_list in merged.items():
    app_id = src_to_app.get(src_id)
    if not app_id:
        print(f'  SIN MAPA: {src_id}')
        unmapped += 1
        continue
    if app_id in existing:
        skipped += 1
        continue
    valid = []
    for i, ex in enumerate(ex_list, 1):
        err = validate(ex)
        if err:
            print(f'  INVALIDO {app_id}: {err}')
            bad += 1
        else:
            ex['id'] = f'{app_id}-ex{i}'
            valid.append(ex)
            ok += 1
    if valid:
        result[app_id] = valid

OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'\nValidados OK: {ok} | Inválidos (descartados): {bad} | Sin mapa: {unmapped} | Ya existían: {skipped}')
print(f'Total lecciones con ejercicio: {len(result)} / 115')
print(f'Guardado en {OUT}')
