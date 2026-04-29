'use client'

import Link from 'next/link'
import { Sparkles, X } from 'lucide-react'
import { useState } from 'react'

interface AdSlotProps {
  /** Si el usuario es premium, no muestra nada */
  isPremium: boolean
  /** Posición — afecta solo al estilo */
  format?: 'banner' | 'between-lessons' | 'sidebar'
  /** Identificador del slot para AdSense (cuando se conecte) */
  slot?: string
}

export function AdSlot({ isPremium, format = 'banner' }: AdSlotProps) {
  const [hidden, setHidden] = useState(false)

  if (isPremium || hidden) return null

  // Placeholder mientras AdSense no está conectado.
  // Reemplazar con <ins className="adsbygoogle" .../> cuando esté aprobado.

  if (format === 'between-lessons') {
    return (
      <div className="my-8 p-5 rounded-xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 relative">
        <button
          onClick={() => setHidden(true)}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-300"
          aria-label="Ocultar"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-4">
          <div className="text-3xl shrink-0">✨</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">¿Sin distracciones?</p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Codalia Premium te da acceso a todos los cursos avanzados, sin anuncios y con tutor IA. Por menos de un café al mes.
            </p>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-1.5 mt-3 text-blue-400 hover:text-blue-300 text-xs font-semibold"
            >
              <Sparkles size={12} />
              Probar Premium
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (format === 'sidebar') {
    return (
      <div className="mt-4 mx-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
        <p className="text-slate-300 font-medium">🚀 Codalia Premium</p>
        <p className="text-slate-500 mt-1 leading-snug">Sin ads, todos los cursos, +tutor IA.</p>
        <Link href="/upgrade" className="text-blue-400 hover:text-blue-300 font-medium mt-2 block">
          Ver planes →
        </Link>
      </div>
    )
  }

  // banner por defecto
  return (
    <div className="my-6 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 text-center text-xs text-slate-500">
      <span className="text-slate-600">[ Espacio publicitario ]</span>
      <Link href="/upgrade" className="ml-2 text-blue-400 hover:underline">
        Quitar anuncios
      </Link>
    </div>
  )
}
