import { useNavigate, useLocation } from 'react-router-dom'
import { Flame, ChevronLeft } from 'lucide-react'
import { useProgress } from '@/lib/progress'
import { getLevelForXP } from '@/lib/gamification'
import { Logo } from './Logo'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useProgress()
  const level = getLevelForXP(state.totalXP)

  // Mostrar botón "atrás" en pantallas internas (no en raíz ni perfil)
  const showBack = location.pathname.startsWith('/course/')

  return (
    <header
      className="shrink-0 border-b border-slate-800 bg-ink"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-14 flex items-center gap-3 px-4">
      {showBack ? (
        <button
          onClick={() => navigate(-1)}
          className="-ml-1 p-1 text-slate-400 hover:text-white"
          aria-label="Atrás"
        >
          <ChevronLeft size={22} />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Logo size={26} />
          <span className="font-bold text-white">Codalia</span>
        </div>
      )}

      <div className="flex-1" />

      {/* Racha */}
      {state.currentStreak > 0 && (
        <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-2.5 py-1">
          <Flame size={13} className="text-orange-400" />
          <span className="text-orange-300 text-xs font-semibold">{state.currentStreak}</span>
        </div>
      )}

      {/* Nivel + XP */}
      <div
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 border text-xs font-semibold"
        style={{ color: level.color, borderColor: level.color + '55', backgroundColor: level.color + '18' }}
      >
        <span>Nv.{level.level}</span>
        <span className="text-slate-400 font-normal">{state.totalXP} XP</span>
      </div>
      </div>
    </header>
  )
}
