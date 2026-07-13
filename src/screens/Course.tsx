import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, ChevronRight, Loader2, WifiOff, Download } from 'lucide-react'
import type { Course } from '@/lib/content'
import { getCatalogCourse } from '@/lib/content'
import { useContent } from '@/lib/content-provider'
import { useProgress } from '@/lib/progress'
import { Paywall } from '@/components/Paywall'

type Status = 'loading' | 'ready' | 'error'

export function CourseScreen() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { ensureCourse } = useContent()
  const { state, isCourseUnlocked } = useProgress()

  const [course, setCourse] = useState<Course | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  const meta = getCatalogCourse(courseId ?? '')
  const unlocked = isCourseUnlocked(courseId ?? '')

  useEffect(() => {
    if (!unlocked) return // no descargar cursos bloqueados
    let alive = true
    setStatus('loading')
    ensureCourse(courseId ?? '').then(c => {
      if (!alive) return
      if (c) { setCourse(c); setStatus('ready') }
      else setStatus('error')
    })
    return () => { alive = false }
  }, [courseId, ensureCourse, unlocked])

  // Curso premium no comprado → paywall (antes de descargar nada)
  if (!unlocked) return <Paywall courseId={courseId ?? ''} />

  // Cargando / descargando
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <Loader2 size={28} className="text-brand animate-spin" />
        <p className="text-slate-400 text-sm">
          {meta ? `Descargando "${meta.title}"…` : 'Cargando…'}
        </p>
        <p className="text-slate-600 text-xs">Solo la primera vez. Después funciona offline.</p>
      </div>
    )
  }

  // Sin conexión y no estaba descargado
  if (status === 'error' || !course) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <WifiOff size={28} className="text-slate-500" />
        <p className="text-white font-medium">No se pudo cargar el curso</p>
        <p className="text-slate-400 text-sm">Necesitas internet para descargarlo la primera vez.</p>
        <button
          onClick={() => navigate(0)}
          className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium"
        >
          <Download size={14} /> Reintentar
        </button>
      </div>
    )
  }

  const completed = state.completedLessons
  const totalDone = course.chapters.reduce((a, ch) =>
    a + ch.lessons.filter(l => completed[l.id]).length, 0)
  const pct = Math.round((totalDone / course.total_lessons) * 100)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <p className="text-brand text-xs font-medium mb-1">Curso</p>
        <h1 className="text-xl font-bold text-white leading-tight">{course.title}</h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden max-w-[12rem]">
            <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm text-slate-400">{totalDone}/{course.total_lessons}</span>
        </div>
      </div>

      <div className="space-y-6">
        {course.chapters.map((chapter, ci) => {
          const chDone = chapter.lessons.filter(l => completed[l.id]).length
          return (
            <div key={chapter.id}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-slate-200 text-sm">
                  <span className="text-slate-500 mr-2">{String(ci + 1).padStart(2, '0')}.</span>
                  {chapter.title}
                </h2>
                <span className="text-xs text-slate-500">{chDone}/{chapter.lesson_count}</span>
              </div>
              <div className="space-y-1 ml-1 border-l border-slate-700/50 pl-3">
                {chapter.lessons.map(lesson => {
                  const done = !!completed[lesson.id]
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigate(`/course/${course.id}/${chapter.id}/${lesson.id}`)}
                      className="w-full flex items-center gap-3 py-2.5 px-2 rounded-lg active:bg-slate-800/60 text-left"
                    >
                      {done
                        ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        : <Circle size={16} className="text-slate-600 shrink-0" />}
                      <span className={`text-sm flex-1 ${done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                        {lesson.title}
                      </span>
                      <ChevronRight size={14} className="text-slate-600 shrink-0" />
                    </button>
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
