import { useState } from 'react'
import { Share } from '@capacitor/share'
import { X, Share2, Award, AlertCircle } from 'lucide-react'
import { getLearningPaths, getCatalogCourse } from '@/lib/content'
import { useProgress } from '@/lib/progress'
import { Logo } from './Logo'

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Nivel Principiante',
  intermediate: 'Nivel Intermedio',
  advanced: 'Nivel Avanzado',
}

export function Certificate({ pathId, onClose }: { pathId: string; onClose: () => void }) {
  const { state, setName, claimCertificate } = useProgress()
  const [nameInput, setNameInput] = useState(state.displayName ?? '')
  const path = getLearningPaths().find(p => p.id === pathId)

  if (!path) return null
  const hasName = !!state.displayName

  // Estadísticas de la ruta
  const lessons = path.courses.reduce((a, id) => a + (getCatalogCourse(id)?.total_lessons ?? 0), 0)
  const levelLabel = LEVEL_LABELS[path.level] ?? ''

  // Si ya hay nombre → emitir/obtener el certificado (nombre grabado adentro)
  const cert = hasName ? claimCertificate(pathId) : null
  const certName = cert?.name || state.displayName || ''
  const date = cert ? new Date(cert.date).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  const share = async () => {
    try {
      await Share.share({
        title: 'Mi certificado de Codalia',
        text: `🎓 Certifico que completé "${path.title}" (${levelLabel}) en Codalia — ${lessons} lecciones.\nCódigo de verificación: ${cert?.code}`,
      })
    } catch { /* cancelado */ }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-md my-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="ml-auto mb-2 flex w-8 h-8 items-center justify-center rounded-full bg-slate-800 text-slate-400">
          <X size={16} />
        </button>

        {!hasName ? (
          // Pedir el nombre (una sola vez, queda fijo)
          <div className="bg-panel rounded-2xl p-6 border border-slate-700/50">
            <Award size={28} className="text-yellow-400 mx-auto mb-3" />
            <h2 className="text-white font-bold text-center mb-1">Tu certificado</h2>
            <p className="text-slate-400 text-sm text-center mb-4">
              Escribe tu nombre completo como quieres que aparezca.
            </p>
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Tu nombre completo"
              autoCapitalize="words"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 mb-3"
            />
            <div className="flex items-start gap-2 mb-4 text-[11px] text-amber-400/90">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>Tu nombre se usa para todos tus certificados y no se puede cambiar después. Escríbelo bien.</span>
            </div>
            <button
              onClick={() => nameInput.trim() && setName(nameInput)}
              disabled={!nameInput.trim()}
              className="w-full py-2.5 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-50"
            >
              Confirmar y generar
            </button>
          </div>
        ) : (
          <>
            {/* Diploma */}
            <div
              className="rounded-2xl p-6 text-center border-2"
              style={{ background: 'linear-gradient(160deg, #1E293B 0%, #0F172A 100%)', borderColor: path.color + '99' }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Logo size={28} />
                <span className="font-bold text-white tracking-wide">CODALIA</span>
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-5">Certificado de finalización</p>

              <p className="text-slate-400 text-xs mb-1">Se certifica que</p>
              <p className="text-2xl font-bold text-white mb-4">{certName}</p>

              <p className="text-slate-400 text-xs mb-1">completó la especialización</p>
              <p className="text-lg font-semibold" style={{ color: path.color }}>
                {path.icon} {path.title}
              </p>
              {levelLabel && (
                <p className="text-xs text-slate-400 mb-4">{levelLabel} de Python</p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center gap-4 my-4 text-xs">
                <div><span className="text-white font-bold">{lessons}</span> <span className="text-slate-500">lecciones</span></div>
                <div className="w-px h-4 bg-slate-700" />
                <div><span className="text-white font-bold">{path.estimated_hours}</span> <span className="text-slate-500">horas</span></div>
              </div>

              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center border-2"
                style={{ borderColor: path.color, background: path.color + '22' }}>
                <Award size={26} style={{ color: path.color }} />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-4 border-t border-slate-700/50">
                <span>Emitido el {date}</span>
                <span>{cert?.code}</span>
              </div>
            </div>

            <button
              onClick={share}
              className="w-full mt-4 py-3 rounded-xl bg-brand text-white font-semibold flex items-center justify-center gap-2 active:bg-blue-700"
            >
              <Share2 size={16} /> Compartir certificado
            </button>
            <p className="text-center text-slate-600 text-[11px] mt-2">
              Código verificable: {cert?.code}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
