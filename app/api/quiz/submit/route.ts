import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { XP_RULES, getLevelForXP } from '@/lib/gamification'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId, courseId, score, total } = await request.json()
  // score = número de respuestas correctas, total = número total (4)

  const perfect  = score === total
  const passed   = score / total >= 0.75
  const xpEarned = perfect ? XP_RULES.quiz_perfect : passed ? XP_RULES.quiz_passed : 0

  // Guardar intento
  await supabase.from('quiz_attempts').insert({
    user_id:   user.id,
    lesson_id: lessonId,
    course_id: courseId,
    score,
    total,
    perfect,
    passed,
  })

  if (xpEarned > 0) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_xp')
      .eq('id', user.id)
      .single()

    const oldXP = profile?.total_xp ?? 0
    const newXP = oldXP + xpEarned
    const levelUp = getLevelForXP(newXP).level > getLevelForXP(oldXP).level

    await supabase.from('profiles').update({ total_xp: newXP }).eq('id', user.id)
    await supabase.from('xp_events').insert({
      user_id:    user.id,
      event_type: perfect ? 'quiz_perfect' : 'quiz_passed',
      xp_amount:  xpEarned,
      context:    { lessonId, courseId, score, total },
    })

    return NextResponse.json({ xp_earned: xpEarned, new_total: newXP, level_up: levelUp, perfect, passed })
  }

  return NextResponse.json({ xp_earned: 0, perfect, passed })
}
