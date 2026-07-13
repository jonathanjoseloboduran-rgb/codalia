import { useEffect, useRef } from 'react'
import { useAuth } from './auth'
import { useProgress } from './progress'
import { pullProgress, pushProgress, mergeProgress } from './sync'
import { supabase } from './supabase'
import { getLearningPaths } from './content'

// Sincroniza el progreso local con la nube cuando hay sesión.
export function useSync() {
  const { user } = useAuth()
  const { state, applyMerged, loading } = useProgress()
  const stateRef = useRef(state)
  stateRef.current = state
  const syncedUser = useRef<string | null>(null)
  const pushTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Al iniciar sesión: traer remoto → fusionar → subir
  useEffect(() => {
    if (loading) return
    if (!user) { syncedUser.current = null; return }
    if (syncedUser.current === user.id) return
    syncedUser.current = user.id
    ;(async () => {
      try {
        const remote = await pullProgress(user.id)
        const merged = remote ? mergeProgress(stateRef.current, remote) : stateRef.current
        applyMerged(merged)
        await pushProgress(user.id, merged)
      } catch {
        // sin conexión: queda el progreso local, se sube luego
      }
    })()
  }, [user, loading, applyMerged])

  // Al cambiar el progreso (con sesión ya fusionada): subir con debounce
  useEffect(() => {
    if (loading || !user || syncedUser.current !== user.id) return
    clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(() => {
      pushProgress(user.id, stateRef.current).catch(() => {})
    }, 1500)
    return () => clearTimeout(pushTimer.current)
  }, [state, user, loading])

  // Registrar los certificados en la tabla pública (los hace verificables online)
  useEffect(() => {
    if (loading || !user) return
    const certs = Object.entries(state.certificates)
    if (certs.length === 0) return
    const paths = getLearningPaths()
    const rows = certs
      .filter(([, c]) => c.name) // solo certificados ya emitidos con nombre
      .map(([pathId, c]) => {
        const p = paths.find(x => x.id === pathId)
        return {
          code: c.code,
          user_id: user.id,
          name: c.name,
          path_id: pathId,
          path_title: p?.title ?? pathId,
          level: p?.level ?? null,
          issued_at: c.date,
        }
      })
    if (rows.length) {
      supabase.from('certificates').upsert(rows, { onConflict: 'code' }).then(() => {})
    }
  }, [state.certificates, user, loading])
}
