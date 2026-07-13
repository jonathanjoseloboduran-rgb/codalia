// Persistencia local del progreso. Usa Capacitor Preferences en el APK
// y localStorage en el navegador (dev). Todo vive en el dispositivo.

import { Preferences } from '@capacitor/preferences'

const KEY = 'codalia.progress.v1'

export interface ProgressState {
  completedLessons: Record<string, true>   // lessonId → true
  totalXP: number
  earnedBadges: Record<string, string>      // badgeId → ISO date
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null             // YYYY-MM-DD
  quizScores: Record<string, number>        // lessonId → mejor puntaje (0..total)
  solvedExercises: Record<string, true>     // exerciseId → resuelto
  entitlements: Record<string, true>        // pathId → ruta premium desbloqueada
  displayName?: string                       // nombre para los certificados (se fija una vez)
  certificates: Record<string, { code: string; date: string; name: string }> // pathId → certificado
  createdAt: string
}

export function emptyState(): ProgressState {
  return {
    completedLessons: {},
    totalXP: 0,
    earnedBadges: {},
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    quizScores: {},
    solvedExercises: {},
    entitlements: {},
    certificates: {},
    createdAt: new Date().toISOString(),
  }
}

export async function loadProgress(): Promise<ProgressState> {
  try {
    const { value } = await Preferences.get({ key: KEY })
    if (value) return { ...emptyState(), ...JSON.parse(value) }
  } catch (e) {
    console.error('Error cargando progreso:', e)
  }
  return emptyState()
}

export async function saveProgress(state: ProgressState): Promise<void> {
  try {
    await Preferences.set({ key: KEY, value: JSON.stringify(state) })
  } catch (e) {
    console.error('Error guardando progreso:', e)
  }
}

export async function resetProgress(): Promise<void> {
  try {
    await Preferences.remove({ key: KEY })
  } catch (e) {
    console.error('Error reiniciando progreso:', e)
  }
}
