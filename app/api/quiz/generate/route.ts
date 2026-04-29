import { NextResponse } from 'next/server'
import { getLesson } from '@/lib/content'
import quizzesData from '@/data/quizzes.json'

export interface QuizQuestion {
  question:    string
  options:     string[]   // 4 opciones sin prefijo A/B/C/D
  correct:     number     // índice 0-3
  explanation: string
}

export interface QuizData {
  lessonId:  string
  questions: QuizQuestion[]
}

const quizzes = quizzesData as Record<string, QuizQuestion[]>

export async function POST(request: Request) {
  const { lessonId, courseId, chapterId } = await request.json()

  if (!lessonId || !courseId || !chapterId) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  // Verificar que la lección existe
  const lesson = getLesson(courseId, chapterId, lessonId)
  if (!lesson) {
    return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 })
  }

  const questions = quizzes[lessonId]
  if (!questions || questions.length === 0) {
    return NextResponse.json(
      { error: 'Quiz no disponible para esta lección todavía.' },
      { status: 404 }
    )
  }

  return NextResponse.json({ lessonId, questions } satisfies QuizData)
}
