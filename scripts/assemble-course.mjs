// Ensambla un curso desde los archivos generados por los agentes:
//   extra-courses/src/<courseId>/<chapterId>/<lessonId>.md   (contenido)
//   extra-courses/src/<courseId>/<chapterId>/quizzes.json    ({lessonId: [4 preguntas]})
// → extra-courses/<courseId>.json  (formato OTA; build-content.mjs lo incluye)
//
// Uso: node scripts/assemble-course.mjs scripts/course-specs/python-ia.json

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const specPath = process.argv[2]
if (!specPath) { console.error('Uso: node scripts/assemble-course.mjs <spec.json>'); process.exit(1) }

const spec = JSON.parse(readFileSync(join(root, specPath), 'utf8'))
const srcDir = join(root, 'extra-courses', 'src', spec.id)

let missing = 0
const chapters = []

for (const ch of spec.chapters) {
  const chDir = join(srcDir, ch.id)
  const quizPath = join(chDir, 'quizzes.json')
  const quizzes = existsSync(quizPath) ? JSON.parse(readFileSync(quizPath, 'utf8')) : {}

  const lessons = []
  for (const l of ch.lessons) {
    const mdPath = join(chDir, `${l.id}.md`)
    if (!existsSync(mdPath)) {
      console.warn(`  FALTA: ${ch.id}/${l.id}.md`)
      missing++
      continue
    }
    const content = readFileSync(mdPath, 'utf8').trim()
    const quiz = quizzes[l.id] ?? []
    if (quiz.length < 4) console.warn(`  quiz incompleto (${quiz.length}/4): ${l.id}`)
    lessons.push({
      id: l.id,
      title: l.title,
      content,
      word_count: content.split(/\s+/).length,
      quiz,
    })
  }
  chapters.push({
    id: ch.id, title: ch.title, description: '',
    lesson_count: lessons.length, lessons,
  })
}

if (missing > 0) {
  console.error(`\n${missing} lecciones faltantes — ensamblado INCOMPLETO (no se escribió el curso).`)
  process.exit(1)
}

const course = {
  id: spec.id,
  title: spec.title,
  language: spec.language ?? 'python',
  version: 1,
  chapter_count: chapters.length,
  total_lessons: chapters.reduce((a, c) => a + c.lesson_count, 0),
  chapters,
}

const out = join(root, 'extra-courses', `${spec.id}.json`)
writeFileSync(out, JSON.stringify(course))
console.log(`Curso ensamblado: ${out} (${course.total_lessons} lecciones)`)
console.log('Ahora: node scripts/build-content.mjs')
