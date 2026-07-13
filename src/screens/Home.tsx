import { useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Download } from 'lucide-react'
import { getCourse, getTotalLessons, isCourseLoaded } from '@/lib/content'
import { useContent } from '@/lib/content-provider'
import { useProgress } from '@/lib/progress'
import { getLevelForXP, getProgressToNextLevel } from '@/lib/gamification'

export function Home() {
  const navigate = useNavigate()
  const { courses, learningPaths } = useContent()
  const { state, isCourseUnlocked } = useProgress()
  const completed = state.completedLessons

  const totalXP = state.totalXP
  const level = getLevelForXP(totalXP)
  const pct = getProgressToNextLevel(totalXP)
  const doneCount = Object.keys(completed).length
  const totalLessons = getTotalLessons()

  // Lecciones completadas de un curso (0 si aún no está descargado)
  const courseDone = (id: string) => {
    const c = getCourse(id)
    if (!c) return 0
    return c.chapters.reduce((a, ch) => a + ch.lessons.filter(l => completed[l.id]).length, 0)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-7">
      {/* Bienvenida */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-500/20 rounded-2xl p-5">
        <h1 className="text-xl font-bold text-white">
          {doneCount === 0 ? '¡Bienvenido a Codalia! 🎉' : '¡Buen regreso! 👋'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {doneCount === 0
            ? 'Elige una ruta y empieza a aprender'
            : `${doneCount} de ${totalLessons} lecciones completadas`}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-slate-400 shrink-0">Nv.{level.level} · {level.title}</span>
        </div>
      </div>

      {/* Rutas de aprendizaje */}
      <section>
        <h2 className="text-base font-semibold text-slate-300 mb-3">Rutas de aprendizaje</h2>
        <div className="grid grid-cols-2 gap-3">
          {learningPaths.map(path => {
            const soon = path.status === 'coming_soon'
            const pc = courses.filter(c => path.courses.includes(c.id))
            const total = pc.reduce((a, c) => a + c.total_lessons, 0)
            const done = pc.reduce((a, c) => a + courseDone(c.id), 0)
            const p = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <button
                key={path.id}
                onClick={() => !soon && navigate(`/course/${path.courses[0]}`)}
                disabled={soon}
                className={`relative text-left rounded-2xl border p-4 ${
                  soon ? 'border-slate-700/40 bg-slate-800/20 opacity-60'
                       : 'border-slate-700/50 bg-panel active:border-blue-500/50'
                }`}
                style={!soon ? { borderLeftColor: path.color, borderLeftWidth: 3 } : {}}
              >
                {soon && <Lock size={13} className="absolute top-3 right-3 text-slate-500" />}
                <div className="text-2xl mb-1.5">{path.icon}</div>
                <h3 className="font-bold text-white text-sm leading-tight">{path.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {soon ? 'Próximamente' : `${total} lecciones · ${p}%`}
                </p>
                {!soon && (
                  <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p}%`, background: path.color }} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Todos los cursos */}
      <section>
        <h2 className="text-base font-semibold text-slate-300 mb-3">Todos los cursos</h2>
        <div className="space-y-2.5">
          {courses.map(course => {
            const done = courseDone(course.id)
            const p = Math.round((done / course.total_lessons) * 100)
            const downloaded = isCourseLoaded(course.id)
            const locked = course.premium && !isCourseUnlocked(course.id)
            return (
              <button
                key={course.id}
                onClick={() => navigate(`/course/${course.id}`)}
                className="w-full flex items-center gap-3 p-4 bg-panel rounded-xl border border-slate-700/50 active:border-blue-500/50 text-left"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ background: course.color + '22' }}>
                  {course.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white text-sm truncate">{course.title}</p>
                    {locked && (
                      <span className="shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden max-w-[10rem]">
                      <div className="h-full bg-brand rounded-full" style={{ width: `${p}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {locked ? 'Bloqueado' : downloaded ? `${done}/${course.total_lessons}` : `${course.total_lessons} lecc.`}
                    </span>
                  </div>
                </div>
                {locked
                  ? <Lock size={15} className="text-purple-400/70 shrink-0" />
                  : downloaded
                    ? <ArrowRight size={16} className="text-slate-600 shrink-0" />
                    : <Download size={15} className="text-slate-600 shrink-0" />}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
