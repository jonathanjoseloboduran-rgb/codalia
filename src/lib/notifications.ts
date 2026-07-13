// Recordatorio diario de racha (notificación local). Mantiene el hábito.
// Se reprograma en cada apertura con la racha actual.

import { LocalNotifications } from '@capacitor/local-notifications'

const REMINDER_ID = 1001
const HOUR = 20 // 8:00 PM

function bodyFor(streak: number): string {
  if (streak <= 0) return 'Dedica unos minutos a Python hoy 🐍'
  if (streak === 1) return '¡Empezaste una racha! Vuelve hoy para no perderla 🔥'
  return `Llevas ${streak} días seguidos. ¡No pierdas tu racha hoy! 🔥`
}

export async function scheduleStreakReminder(streak: number): Promise<void> {
  try {
    // Pedir permiso (Android 13+ lo requiere)
    const perm = await LocalNotifications.requestPermissions()
    if (perm.display !== 'granted') return

    // Cancelar el anterior y reprogramar
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] })
    await LocalNotifications.schedule({
      notifications: [{
        id: REMINDER_ID,
        title: 'Codalia',
        body: bodyFor(streak),
        schedule: { on: { hour: HOUR, minute: 0 }, allowWhileIdle: true },
        smallIcon: 'ic_stat_icon',
      }],
    })
  } catch {
    // En web o si falla el plugin, no hace nada
  }
}
