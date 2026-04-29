import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLesson, getCourse, getPrevNextLesson } from '@/lib/content'
import { LessonContent } from '@/components/lesson/LessonContent'
import { LessonNav } from '@/components/lesson/LessonNav'
import { PythonRunner } from '@/components/editor/PythonRunner'
import { Quiz } from '@/components/lesson/Quiz'
import { Clock, BookOpen } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ course: string; chapter: string; lesson: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course, chapter, lesson } = await params
  const l = getLesson(course, chapter, lesson)
  return { title: l?.title ?? 'Lección' }
}

export default async function LessonPage({ params }: Props) {
  const { course: courseId, chapter: chapterId, lesson: lessonId } = await params

  const lesson = getLesson(courseId, chapterId, lessonId)
  const course = getCourse(courseId)
  if (!lesson || !course) notFound()

  const { prev, next } = getPrevNextLesson(courseId, chapterId, lessonId)

  // Verificar si ya está completada
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: progressRow } = await supabase
    .from('lesson_progress')
    .select('status')
    .eq('user_id', user!.id)
    .eq('lesson_id', lessonId)
    .single()

  const isCompleted = progressRow?.status === 'completed'
  const readTime = Math.ceil(lesson.word_count / 200) // ~200 palabras/min

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <BookOpen size={12} />
        <span>{course.title}</span>
        <span>›</span>
        <span className="text-slate-400">{lesson.title}</span>
      </div>

      {/* Título de la lección */}
      <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{lesson.title}</h1>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock size={12} />
          <span>{readTime} min de lectura</span>
        </div>
        <span className="text-slate-700">·</span>
        <span className="text-xs text-slate-500">{lesson.word_count} palabras</span>
        {isCompleted && (
          <>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-emerald-400 font-medium">✓ Completada</span>
          </>
        )}
      </div>

      {/* Contenido Markdown */}
      <LessonContent content={lesson.raw_content} />

      {/* Editor Python embebido */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white mb-1">Practica el código</h2>
        <p className="text-slate-400 text-sm mb-4">
          Experimenta con los ejemplos de esta lección o escribe tu propio código.
        </p>
        <PythonRunner
          title={`${lesson.title.toLowerCase().replace(/\s+/g, '_')}.py`}
          minHeight="200px"
        />
      </div>

      {/* Quiz IA */}
      <Quiz courseId={courseId} chapterId={chapterId} lessonId={lessonId} />

      {/* Navegación prev/next + marcar completada */}
      <LessonNav
        courseId={courseId}
        lessonId={lessonId}
        isCompleted={isCompleted}
        prev={prev}
        next={next}
      />
    </div>
  )
}
