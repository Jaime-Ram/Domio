'use client'

import { Button } from '@/components/ui/button'
import { Menu, Bell, User, Zap, Building2, Users, FileText, Wrench, LogOut, Shield, ExternalLink, AlertTriangle, ChevronRight } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { notifications as mockNotifications } from '@/lib/mock-data/domio-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { signOut } from '@/lib/supabase/auth'

interface ContentHeaderProps {
  onMenuClick?: () => void
  /** Sticky offset (e.g. md:top-12 when demo bar is above) */
  stickyOffsetClassName?: string
  /** Base path voor links (default: /dashboard/employer). Voor demo: /demo/app */
  basePath?: string
}

function getInitials(name: string | null, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

function clearDemoCookie() {
  document.cookie = 'domio_demo=; path=/; max-age=0'
}

export function ContentHeader({ onMenuClick, stickyOffsetClassName, basePath = '/dashboard/employer' }: ContentHeaderProps) {
  const { profile, user, isDemo, loading } = useDashboardUser()
  const notifications = isDemo ? mockNotifications : []
  const userName = profile?.full_name || user?.email?.split('@')[0] || (loading ? 'Laden...' : 'Gebruiker')
  const userEmail = user?.email || profile?.email || ''
  const userRole = profile?.role === 'verhuurder' ? 'Beheerder' : profile?.role === 'huurder' ? 'Bewoner' : 'Admin'
  const avatarInitials = getInitials(profile?.full_name ?? null, userEmail || '')
  const unreadCount = 0

  const dropdownContentClass = isDemo
    ? 'rounded-card bg-white dark:bg-neutral-900 p-0 overflow-hidden min-w-[260px]'
    : 'rounded-card border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg p-0 overflow-hidden min-w-[260px]'
  const quickActionItemClass =
    'flex w-full items-center gap-3 py-3 px-4 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/80 active:bg-gray-100 dark:active:bg-neutral-700 transition-colors rounded-block focus:bg-gray-50 dark:focus:bg-neutral-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2'
  const quickActionIconWrap = isDemo
    ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800'
    : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800'
  const quickActionIconClass = 'h-5 w-5 text-brand-primary dark:text-brand-accent'

  const quickActions = [
    { label: 'Nieuw pand', desc: 'Voeg pand toe aan portefeuille', icon: Building2, href: `${basePath}/portfolio/properties/new` },
    { label: 'Huurders', desc: 'Bekijk en beheer huurders', icon: Users, href: `${basePath}/tenants` },
    { label: 'Facturatie', desc: 'Facturen en betalingen', icon: FileText, href: `${basePath}/financial` },
    { label: 'Onderhoud', desc: 'Tickets en meldingen', icon: Wrench, href: `${basePath}/maintenance` },
  ]

  return (
    <header className={cn("sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur", stickyOffsetClassName)}>
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-3">
        {/* Hamburger menu for mobile */}
        <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10 min-h-[44px] min-w-[44px] rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 touch-manipulation"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onMenuClick?.()
            }}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu openen</span>
          </Button>

        {/* Search + Snelle acties - Desktop */}
        <div className="hidden md:flex flex-1 max-w-2xl items-center gap-3">
          <GlobalSearch basePath={basePath} />
          <div suppressHydrationWarning>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'group h-10 px-4 rounded-pill font-medium text-sm gap-3 text-brand-primary dark:text-brand-accent hover:bg-gray-50 dark:hover:bg-neutral-800',
                    isDemo ? 'bg-gray-100 dark:bg-neutral-800' : 'border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm'
                  )}
                >
                  <Zap className="h-4 w-4 shrink-0 transition-colors group-hover:text-[#9FE870] group-hover:stroke-[#9FE870] group-hover:fill-[#9FE870] dark:group-hover:text-[#9FE870] dark:group-hover:stroke-[#9FE870] dark:group-hover:fill-[#9FE870]" />
                  <span>Snelle acties</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className={dropdownContentClass}>
                <div className="p-wise-sm">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-wise-xs px-1">Snelle acties</p>
                  <div className="space-y-0.5">
                    {quickActions.map((a) => {
                      const Icon = a.icon
                      return (
                        <DropdownMenuItem key={a.href} asChild>
                          <Link href={a.href} className={quickActionItemClass}>
                            <div className={quickActionIconWrap}>
                              <Icon className={quickActionIconClass} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{a.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.desc}</div>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search + Snelle acties - Mobile */}
        <div className="flex md:hidden items-center gap-2 flex-1 min-w-0">
          <GlobalSearch basePath={basePath} />
          <div suppressHydrationWarning>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'group h-10 w-10 rounded-pill text-brand-primary dark:text-brand-accent hover:bg-gray-50 dark:hover:bg-neutral-800 shrink-0',
                    isDemo ? 'bg-gray-100 dark:bg-neutral-800' : 'border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm'
                  )}
                >
                  <Zap className="h-4 w-4 transition-colors group-hover:text-[#9FE870] group-hover:stroke-[#9FE870] group-hover:fill-[#9FE870] dark:group-hover:text-[#9FE870] dark:group-hover:stroke-[#9FE870] dark:group-hover:fill-[#9FE870]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={dropdownContentClass}>
                <div className="p-wise-sm">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-wise-xs px-1">Snelle acties</p>
                  <div className="space-y-0.5">
                    {quickActions.map((a) => {
                      const Icon = a.icon
                      return (
                        <DropdownMenuItem key={a.href} asChild>
                          <Link href={a.href} className={quickActionItemClass}>
                            <div className={quickActionIconWrap}>
                              <Icon className={quickActionIconClass} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{a.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.desc}</div>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
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
                  className={cn(
                    "relative h-10 w-10 rounded-full text-gray-600 dark:text-gray-400",
                    isDemo
                      ? "bg-[#f4f4f4] dark:bg-neutral-800 hover:bg-[#e8e8e8] dark:hover:bg-neutral-700 focus-visible:ring-0 focus-visible:ring-offset-0"
                      : "border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 shadow-sm"
                  )}
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
                <div className="px-wise-sm py-wise-sm border-b border-gray-200/80 dark:border-neutral-700">
                  <div className="flex items-center justify-between gap-2">
                    <DropdownMenuLabel className="p-0 font-semibold text-gray-900 dark:text-white">
                      Notificaties
                    </DropdownMenuLabel>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-brand-primary dark:text-brand-accent font-medium rounded-block">
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
                        className={`px-wise-sm py-3 flex items-start gap-3 cursor-pointer transition-colors rounded-block mx-wise-xs my-0.5 ${
                          n.read === false
                            ? 'bg-gray-50/80 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-800'
                            : 'hover:bg-gray-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <div className={cn('h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0', isDemo ? 'bg-gray-100 dark:bg-neutral-800' : 'border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800')}>
                          <Icon className="h-4 w-4 text-brand-primary dark:text-brand-accent" />
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
                <div className="px-wise-sm py-wise-xs border-t border-gray-200/80 dark:border-neutral-700">
                  <Button variant="ghost" size="sm" className="w-full justify-center text-sm font-medium text-brand-primary dark:text-brand-accent rounded-block">
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
                  className={cn(
                    "h-10 pl-2 pr-3 rounded-full gap-2",
                    isDemo
                      ? "bg-[#f4f4f4] dark:bg-neutral-800 hover:bg-[#e8e8e8] dark:hover:bg-neutral-700 focus-visible:ring-0 focus-visible:ring-offset-0"
                      : "border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 shadow-sm"
                  )}
                >
                  <span className={cn(
                    "h-7 w-7 rounded-full text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0",
                    loading ? "bg-gray-300 dark:bg-neutral-600 animate-pulse" : isDemo ? "bg-gray-400 dark:bg-neutral-600" : "bg-brand-primary dark:bg-brand-primary"
                  )}>
                    {loading ? '' : avatarInitials}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline max-w-[120px] truncate">
                    {userName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={dropdownContentClass}>
                {/* User header – clean, Wise-achtige hiërarchie */}
                <div className="p-wise-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-[#163300] text-white text-sm font-semibold flex items-center justify-center">
                      {avatarInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{userEmail}</p>
                      <span className="inline-block mt-1.5 text-[11px] font-medium text-[#163300] dark:text-[#9FE870]">
                        {userRole}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-neutral-800" />
                {/* Navigatie – icon + label, consistente padding */}
                <div className="p-wise-xs">
                  <DropdownMenuItem asChild>
                    <Link href={`${basePath}/settings`} className="flex items-center gap-3 w-full py-2.5 px-wise-sm rounded-block text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800/80 hover:text-[#163300] dark:hover:text-[#9FE870]">
                      <User className="h-4 w-4 shrink-0 text-[#163300] dark:text-[#9FE870]" />
                      Profiel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${basePath}/settings`} className="flex items-center gap-3 w-full py-2.5 px-wise-sm rounded-block text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800/80 hover:text-[#163300] dark:hover:text-[#9FE870]">
                      <Bell className="h-4 w-4 shrink-0 text-[#163300] dark:text-[#9FE870]" />
                      Notificaties
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 w-full py-2.5 px-wise-sm rounded-block text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800/80 focus:bg-gray-50 dark:focus:bg-neutral-800/80">
                    <Shield className="h-4 w-4 shrink-0 text-[#163300] dark:text-[#9FE870]" />
                    Beveiliging
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-neutral-800" />
                <div className="p-wise-xs">
                  <DropdownMenuItem asChild>
                    <Link href="/privacy" className="flex items-center gap-3 w-full py-2.5 px-wise-sm rounded-block text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800/80 hover:text-gray-900 dark:hover:text-white">
                      <ExternalLink className="h-4 w-4 shrink-0 text-gray-400" />
                      Privacy
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/terms" className="flex items-center gap-3 w-full py-2.5 px-wise-sm rounded-block text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800/80 hover:text-gray-900 dark:hover:text-white">
                      <ExternalLink className="h-4 w-4 shrink-0 text-gray-400" />
                      Algemene voorwaarden
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-neutral-800" />
                <div className="p-wise-xs">
                  <DropdownMenuItem
                    className="flex items-center gap-3 w-full py-2.5 px-wise-sm rounded-block text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/30 focus:bg-red-50/80 dark:focus:bg-red-950/30"
                    onSelect={async () => {
                      if (isDemo) {
                        clearDemoCookie()
                        window.location.href = '/'
                      } else {
                        await signOut()
                        window.location.href = '/'
                      }
                    }}
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {isDemo ? 'Demo verlaten' : 'Uitloggen'}
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


