// Reglas de XP, niveles y badges para Codalia

export const XP_RULES = {
  lesson_completed:  10,
  exercise_passed:   25,
  quiz_perfect:      30,
  quiz_passed:       15,
  daily_streak:       5,
  chapter_completed: 50,
  course_completed:  200,
} as const

export type XPEventType = keyof typeof XP_RULES

export interface Level {
  level: number
  xp: number
  title: string
  color: string
}

export const LEVELS: Level[] = [
  { level: 1,  xp: 0,     title: 'Aprendiz',    color: '#64748B' },
  { level: 2,  xp: 100,   title: 'Iniciado',     color: '#3B82F6' },
  { level: 3,  xp: 250,   title: 'Practicante',  color: '#3B82F6' },
  { level: 5,  xp: 500,   title: 'Programador',  color: '#8B5CF6' },
  { level: 7,  xp: 900,   title: 'Desarrollador', color: '#8B5CF6' },
  { level: 10, xp: 1500,  title: 'Pythonista',   color: '#10B981' },
  { level: 13, xp: 2500,  title: 'Experto',      color: '#F59E0B' },
  { level: 17, xp: 4000,  title: 'Arquitecto',   color: '#EF4444' },
  { level: 20, xp: 6000,  title: 'Maestro',      color: '#EC4899' },
  { level: 25, xp: 10000, title: 'Leyenda',      color: '#F97316' },
]

export function getLevelForXP(xp: number): Level {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (xp >= lvl.xp) current = lvl
    else break
  }
  return current
}

export function getNextLevel(xp: number): Level | null {
  for (const lvl of LEVELS) {
    if (xp < lvl.xp) return lvl
  }
  return null
}

export function getProgressToNextLevel(xp: number): number {
  const current = getLevelForXP(xp)
  const next = getNextLevel(xp)
  if (!next) return 100
  const range = next.xp - current.xp
  const earned = xp - current.xp
  return Math.round((earned / range) * 100)
}

// ─── Condiciones de badges ────────────────────────────────────────────────────

export interface UserStats {
  lessons_completed: number
  chapters_completed: number
  courses_completed: string[]
  exercises_passed: number
  exercises_attempted: number
  quiz_perfect_scores: number
  quizzes_completed: number
  streak_days: number
  all_lessons_total: number
}

export function checkBadgeCondition(
  condition: Record<string, unknown>,
  stats: UserStats,
): boolean {
  const type = condition.type as string
  const count = condition.count as number | undefined

  switch (type) {
    case 'lessons_completed':
      return stats.lessons_completed >= (count ?? 1)
    case 'chapters_completed':
      return stats.chapters_completed >= (count ?? 1)
    case 'exercises_passed':
      return stats.exercises_passed >= (count ?? 1)
    case 'exercises_attempted':
      return stats.exercises_attempted >= (count ?? 1)
    case 'quiz_perfect_score':
      return stats.quiz_perfect_scores >= (count ?? 1)
    case 'quizzes_completed':
      return stats.quizzes_completed >= (count ?? 1)
    case 'streak_days':
      return stats.streak_days >= (count ?? 1)
    case 'course_completed':
      return stats.courses_completed.includes(condition.course_id as string)
    case 'all_courses_completed':
      return stats.courses_completed.length >= 5 // 5 cursos disponibles
    default:
      return false
  }
}
