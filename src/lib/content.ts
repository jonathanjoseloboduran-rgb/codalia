import bundledCatalog from '@/data/bundled/catalog.json'
import bundledCourse from '@/data/bundled/python-fundamentals.json'
import badgesData from '@/data/badges.json'

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export interface ExerciseTest {
  call: string       // expresión Python, ej: "suma(2, 3)"
  expected: string   // resultado esperado como literal, ej: "5"
}

export interface Exercise {
  id: string
  prompt: string
  starter: string
  solution: string
  tests: ExerciseTest[]
}

export interface Lesson {
  id: string
  title: string
  content: string
  word_count: number
  quiz: QuizQuestion[]
  exercises?: Exercise[]
}

export interface Chapter {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
  lesson_count: number
}

export interface Course {
  id: string
  title: string
  language: string
  version: number
  chapters: Chapter[]
  chapter_count: number
  total_lessons: number
}

// Entrada del catálogo: metadata de un curso (puede no estar descargado aún)
export interface CatalogCourse {
  id: string
  title: string
  language: string
  icon: string
  color: string
  premium: boolean
  version: number
  file: string
  chapter_count: number
  total_lessons: number
}

export interface LearningPath {
  id: string
  title: string
  description: string
  icon: string
  color: string
  courses: string[]
  estimated_hours: number
  level: string
  status: 'available' | 'coming_soon'
}

export interface Catalog {
  version: number
  updated_at?: string
  courses: CatalogCourse[]
  learning_paths: LearningPath[]
}

export interface Badge {
  id: string
  icon: string
  name: string
  description: string
  condition: Record<string, unknown>
  xp_reward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// ─── Store en memoria ─────────────────────────────────────────────────────────
// Arranca con el contenido bundleado (offline desde la 1ª apertura) y crece
// a medida que se descargan/cachean cursos.

let _catalog: Catalog = bundledCatalog as Catalog
const _loaded: Record<string, Course> = {}
_loaded[(bundledCourse as Course).id] = bundledCourse as Course

export const badges: Badge[] = badgesData as Badge[]

// ─── Mutadores (los usa el ContentProvider) ────────────────────────────────────

export function setCatalog(c: Catalog) { _catalog = c }
export function addLoadedCourse(course: Course) { _loaded[course.id] = course }
export function getLoadedCourses(): Course[] { return Object.values(_loaded) }

// ─── Accesores ────────────────────────────────────────────────────────────────

export function getCatalog(): Catalog { return _catalog }
export function getLearningPaths(): LearningPath[] { return _catalog.learning_paths }
export function getCatalogCourses(): CatalogCourse[] { return _catalog.courses }
export function getCatalogCourse(id: string): CatalogCourse | undefined {
  return _catalog.courses.find(c => c.id === id)
}

export function isCourseLoaded(id: string): boolean { return !!_loaded[id] }
export function getCourse(id: string): Course | undefined { return _loaded[id] }

export function getChapter(courseId: string, chapterId: string): Chapter | undefined {
  return getCourse(courseId)?.chapters.find(ch => ch.id === chapterId)
}

export function getLesson(courseId: string, chapterId: string, lessonId: string): Lesson | undefined {
  return getChapter(courseId, chapterId)?.lessons.find(l => l.id === lessonId)
}

// Busca el quiz de una lección entre los cursos cargados (por lessonId)
export function getLessonQuiz(lessonId: string): QuizQuestion[] | null {
  for (const course of getLoadedCourses()) {
    for (const ch of course.chapters) {
      const l = ch.lessons.find(x => x.id === lessonId)
      if (l) return l.quiz.length ? l.quiz : null
    }
  }
  return null
}

// Total de lecciones del catálogo completo (incluye cursos no descargados)
export function getTotalLessons(): number {
  return _catalog.courses.reduce((acc, c) => acc + c.total_lessons, 0)
}

export function getCourseLessonsFlat(courseId: string): { lesson: Lesson; chapterId: string }[] {
  const course = getCourse(courseId)
  if (!course) return []
  const out: { lesson: Lesson; chapterId: string }[] = []
  for (const ch of course.chapters) {
    for (const l of ch.lessons) out.push({ lesson: l, chapterId: ch.id })
  }
  return out
}

export function getPrevNext(courseId: string, chapterId: string, lessonId: string) {
  const all = getCourseLessonsFlat(courseId)
  const idx = all.findIndex(x => x.chapterId === chapterId && x.lesson.id === lessonId)
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
  }
}

// Ejercicios agrupados por curso → lección (solo de cursos descargados)
export interface ExerciseGroup {
  courseId: string
  courseTitle: string
  lessons: { lessonId: string; lessonTitle: string; quizCount: number; exercises: Exercise[] }[]
}

// Una ruta está completa si TODOS los cursos que la componen están al 100%
export function isPathComplete(pathId: string, completed: Record<string, true>): boolean {
  const path = getLearningPaths().find(p => p.id === pathId)
  if (!path) return false
  let total = 0, done = 0
  for (const courseId of path.courses) {
    const c = getCourse(courseId)
    if (!c) return false // curso no descargado → no se puede dar por completo
    for (const ch of c.chapters) {
      for (const l of ch.lessons) {
        total++
        if (completed[l.id]) done++
      }
    }
  }
  return total > 0 && done === total
}

export function getExercisesByCourse(): ExerciseGroup[] {
  const groups: ExerciseGroup[] = []
  for (const course of getLoadedCourses()) {
    const lessons: ExerciseGroup['lessons'] = []
    for (const ch of course.chapters) {
      for (const l of ch.lessons) {
        if (l.exercises?.length) {
          lessons.push({
            lessonId: l.id, lessonTitle: l.title,
            quizCount: l.quiz.length, exercises: l.exercises,
          })
        }
      }
    }
    if (lessons.length) groups.push({ courseId: course.id, courseTitle: course.title, lessons })
  }
  return groups
}
