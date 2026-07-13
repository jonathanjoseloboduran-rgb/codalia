import { useState } from 'react'
import { Play, Loader2, CheckCircle2, XCircle, Eye, Trophy, RotateCcw } from 'lucide-react'
import { runExercise, type TestResult } from '@/lib/pyodide'
import { useProgress } from '@/lib/progress'
import { CodeEditor } from './CodeEditor'
import type { Exercise as ExerciseType } from '@/lib/content'

export function Exercise({ exercise }: { exercise: ExerciseType }) {
  const { isExerciseSolved, submitExercise } = useProgress()
  const [code, setCode] = useState(exercise.starter)
  const [results, setResults] = useState<TestResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [firstLoad, setFirstLoad] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [xpToast, setXpToast] = useState<string | null>(null)

  const solved = isExerciseSolved(exercise.id)
  const passed = results?.filter(r => r.ok).length ?? 0
  const allPassed = !!results && results.length > 0 && passed === results.length

  const check = async () => {
    if (running) return
    setRunning(true); setResults(null); setError(null); setFirstLoad(true)
    try {
      const { results: res, error: err } = await runExercise(code, exercise.tests)
      setResults(res); setError(err)
      if (!err && res.length > 0 && res.every(r => r.ok)) {
        const r = await submitExercise(exercise.id)
        if (r.xp_earned > 0) {
          setXpToast(`+${r.xp_earned} XP`)
          setTimeout(() => setXpToast(null), 2600)
        }
      }
    } finally {
      setRunning(false); setFirstLoad(false)
    }
  }

  const reset = () => {
    setCode(exercise.starter)
    setResults(null)
    setError(null)
    setShowSolution(false)
  }

  return (
    <div>
      <p className="text-slate-300 text-sm mb-3 leading-relaxed">{exercise.prompt}</p>

      {/* Editor */}
      <div className="rounded-xl overflow-hidden border border-slate-700">
        <div className="flex items-center justify-between px-3 py-2 bg-[#161B22] border-b border-slate-700">
          <span className="text-xs text-slate-400">solución.py</span>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="flex items-center gap-1 text-xs text-slate-500 active:text-slate-300 px-2 py-1">
              <RotateCcw size={12} /> Reiniciar
            </button>
            <button
              onClick={check}
              disabled={running}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 active:bg-emerald-500 px-3 py-1.5 rounded-md disabled:opacity-60"
            >
              {running
                ? <><Loader2 size={12} className="animate-spin" /> {firstLoad ? 'Cargando…' : 'Probando…'}</>
                : <><Play size={12} /> Comprobar</>}
            </button>
          </div>
        </div>
        <CodeEditor value={code} onChange={setCode} minHeight="160px" />
      </div>

      {/* Resultado global */}
      {results && !error && (
        <div className={`mt-3 flex items-center gap-2 rounded-lg px-4 py-2.5 border ${
          allPassed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          {allPassed
            ? <Trophy size={16} className="text-emerald-400" />
            : <XCircle size={16} className="text-yellow-400" />}
          <span className={`text-sm font-semibold ${allPassed ? 'text-emerald-300' : 'text-yellow-300'}`}>
            {allPassed
              ? `¡Correcto! Pasaste los ${results.length} casos 🎉`
              : `Pasaste ${passed} de ${results.length} casos. Sigue intentando.`}
          </span>
        </div>
      )}

      {/* Error de ejecución (en español) */}
      {error && (
        <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
          <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 text-sm font-medium">Tu código no se pudo ejecutar</p>
            <p className="text-red-400/90 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Resultados por test */}
      {results && results.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-lg border ${
              r.ok ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
                   : 'border-red-500/30 bg-red-500/5 text-red-300'
            }`}>
              {r.ok ? <CheckCircle2 size={13} className="shrink-0" /> : <XCircle size={13} className="shrink-0" />}
              <span className="text-slate-400">{r.call}</span>
              {!r.ok && (
                <span className="ml-auto text-slate-500 text-right">
                  esperado: {r.expected} · obtuviste: {r.actual}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ver solución */}
      <button
        onClick={() => setShowSolution(s => !s)}
        className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 active:text-slate-300"
      >
        <Eye size={13} /> {showSolution ? 'Ocultar solución' : 'Ver solución'}
      </button>
      {showSolution && (
        <pre className="mt-2 p-3 rounded-lg bg-[#0D1117] border border-slate-700/50 overflow-x-auto text-xs text-slate-300 font-mono whitespace-pre-wrap">
          {exercise.solution}
        </pre>
      )}

      {solved && !results && (
        <p className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 size={13} /> Ya resolviste este ejercicio
        </p>
      )}

      {/* Toast XP */}
      {xpToast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50 bg-slate-800 border border-slate-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg animate-[fade_0.2s_ease]">
          {xpToast}
        </div>
      )}
    </div>
  )
}
