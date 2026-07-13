import { useState } from 'react'
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy, HelpCircle } from 'lucide-react'
import type { QuizQuestion } from '@/lib/content'
import { useProgress } from '@/lib/progress'

interface QuizProps {
  lessonId: string
  questions: QuizQuestion[]
}

type Phase = 'idle' | 'answering' | 'result'

export function Quiz({ lessonId, questions }: QuizProps) {
  const { submitQuiz, state } = useProgress()
  const [phase, setPhase] = useState<Phase>('idle')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [score, setScore] = useState(0)
  const [xpGained, setXpGained] = useState(0)

  const prevBest = state.quizScores[lessonId]

  const start = () => {
    setPhase('answering')
    setCurrent(0); setSelected(null); setRevealed(false)
    setAnswers([]); setScore(0); setXpGained(0)
  }

  const confirm = () => {
    if (selected === null || revealed) return
    const ok = selected === questions[current].correct
    setRevealed(true)
    setAnswers(a => [...a, ok])
    if (ok) setScore(s => s + 1)
  }

  const next = async () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1); setSelected(null); setRevealed(false)
    } else {
      const res = await submitQuiz(lessonId, questions, score)
      setXpGained(res.xp_earned)
      setPhase('result')
    }
  }

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle size={18} className="text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Pon a prueba lo aprendido</h2>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          {questions.length} preguntas de selección simple.
          {prevBest !== undefined && (
            <span className="text-emerald-400"> Tu mejor: {prevBest}/{questions.length}.</span>
          )}
        </p>
        <button
          onClick={start}
          className="w-full py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-semibold active:bg-yellow-500/20"
        >
          {prevBest !== undefined ? 'Reintentar quiz' : 'Comenzar quiz'}
        </button>
      </div>
    )
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const pct = Math.round((score / questions.length) * 100)
    const perfect = score === questions.length
    const passed = pct >= 75
    return (
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="bg-panel rounded-2xl p-6 border border-slate-700/50 text-center">
          <div className="text-5xl mb-3">{perfect ? '🎯' : passed ? '✅' : '📚'}</div>
          <h2 className="text-xl font-bold text-white mb-1">
            {perfect ? '¡Perfecto!' : passed ? '¡Aprobado!' : 'Sigue practicando'}
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            {score} de {questions.length} correctas ({pct}%)
          </p>
          <div className="flex justify-center gap-1.5 mb-5">
            {answers.map((ok, i) => (
              <div key={i} className={`h-2 w-9 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500/60'}`} />
            ))}
          </div>
          {xpGained > 0 && (
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-5">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-yellow-300 text-sm font-medium">+{xpGained} XP</span>
            </div>
          )}
          <button
            onClick={start}
            className="w-full py-2.5 rounded-xl border border-slate-600 text-slate-300 font-medium flex items-center justify-center gap-2 active:bg-slate-800"
          >
            <RotateCcw size={14} /> Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  // ── ANSWERING ─────────────────────────────────────────────────────────────
  const q = questions[current]
  return (
    <div className="mt-8 pt-6 border-t border-slate-800">
      {/* Progreso */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-white">
          Pregunta {current + 1} de {questions.length}
        </span>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 w-5 rounded-full ${
              i < answers.length ? (answers[i] ? 'bg-emerald-500' : 'bg-red-500/60')
              : i === current ? 'bg-yellow-400' : 'bg-slate-700'
            }`} />
          ))}
        </div>
      </div>

      <p className="text-white font-medium text-base mb-5 leading-relaxed">{q.question}</p>

      <div className="space-y-2 mb-5">
        {q.options.map((opt, idx) => {
          let cls = 'border-slate-700 bg-slate-800/50 text-slate-300 active:border-blue-500/50'
          if (revealed) {
            if (idx === q.correct) cls = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
            else if (idx === selected) cls = 'border-red-500/60 bg-red-500/10 text-red-300'
            else cls = 'border-slate-700/50 bg-slate-800/30 text-slate-500'
          } else if (idx === selected) {
            cls = 'border-blue-500/60 bg-blue-500/10 text-blue-300'
          }
          return (
            <button
              key={idx}
              onClick={() => !revealed && setSelected(idx)}
              disabled={revealed}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm flex items-center gap-3 ${cls}`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                {['A', 'B', 'C', 'D'][idx]}
              </span>
              <span className="flex-1">{opt}</span>
              {revealed && idx === q.correct && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
              {revealed && idx === selected && idx !== q.correct && <XCircle size={16} className="text-red-400 shrink-0" />}
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className="mb-5 p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300">
          <span className="font-semibold text-slate-200">Explicación: </span>{q.explanation}
        </div>
      )}

      {!revealed ? (
        <button
          onClick={confirm}
          disabled={selected === null}
          className="w-full py-3 rounded-xl bg-brand text-white font-semibold disabled:opacity-40 active:bg-blue-700"
        >
          Confirmar
        </button>
      ) : (
        <button
          onClick={next}
          className="w-full py-3 rounded-xl bg-brand text-white font-semibold flex items-center justify-center gap-2 active:bg-blue-700"
        >
          {current < questions.length - 1 ? <>Siguiente <ChevronRight size={16} /></> : <>Ver resultado <Trophy size={16} /></>}
        </button>
      )}
    </div>
  )
}
