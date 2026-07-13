import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import {
  loadProgress, saveProgress, resetProgress, emptyState, type ProgressState,
} from './storage'
import {
  getCourse, getLessonQuiz, getLoadedCourses, getCatalogCourse, getLearningPaths,
  badges, type QuizQuestion,
} from './content'
import { XP_RULES, getLevelForXP, checkBadgeCondition, type UserStats } from './gamification'

interface LessonResult {
  xp_earned: number
  level_up: boolean
  new_level: number
  new_badges: { id: string; icon: string; name: string }[]
}

interface QuizResult {
  xp_earned: number
  perfect: boolean
  passed: boolean
}

interface ExerciseResult {
  xp_earned: number
  already_solved: boolean
  new_badges: { id: string; icon: string; name: string }[]
}

interface ProgressContextValue {
  state: ProgressState
  loading: boolean
  isComplete: (lessonId: string) => boolean
  isExerciseSolved: (exerciseId: string) => boolean
  isCourseUnlocked: (courseId: string) => boolean
  ownsPath: (pathId: string) => boolean
  grantPath: (pathId: string) => void
  revokePath: (pathId: string) => void
  setName: (name: string) => void
  claimCertificate: (pathId: string) => { code: string; date: string; name: string }
  markLessonComplete: (courseId: string, chapterId: string, lessonId: string) => Promise<LessonResult>
  submitQuiz: (lessonId: string, questions: QuizQuestion[], correctCount: number) => Promise<QuizResult>
  submitExercise: (exerciseId: string) => Promise<ExerciseResult>
  applyMerged: (merged: ProgressState) => void
  reset: () => Promise<void>
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress debe usarse dentro de <ProgressProvider>')
  return ctx
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function isPerfectScore(lessonId: string, score: number): boolean {
  const q = getLessonQuiz(lessonId)
  return !!q && score >= q.length
}

// Calcula estadísticas derivadas para evaluar badges
function computeStats(
  completed: Record<string, true>,
  quizScores: Record<string, number>,
  solvedExercises: Record<string, true>,
  streak: number,
): UserStats {
  let chapters = 0
  const coursesDone: string[] = []

  for (const course of getLoadedCourses()) {
    let courseLessons = 0, courseDone = 0
    for (const ch of course.chapters) {
      const chDone = ch.lessons.filter(l => completed[l.id]).length
      if (ch.lesson_count > 0 && chDone === ch.lesson_count) chapters++
      courseLessons += ch.lesson_count
      courseDone += chDone
    }
    if (courseLessons > 0 && courseDone === courseLessons) coursesDone.push(course.id)
  }

  const quizEntries = Object.entries(quizScores)
  const perfectQuizzes = quizEntries.filter(([lid, sc]) => isPerfectScore(lid, sc)).length

  return {
    lessons_completed: Object.keys(completed).length,
    chapters_completed: chapters,
    courses_completed: coursesDone,
    quiz_perfect_scores: perfectQuizzes,
    quizzes_completed: quizEntries.length,
    exercises_passed: Object.keys(solvedExercises).length,
    streak_days: streak,
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(emptyState())
  const [loading, setLoading] = useState(true)
  const stateRef = useRef(state)
  stateRef.current = state

  // Cargar progreso al inicio
  useEffect(() => {
    loadProgress().then(s => {
      setState(s)
      setLoading(false)
    })
  }, [])

  // Persistir cada cambio (después de la carga inicial)
  useEffect(() => {
    if (!loading) saveProgress(state)
  }, [state, loading])

  const isComplete = useCallback((lessonId: string) => !!stateRef.current.completedLessons[lessonId], [])

  const markLessonComplete = useCallback(async (
    courseId: string, chapterId: string, lessonId: string,
  ): Promise<LessonResult> => {
    const s = stateRef.current
    if (s.completedLessons[lessonId]) {
      return { xp_earned: 0, level_up: false, new_level: getLevelForXP(s.totalXP).level, new_badges: [] }
    }

    const course = getCourse(courseId)
    const completedAfter = { ...s.completedLessons, [lessonId]: true as const }

    let xpEarned = XP_RULES.lesson_completed

    // Capítulo completo
    const chapter = course?.chapters.find(ch => ch.id === chapterId)
    if (chapter) {
      const chDone = chapter.lessons.filter(l => completedAfter[l.id]).length
      if (chDone >= chapter.lesson_count) xpEarned += XP_RULES.chapter_completed
    }

    // Curso completo
    if (course) {
      const courseDone = course.chapters.reduce((a, ch) =>
        a + ch.lessons.filter(l => completedAfter[l.id]).length, 0)
      if (courseDone >= course.total_lessons) xpEarned += XP_RULES.course_completed
    }

    // Racha
    const t = today()
    let newStreak = s.currentStreak
    if (s.lastActiveDate !== t) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      newStreak = s.lastActiveDate === yesterday ? s.currentStreak + 1 : 1
      if (newStreak > 1) xpEarned += XP_RULES.daily_streak
    }

    const newXP = s.totalXP + xpEarned
    const oldLevel = getLevelForXP(s.totalXP).level
    const newLevel = getLevelForXP(newXP).level

    // Badges
    const stats = computeStats(completedAfter, s.quizScores, s.solvedExercises, newStreak)
    const newBadges: { id: string; icon: string; name: string }[] = []
    const earnedBadges = { ...s.earnedBadges }
    for (const badge of badges) {
      if (!earnedBadges[badge.id] && checkBadgeCondition(badge.condition, stats)) {
        earnedBadges[badge.id] = new Date().toISOString()
        newBadges.push({ id: badge.id, icon: badge.icon, name: badge.name })
      }
    }

    setState({
      ...s,
      completedLessons: completedAfter,
      totalXP: newXP,
      currentStreak: newStreak,
      longestStreak: Math.max(s.longestStreak, newStreak),
      lastActiveDate: t,
      earnedBadges,
    })

    return { xp_earned: xpEarned, level_up: newLevel > oldLevel, new_level: newLevel, new_badges: newBadges }
  }, [])

  const submitQuiz = useCallback(async (
    lessonId: string, questions: QuizQuestion[], correctCount: number,
  ): Promise<QuizResult> => {
    const s = stateRef.current
    const total = questions.length
    const perfect = correctCount === total
    const passed = correctCount / total >= 0.75
    const prevBest = s.quizScores[lessonId] ?? 0

    // Solo otorga XP si mejora el puntaje previo
    let xpEarned = 0
    if (correctCount > prevBest) {
      xpEarned = perfect ? XP_RULES.quiz_perfect : passed ? XP_RULES.quiz_passed : 0
    }

    setState({
      ...s,
      totalXP: s.totalXP + xpEarned,
      quizScores: { ...s.quizScores, [lessonId]: Math.max(prevBest, correctCount) },
    })

    return { xp_earned: xpEarned, perfect, passed }
  }, [])

  const isExerciseSolved = useCallback(
    (exerciseId: string) => !!stateRef.current.solvedExercises[exerciseId], [])

  const submitExercise = useCallback(async (exerciseId: string): Promise<ExerciseResult> => {
    const s = stateRef.current
    if (s.solvedExercises[exerciseId]) {
      return { xp_earned: 0, already_solved: true, new_badges: [] }
    }

    const xpEarned = XP_RULES.exercise_passed
    const newSolved = { ...s.solvedExercises, [exerciseId]: true as const }

    // Badges (puede desbloquear insignias de ejercicios)
    const stats = computeStats(s.completedLessons, s.quizScores, newSolved, s.currentStreak)
    const newBadges: { id: string; icon: string; name: string }[] = []
    const earnedBadges = { ...s.earnedBadges }
    for (const badge of badges) {
      if (!earnedBadges[badge.id] && checkBadgeCondition(badge.condition, stats)) {
        earnedBadges[badge.id] = new Date().toISOString()
        newBadges.push({ id: badge.id, icon: badge.icon, name: badge.name })
      }
    }

    setState({
      ...s,
      totalXP: s.totalXP + xpEarned,
      solvedExercises: newSolved,
      earnedBadges,
    })

    return { xp_earned: xpEarned, already_solved: false, new_badges: newBadges }
  }, [])

  // ─── Premium / desbloqueo de rutas ──────────────────────────────────────────
  const ownsPath = useCallback((pathId: string) => !!stateRef.current.entitlements[pathId], [])

  // Un curso está desbloqueado si es gratis, o si el usuario posee alguna
  // ruta premium que lo incluya.
  const isCourseUnlocked = useCallback((courseId: string) => {
    const cat = getCatalogCourse(courseId)
    if (!cat || !cat.premium) return true
    const paths = getLearningPaths().filter(p => p.courses.includes(courseId))
    return paths.some(p => stateRef.current.entitlements[p.id])
  }, [])

  const grantPath = useCallback((pathId: string) => {
    setState(s => ({ ...s, entitlements: { ...s.entitlements, [pathId]: true } }))
  }, [])

  const revokePath = useCallback((pathId: string) => {
    setState(s => {
      const e = { ...s.entitlements }
      delete e[pathId]
      return { ...s, entitlements: e }
    })
  }, [])

  const setName = useCallback((name: string) => {
    setState(s => ({ ...s, displayName: name.trim() }))
  }, [])

  // Genera (o devuelve) el certificado de una ruta. El nombre queda grabado
  // al emitirlo y ya no cambia (uno solo por ruta).
  const claimCertificate = useCallback((pathId: string) => {
    const existing = stateRef.current.certificates[pathId]
    if (existing) return existing
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
    const cert = {
      code: `CDL-${rand}`,
      date: new Date().toISOString(),
      name: stateRef.current.displayName ?? '',
    }
    setState(s => ({ ...s, certificates: { ...s.certificates, [pathId]: cert } }))
    return cert
  }, [])

  const applyMerged = useCallback((merged: ProgressState) => {
    setState(merged) // el effect de persistencia lo guarda local
  }, [])

  const reset = useCallback(async () => {
    await resetProgress()
    setState(emptyState())
  }, [])

  const value: ProgressContextValue = {
    state, loading, isComplete, isExerciseSolved,
    isCourseUnlocked, ownsPath, grantPath, revokePath, setName, claimCertificate,
    markLessonComplete, submitQuiz, submitExercise, applyMerged, reset,
  }

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
