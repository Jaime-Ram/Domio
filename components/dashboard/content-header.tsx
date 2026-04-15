'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, Bell, User, FileText, Wrench, LogOut, Shield, ExternalLink, AlertTriangle, CreditCard, Settings as SettingsIcon } from 'lucide-react'
import { GlobalSearch } from './global-search'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  const router = useRouter()

  const notifications = isDemo ? mockNotifications : []
  const userName = profile?.full_name || user?.email?.split('@')[0] || (loading ? 'Laden...' : 'Gebruiker')
  const userEmail = user?.email || profile?.email || ''
  const userRole = profile?.role === 'verhuurder' ? 'Beheerder' : profile?.role === 'huurder' ? 'Bewoner' : 'Admin'
  const avatarInitials = getInitials(profile?.full_name ?? null, userEmail || '')
  const unreadCount = 0

  const dropdownContentClass = 'rounded-2xl bg-white dark:bg-neutral-800 border-0 shadow-soft-lg p-0 overflow-hidden min-w-[260px] origin-top-right data-[state=open]:animate-widget-menu-in data-[state=closed]:animate-widget-menu-out'

  return (
    <header className={cn("sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur", stickyOffsetClassName)}>
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:pl-20 lg:pr-16 h-16 flex items-center justify-between gap-3">
        {/* Hamburger menu for mobile */}
        <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10 min-h-[44px] min-w-[44px] rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 touch-manipulation"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onMenuClick?.()
            }}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu openen</span>
          </Button>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 max-w-2xl items-center gap-3">
          <GlobalSearch basePath={basePath} />
        </div>

        {/* Search - Mobile */}
        <div className="flex md:hidden items-center gap-3 flex-1 min-w-0">
          <GlobalSearch basePath={basePath} />
        </div>

        {/* Right: Notificaties + Profiel */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-full text-[#163300] dark:text-[#9FE870] bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold bg-red-500 text-white rounded-full border-2 border-white dark:border-neutral-900">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className={dropdownContentClass}>
                <div className="px-3 pt-3 pb-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Notificaties</p>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-brand-primary dark:text-brand-accent font-medium rounded-lg hover:bg-[#f4f4f4] dark:hover:bg-neutral-700">
                      Alles gelezen
                    </Button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto px-1.5 pb-1.5">
                  {notifications.map((n) => {
                    const Icon = n.title.includes('storingsmelding') ? Wrench : n.title.includes('Factuur') ? FileText : AlertTriangle
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          'px-3 py-2.5 flex items-start gap-3 cursor-pointer transition-colors rounded-lg my-0.5',
                          n.read === false
                            ? 'bg-[#f4f4f4]/60 dark:bg-neutral-900/40 hover:bg-[#f4f4f4] dark:hover:bg-neutral-700'
                            : 'hover:bg-[#f4f4f4] dark:hover:bg-neutral-700'
                        )}
                      >
                        <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 bg-[#f4f4f4] dark:bg-neutral-900">
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
                <div className="px-1.5 pb-1.5">
                  <Button variant="ghost" size="sm" className="w-full justify-center text-sm font-medium text-brand-primary dark:text-brand-accent rounded-lg hover:bg-[#f4f4f4] dark:hover:bg-neutral-700">
                    Alle notificaties bekijken
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 pl-2 pr-3 rounded-full gap-2 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <span className={cn(
                    "h-7 w-7 rounded-full text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0",
                    loading ? "bg-gray-300 dark:bg-neutral-600 animate-pulse" : "bg-[#163300] dark:bg-[#9FE870] dark:text-[#163300]"
                  )}>
                    {loading ? '' : avatarInitials}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline max-w-[120px] truncate">
                    {userName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className={dropdownContentClass}>
                <div className="px-3 pt-3 pb-2">
                  <button
                    type="button"
                    onClick={() => router.push(`${basePath}/settings?tab=account`)}
                    className="flex items-center gap-3 w-full rounded-lg px-2 py-1.5 transition-colors hover:bg-[#f4f4f4] dark:hover:bg-neutral-700 text-left"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-full bg-[#163300] text-white text-sm font-semibold flex items-center justify-center">
                      {avatarInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{userEmail}</p>
                    </div>
                  </button>
                </div>
                <div className="px-1.5 py-1">
                  <DropdownMenuItem
                    asChild
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#9FE870] dark:hover:bg-[#9FE870]/70 hover:text-[#163300] dark:hover:text-[#163300] focus:bg-[#9FE870] dark:focus:bg-[#9FE870]/70 focus:text-[#163300] dark:focus:text-[#163300]"
                  >
                    <Link href={`${basePath}/settings?tab=account`} className="flex items-center gap-3 w-full">
                      <User className="h-4 w-4 shrink-0" />
                      <span>Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#9FE870] dark:hover:bg-[#9FE870]/70 hover:text-[#163300] dark:hover:text-[#163300] focus:bg-[#9FE870] dark:focus:bg-[#9FE870]/70 focus:text-[#163300] dark:focus:text-[#163300]"
                  >
                    <Link href={`${basePath}/settings?tab=beveiliging`} className="flex items-center gap-3 w-full">
                      <Shield className="h-4 w-4 shrink-0" />
                      <span>Beveiliging</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#9FE870] dark:hover:bg-[#9FE870]/70 hover:text-[#163300] dark:hover:text-[#163300] focus:bg-[#9FE870] dark:focus:bg-[#9FE870]/70 focus:text-[#163300] dark:focus:text-[#163300]"
                  >
                    <Link href={`${basePath}/settings?tab=abonnement`} className="flex items-center gap-3 w-full">
                      <CreditCard className="h-4 w-4 shrink-0" />
                      <span>Abonnement</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#9FE870] dark:hover:bg-[#9FE870]/70 hover:text-[#163300] dark:hover:text-[#163300] focus:bg-[#9FE870] dark:focus:bg-[#9FE870]/70 focus:text-[#163300] dark:focus:text-[#163300]"
                  >
                    <Link href={`${basePath}/settings?tab=koppelingen`} className="flex items-center gap-3 w-full">
                      <SettingsIcon className="h-4 w-4 shrink-0" />
                      <span>Koppelingen</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                <div className="mx-3 my-0.5 h-px bg-[#e8e8e8] dark:bg-neutral-700" />
                <div className="px-1.5 py-1">
                  <DropdownMenuItem
                    asChild
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#f4f4f4] dark:hover:bg-neutral-700 hover:text-gray-900 dark:hover:text-white focus:bg-[#f4f4f4] dark:focus:bg-neutral-700 focus:text-gray-900 dark:focus:text-white"
                  >
                    <Link href="/privacy" className="flex items-center gap-3 w-full">
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      <span>Privacy</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#f4f4f4] dark:hover:bg-neutral-700 hover:text-gray-900 dark:hover:text-white focus:bg-[#f4f4f4] dark:focus:bg-neutral-700 focus:text-gray-900 dark:focus:text-white"
                  >
                    <Link href="/terms" className="flex items-center gap-3 w-full">
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      <span>Algemene voorwaarden</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                <div className="mx-3 my-0.5 h-px bg-[#e8e8e8] dark:bg-neutral-700" />
                <div className="px-1.5 pt-1 pb-1.5">
                  <DropdownMenuItem
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#f4f4f4] dark:hover:bg-neutral-700 hover:text-red-600 dark:hover:text-red-400 focus:bg-[#f4f4f4] dark:focus:bg-neutral-700 focus:text-red-600 dark:focus:text-red-400"
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
    </header>
  )
}


