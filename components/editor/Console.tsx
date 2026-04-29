'use client'

import { Terminal, AlertCircle, Loader2 } from 'lucide-react'

interface ConsoleProps {
  stdout: string
  stderr: string
  error: string | null
  isRunning: boolean
}

export function Console({ stdout, stderr, error, isRunning }: ConsoleProps) {
  const hasOutput = stdout || stderr || error

  return (
    <div className="rounded-b-xl bg-[#0D1117] border border-t-0 border-slate-700 min-h-[80px] font-mono text-sm">
      {/* Barra de consola */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-[#161B22]">
        <Terminal size={12} className="text-slate-500" />
        <span className="text-slate-500 text-xs">Salida</span>
        {isRunning && (
          <Loader2 size={12} className="text-blue-400 animate-spin ml-auto" />
        )}
      </div>

      {/* Contenido */}
      <div className="p-3 space-y-1 min-h-[60px]">
        {isRunning && !hasOutput && (
          <p className="text-slate-600 text-xs italic">Ejecutando...</p>
        )}

        {!isRunning && !hasOutput && (
          <p className="text-slate-700 text-xs italic">
            Presiona Ejecutar para ver la salida aquí
          </p>
        )}

        {stdout && (
          <pre className="text-emerald-400 whitespace-pre-wrap break-words">{stdout}</pre>
        )}

        {stderr && (
          <pre className="text-yellow-400 whitespace-pre-wrap break-words">{stderr}</pre>
        )}

        {error && (
          <div className="flex gap-2">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <pre className="text-red-400 whitespace-pre-wrap break-words text-xs">{error}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
