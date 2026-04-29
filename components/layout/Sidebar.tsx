'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { courses } from '@/lib/content'
import { cn } from '@/lib/utils'
import { BookOpen, Code2, User, LayoutDashboard } from 'lucide-react'

const navItems = [
  { href: '/',           label: 'Inicio',     icon: LayoutDashboard },
  { href: '/courses',    label: 'Cursos',     icon: BookOpen },
  { href: '/playground', label: 'Playground', icon: Code2 },
  { href: '/profile',    label: 'Mi perfil',  icon: User },
]

interface SidebarProps {
  // Lecciones completadas del usuario (lesson_id → true)
  completedLessons?: Record<string, boolean>
  activeCourseId?:   string
  activeChapterId?:  string
  activeLessonId?:   string
}

export function Sidebar({
  completedLessons = {},
  activeCourseId,
  activeChapterId,
  activeLessonId,
}: SidebarProps) {
  const pathname = usePathname()
  const activeCourse = courses.find(c => c.id === activeCourseId)

  return (
    <aside className="flex flex-col h-full w-64 bg-[#0F172A] border-r border-slate-800">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-slate-800 shrink-0">
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
          <span className="text-2xl">🐍</span>
          <span>Codalia</span>
        </Link>
      </div>

      {/* Nav principal */}
      <nav className="px-3 py-4 space-y-1 shrink-0">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800',
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* TOC del capítulo activo */}
      {activeCourse && (
        <>
          <div className="px-4 pt-2 pb-1 shrink-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {activeCourse.title}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
            {activeCourse.chapters.map(chapter => (
              <div key={chapter.id}>
                <p className={cn(
                  'px-3 py-1.5 text-xs font-semibold uppercase tracking-wide',
                  chapter.id === activeChapterId ? 'text-blue-400' : 'text-slate-500',
                )}>
                  {chapter.title}
                </p>
                {chapter.lessons.map(lesson => {
                  const done = completedLessons[lesson.id]
                  const active = lesson.id === activeLessonId
                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${activeCourse.id}/${chapter.id}/${lesson.id}`}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors',
                        active
                          ? 'bg-blue-600/20 text-blue-300 font-medium'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800',
                      )}
                    >
                      <span className={cn(
                        'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px]',
                        done  ? 'bg-emerald-500 border-emerald-500 text-white' :
                        active ? 'border-blue-400' : 'border-slate-600',
                      )}>
                        {done ? '✓' : ''}
                      </span>
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {!activeCourse && <div className="flex-1" />}
    </aside>
  )
}
