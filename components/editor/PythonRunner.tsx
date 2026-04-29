'use client'

import { useState, useRef } from 'react'
import { CodeEditor } from './CodeEditor'
import { Console } from './Console'
import { runPython, type RunResult } from '@/lib/pyodide'
import { Play, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PythonRunnerProps {
  initialCode?: string
  title?: string
  /** Callback cuando se ejecuta código por primera vez (para el badge editor_first_run) */
  onFirstRun?: () => void
  /** Altura mínima del editor */
  minHeight?: string
}

const DEFAULT_CODE = `# Escribe tu código Python aquí
print("¡Hola, mundo!")
`

export function PythonRunner({
  initialCode = DEFAULT_CODE,
  title,
  onFirstRun,
  minHeight = '200px',
}: PythonRunnerProps) {
  const [code, setCode] = useState(initialCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isPyodideLoading, setIsPyodideLoading] = useState(false)
  const hasRun = useRef(false)

  const run = async () => {
    if (isRunning) return

    // Primera vez que se carga Pyodide
    if (!hasRun.current) {
      setIsPyodideLoading(true)
    }

    setIsRunning(true)
    setResult(null)

    try {
      const res = await runPython(code)
      setResult(res)

      // Badge de primer run
      if (!hasRun.current) {
        hasRun.current = true
        onFirstRun?.()
      }
    } catch (err) {
      setResult({ stdout: '', stderr: '', error: String(err) })
    } finally {
      setIsRunning(false)
      setIsPyodideLoading(false)
    }
  }

  const reset = () => {
    setCode(initialCode)
    setResult(null)
  }

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 bg-[#1E293B] my-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-slate-400 text-xs ml-1">{title ?? 'Editor Python'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-7 px-2 text-slate-500 hover:text-slate-300 text-xs"
            title="Resetear código"
          >
            <RotateCcw size={12} className="mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={run}
            disabled={isRunning}
            className="h-7 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
          >
            {isRunning ? (
              <>
                <Loader2 size={12} className="mr-1.5 animate-spin" />
                {isPyodideLoading ? 'Cargando Python...' : 'Ejecutando...'}
              </>
            ) : (
              <>
                <Play size={12} className="mr-1.5" />
                Ejecutar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <CodeEditor
        value={code}
        onChange={setCode}
        minHeight={minHeight}
      />

      {/* Consola de salida */}
      <Console
        stdout={result?.stdout ?? ''}
        stderr={result?.stderr ?? ''}
        error={result?.error ?? null}
        isRunning={isRunning}
      />
    </div>
  )
}
