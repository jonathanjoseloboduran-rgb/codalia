import { createClient } from '@/lib/supabase/server'
import { courses, learningPaths } from '@/lib/content'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BookOpen, Clock, Lock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cursos' }

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('course_id, lesson_id, status')
    .eq('user_id', user!.id)

  const completed = new Set(
    (progressRows ?? []).filter(r => r.status === 'completed').map(r => r.lesson_id)
  )

  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">

      {/* Rutas de aprendizaje */}
      <section>
        <h1 className="text-2xl font-bold text-white mb-1">Cursos</h1>
        <p className="text-slate-400 text-sm mb-6">
          Elige una ruta de aprendizaje o explora los cursos individuales.
        </p>

        <h2 className="text-base font-semibold text-slate-300 mb-3">Rutas de aprendizaje</h2>
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
                    ? 'border-slate-700/40 bg-slate-800/20 opacity-60'
                    : 'border-slate-700/50 bg-[#1E293B] hover:border-blue-500/40'
                }`}
                style={!isComingSoon ? { borderLeftColor: path.color, borderLeftWidth: 3 } : {}}
              >
                {isComingSoon && (
                  <Lock size={14} className="absolute top-4 right-4 text-slate-500" />
                )}

                <div className="text-3xl mb-2">{path.icon}</div>
                <h3 className="font-bold text-white">{path.title}</h3>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{path.description}</p>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{path.estimated_hours}h · {pathTotal} lecciones</span>
                  {!isComingSoon && <span>{pct}% completado</span>}
                </div>

                {!isComingSoon && (
                  <>
                    <Progress value={pct} className="mt-2 h-1 bg-slate-700" />
                    <Link
                      href={`/courses/${path.courses[0]}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
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
      </section>

      {/* Todos los cursos */}
      <section>
        <h2 className="text-base font-semibold text-slate-300 mb-3">Todos los cursos</h2>
        <div className="space-y-3">
          {courses.map((course, i) => {
            const done = course.chapters.reduce((a, ch) =>
              a + ch.lessons.filter(l => completed.has(l.id)).length, 0)
            const pct = Math.round((done / course.total_lessons) * 100)
            const color = colors[i % colors.length]

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="flex items-center gap-4 p-5 bg-[#1E293B] rounded-xl border border-slate-700/50 hover:border-blue-500/40 transition-all group"
              >
                <div className="w-1.5 h-14 rounded-full shrink-0" style={{ backgroundColor: color }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white">{course.title}</p>
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px] border-slate-600 text-slate-400"
                    >
                      {pct > 0 ? `${pct}%` : 'Nuevo'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} />
                      {course.chapter_count} capítulos
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {course.total_lessons} lecciones
                    </span>
                    <span>{done} completadas</span>
                  </div>

                  <Progress value={pct} className="mt-2 h-1 bg-slate-700 max-w-48" />
                </div>

                <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 shrink-0" />
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
