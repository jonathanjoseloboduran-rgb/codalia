'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { lessonUrl } from '@/lib/content'

interface NavLesson { lesson: { id: string; title: string }; chapterId: string }

interface LessonNavProps {
  courseId:    string
  lessonId:    string
  isCompleted: boolean
  prev:        NavLesson | null
  next:        NavLesson | null
}

export function LessonNav({ courseId, lessonId, isCompleted, prev, next }: LessonNavProps) {
  const [completed, setCompleted] = useState(isCompleted)
  const [loading, setLoading]     = useState(false)

  const markComplete = async () => {
    if (completed || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId }),
      })
      const data = await res.json()
      if (res.ok) {
        setCompleted(true)
        toast.success(`+${data.xp_earned} XP`, {
          description: data.level_up ? `🎉 ¡Subiste al nivel ${data.new_level}!` : '¡Lección completada!',
        })
        if (data.new_badges?.length) {
          data.new_badges.forEach((b: { icon: string; name: string }) =>
            toast.success(`${b.icon} ${b.name}`, { description: '¡Nuevo badge desbloqueado!' })
          )
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-800">
      {/* Anterior */}
      <div className="flex-1">
        {prev ? (
          <Link
            href={lessonUrl(courseId, prev.chapterId, prev.lesson.id)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <div>
              <p className="text-xs text-slate-600">Anterior</p>
              <p className="text-sm font-medium line-clamp-1">{prev.lesson.title}</p>
            </div>
          </Link>
        ) : <div />}
      </div>

      {/* Marcar completada */}
      <Button
        onClick={markComplete}
        disabled={completed || loading}
        className={`mx-4 gap-2 ${
          completed
            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/20'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <CheckCircle2 size={16} />
        {completed ? 'Completada' : loading ? 'Guardando...' : 'Marcar completada'}
      </Button>

      {/* Siguiente */}
      <div className="flex-1 flex justify-end">
        {next ? (
          <Link
            href={lessonUrl(courseId, next.chapterId, next.lesson.id)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-right"
          >
            <div>
              <p className="text-xs text-slate-600">Siguiente</p>
              <p className="text-sm font-medium line-clamp-1">{next.lesson.title}</p>
            </div>
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <Link
            href={`/courses/${courseId}`}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">Ver capítulos</span>
          </Link>
        )}
      </div>
    </div>
  )
}
