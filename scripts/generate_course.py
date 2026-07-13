"""
generate_course.py
Genera un curso completo (lecciones en español + quiz por lección) con Groq,
a partir de un temario en scripts/course-specs/<id>.json.

Salida: extra-courses/<id>.json  (formato OTA listo para build-content.mjs)

Uso:
    set GROQ_API_KEY=tu_key
    python scripts/generate_course.py --spec scripts/course-specs/python-ia.json
    python scripts/generate_course.py --spec ... --resume     (retoma si se cortó)

Son 2 llamadas por lección (contenido + quiz) con pausa de 65s entre llamadas:
un curso de 20 lecciones tarda ~45 min. Al final:
    node scripts/build-content.mjs   y subir content/ a Supabase.
"""

import json, os, sys, time, argparse, io, re
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / 'extra-courses'
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
THROTTLE_S = 65

MODELS = [
    'openai/gpt-oss-120b',
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
]

LESSON_SYSTEM = """Eres un autor de cursos de programación en Python, escribiendo en español latinoamericano NEUTRO (nada de voseo: usa "tú/escribe/puedes", nunca "vos/escribí/podés").

Escribe UNA lección de curso en Markdown con esta estructura exacta:

# <Título de la lección>

## Introducción
(2-3 párrafos: qué se aprende y por qué importa en la práctica)

## Conceptos clave
(lista de 3-5 conceptos con definición breve en negrita)

## Desarrollo
(el cuerpo de la lección: explica paso a paso con subtítulos ###, incluye 3-6 bloques de código Python con ```python, cada uno con su explicación; ejemplos originales, realistas y en español)

## Errores comunes
(2-3 errores típicos del principiante en este tema y cómo evitarlos)

## Resumen
(lista breve de lo esencial que hay que recordar)

Reglas:
- SOLO devuelve el Markdown de la lección, sin comentarios extra.
- Código correcto y ejecutable; nombres de variables en español.
- Largo objetivo: 600-900 palabras.
- No menciones otras plataformas ni cursos externos."""

QUIZ_SYSTEM = """Eres un generador de quizzes para un curso de Python en español latinoamericano neutro.
Dado el contenido de una lección, genera exactamente 4 preguntas de opción múltiple.
Responde SOLO con JSON válido, sin markdown:
{
  "questions": [
    {"question": "...", "options": ["...","...","...","..."], "correct": 0, "explanation": "..."}
  ]
}
Reglas: opciones sin prefijos A)/B); "correct" es el índice 0-3; preguntas basadas en el contenido; 2 conceptuales, 1 de código, 1 de aplicación; español neutro sin voseo."""


def call_groq(system, user, model, max_tokens):
    from groq import Groq
    client = Groq(api_key=GROQ_API_KEY)
    resp = client.chat.completions.create(
        model=model,
        messages=[{'role': 'system', 'content': system}, {'role': 'user', 'content': user}],
        temperature=0.6,
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content or ''


def with_fallback(fn):
    last = None
    for model in MODELS:
        try:
            print(f'      {model}', end=' ... ', flush=True)
            out = fn(model)
            print('OK')
            return out
        except Exception as e:
            print(f'error: {e}')
            last = e
            time.sleep(5)
    raise RuntimeError(f'todos los modelos fallaron: {last}')


def gen_lesson(course_title, chapter_title, lesson):
    prompt = (
        f'Curso: "{course_title}"\nCapítulo: "{chapter_title}"\n'
        f'Lección: "{lesson["title"]}"\n\n'
        f'Temas que DEBE cubrir esta lección:\n{lesson["topics"]}\n\n'
        f'Escribe la lección completa.'
    )
    def run(model):
        md = call_groq(LESSON_SYSTEM, prompt, model, 2400).strip()
        if len(md) < 800 or not md.startswith('#'):
            raise ValueError(f'lección demasiado corta o sin título ({len(md)} chars)')
        return md
    return with_fallback(run)


def gen_quiz(content):
    def run(model):
        raw = call_groq(QUIZ_SYSTEM, f'Contenido de la lección:\n\n{content[:3500]}', model, 1200)
        m = re.search(r'\{[\s\S]*\}', raw)
        if not m:
            raise ValueError('sin JSON')
        qs = json.loads(m.group())['questions'][:4]
        assert len(qs) == 4
        for q in qs:
            assert len(q['options']) == 4 and 0 <= q['correct'] <= 3 and q['explanation']
        return qs
    return with_fallback(run)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--spec', required=True, help='ruta del temario (course-specs/*.json)')
    ap.add_argument('--resume', action='store_true')
    args = ap.parse_args()

    if not GROQ_API_KEY:
        print('ERROR: falta GROQ_API_KEY')
        sys.exit(1)

    spec = json.loads(Path(args.spec).read_text(encoding='utf-8'))
    OUT_DIR.mkdir(exist_ok=True)
    ckpt_path = OUT_DIR / f'.checkpoint-{spec["id"]}.json'

    done = {}
    if args.resume and ckpt_path.exists():
        done = json.loads(ckpt_path.read_text(encoding='utf-8'))
        print(f'Retomando: {len(done)} lecciones ya generadas.')

    lessons_flat = [(ch, l) for ch in spec['chapters'] for l in ch['lessons']]
    total = len(lessons_flat)

    for i, (ch, l) in enumerate(lessons_flat, 1):
        if l['id'] in done:
            continue
        print(f'\n[{i}/{total}] {ch["title"]} → {l["title"]}')
        print('   contenido:')
        content = gen_lesson(spec['title'], ch['title'], l)
        time.sleep(THROTTLE_S)
        print('   quiz:')
        quiz = gen_quiz(content)
        done[l['id']] = {'content': content, 'quiz': quiz}
        ckpt_path.write_text(json.dumps(done, ensure_ascii=False), encoding='utf-8')
        if i < total:
            print(f'   esperando {THROTTLE_S}s...')
            time.sleep(THROTTLE_S)

    # Ensamblar el curso final en formato OTA
    chapters = []
    for ch in spec['chapters']:
        lessons = []
        for l in ch['lessons']:
            d = done[l['id']]
            lessons.append({
                'id': l['id'],
                'title': l['title'],
                'content': d['content'],
                'word_count': len(d['content'].split()),
                'quiz': d['quiz'],
            })
        chapters.append({
            'id': ch['id'], 'title': ch['title'], 'description': '',
            'lesson_count': len(lessons), 'lessons': lessons,
        })

    course = {
        'id': spec['id'],
        'title': spec['title'],
        'language': spec.get('language', 'python'),
        'version': 1,
        'chapter_count': len(chapters),
        'total_lessons': sum(c['lesson_count'] for c in chapters),
        'chapters': chapters,
    }

    out = OUT_DIR / f'{spec["id"]}.json'
    out.write_text(json.dumps(course, ensure_ascii=False), encoding='utf-8')
    print(f'\nCurso generado: {out} ({course["total_lessons"]} lecciones)')
    print('Ahora: node scripts/build-content.mjs  y subir content/ a Supabase.')


if __name__ == '__main__':
    main()
