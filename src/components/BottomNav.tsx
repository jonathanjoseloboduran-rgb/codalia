import { useNavigate, useLocation } from 'react-router-dom'
import { Home as HomeIcon, Code2, User } from 'lucide-react'

const tabs = [
  { path: '/',           label: 'Inicio',   icon: HomeIcon },
  { path: '/playground', label: 'Práctica', icon: Code2 },
  { path: '/profile',    label: 'Perfil',   icon: User },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="shrink-0 flex border-t border-slate-800 bg-ink pb-[env(safe-area-inset-bottom)]">
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = path === '/' ? pathname === '/' || pathname.startsWith('/course') : pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              active ? 'text-brand' : 'text-slate-500'
            }`}
          >
            <Icon size={20} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
