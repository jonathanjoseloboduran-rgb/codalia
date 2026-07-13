import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useProgress } from './lib/progress'
import { useBackButton } from './lib/useBackButton'
import { useSync } from './lib/useSync'
import { scheduleStreakReminder } from './lib/notifications'
import { showAdBanner, hideAdBanner } from './lib/ads'
import { Logo } from './components/Logo'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { Home } from './screens/Home'
import { CourseScreen } from './screens/Course'
import { LessonScreen } from './screens/Lesson'
import { Playground } from './screens/Playground'
import { Profile } from './screens/Profile'

export default function App() {
  const { loading, state } = useProgress()
  useBackButton()
  useSync()

  // Programar/actualizar el recordatorio de racha al cargar y cuando cambia
  useEffect(() => {
    if (!loading) scheduleStreakReminder(state.currentStreak)
  }, [loading, state.currentStreak])

  // Anuncios: banner para free; quien tenga alguna ruta premium, sin ads
  const hasPremium = Object.keys(state.entitlements).length > 0
  useEffect(() => {
    if (loading) return
    if (hasPremium) hideAdBanner()
    else showAdBanner()
  }, [loading, hasPremium])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-ink">
        <div className="flex flex-col items-center gap-4">
          <Logo size={72} />
          <div className="w-7 h-7 border-2 border-slate-700 border-t-brand rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-ink" style={{ paddingBottom: 'var(--ad-height, 0px)' }}>
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/course/:courseId" element={<CourseScreen />} />
          <Route path="/course/:courseId/:chapterId/:lessonId" element={<LessonScreen />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
