import { useState } from 'react'
import { Zap, BookOpen, Flame, Trophy } from 'lucide-react'
import { badges as allBadges, getTotalLessons } from '@/lib/content'
import { useProgress } from '@/lib/progress'
import { getLevelForXP, getNextLevel, getProgressToNextLevel } from '@/lib/gamification'
import { AccountSection } from '@/components/AccountSection'
import { CertificatesSection } from '@/components/CertificatesSection'

const rarityColor: Record<string, string> = {
  common:    'border-slate-600 text-slate-400',
  rare:      'border-blue-500/50 text-blue-400',
  epic:      'border-purple-500/50 text-purple-400',
  legendary: 'border-yellow-500/50 text-yellow-400',
}

export function Profile() {
  const { state, reset } = useProgress()
  const [confirming, setConfirming] = useState(false)

  const totalXP = state.totalXP
  const level = getLevelForXP(totalXP)
  const next = getNextLevel(totalXP)
  const pct = getProgressToNextLevel(totalXP)
  const doneCount = Object.keys(state.completedLessons).length
  const earned = new Set(Object.keys(state.earnedBadges))

  const stats = [
    { icon: Zap,      label: 'XP Total',     value: totalXP },
    { icon: BookOpen, label: 'Lecciones',    value: `${doneCount}/${getTotalLessons()}` },
    { icon: Flame,    label: 'Racha actual',  value: `${state.currentStreak}d` },
    { icon: Trophy,   label: 'Mejor racha',   value: `${state.longestStreak}d` },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Cabecera */}
      <div className="bg-panel rounded-2xl p-5 flex items-center gap-4 border border-slate-700/50">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
          style={{ background: level.color + '22', color: level.color }}
        >
          {level.level}
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Tu progreso</h1>
          <p className="text-sm" style={{ color: level.color }}>Nivel {level.level} · {level.title}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-panel rounded-xl p-4 border border-slate-700/50 text-center">
            <Icon size={18} className="mx-auto text-brand mb-2" />
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Barra de nivel */}
      <div className="bg-panel rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Progreso de nivel</span>
          <span className="text-xs text-slate-400">
            {next ? `${totalXP} / ${next.xp} XP` : '¡Nivel máximo!'}
          </span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Cuenta / sincronización */}
      <AccountSection />

      {/* Certificados de rutas completadas */}
      <CertificatesSection />

      {/* Badges */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">
          Insignias <span className="text-slate-500 font-normal text-sm">({earned.size}/{allBadges.length})</span>
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {allBadges.map(badge => {
            const got = earned.has(badge.id)
            return (
              <div
                key={badge.id}
                className={`rounded-xl p-3 border text-center ${
                  got ? `bg-panel ${rarityColor[badge.rarity]}` : 'bg-slate-800/30 border-slate-700/30 opacity-40 grayscale'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <p className="font-semibold text-white text-[11px] leading-tight">{badge.name}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reiniciar */}
      <div className="pt-2">
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-500 text-sm active:bg-slate-800"
          >
            Reiniciar progreso
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-red-300 text-sm mb-3">¿Borrar todo tu progreso? No se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirming(false)}
                className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm">
                Cancelar
              </button>
              <button onClick={() => { reset(); setConfirming(false) }}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium">
                Sí, borrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
