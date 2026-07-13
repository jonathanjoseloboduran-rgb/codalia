import { useState } from 'react'
import { Award, ChevronRight } from 'lucide-react'
import { getLearningPaths, isPathComplete } from '@/lib/content'
import { useProgress } from '@/lib/progress'
import { Certificate } from './Certificate'

export function CertificatesSection() {
  const { state } = useProgress()
  const [openPath, setOpenPath] = useState<string | null>(null)

  const paths = getLearningPaths()
  const completed = paths.filter(p => isPathComplete(p.id, state.completedLessons))

  return (
    <div>
      <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        <Award size={18} className="text-yellow-400" /> Tus certificados
      </h2>

      {completed.length === 0 && (
        <p className="text-slate-500 text-sm mb-3">
          Completa una ruta entera para ganar tu certificado.
        </p>
      )}

      <div className="space-y-2">
        {completed.map(p => (
          <button
            key={p.id}
            onClick={() => setOpenPath(p.id)}
            className="w-full flex items-center gap-3 p-4 bg-panel rounded-xl border border-yellow-500/20 active:border-yellow-500/40 text-left"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
              style={{ background: p.color + '22' }}>
              {p.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{p.title}</p>
              <p className="text-yellow-400/80 text-xs">Ruta completada · ver certificado</p>
            </div>
            <ChevronRight size={16} className="text-slate-600 shrink-0" />
          </button>
        ))}
      </div>

      {/* Vista previa de prueba (quitar antes de publicar) */}
      <button
        onClick={() => setOpenPath(paths[0]?.id ?? null)}
        className="w-full mt-2 py-2 rounded-lg border border-dashed border-slate-700 text-slate-500 text-xs active:bg-slate-800"
      >
        Ver certificado de ejemplo (modo prueba)
      </button>

      {openPath && <Certificate pathId={openPath} onClose={() => setOpenPath(null)} />}
    </div>
  )
}
