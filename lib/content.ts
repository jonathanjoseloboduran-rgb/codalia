import courseData from '@/data/course_es.json'
import pathsData from '@/data/learning_paths.json'
import badgesData from '@/data/badges.json'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CodeBlock { language: string; code: string }

export interface Lesson {
  id: string
  filename: string
  order: number
  title: string
  raw_content: string
  sections: Record<string, string>
  code_blocks: CodeBlock[]
  word_count: number
}

export interface Chapter {
  id: string
  folder: string
  order: number
  title: string
  description: string
  lessons: Lesson[]
  lesson_count: number
}

export interface Course {
  id: string
  title: string
  order: number
  chapters: Chapter[]
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
  prereq: string | null
  status: 'available' | 'coming_soon'
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

// ─── Acceso a datos ───────────────────────────────────────────────────────────

export const courses: Course[] = (courseData as any).courses
export const learningPaths: LearningPath[] = pathsData as LearningPath[]
export const badges: Badge[] = badgesData as Badge[]

export function getCourse(courseId: string): Course | undefined {
  return courses.find(c => c.id === courseId)
}

export function getChapter(courseId: string, chapterId: string): Chapter | undefined {
  return getCourse(courseId)?.chapters.find(ch => ch.id === chapterId)
}

export function getLesson(courseId: string, chapterId: string, lessonId: string): Lesson | undefined {
  return getChapter(courseId, chapterId)?.lessons.find(l => l.id === lessonId)
}

export function getPrevNextLesson(courseId: string, chapterId: string, lessonId: string) {
  const course = getCourse(courseId)
  if (!course) return { prev: null, next: null }

  // Aplanar todas las lecciones del curso en orden
  const all: { lesson: Lesson; chapterId: string }[] = []
  for (const ch of course.chapters) {
    for (const l of ch.lessons) {
      all.push({ lesson: l, chapterId: ch.id })
    }
  }

  const idx = all.findIndex(x => x.chapterId === chapterId && x.lesson.id === lessonId)
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  }
}

export function getAllLessonsFlat(): Array<{ lesson: Lesson; chapter: Chapter; course: Course }> {
  const result = []
  for (const course of courses) {
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        result.push({ lesson, chapter, course })
      }
    }
  }
  return result
}

export function getTotalLessons(): number {
  return courses.reduce((acc, c) => acc + c.total_lessons, 0)
}

// Slugify para URLs: "the-zen-of-python-the-repl" → mismo ID que en el JSON
export function lessonUrl(courseId: string, chapterId: string, lessonId: string): string {
  return `/courses/${courseId}/${chapterId}/${lessonId}`
}
