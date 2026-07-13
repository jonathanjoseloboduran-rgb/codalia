// Genera el contenido en formato "over-the-air" a partir de:
//   - las traducciones .md de Gemini (fuente de verdad del texto)
//   - course_es.json (estructura + IDs estables, para que los quizzes encajen)
//   - quizzes.json (quizzes por lección)
//
// Salidas:
//   content/catalog.json            ← catálogo (subir a Supabase)
//   content/courses/<id>.json       ← curso autocontenido c/ quizzes adentro
//   src/data/bundled/catalog.json   ← fallback offline (bundleado en el APK)
//   src/data/bundled/<primer-curso>.json
//
// Para regenerar tras editar/agregar .md:  node scripts/build-content.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dataDir = join(root, 'src', 'data')

// Carpeta con los .md traducidos (las carpetas <curso>_traducido_md/<capitulo>/)
const TRANSLATIONS_ROOT = 'C:/Users/Jonathan Lobo/Documents/python-course-app/the-dev-handbook/python'

const course_es = JSON.parse(readFileSync(join(dataDir, 'course_es.json'), 'utf8'))
const quizzes   = JSON.parse(readFileSync(join(dataDir, 'quizzes.json'), 'utf8'))
const paths     = JSON.parse(readFileSync(join(dataDir, 'learning_paths.json'), 'utf8'))
const exercises = existsSync(join(dataDir, 'exercises.json'))
  ? JSON.parse(readFileSync(join(dataDir, 'exercises.json'), 'utf8'))
  : {}

const META = {
  'python-fundamentals':    { icon: '🐍', color: '#3B82F6', premium: false },
  'python-architecture':    { icon: '🏛️', color: '#8B5CF6', premium: true },
  'python-concurrency':     { icon: '⚡', color: '#10B981', premium: true },
  'python-metaprogramming': { icon: '🪄', color: '#F59E0B', premium: true },
  'python-performance':     { icon: '🚀', color: '#EF4444', premium: true },
  // Cursos generados con generate_course.py (viven en extra-courses/)
  'python-ia':              { icon: '🤖', color: '#10B981', premium: true },
  'python-data-science':    { icon: '📊', color: '#F59E0B', premium: true },
}

const CONTENT_VERSION = 7   // subir cuando cambie cualquier curso (gatilla re-descarga)

