import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { getLesson, getPrevNext, isCourseLoaded } from '@/lib/content'
import { useContent } from '@/lib/content-provider'
import { useProgress } from '@/lib/progress'
import { LessonMarkdown } from '@/components/LessonMarkdown'
import { Quiz } from '@/components/Quiz'

export function LessonScreen() {
  const { courseId, chapterId, lessonId } = useParams()
  const navigate = useNavigate()
  const { ensureCourse } = useContent()
  const { isComplete, markLessonComplete } = useProgress()
  const [toast, setToast] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  // Se recalcula en cada render desde courseId → al cambiar de curso re-evalúa
  const loaded = isCourseLoaded(courseId ?? '')
  const [, forceRender] = useState(0)

  // Asegurar que el curso esté cargado (por si se entra directo o se cambia de curso)
  useEffect(() => {
    if (loaded) return
    let alive = true
    ensureCourse(courseId ?? '').then(() => { if (alive) forceRender(n => n + 1) })
    return () => { alive = false }
  }, [courseId, loaded, ensureCourse])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={26} className="text-brand animate-spin" />
      </div>
    )
  }

  const lesson = getLesson(courseId ?? '', chapterId ?? '', lessonId ?? '')
  if (!lesson) {
    return <div className="p-6 text-center text-slate-400">Lección no encontrada.</div>
  }

  const { prev, next } = getPrevNext(courseId!, chapterId!, lessonId!)
  const done = isComplete(lesson.id)
  const readTime = Math.max(1, Math.ceil(lesson.word_count / 200))

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  const complete = async () => {
    if (done || saving) return
    setSaving(true)
    const res = await markLessonComplete(courseId!, chapterId!, lessonId!)
    setSaving(false)
    let msg = `+${res.xp_earned} XP`
    if (res.level_up) msg += ` · ¡Nivel ${res.new_level}!`
    showToast(msg)
    if (res.new_badges.length) {
      setTimeout(() => showToast(`${res.new_badges[0].icon} ${res.new_badges[0].name}`), 2700)
    }
  }

  const goTo = (chId: string, lId: string) => navigate(`/course/${courseId}/${chId}/${lId}`)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white leading-tight mb-3">{lesson.title}</h1>
      <div className="flex items-center gap-3 mb-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><Clock size={12} /> {readTime} min</span>
        <span>·</span>
        <span>{lesson.word_count} palabras</span>
        {done && <><span>·</span><span className="text-emerald-400 font-medium">✓ Completada</span></>}
      </div>

      <LessonMarkdown content={lesson.content} />

      {lesson.quiz.length > 0 && <Quiz lessonId={lesson.id} questions={lesson.quiz} />}

      {lesson.exercises && lesson.exercises.length > 0 && (
        <button
          onClick={() => navigate('/playground')}
          className="w-full mt-8 py-3 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-center gap-2 active:bg-emerald-600/20"
        >
          {'</>'} Practica este tema con código
        </button>
      )}

      <button
        onClick={complete}
        disabled={done || saving}
        className={`w-full mt-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
          done
            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-brand text-white active:bg-blue-700'
        }`}
      >
        <CheckCircle2 size={18} />
        {done ? 'Lección completada' : saving ? 'Guardando…' : 'Marcar como completada'}
      </button>

      <div className="flex items-center justify-between gap-3 mt-4">
        {prev ? (
          <button onClick={() => goTo(prev.chapterId, prev.lesson.id)}
            className="flex-1 flex items-center gap-1.5 text-slate-400 active:text-white text-left">
            <ChevronLeft size={16} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-600">Anterior</p>
              <p className="text-xs font-medium truncate">{prev.lesson.title}</p>
            </div>
          </button>
        ) : <div className="flex-1" />}

        {next ? (
          <button onClick={() => goTo(next.chapterId, next.lesson.id)}
            className="flex-1 flex items-center justify-end gap-1.5 text-slate-400 active:text-white text-right">
            <div className="min-w-0">
              <p className="text-[10px] text-slate-600">Siguiente</p>
              <p className="text-xs font-medium truncate">{next.lesson.title}</p>
            </div>
            <ChevronRight size={16} className="shrink-0" />
          </button>
        ) : (
          <button onClick={() => navigate(`/course/${courseId}`)}
            className="flex-1 flex items-center justify-end gap-1.5 text-emerald-400 text-right">
            <span className="text-xs font-medium">Ver capítulos</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50 bg-slate-800 border border-slate-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg animate-[fade_0.2s_ease]">
          {toast}
        </div>
      )}
    </div>
  )
}
