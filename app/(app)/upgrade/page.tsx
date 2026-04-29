import { createClient } from '@/lib/supabase/server'
import { Check, Sparkles, X, Zap, BookOpen, Award } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Codalia Premium' }

const FREE_FEATURES = [
  { ok: true,  text: 'Curso "Python Básico" completo' },
  { ok: true,  text: 'Playground Python ilimitado' },
  { ok: true,  text: 'Quizzes y ejercicios' },
  { ok: true,  text: 'Sistema de XP, racha y badges' },
  { ok: false, text: 'Cursos avanzados (Arquitectura, IA…)' },
  { ok: false, text: 'Sin anuncios' },
  { ok: false, text: 'Tutor IA en cualquier lección' },
  { ok: false, text: 'Certificados verificables' },
]

const PREMIUM_FEATURES = [
  { ok: true, text: 'Todo lo gratis, sin límites' },
  { ok: true, text: 'Cursos avanzados desbloqueados' },
  { ok: true, text: 'Sin anuncios, en ningún lado' },
  { ok: true, text: 'Tutor IA en cada lección' },
  { ok: true, text: 'Certificados verificables al completar cursos' },
  { ok: true, text: 'Soporte prioritario' },
]

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, premium_until')
    .eq('id', user!.id)
    .single()

  const isPremium = profile?.is_premium ?? false

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-4">
          <Sparkles size={12} className="text-blue-400" />
          <span className="text-xs font-medium text-blue-300">Codalia Premium</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Aprende sin distracciones
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Por menos de un café al mes accedes a todos los cursos, sin anuncios, con tutor IA y certificados.
        </p>
      </div>

      {/* Estado actual */}
      {isPremium && (
        <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-emerald-300 font-semibold">✨ Ya eres Premium</p>
          <p className="text-emerald-400/70 text-sm mt-1">
            Gracias por apoyar a Codalia.
          </p>
        </div>
      )}

      {/* Planes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gratis */}
        <div className="rounded-2xl border border-slate-700/50 bg-[#1E293B] p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-bold text-white">Gratis</h2>
            <span className="text-xs text-slate-500">Para siempre</span>
          </div>
          <p className="text-3xl font-bold text-white mt-2 mb-1">$0<span className="text-base font-normal text-slate-500">/mes</span></p>
          <p className="text-slate-400 text-sm mb-5">Empieza a aprender Python hoy</p>

          <ul className="space-y-2.5 mb-6">
            {FREE_FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {f.ok
                  ? <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  : <X size={16} className="text-slate-600 shrink-0 mt-0.5" />}
                <span className={f.ok ? 'text-slate-300' : 'text-slate-600 line-through'}>{f.text}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/"
            className="block text-center py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            Plan actual
          </Link>
        </div>

        {/* Premium */}
        <div className="relative rounded-2xl border-2 border-blue-500/50 bg-gradient-to-br from-blue-600/10 to-purple-600/5 p-6 shadow-lg shadow-blue-500/10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
            RECOMENDADO
          </div>

          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-bold text-white">Premium</h2>
            <Sparkles size={16} className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white mt-2 mb-1">
            $5<span className="text-base font-normal text-slate-400">/mes</span>
          </p>
          <p className="text-blue-300 text-sm mb-5">
            o $39/año <span className="text-emerald-400 font-medium">(ahorras 35%)</span>
          </p>

          <ul className="space-y-2.5 mb-6">
            {PREMIUM_FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-200">{f.text}</span>
              </li>
            ))}
          </ul>

          {isPremium ? (
            <button
              disabled
              className="block w-full text-center py-2.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium cursor-default"
            >
              ✓ Ya activo
            </button>
          ) : (
            <button
              disabled
              className="block w-full text-center py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
            >
              Próximamente
            </button>
          )}
          <p className="text-center text-xs text-slate-500 mt-2">
            Cancelas cuando quieras · Sin compromiso
          </p>
        </div>
      </div>

      {/* Beneficios destacados */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="text-center p-4">
          <BookOpen size={24} className="mx-auto text-blue-400 mb-2" />
          <p className="font-semibold text-white text-sm">115+ lecciones</p>
          <p className="text-xs text-slate-500 mt-1">Desde básico hasta avanzado</p>
        </div>
        <div className="text-center p-4">
          <Zap size={24} className="mx-auto text-yellow-400 mb-2" />
          <p className="font-semibold text-white text-sm">Tutor IA</p>
          <p className="text-xs text-slate-500 mt-1">Pregúntale lo que sea, 24/7</p>
        </div>
        <div className="text-center p-4">
          <Award size={24} className="mx-auto text-emerald-400 mb-2" />
          <p className="font-semibold text-white text-sm">Certificados</p>
          <p className="text-xs text-slate-500 mt-1">Verificables, para tu LinkedIn</p>
        </div>
      </div>
    </div>
  )
}
