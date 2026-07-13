"""
generate_exercises.py
Genera 1 ejercicio de código autocorregible por lección usando Groq, y
VALIDA cada uno corriendo la solución contra los tests antes de guardarlo.

Salida: src/data/exercises.json  (keyed por lessonId)
Luego:  node scripts/build-content.mjs  (mete los ejercicios en el contenido)
        y subís content/ a Supabase.

Uso:
    set GROQ_API_KEY=tu_key            (Windows CMD)   o   export GROQ_API_KEY=...
    python scripts/generate_exercises.py --resume
    python scripts/generate_exercises.py --course python-fundamentals
"""

import json, os, sys, time, argparse, io, re, subprocess
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = Path(__file__).resolve().parent.parent
COURSES_DIR = ROOT / 'content' / 'courses'
OUT = ROOT / 'src' / 'data' / 'exercises.json'
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
THROTTLE_S = 65
MAX_CONTENT = 3500

MODELS = [
    'openai/gpt-oss-120b',
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
]

SYSTEM = """Eres un generador de ejercicios de programación Python para un curso en español latinoamericano neutro.
Dado el contenido de una lección, creás UN ejercicio práctico de código, autocorregible.

Respondé SOLO con JSON válido, sin markdown. Dos formatos posibles:

Si la lección SÍ permite un ejercicio de código con una función:
{
  "prompt": "enunciado claro en español, menciona el nombre exacto de la función a escribir",
  "starter": "def nombre(args):\\n    # tu código aquí\\n    pass",
  "solution": "def nombre(args):\\n    return ...",
  "tests": [
    {"call": "nombre(2, 3)", "expected": "5"},
    {"call": "nombre(0, 0)", "expected": "0"},
    {"call": "nombre(-1, 1)", "expected": "0"}
  ]
}

Si la lección es conceptual y NO se presta a un ejercicio de código simple:
{"skip": true}

Reglas estrictas:
- El ejercicio debe basarse en lo que enseña la lección.
- Definí UNA función. "call" son llamadas a esa función; "expected" es el resultado como literal Python (ej: 5, "texto", [1,2], True).
- La "solution" DEBE pasar los 3 tests. Verificá mentalmente antes de responder.
- Solo Python estándar, sin imports raros ni input(). Nada de print en la solución.
- Todo el texto en español neutro, sin voseo argentino."""


def call_groq(content, model):
    from groq import Groq
    client = Groq(api_key=GROQ_API_KEY)
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {'role': 'system', 'content': SYSTEM},
            {'role': 'user', 'content': f'Contenido de la lección:\n\n{content[:MAX_CONTENT]}'},
        ],
        temperature=0.5,
        max_tokens=900,
    )
    raw = resp.choices[0].message.content or ''
    m = re.search(r'\{[\s\S]*\}', raw)
    if not m:
        raise ValueError('sin JSON')
    return json.loads(m.group())


def validate(ex):
    """Corre la solución + tests en un subproceso. True si pasa todo."""
    tests = ex.get('tests', [])
    if not (ex.get('prompt') and ex.get('solution') and ex.get('starter') and len(tests) >= 1):
        return False
    harness = ex['solution'] + '\n\nimport json as _j\n_T = _j.loads(r"""' + json.dumps(tests) + '""")\n'
    harness += 'for _t in _T:\n    assert eval(_t["call"]) == eval(_t["expected"]), _t["call"]\nprint("OK")\n'
    try:
        r = subprocess.run([sys.executable, '-c', harness], capture_output=True, text=True, timeout=8)
        return r.returncode == 0 and 'OK' in r.stdout
    except Exception:
        return False


def generate_for_lesson(content):
    """Devuelve (exercise_list, skipped_bool). Reintenta entre modelos."""
    last = None
    for model in MODELS:
        try:
            print(f'    {model}', end=' ... ', flush=True)
            data = call_groq(content, model)
            if data.get('skip'):
                print('skip (conceptual)')
                return [], True
            ex = {
                'id': '',  # se setea afuera
                'prompt': data['prompt'].strip(),
                'starter': data['starter'],
                'solution': data['solution'],
                'tests': data['tests'][:3],
            }
            if validate(ex):
                print('OK (validado)')
                return [ex], False
            print('falló validación')
            last = 'validación'
        except Exception as e:
            print(f'error: {e}')
            last = e
        time.sleep(4)
    print(f'    >> no se pudo generar ({last})')
    return [], False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--resume', action='store_true', help='saltar lecciones ya procesadas')
    ap.add_argument('--course', help='solo este curso (id)')
    args = ap.parse_args()

    if not GROQ_API_KEY:
        print('ERROR: falta GROQ_API_KEY')
        sys.exit(1)

    existing = {}
    if OUT.exists():
        existing = json.loads(OUT.read_text(encoding='utf-8'))

    files = sorted(COURSES_DIR.glob('*.json'))
    if args.course:
        files = [f for f in files if f.stem == args.course]

    lessons = []
    for f in files:
        course = json.loads(f.read_text(encoding='utf-8'))
        for ch in course['chapters']:
            for l in ch['lessons']:
                lessons.append((l['id'], l['title'], l.get('content', '')))

    total = len(lessons)
    gen = skipped = errs = 0
    print(f'\nProcesando {total} lecciones...\n')

    for i, (lid, title, content) in enumerate(lessons, 1):
        if args.resume and lid in existing:
            continue
        print(f'[{i}/{total}] {title[:55]}')
        ex_list, was_skip = generate_for_lesson(content)
        for ex in ex_list:
            ex['id'] = f'{lid}-ex1'
        existing[lid] = ex_list          # [] = saltado/sin ejercicio
        if was_skip: skipped += 1
        elif ex_list: gen += 1
        else: errs += 1

        OUT.write_text(json.dumps(existing, ensure_ascii=False, indent=2), encoding='utf-8')

        if i < total:
            print(f'    esperando {THROTTLE_S}s...')
            time.sleep(THROTTLE_S)

    print(f'\nListo: {gen} ejercicios generados, {skipped} conceptuales (sin ejercicio), {errs} fallidos.')
    print(f'Archivo: {OUT}')
    print('Ahora: node scripts/build-content.mjs  y subí content/ a Supabase.')


if __name__ == '__main__':
    main()
