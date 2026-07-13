import { useState } from 'react'
import { Cloud, CloudOff, LogOut, Loader2, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export function AccountSection() {
  const { user, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  // ── Con sesión ──────────────────────────────────────────────────────────
  if (user) {
    return (
      <div className="bg-panel rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Cloud size={18} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.email}</p>
            <p className="text-emerald-400 text-xs">Progreso sincronizado en la nube</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full mt-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm flex items-center justify-center gap-2 active:bg-slate-800"
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>
    )
  }

  // ── Sin sesión: formulario ──────────────────────────────────────────────
  const submit = async () => {
    if (busy) return
    setError(null); setInfo(null)
    if (!email.trim() || password.length < 6) {
      setError('Ingresa un email y una contraseña de al menos 6 caracteres.')
      return
    }
    setBusy(true)
    const fn = mode === 'login' ? signIn : signUp
    const { error } = await fn(email.trim(), password)
    setBusy(false)
    if (error) { setError(error); return }
    if (mode === 'register') {
      setInfo('¡Cuenta creada! Si te pide confirmar el email, revisa tu correo.')
    }
  }

  return (
    <div className="bg-panel rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1">
        <CloudOff size={16} className="text-slate-400" />
        <h2 className="text-white font-semibold text-sm">Guardá tu progreso en la nube</h2>
      </div>
      <p className="text-slate-500 text-xs mb-4">
        Opcional. Crea una cuenta para no perder tu avance si cambias de teléfono.
      </p>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-lg px-3">
          <Mail size={14} className="text-slate-500 shrink-0" />
          <input
            type="email" inputMode="email" autoCapitalize="none" autoCorrect="off"
            placeholder="tu@email.com" value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-lg px-3">
          <Lock size={14} className="text-slate-500 shrink-0" />
          <input
            type="password" placeholder="Contraseña" value={password}
            onChange={e => setPassword(e.target.value)}
            className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      {info && <p className="text-emerald-400 text-xs mt-2">{info}</p>}

      <button
        onClick={submit}
        disabled={busy}
        className="w-full mt-4 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 active:bg-blue-700"
      >
        {busy && <Loader2 size={14} className="animate-spin" />}
        {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </button>

      <button
        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setInfo(null) }}
        className="w-full mt-2 text-xs text-slate-500 active:text-slate-300"
      >
        {mode === 'login' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Iniciar sesión'}
      </button>
    </div>
  )
}