// Elimina menciones a la plataforma de origen (Stanza). Quita líneas enteras
// que la mencionen (atribuciones, enlaces "abrir en Stanza", etc.).
function scrubStanza(md) {
  return md
    .split('\n')
    .filter(line => !/stanza/i.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Títulos de capítulos en español (la traducción .md solo cubría el contenido)
const CHAPTER_TITLES = {
  'Foundations': 'Fundamentos',
  'Data Structures': 'Estructuras de datos',
  'Control Flow': 'Flujo de control',
  'Functions': 'Funciones',
  'Oop': 'Programación orientada a objetos (OOP)',
  'Error Handling': 'Manejo de errores',
  'Modules Packaging': 'Módulos y empaquetado',
  'Modern Type System': 'Sistema de tipos moderno',
  'Protocols': 'Protocolos',
  'Design Patterns': 'Patrones de diseño',
  'Dependency Injection': 'Inyección de dependencias',
  'Api Design': 'Diseño de APIs',
  'Testing Architecture': 'Arquitectura de pruebas',
  'Concurrency Evolution': 'Evolución de la concurrencia',
  'Mastering Asyncio': 'Dominando asyncio',
  'Structured Concurrency': 'Concurrencia estructurada',
  'Free Threading': 'Free threading (hilos sin GIL)',
  'Multiprocessing Shared': 'Multiprocessing y memoria compartida',
  'Advanced Async': 'Async avanzado',
  'Decorators': 'Decoradores',
  'Descriptors': 'Descriptores',
  'Metaclasses': 'Metaclases',
  'Introspection': 'Introspección',
  'Ast': 'Árboles de sintaxis (AST)',
  'Code Generation': 'Generación de código',
  'Jit Compiler': 'Compilador JIT',
  'Memory Management': 'Gestión de memoria',
  'Optimization Techniques': 'Técnicas de optimización',
  'Profiling Diagnostics': 'Profiling y diagnóstico',
  'C Extensions': 'Extensiones en C',
  'Algorithmic Efficiency': 'Eficiencia algorítmica',
}

// Extrae el primer título H1 del markdown (saltando frontmatter)
function extractTitle(md) {
  const m = md.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : null
}

// Lee la traducción de una lección; devuelve {title, content} o null si falta
function readTranslation(courseFolder, chapterFolder, filename) {
  const p = join(TRANSLATIONS_ROOT, `${courseFolder}_traducido_md`, chapterFolder, filename)
  if (!existsSync(p)) return null
  const content = readFileSync(p, 'utf8')
  return { title: extractTitle(content), content }
}

const outContent = join(root, 'content')
const outCourses = join(outContent, 'courses')
const outBundled = join(dataDir, 'bundled')
mkdirSync(outCourses, { recursive: true })
mkdirSync(outBundled, { recursive: true })

const catalogCourses = []
let translated = 0, fallback = 0

for (const course of course_es.courses) {
  const meta = META[course.id] ?? { icon: '📘', color: '#3B82F6' }

  const courseFile = {
    id: course.id,
    title: course.title,
    language: 'python',
    version: CONTENT_VERSION,
    chapter_count: course.chapter_count,
    total_lessons: course.total_lessons,
    chapters: course.chapters.map(ch => ({
      id: ch.id,
      title: CHAPTER_TITLES[ch.title] ?? ch.title,
      description: ch.description ?? '',
      lesson_count: ch.lesson_count,
      lessons: ch.lessons.map(l => {
        const t = readTranslation(course.folder, ch.folder, l.filename)
        if (t) { translated++ } else { fallback++ }
        const lessonOut = {
          id: l.id,
          // Usa el título traducido de Gemini si existe; si no, el viejo
          title: (t && t.title) ? t.title : l.title,
          content: scrubStanza(t ? t.content : l.raw_content),
          word_count: l.word_count,
          quiz: quizzes[l.id] ?? [],
        }
        if (exercises[l.id]?.length) lessonOut.exercises = exercises[l.id]
        return lessonOut
      }),
    })),
  }

  writeFileSync(join(outCourses, `${course.id}.json`), JSON.stringify(courseFile))

  catalogCourses.push({
    id: course.id,
    title: course.title,
    language: 'python',
    icon: meta.icon,
    color: meta.color,
    premium: meta.premium ?? true,
    version: CONTENT_VERSION,
    file: `courses/${course.id}.json`,
    chapter_count: course.chapter_count,
    total_lessons: course.total_lessons,
  })
}

// ── Cursos extra (generados con generate_course.py en extra-courses/) ─────────
import { readdirSync } from 'fs'
const extraDir = join(root, 'extra-courses')
if (existsSync(extraDir)) {
  for (const f of readdirSync(extraDir)) {
    if (!f.endsWith('.json') || f.startsWith('.')) continue
    const course = JSON.parse(readFileSync(join(extraDir, f), 'utf8'))
    const meta = META[course.id] ?? { icon: '📘', color: '#3B82F6', premium: true }
    writeFileSync(join(outCourses, `${course.id}.json`), JSON.stringify(course))
    catalogCourses.push({
      id: course.id,
      title: course.title,
      language: course.language ?? 'python',
      icon: meta.icon,
      color: meta.color,
      premium: meta.premium ?? true,
      version: course.version ?? 1,
      file: `courses/${course.id}.json`,
      chapter_count: course.chapter_count,
      total_lessons: course.total_lessons,
    })
    console.log(`Curso extra incluido: ${course.id} (${course.total_lessons} lecciones)`)
  }
}

const catalog = {
  version: CONTENT_VERSION,
  updated_at: new Date().toISOString(),
  courses: catalogCourses,
  learning_paths: paths,
}
writeFileSync(join(outContent, 'catalog.json'), JSON.stringify(catalog, null, 2))

// Fallback bundleado: catálogo + primer curso
const firstCourse = course_es.courses[0]
const firstCourseFile = JSON.parse(readFileSync(join(outCourses, `${firstCourse.id}.json`), 'utf8'))
writeFileSync(join(outBundled, 'catalog.json'), JSON.stringify(catalog))
writeFileSync(join(outBundled, `${firstCourse.id}.json`), JSON.stringify(firstCourseFile))

console.log(`Catálogo: ${catalogCourses.length} cursos (versión ${CONTENT_VERSION})`)
console.log(`Lecciones con traducción Gemini: ${translated}`)
console.log(`Lecciones sin traducción (usaron texto viejo): ${fallback}`)
console.log(`Fallback bundleado: catalog.json + ${firstCourse.id}.json`)
