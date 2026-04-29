import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourse, lessonUrl } from '@/lib/content'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: Promise<{ course: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course: courseId } = await params
  const course = getCourse(courseId)
  return { title: course?.title ?? 'Curso' }
}

export default async function CoursePage({ params }: Props) {
  const { course: courseId } = await params
  const course = getCourse(courseId)
  if (!course) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('lesson_id, status')
    .eq('user_id', user!.id)
    .eq('course_id', courseId)

  const completed = new Set((progressRows ?? []).filter(r => r.status === 'completed').map(r => r.lesson_id))
  const totalDone = completed.size
  const pct = Math.round((totalDone / course.total_lessons) * 100)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header del curso */}
      <div className="mb-8">
        <p className="text-blue-400 text-sm font-medium mb-1">Curso</p>
        <h1 className="text-2xl font-bold text-white">{course.title}</h1>
        <div className="flex items-center gap-3 mt-3">
          <Progress value={pct} className="h-2 bg-slate-700 flex-1 max-w-48" />
          <span className="text-sm text-slate-400">{totalDone}/{course.total_lessons} lecciones</span>
        </div>
      </div>

      {/* Capítulos */}
      <div className="space-y-6">
        {course.chapters.map((chapter, ci) => {
          const chapterDone = chapter.lessons.filter(l => completed.has(l.id)).length
          return (
            <div key={chapter.id}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-slate-200">
                  <span className="text-slate-500 mr-2">{String(ci + 1).padStart(2,'0')}.</span>
                  {chapter.title}
                </h2>
                <span className="text-xs text-slate-500">{chapterDone}/{chapter.lesson_count}</span>
              </div>

              <div className="space-y-1 ml-2 border-l border-slate-700/50 pl-4">
                {chapter.lessons.map((lesson, li) => {
                  const done = completed.has(lesson.id)
                  return (
                    <Link
                      key={lesson.id}
                      href={lessonUrl(courseId, chapter.id, lesson.id)}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-800/60 group transition-colors"
                    >
                      {done
                        ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        : <Circle size={16} className="text-slate-600 group-hover:text-slate-400 shrink-0" />}
                      <span className={`text-sm flex-1 ${done ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-300 group-hover:text-white'}`}>
                        {lesson.title}
                      </span>
                      <span className="text-xs text-slate-600">{lesson.word_count} palabras</span>
                      <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 shrink-0" />
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
