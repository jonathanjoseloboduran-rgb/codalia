import { supabase } from './supabase'
import type { ProgressState } from './storage'

// Fusiona progreso local y remoto tomando lo MEJOR de cada uno.
// El progreso es monotónico (solo se gana), así que nunca se pierde nada.
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  // Badges: unión, conservando la fecha más temprana
  const earnedBadges: Record<string, string> = { ...b.earnedBadges }
  for (const [id, date] of Object.entries(a.earnedBadges)) {
    if (!earnedBadges[id] || date < earnedBadges[id]) earnedBadges[id] = date
  }

  // Quiz scores: el mejor de cada lección
  const quizScores: Record<string, number> = { ...b.quizScores }
  for (const [lid, sc] of Object.entries(a.quizScores)) {
    quizScores[lid] = Math.max(sc, quizScores[lid] ?? 0)
  }

  const lastActiveDate = (a.lastActiveDate ?? '') >= (b.lastActiveDate ?? '')
    ? a.lastActiveDate : b.lastActiveDate

  // La racha actual: la del que estuvo activo más recientemente
  const currentStreak = (a.lastActiveDate ?? '') >= (b.lastActiveDate ?? '')
    ? a.currentStreak : b.currentStreak

  return {
    completedLessons: { ...b.completedLessons, ...a.completedLessons },
    solvedExercises: { ...b.solvedExercises, ...a.solvedExercises },
    entitlements: { ...b.entitlements, ...a.entitlements },
    certificates: { ...b.certificates, ...a.certificates },
    displayName: a.displayName || b.displayName,
    earnedBadges,
    quizScores,
    totalXP: Math.max(a.totalXP, b.totalXP),
    currentStreak,
    longestStreak: Math.max(a.longestStreak, b.longestStreak),
    lastActiveDate,
    createdAt: (a.createdAt < b.createdAt ? a.createdAt : b.createdAt),
  }
}

// Trae el progreso guardado en la nube para un usuario (o null)
export async function pullProgress(userId: string): Promise<ProgressState | null> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data.data as ProgressState
}

// Sube el progreso a la nube
export async function pushProgress(userId: string, state: ProgressState): Promise<void> {
  await supabase
    .from('user_progress')
    .upsert({ user_id: userId, data: state, updated_at: new Date().toISOString() })
}
