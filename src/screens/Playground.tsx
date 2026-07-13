import { useState } from 'react'
import { Play, RotateCcw, Loader2, Terminal, ChevronDown, CheckCircle2, Code2, Dumbbell, Lock } from 'lucide-react'
import { runPython, isPyodideReady, type RunResult } from '@/lib/pyodide'
import { getExercisesByCourse } from '@/lib/content'
import { useContent } from '@/lib/content-provider'
import { useProgress } from '@/lib/progress'
import { CodeEditor } from '@/components/CodeEditor'
import { Exercise } from '@/components/Exercise'

type Mode = 'ejercicios' | 'libre'

export function Playground() {
  const [mode, setMode] = useState<Mode>('ejercicios')

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-white mb-3">Práctica</h1>

      {/* Toggle */}
      <div className="flex gap-2 mb-5 p-1 bg-panel rounded-xl border border-slate-700/50">
        {([['ejercicios', 'Ejercicios', Dumbbell], ['libre', 'Editor libre', Code2]] as const).map(
          ([m, label, Icon]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m ? 'bg-brand text-white' : 'text-slate-400'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          )
        )}
      </div>

      {mode === 'ejercicios' ? <ExercisesBrowser /> : <FreePlayground />}
    </div>
  )
}

// ─── Navegador de ejercicios (por curso → lección) ──────────────────────────

function ExercisesBrowser() {
  useContent() // re-render cuando cambia el contenido cargado
  const { isExerciseSolved, state } = useProgress()
  const [open, setOpen] = useState<string | null>(null)
  const groups = getExercisesByCourse()

  if (groups.length === 0) {
    return (
      <p className="text-slate-500 text-sm text-center py-10">
        Abre un curso para desbloquear sus ejercicios de código.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map(group => (
        <section key={group.courseId}>
          <h2 className="text-sm font-semibold text-slate-300 mb-2">{group.courseTitle}</h2>
          <div className="space-y-2">
            {group.lessons.map(lesson => {
              // Bloqueo: hay que completar la lección y aprobar su quiz
              const lessonDone = !!state.completedLessons[lesson.lessonId]
              const quizOk = lesson.quizCount === 0 ||
                (state.quizScores[lesson.lessonId] ?? 0) / lesson.quizCount >= 0.75
              const unlocked = lessonDone && quizOk

              return lesson.exercises.map(ex => {
                const isOpen = open === ex.id && unlocked
                const solved = isExerciseSolved(ex.id)
                return (
                  <div key={ex.id} className={`rounded-xl border overflow-hidden ${
                    unlocked ? 'border-slate-700/50 bg-panel' : 'border-slate-700/30 bg-slate-800/20'
                  }`}>
                    <button
                      onClick={() => unlocked && setOpen(isOpen ? null : ex.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left ${unlocked ? 'active:bg-slate-800/40' : ''}`}
                    >
                      {!unlocked
                        ? <Lock size={15} className="text-slate-600 shrink-0" />
                        : solved
                          ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                          : <Code2 size={16} className="text-slate-500 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm truncate block ${unlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                          {lesson.lessonTitle}
                        </span>
                        {!unlocked && (
                          <span className="text-[11px] text-slate-600">
                            {!lessonDone ? 'Completa la lección' : 'Aprueba el quiz'} para desbloquear
                          </span>
                        )}
                      </div>
                      {unlocked && (
                        <ChevronDown size={16} className={`text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-700/50">
                        <Exercise exercise={ex} />
                      </div>
                    )}
                  </div>
                )
              })
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

// ─── Editor libre (playground) ──────────────────────────────────────────────

const EXAMPLES: { label: string; code: string }[] = [
  { label: 'Hola mundo', code: 'print("¡Hola, mundo!")\nprint("Python en tu teléfono 🐍")' },
  { label: 'Variables', code: 'nombre = "Ana"\nedad = 25\nprint(f"{nombre} tiene {edad} años")' },
  {
    label: 'Listas y bucles',
    code: 'frutas = ["manzana", "banana", "naranja"]\nfor i, f in enumerate(frutas, 1):\n    print(f"{i}. {f.capitalize()}")',
  },
]

const DEFAULT_CODE = '# Escribe tu código Python aquí\nprint("¡Hola, mundo!")\n'

function FreePlayground() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [firstLoad, setFirstLoad] = useState(!isPyodideReady())

  const run = async () => {
    if (running) return
    setRunning(true); setResult(null)
    if (!isPyodideReady()) setFirstLoad(true)
    try {
      setResult(await runPython(code))
    } finally {
      setRunning(false); setFirstLoad(false)
    }
  }

  const reset = () => { setCode(DEFAULT_CODE); setResult(null) }

  return (
    <div>
      <div className="rounded-xl overflow-hidden border border-slate-700">
        <div className="flex items-center justify-between px-3 py-2 bg-[#161B22] border-b border-slate-700">
          <span className="text-xs text-slate-400">main.py</span>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="flex items-center gap-1 text-xs text-slate-500 active:text-slate-300 px-2 py-1">
              <RotateCcw size={12} /> Reset
            </button>
            <button onClick={run} disabled={running}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 active:bg-emerald-500 px-3 py-1.5 rounded-md disabled:opacity-60">
              {running
                ? <><Loader2 size={12} className="animate-spin" /> {firstLoad ? 'Cargando Python…' : 'Ejecutando…'}</>
                : <><Play size={12} /> Ejecutar</>}
            </button>
          </div>
        </div>
        <CodeEditor value={code} onChange={setCode} minHeight="200px" />
      </div>

      <div className="mt-3 rounded-xl border border-slate-700 bg-[#0D1117] overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-[#161B22]">
          <Terminal size={12} className="text-slate-500" />
          <span className="text-xs text-slate-500">Salida</span>
        </div>
        <div className="p-3 min-h-[60px] font-mono text-sm">
          {!result && !running && <p className="text-slate-700 text-xs italic">Presiona Ejecutar para ver la salida</p>}
          {firstLoad && running && <p className="text-slate-500 text-xs italic">Iniciando Python… (solo la primera vez)</p>}
          {result?.stdout && <pre className="text-emerald-400 whitespace-pre-wrap break-words">{result.stdout}</pre>}
          {result?.stderr && <pre className="text-yellow-400 whitespace-pre-wrap break-words">{result.stderr}</pre>}
          {result?.error && <pre className="text-red-400 whitespace-pre-wrap break-words text-xs">{result.error}</pre>}
        </div>
      </div>

      <h2 className="text-sm font-semibold text-slate-300 mt-6 mb-2">Ejemplos</h2>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map(ex => (
          <button key={ex.label} onClick={() => { setCode(ex.code); setResult(null) }}
            className="text-xs px-3 py-1.5 rounded-full bg-panel border border-slate-700 text-slate-300 active:border-blue-500/50">
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  )
}
