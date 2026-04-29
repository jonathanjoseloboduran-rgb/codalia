'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Ya está instalada como PWA — no mostrar
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Ya fue descartada antes
    if (localStorage.getItem('pwa-dismissed')) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!prompt || dismissed) return null

  const install = async () => {
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setPrompt(null)
    }
  }

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa-dismissed', '1')
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-xl flex items-center gap-3">
        <div className="text-2xl shrink-0">🐍</div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold">Instalar Codalia</p>
          <p className="text-slate-400 text-xs mt-0.5">Accede sin internet y más rápido</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={install}
            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
          >
            <Download size={12} />
            Instalar
          </Button>
          <button
            onClick={dismiss}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
