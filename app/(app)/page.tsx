import { createClient } from '@/lib/supabase/server'
import { learningPaths, courses, getTotalLessons } from '@/lib/content'
import { getLevelForXP, getProgressToNextLevel } from '@/lib/gamification'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, Lock, Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Inicio' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('total_xp, current_streak_days, preferred_path')
    .eq('id', user!.id)
    .single()

  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('course_id, lesson_id, status')
    .eq('user_id', user!.id)

  const completed = new Set((progressRows ?? []).filter(r => r.status === 'completed').map(r => r.lesson_id))
  const totalXP = profile?.total_xp ?? 0
  const level = getLevelForXP(totalXP)
  const progressPct = getProgressToNextLevel(totalXP)
  const totalLessons = getTotalLessons()

  // Última lección en progreso
  const lastProgress = (progressRows ?? []).at(-1)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Bienvenida + stats */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {completed.size === 0 ? '¡Bienvenido a Codalia! 🎉' : '¡Buen regreso! 👋'}
            </h1>
            <p className="text-slate-400 mt-1">
              {completed.size === 0
                ? 'Elige una ruta y empieza a aprender Python'
                : `${completed.size} de ${totalLessons} lecciones completadas`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge style={{ backgroundColor: level.color + '22', color: level.color, borderColor: level.color + '44' }}
              className="border font-semibold">
              Nivel {level.level} · {level.title}
            </Badge>
            <div className="flex items-center gap-2 w-40">
              <Progress value={progressPct} className="h-1.5 bg-slate-700 flex-1" />
              <span className="text-slate-400 text-xs shrink-0">{totalXP} XP</span>
            </div>
          </div>
        </div>

        {/* Continuar donde quedaste */}
        {lastProgress && (
          <Link
            href={`/courses/${lastProgress.course_id}`}
            className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            <Zap size={14} />
            Continuar donde lo dejaste
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Rutas de aprendizaje */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Rutas de aprendizaje</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {learningPaths.map(path => {
            const isComingSoon = path.status === 'coming_soon'
            const pathCourses = courses.filter(c => path.courses.includes(c.id))
            const pathTotal = pathCourses.reduce((a, c) => a + c.total_lessons, 0)
            const pathDone = pathCourses.reduce((a, c) =>
              a + c.chapters.reduce((b, ch) =>
                b + ch.lessons.filter(l => completed.has(l.id)).length, 0), 0)
            const pct = pathTotal > 0 ? Math.round((pathDone / pathTotal) * 100) : 0

            return (
              <div
                key={path.id}
                className={`relative rounded-2xl border p-5 transition-all ${
                  isComingSoon
                    ? 'border-slate-700/50 bg-slate-800/30 opacity-60'
                    : 'border-slate-700/50 bg-[#1E293B] hover:border-blue-500/40 cursor-pointer'
                }`}
                style={!isComingSoon ? { borderLeftColor: path.color, borderLeftWidth: 3 } : {}}
              >
                {isComingSoon && (
                  <div className="absolute top-3 right-3">
                    <Lock size={14} className="text-slate-500" />
                  </div>
                )}
                <div className="text-3xl mb-2">{path.icon}</div>
                <h3 className="font-bold text-white">{path.title}</h3>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{path.description}</p>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{path.estimated_hours}h estimadas · {pathTotal} lecciones</span>
                  {!isComingSoon && <span>{pct}% completado</span>}
                </div>

                {!isComingSoon && (
                  <>
                    <Progress value={pct} className="mt-2 h-1 bg-slate-700" />
                    <Link
                      href={`/courses/${path.courses[0]}`}
                      className="mt-3 flex items-center gap-1 text-sm font-medium"
                      style={{ color: path.color }}
                    >
                      {pct > 0 ? 'Continuar' : 'Empezar'}
                      <ArrowRight size={14} />
                    </Link>
                  </>
                )}
                {isComingSoon && (
                  <p className="mt-3 text-xs text-slate-500 font-medium">Próximamente</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Todos los cursos */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Todos los cursos</h2>
        <div className="space-y-2">
          {courses.map((course, i) => {
            const done = course.chapters.reduce((a, ch) =>
              a + ch.lessons.filter(l => completed.has(l.id)).length, 0)
            const pct = Math.round((done / course.total_lessons) * 100)
            const colors = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444']

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="flex items-center gap-4 p-4 bg-[#1E293B] rounded-xl border border-slate-700/50 hover:border-blue-500/40 transition-all group"
              >
                <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{course.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={pct} className="h-1 bg-slate-700 flex-1 max-w-32" />
                    <span className="text-xs text-slate-500">{done}/{course.total_lessons}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 shrink-0" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
