import { createClient } from '@/lib/supabase/server'
import { badges as allBadges } from '@/lib/content'
import { getLevelForXP, getNextLevel, getProgressToNextLevel, LEVELS } from '@/lib/gamification'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Flame, Trophy, BookOpen, CheckCircle2, Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi perfil' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: userBadges } = await supabase
    .from('user_badges').select('badge_id, earned_at').eq('user_id', user!.id)

  const { data: progressRows } = await supabase
    .from('lesson_progress').select('lesson_id').eq('user_id', user!.id).eq('status', 'completed')

  const { data: xpEvents } = await supabase
    .from('xp_events').select('event_type, xp_amount, created_at')
    .eq('user_id', user!.id).order('created_at', { ascending: false }).limit(10)

  const earnedBadgeIds = new Set((userBadges ?? []).map(b => b.badge_id))
  const totalXP = profile?.total_xp ?? 0
  const level   = getLevelForXP(totalXP)
  const next    = getNextLevel(totalXP)
  const pct     = getProgressToNextLevel(totalXP)

  const rarityColor = {
    common:    'border-slate-600 text-slate-400',
    rare:      'border-blue-500/50 text-blue-400',
    epic:      'border-purple-500/50 text-purple-400',
    legendary: 'border-yellow-500/50 text-yellow-400',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header del perfil */}
      <div className="bg-[#1E293B] rounded-2xl p-6 flex flex-wrap gap-6 items-center border border-slate-700/50">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-blue-600 text-white text-xl">
            {(profile?.username?.[0] ?? 'U').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white">{profile?.username}</h1>
          <p className="text-slate-400 text-sm">Miembro desde {new Date(profile?.created_at).toLocaleDateString('es', { month: 'long', year: 'numeric' })}</p>
        </div>
        <Badge style={{ backgroundColor: level.color + '22', color: level.color, borderColor: level.color + '55' }} className="border text-sm px-3 py-1">
          Nivel {level.level} · {level.title}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Zap,         label: 'XP Total',      value: totalXP },
          { icon: BookOpen,    label: 'Lecciones',      value: progressRows?.length ?? 0 },
          { icon: Flame,       label: 'Racha actual',   value: `${profile?.current_streak_days ?? 0}d` },
          { icon: Trophy,      label: 'Mejor racha',    value: `${profile?.longest_streak ?? 0}d` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-[#1E293B] rounded-xl p-4 border border-slate-700/50 text-center">
            <Icon size={18} className="mx-auto text-blue-400 mb-2" />
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Barra de nivel */}
      <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Progreso de nivel</span>
          <span className="text-xs text-slate-400">
            {next ? `${totalXP} / ${next.xp} XP → ${next.title}` : '¡Nivel máximo!'}
          </span>
        </div>
        <Progress value={pct} className="h-3 bg-slate-700" />
        <div className="flex justify-between mt-1 text-[10px] text-slate-600">
          <span>Nv.{level.level}</span>
          {next && <span>Nv.{next.level}</span>}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">
          Badges <span className="text-slate-500 font-normal text-sm">({earnedBadgeIds.size}/{allBadges.length})</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allBadges.map(badge => {
            const earned = earnedBadgeIds.has(badge.id)
            return (
              <div
                key={badge.id}
                className={`rounded-xl p-4 border transition-all ${
                  earned
                    ? `bg-[#1E293B] ${rarityColor[badge.rarity]}`
                    : 'bg-slate-800/30 border-slate-700/30 opacity-40 grayscale'
                }`}
              >
                <div className="text-2xl mb-2">{badge.icon}</div>
                <p className="font-semibold text-white text-sm">{badge.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{badge.description}</p>
                {badge.xp_reward > 0 && earned && (
                  <span className="mt-2 inline-block text-[10px] text-yellow-400">+{badge.xp_reward} XP</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Historial XP reciente */}
      {xpEvents && xpEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Actividad reciente</h2>
          <div className="space-y-2">
            {xpEvents.map((ev, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-4 bg-[#1E293B] rounded-lg border border-slate-700/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-sm text-slate-300">
                    {ev.event_type === 'lesson_completed'   ? 'Lección completada' :
                     ev.event_type === 'chapter_completed'  ? 'Capítulo completado' :
                     ev.event_type === 'course_completed'   ? '🎉 Curso completado' :
                     ev.event_type === 'exercise_passed'    ? 'Ejercicio resuelto' :
                     ev.event_type === 'quiz_perfect'       ? '💯 Quiz perfecto' :
                     ev.event_type}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 text-sm font-medium">+{ev.xp_amount} XP</span>
                  <span className="text-xs text-slate-600">{new Date(ev.created_at).toLocaleDateString('es')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
