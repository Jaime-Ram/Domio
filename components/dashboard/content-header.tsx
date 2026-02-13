'use client'

import { Button } from '@/components/ui/button'
import { Menu, Bell, User, Zap, Building2, Users, FileText, Wrench, LogOut, Shield, ExternalLink, AlertTriangle } from 'lucide-react'
import { GlobalSearch } from './global-search'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { currentUser, notifications, unreadNotificationsCount } from '@/lib/mock-data/domio-dashboard'

interface ContentHeaderProps {
  onMenuClick?: () => void
}

export function ContentHeader({ onMenuClick }: ContentHeaderProps) {
  const userName = currentUser.name
  const userEmail = currentUser.email
  const userRole = 'Admin'
  const unreadCount = unreadNotificationsCount

  const dropdownContentClass =
    'rounded-[1.75rem] border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg p-0 overflow-hidden'
  const quickActionBtnClass =
    'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors'
  const quickActionIconClass = 'w-10 h-10 rounded-full bg-[#002A1F] flex items-center justify-center'

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-3">
        {/* Hamburger menu for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Search + Snelle acties - Desktop */}
        <div className="hidden md:flex flex-1 max-w-2xl items-center gap-3">
          <GlobalSearch />
          <div suppressHydrationWarning>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 px-4 rounded-full border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[#002A1F] dark:text-[#9AFF7C] hover:bg-gray-50 dark:hover:bg-neutral-800 shadow-sm font-medium text-sm"
                >
                  <Zap className="h-4 w-4" />
                  <span>Snelle acties</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className={dropdownContentClass}>
                <div className="p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Snelle acties</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className={quickActionBtnClass}>
                      <div className={quickActionIconClass}>
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">Nieuw pand</span>
                    </button>
                    <button className={quickActionBtnClass}>
                      <div className={quickActionIconClass}>
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">Huurder</span>
                    </button>
                    <button className={quickActionBtnClass}>
                      <div className={quickActionIconClass}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">Factuur</span>
                    </button>
                    <button className={quickActionBtnClass}>
                      <div className={quickActionIconClass}>
                        <Wrench className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">Onderhoud</span>
                    </button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search + Snelle acties - Mobile */}
        <div className="flex md:hidden items-center gap-2 flex-1 min-w-0">
          <GlobalSearch />
          <div suppressHydrationWarning>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[#002A1F] dark:text-[#9AFF7C] hover:bg-gray-50 dark:hover:bg-neutral-800 shadow-sm shrink-0"
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={dropdownContentClass}>
                <div className="p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Snelle acties</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className={quickActionBtnClass}>
                      <div className={quickActionIconClass}>
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">Nieuw pand</span>
                    </button>
                    <button className={quickActionBtnClass}>
                      <div className={quickActionIconClass}>
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">Huurder</span>
                    </button>
                    <button className={quickActionBtnClass}>
                      <div className={quickActionIconClass}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">Factuur</span>
                    </button>
                    <button className={quickActionBtnClass}>
                      <div className={quickActionIconClass}>
                        <Wrench className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">Onderhoud</span>
                    </button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Right: Notificaties + Profiel */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <div suppressHydrationWarning>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-full border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-400 shadow-sm"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold bg-red-500 text-white rounded-full border-2 border-white dark:border-neutral-900">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={dropdownContentClass}>
                <div className="px-4 py-3 border-b border-gray-200/80 dark:border-neutral-700">
                  <div className="flex items-center justify-between gap-2">
                    <DropdownMenuLabel className="p-0 font-semibold text-gray-900 dark:text-white">
                      Notificaties
                    </DropdownMenuLabel>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#002A1F] dark:text-[#9AFF7C] font-medium">
                      Alles gelezen
                    </Button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = n.title.includes('storingsmelding') ? Wrench : n.title.includes('Factuur') ? FileText : AlertTriangle
                    return (
                      <div
                        key={n.id}
                        className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors ${
                          n.read === false
                            ? 'bg-gray-50/80 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-800'
                            : 'hover:bg-gray-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <div className="h-9 w-9 rounded-2xl bg-[#002A1F]/10 dark:bg-[#9AFF7C]/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-[#002A1F] dark:text-[#9AFF7C]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.body}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{n.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="px-4 py-2 border-t border-gray-200/80 dark:border-neutral-700">
                  <Button variant="ghost" size="sm" className="w-full justify-center text-sm font-medium text-[#002A1F] dark:text-[#9AFF7C] rounded-2xl">
                    Alle notificaties bekijken
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div suppressHydrationWarning>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 pl-2 pr-3 rounded-full border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 shadow-sm gap-2"
                >
                  <span className="h-7 w-7 rounded-full bg-[#002A1F] text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                    {currentUser.avatarInitials}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline max-w-[120px] truncate">
                    {userName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={dropdownContentClass}>
                <div className="px-4 py-4 border-b border-gray-200/80 dark:border-neutral-700">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-[#002A1F] text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                      {currentUser.avatarInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-xl">
                        {userRole}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mt-1">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/employer/settings" className="flex items-center mx-2 rounded-2xl py-2">
                      <User className="mr-3 h-4 w-4" />
                      Profiel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="mx-2 rounded-2xl py-2">
                    <Bell className="mr-3 h-4 w-4" />
                    Notificaties
                  </DropdownMenuItem>
                  <DropdownMenuItem className="mx-2 rounded-2xl py-2">
                    <Shield className="mr-3 h-4 w-4" />
                    Beveiliging
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <div className="py-2">
                  <DropdownMenuItem asChild>
                    <Link href="/privacy" className="flex items-center mx-2 rounded-2xl py-2">
                      Privacy
                      <ExternalLink className="ml-auto h-3 w-3" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/terms" className="flex items-center mx-2 rounded-2xl py-2">
                      Algemene voorwaarden
                      <ExternalLink className="ml-auto h-3 w-3" />
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <div className="py-2">
                  <DropdownMenuItem className="mx-2 rounded-2xl py-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                    <LogOut className="mr-3 h-4 w-4" />
                    Uitloggen
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}


