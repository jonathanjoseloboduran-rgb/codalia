'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, LogOut, User, Flame } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { getLevelForXP, getProgressToNextLevel, getNextLevel } from '@/lib/gamification'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  username?:         string
  avatarUrl?:        string
  totalXP:          number
  streakDays:       number
  completedLessons?: Record<string, boolean>
  activeCourseId?:   string
  activeChapterId?:  string
  activeLessonId?:   string
}

export function Header({
  username, avatarUrl, totalXP, streakDays,
  completedLessons, activeCourseId, activeChapterId, activeLessonId,
}: HeaderProps) {
  const router = useRouter()
  const level = getLevelForXP(totalXP)
  const nextLevel = getNextLevel(totalXP)
  const progress = getProgressToNextLevel(totalXP)

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 border-b border-slate-800 bg-[#0F172A] flex items-center px-4 gap-4 shrink-0">
      {/* Hamburger — solo mobile */}
      <Sheet>
        <SheetTrigger
          render={
            <button className="lg:hidden inline-flex items-center justify-center rounded-md w-9 h-9 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" />
          }
        >
          <Menu size={20} />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-[#0F172A] border-slate-800">
          <Sidebar
            completedLessons={completedLessons}
            activeCourseId={activeCourseId}
            activeChapterId={activeChapterId}
            activeLessonId={activeLessonId}
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      {/* Racha */}
      {streakDays > 0 && (
        <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1">
          <Flame size={14} className="text-orange-400" />
          <span className="text-orange-300 text-xs font-semibold">{streakDays}</span>
        </div>
      )}

      {/* XP + nivel */}
      <div className="hidden sm:flex items-center gap-2">
        <Badge
          variant="outline"
          className="border-blue-500/50 text-blue-300 text-xs"
          style={{ borderColor: level.color + '66', color: level.color }}
        >
          Nv.{level.level} {level.title}
        </Badge>
        <div className="flex items-center gap-1.5 w-24">
          <Progress value={progress} className="h-1.5 bg-slate-700" />
          <span className="text-slate-500 text-[10px] shrink-0">{totalXP} XP</span>
        </div>
      </div>

      {/* Avatar + menú */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="rounded-full ring-2 ring-transparent hover:ring-blue-500 transition-all focus:outline-none" />
          }
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {username?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 bg-slate-900 border-slate-700">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-white truncate">{username}</p>
            <p className="text-xs text-slate-400">{totalXP} XP total</p>
          </div>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem className="text-slate-300 hover:text-white cursor-pointer" onClick={() => router.push('/profile')}>
            <User size={14} className="mr-2" /> Mi perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem
            onClick={signOut}
            className="text-red-400 hover:text-red-300 cursor-pointer"
          >
            <LogOut size={14} className="mr-2" /> Salir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
