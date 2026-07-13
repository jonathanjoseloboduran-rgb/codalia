import { Lock, Check, Sparkles, Award } from 'lucide-react'
import { getLearningPaths, getCatalogCourse } from '@/lib/content'
import { PATH_PRICES } from '@/lib/config'
import { useProgress } from '@/lib/progress'

export function Paywall({ courseId }: { courseId: string }) {
  const { grantPath } = useProgress()

  // La ruta premium que incluye este curso
  const path = getLearningPaths().find(p => p.courses.includes(courseId))
  if (!path) return null

  const price = PATH_PRICES[path.id] ?? ''
  const courses = path.courses
    .map(id => getCatalogCourse(id))
    .filter((c): c is NonNullable<typeof c> => !!c)

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-purple-600/15 to-blue-600/10 border border-purple-500/30 rounded-2xl p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-purple-300" />
        </div>
        <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1">Ruta premium</p>
        <h1 className="text-2xl font-bold text-white mb-2">{path.icon} {path.title}</h1>
        <p className="text-slate-400 text-sm mb-5">{path.description}</p>

        {/* Qué incluye */}
        <div className="bg-slate-800/40 rounded-xl p-4 text-left space-y-2 mb-5">
          {courses.map(c => (
            <div key={c.id} className="flex items-center gap-2 text-sm">
              <Check size={15} className="text-emerald-400 shrink-0" />
              <span className="text-slate-300">{c.title}</span>
              <span className="ml-auto text-slate-600 text-xs">{c.total_lessons} lecc.</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm pt-1 border-t border-slate-700/50">
            <Award size={15} className="text-yellow-400 shrink-0" />
            <span className="text-slate-300">Certificado al completar</span>
          </div>
        </div>

        {price && <p className="text-3xl font-bold text-white mb-1">{price}</p>}
        <p className="text-slate-500 text-xs mb-5">Pago único · acceso de por vida</p>

        {/* Botón de compra (modo prueba por ahora) */}
        <button
          onClick={() => grantPath(path.id)}
          className="w-full py-3 rounded-xl bg-purple-600 active:bg-purple-700 text-white font-semibold flex items-center justify-center gap-2"
        >
          <Sparkles size={16} /> Desbloquear (modo prueba)
        </button>
        <p className="text-slate-600 text-[11px] mt-3">
          El pago real se habilitará con Google Play cuando la app esté publicada.
        </p>
      </div>
    </div>
  )
}
