'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  CheckCircle2, XCircle, Sparkles, RotateCcw, Loader2, ChevronRight, Trophy
} from 'lucide-react'
import type { QuizQuestion } from '@/app/api/quiz/generate/route'

/** Markdown inline para preguntas, opciones y explicaciones del quiz */
function MD({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        p: ({ children }) => <span>{children}</span>,
        code: ({ className, children }) => {
          // Bloque de código (con className tipo language-python)
          if (className) {
            return (
              <pre className="my-3 p-3 rounded-lg bg-[#0D1117] border border-slate-700/50 overflow-x-auto text-xs leading-relaxed">
                <code className={className}>{children}</code>
              </pre>
            )
          }
          // Código inline
          return (
            <code className="px-1.5 py-0.5 rounded bg-slate-900 text-blue-300 text-[0.85em] font-mono">
              {children}
            </code>
          )
        },
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

interface QuizProps {
  courseId:  string
  chapterId: string
  lessonId:  string
}

type Phase = 'idle' | 'loading' | 'answering' | 'result'

export function Quiz({ courseId, chapterId, lessonId }: QuizProps) {
  const [phase, setPhase]         = useState<Phase>('idle')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [current, setCurrent]     = useState(0)
  const [selected, setSelected]   = useState<number | null>(null)
  const [answers, setAnswers]     = useState<boolean[]>([])
  const [revealed, setRevealed]   = useState(false)
  const [score, setScore]         = useState(0)

  const load = async () => {
    setPhase('loading')
    try {
      const res = await fetch('/api/quiz/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ lessonId, courseId, chapterId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Quiz no disponible para esta lección.')
        setPhase('idle')
        return
      }
      setQuestions(data.questions)
      setCurrent(0)
      setAnswers([])
      setScore(0)
      setSelected(null)
      setRevealed(false)
      setPhase('answering')
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.')
      setPhase('idle')
    }
  }

  const choose = (idx: number) => {
    if (revealed) return
    setSelected(idx)
  }

  const confirm = () => {
    if (selected === null) return
    const correct = selected === questions[current].correct
    setRevealed(true)
    setAnswers(prev => [...prev, correct])
    if (correct) setScore(s => s + 1)
  }

  const next = async () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
      setSelected(null)
      setRevealed(false)
    } else {
      // Último — enviar resultado
      const finalScore = score + (selected === questions[current].correct ? 0 : 0)
      // score ya se actualizó en confirm()
      setPhase('result')
      try {
        const res = await fetch('/api/quiz/submit', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ lessonId, courseId, score, total: questions.length }),
        })
        const data = await res.json()
        if (data.xp_earned > 0) {
          toast.success(`+${data.xp_earned} XP`, {
            description: data.perfect ? '¡Quiz perfecto! 🎯' : '¡Quiz aprobado!',
          })
        }
      } catch {
        // silencioso — el quiz igual se muestra
      }
    }
  }

  const restart = () => {
    setPhase('idle')
    setQuestions([])
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setRevealed(false)
    setScore(0)
  }

  // ── IDLE ────────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="mt-10 border-t border-slate-800 pt-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={18} className="text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Quiz de la lección</h2>
        </div>
        <p className="text-slate-400 text-sm mb-5">
          Pon a prueba lo que aprendiste con 4 preguntas generadas por IA. Si apruebas ganas XP.
        </p>
        <Button
          onClick={load}
          className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 gap-2"
        >
          <Sparkles size={14} />
          Generar quiz
        </Button>
      </div>
    )
  }

  // ── LOADING ──────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="mt-10 border-t border-slate-800 pt-8">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 size={18} className="animate-spin text-yellow-400" />
          <span className="text-sm">Generando preguntas con IA...</span>
        </div>
      </div>
    )
  }

  // ── RESULT ───────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const pct     = Math.round((score / questions.length) * 100)
    const perfect = score === questions.length
    const passed  = pct >= 75

    return (
      <div className="mt-10 border-t border-slate-800 pt-8">
        <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-700/50 text-center">
          <div className="text-5xl mb-3">
            {perfect ? '🎯' : passed ? '✅' : '📚'}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {perfect ? '¡Quiz perfecto!' : passed ? '¡Aprobado!' : 'Sigue practicando'}
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Respondiste {score} de {questions.length} preguntas correctamente ({pct}%)
          </p>

          {/* Barra de resultado */}
          <div className="flex justify-center gap-1.5 mb-5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-10 rounded-full ${
                  answers[i] ? 'bg-emerald-500' : 'bg-red-500/60'
                }`}
              />
            ))}
          </div>

          {passed && (
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-5">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-yellow-300 text-sm font-medium">
                +{perfect ? 30 : 15} XP ganados
              </span>
            </div>
          )}

          <Button
            onClick={restart}
            variant="outline"
            className="gap-2 border-slate-600 text-slate-300 hover:text-white"
          >
            <RotateCcw size={14} />
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  // ── ANSWERING ────────────────────────────────────────────────────────────────
  const q = questions[current]

  return (
    <div className="mt-10 border-t border-slate-800 pt-8">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-400" />
          <span className="text-sm font-semibold text-white">
            Quiz — Pregunta {current + 1} de {questions.length}
          </span>
        </div>
        {/* Progreso de puntos */}
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i < answers.length
                  ? answers[i] ? 'bg-emerald-500' : 'bg-red-500/60'
                  : i === current ? 'bg-yellow-400' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Pregunta */}
      <div className="text-white font-medium text-base mb-5 leading-relaxed">
        <MD>{q.question}</MD>
      </div>

      {/* Opciones */}
      <div className="space-y-2 mb-5">
        {q.options.map((option, idx) => {
          let style = 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-blue-500/50 hover:text-white'

          if (revealed) {
            if (idx === q.correct) {
              style = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
            } else if (idx === selected && idx !== q.correct) {
              style = 'border-red-500/60 bg-red-500/10 text-red-300'
            } else {
              style = 'border-slate-700/50 bg-slate-800/30 text-slate-500'
            }
          } else if (idx === selected) {
            style = 'border-blue-500/60 bg-blue-500/10 text-blue-300'
          }

          return (
            <button
              key={idx}
              onClick={() => choose(idx)}
              disabled={revealed}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${style}`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                {['A', 'B', 'C', 'D'][idx]}
              </span>
              <span className="flex-1"><MD>{option}</MD></span>
              {revealed && idx === q.correct && (
                <CheckCircle2 size={16} className="ml-auto text-emerald-400 shrink-0" />
              )}
              {revealed && idx === selected && idx !== q.correct && (
                <XCircle size={16} className="ml-auto text-red-400 shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {/* Explicación (tras revelar) */}
      {revealed && (
        <div className="mb-5 p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300">
          <span className="font-semibold text-slate-200">Explicación: </span>
          <MD>{q.explanation}</MD>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-2">
        {!revealed ? (
          <Button
            onClick={confirm}
            disabled={selected === null}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            Confirmar respuesta
          </Button>
        ) : (
          <Button
            onClick={next}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {current < questions.length - 1 ? (
              <>Siguiente <ChevronRight size={14} /></>
            ) : (
              <>Ver resultado <Trophy size={14} /></>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
