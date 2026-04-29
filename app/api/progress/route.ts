import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getCourse, getLesson, badges } from '@/lib/content'
import { XP_RULES, getLevelForXP, checkBadgeCondition } from '@/lib/gamification'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, lessonId, chapterId } = await request.json()

  // Buscar chapterId desde el contenido si no viene en el body
  const course = getCourse(courseId)
  let resolvedChapterId = chapterId
  if (!resolvedChapterId && course) {
    for (const ch of course.chapters) {
      if (ch.lessons.some(l => l.id === lessonId)) {
        resolvedChapterId = ch.id
        break
      }
    }
  }

  // Verificar si ya estaba completada
  const { data: existing } = await supabase
    .from('lesson_progress')
    .select('status')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .single()

  if (existing?.status === 'completed') {
    return NextResponse.json({ already_completed: true, xp_earned: 0 })
  }

  // Marcar lección como completada
  await supabase.from('lesson_progress').upsert({
    user_id:    user.id,
    course_id:  courseId,
    chapter_id: resolvedChapterId,
    lesson_id:  lessonId,
    status:     'completed',
    completed_at: new Date().toISOString(),
  })

  // XP por lección
  let xpEarned = XP_RULES.lesson_completed

  // Verificar si el capítulo quedó completo
  const chapter = course?.chapters.find(ch => ch.id === resolvedChapterId)
  if (chapter) {
    const { data: chapterProgress } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('chapter_id', resolvedChapterId)
      .eq('status', 'completed')

    if ((chapterProgress?.length ?? 0) >= chapter.lesson_count) {
      xpEarned += XP_RULES.chapter_completed
      await supabase.from('xp_events').insert({
        user_id: user.id, event_type: 'chapter_completed',
        xp_amount: XP_RULES.chapter_completed,
        context: { courseId, chapterId: resolvedChapterId },
      })
    }
  }

  // Verificar si el curso quedó completo
  if (course) {
    const { data: courseProgress } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'completed')

    if ((courseProgress?.length ?? 0) >= course.total_lessons) {
      xpEarned += XP_RULES.course_completed
      await supabase.from('xp_events').insert({
        user_id: user.id, event_type: 'course_completed',
        xp_amount: XP_RULES.course_completed, context: { courseId },
      })
    }
  }

  // Actualizar racha
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_xp, current_level, current_streak_days, longest_streak, last_active_date')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]
  const lastActive = profile?.last_active_date
  let newStreak = profile?.current_streak_days ?? 0

  if (lastActive !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    newStreak = lastActive === yesterday ? newStreak + 1 : 1
    if (newStreak > 1) xpEarned += XP_RULES.daily_streak
  }

  // Guardar evento XP de lección
  await supabase.from('xp_events').insert({
    user_id: user.id, event_type: 'lesson_completed',
    xp_amount: XP_RULES.lesson_completed, context: { courseId, lessonId },
  })

  const oldXP   = profile?.total_xp ?? 0
  const newXP   = oldXP + xpEarned
  const oldLevel = getLevelForXP(oldXP).level
  const newLevel = getLevelForXP(newXP).level
  const levelUp = newLevel > oldLevel

  // Actualizar perfil
  await supabase.from('profiles').update({
    total_xp:            newXP,
    current_level:       newLevel,
    current_streak_days: newStreak,
    longest_streak:      Math.max(profile?.longest_streak ?? 0, newStreak),
    last_active_date:    today,
  }).eq('id', user.id)

  // Verificar badges nuevos
  const { data: existingBadges } = await supabase
    .from('user_badges').select('badge_id').eq('user_id', user.id)
  const earnedSet = new Set((existingBadges ?? []).map(b => b.badge_id))

  // Stats actualizadas para evaluar condiciones
  const { data: allProgress } = await supabase
    .from('lesson_progress').select('lesson_id, course_id').eq('user_id', user.id).eq('status', 'completed')
  const { data: exercises }   = await supabase
    .from('exercise_attempts').select('passed').eq('user_id', user.id)
  const { data: quizzes }     = await supabase
    .from('quiz_attempts').select('perfect').eq('user_id', user.id)

  const completedCourseIds = new Set<string>()
  if (course && (allProgress?.filter(r => r.course_id === courseId).length ?? 0) >= course.total_lessons)
    completedCourseIds.add(courseId)

  const stats = {
    lessons_completed:   allProgress?.length ?? 0,
    chapters_completed:  0,
    courses_completed:   Array.from(completedCourseIds),
    exercises_passed:    exercises?.filter(e => e.passed).length ?? 0,
    exercises_attempted: exercises?.length ?? 0,
    quiz_perfect_scores: quizzes?.filter(q => q.perfect).length ?? 0,
    quizzes_completed:   quizzes?.length ?? 0,
    streak_days:         newStreak,
    all_lessons_total:   115,
  }

  const newBadges = []
  for (const badge of badges) {
    if (!earnedSet.has(badge.id) && checkBadgeCondition(badge.condition, stats)) {
      await supabase.from('user_badges').insert({ user_id: user.id, badge_id: badge.id })
      if (badge.xp_reward > 0) {
        await supabase.from('profiles').update({ total_xp: newXP + badge.xp_reward }).eq('id', user.id)
      }
      newBadges.push({ id: badge.id, icon: badge.icon, name: badge.name })
    }
  }

  return NextResponse.json({
    xp_earned:  xpEarned,
    new_total:  newXP,
    level_up:   levelUp,
    new_level:  newLevel,
    new_streak: newStreak,
    new_badges: newBadges,
  })
}
