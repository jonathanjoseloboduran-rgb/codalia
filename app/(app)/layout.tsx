import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { InstallPrompt } from '@/components/layout/InstallPrompt'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Datos del perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, total_xp, current_streak_days')
    .eq('id', user.id)
    .single()

  // Lecciones completadas
  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const completedLessons: Record<string, boolean> = {}
  for (const row of (progressRows ?? [])) {
    completedLessons[row.lesson_id] = true
  }

  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden">
      {/* Sidebar — oculto en mobile */}
      <div className="hidden lg:flex">
        <Sidebar completedLessons={completedLessons} />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          username={profile?.username ?? user.email?.split('@')[0]}
          avatarUrl={profile?.avatar_url ?? undefined}
          totalXP={profile?.total_xp ?? 0}
          streakDays={profile?.current_streak_days ?? 0}
          completedLessons={completedLessons}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <InstallPrompt />
    </div>
  )
}
