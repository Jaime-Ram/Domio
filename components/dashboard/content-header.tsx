'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, Bell, User, Mail, FileText, Wrench, LogOut, Shield, ExternalLink, AlertTriangle, CreditCard, Settings as SettingsIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AppDropdownContent, AppDropdownItem } from '@/components/ui/app-dropdown'
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

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Goedemorgen'
  if (h < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

function getPageTitle(pathname: string, basePath: string, firstName: string): string {
  const rel = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname
  if (rel === '' || rel === '/') return `${getGreeting()}, ${firstName}`
  if (rel.startsWith('/financial')) return 'Financieel'
  if (rel.startsWith('/tenants')) return 'Huurders'
  if (rel.startsWith('/portfolio')) return 'Portefeuille'
  if (rel.startsWith('/maintenance')) return 'Onderhoud'
  if (rel.startsWith('/compliance')) return 'Compliance'
  if (rel.startsWith('/documents')) return 'Documenten'
  if (rel.startsWith('/messages')) return 'Communicatie'
  if (rel.startsWith('/tasks')) return 'Taken'
  if (rel.startsWith('/assist')) return 'Assist'
  if (rel.startsWith('/settings')) return 'Instellingen'
  if (rel.startsWith('/accounting')) return 'Boekhouding'
  if (rel.startsWith('/hulp')) return 'Hulp'
  // Portal routes
  if (rel.startsWith('/betalingen')) return 'Betalingen'
  if (rel.startsWith('/onderhoud')) return 'Onderhoud'
  if (rel.startsWith('/documenten')) return 'Documenten'
  if (rel.startsWith('/berichten')) return 'Berichten'
  if (rel.startsWith('/instellingen')) return 'Instellingen'
  return ''
}

export function ContentHeader({ onMenuClick, stickyOffsetClassName, basePath = '/dashboard/employer' }: ContentHeaderProps) {
  const { profile, user, isDemo, loading } = useDashboardUser()
  const router = useRouter()
  const pathname = usePathname()
  const firstName = (profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '').trim()
  const pageTitle = getPageTitle(pathname, basePath, firstName)
  /** Radix DropdownMenu gebruikt useId(); pas na mount renderen voorkomt SSR/client id-mismatch. */
  const [menusReady, setMenusReady] = useState(false)
  useEffect(() => {
    setMenusReady(true)
  }, [])

  const notifications = isDemo ? mockNotifications : []
  const userName = profile?.full_name || user?.email?.split('@')[0] || (loading ? 'Laden...' : 'Gebruiker')
  const userEmail = user?.email || profile?.email || ''
  const userRole = profile?.role === 'verhuurder' ? 'Beheerder' : profile?.role === 'huurder' ? 'Bewoner' : 'Admin'
  const avatarInitials = getInitials(profile?.full_name ?? null, userEmail || '')
  const unreadCount = 0

  return (
    <header className={cn("sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur", stickyOffsetClassName)}>
      <div className="relative mx-auto max-w-7xl px-10 sm:px-14 lg:pl-16 lg:pr-20 h-[5.25rem]">

        {/* Hamburger — verticaal gecentreerd (mobile) */}
        <div className="absolute inset-y-0 left-10 sm:left-14 lg:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 touch-manipulation"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onMenuClick?.()
            }}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu openen</span>
          </Button>
        </div>

        {/* Paginatitel — aan de onderkant van de balk */}
        {pageTitle && (
          <h1 className="absolute bottom-4 left-10 sm:left-14 lg:left-16 right-48 text-2xl sm:text-3xl font-bold text-[#163300] dark:text-[#9FE870] truncate leading-none">
            {pageTitle}
          </h1>
        )}

        {/* Bell + Profiel — verticaal gecentreerd in de balk */}
        <div className="absolute inset-y-0 right-10 sm:right-14 lg:right-20 flex items-center gap-3">
          {!menusReady ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled
                aria-hidden
                tabIndex={-1}
                className="relative h-10 w-10 rounded-full text-[#163300] dark:text-[#9FE870] bg-transparent opacity-80 pointer-events-none"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled
                aria-hidden
                tabIndex={-1}
                className="h-10 py-0 pl-2 pr-3 rounded-full gap-2 bg-transparent opacity-80 pointer-events-none"
              >
                <span
                  className={cn(
                    'h-7 w-7 rounded-full text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0',
                    loading ? 'bg-gray-300 dark:bg-neutral-600 animate-pulse' : 'bg-[#163300] dark:bg-[#9FE870] dark:text-[#163300]'
                  )}
                >
                  {loading ? '' : avatarInitials}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline max-w-[120px] truncate">
                  {userName}
                </span>
              </Button>
            </>
          ) : (
            <>
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
              <AppDropdownContent align="end">
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
              </AppDropdownContent>
            </DropdownMenu>

          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 py-0 pl-2 pr-3 rounded-full gap-2 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800/50 focus-visible:ring-0 focus-visible:ring-offset-0"
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
              <AppDropdownContent align="end" className="min-w-[260px]">
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
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-gray-400 dark:text-gray-500 shrink-0" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3 w-3 text-gray-400 dark:text-gray-500 shrink-0" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="px-1.5 py-1">
                  <AppDropdownItem
                    asChild
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#9FE870] dark:hover:bg-[#9FE870]/70 hover:text-[#163300] dark:hover:text-[#163300] focus:bg-[#9FE870] dark:focus:bg-[#9FE870]/70 focus:text-[#163300] dark:focus:text-[#163300]"
                  >
                    <Link href={`${basePath}/settings?tab=account`} className="flex items-center gap-3 w-full">
                      <User className="h-4 w-4 shrink-0" />
                      <span>Account</span>
                    </Link>
                  </AppDropdownItem>
                  <AppDropdownItem
                    asChild
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#9FE870] dark:hover:bg-[#9FE870]/70 hover:text-[#163300] dark:hover:text-[#163300] focus:bg-[#9FE870] dark:focus:bg-[#9FE870]/70 focus:text-[#163300] dark:focus:text-[#163300]"
                  >
                    <Link href={`${basePath}/settings?tab=beveiliging`} className="flex items-center gap-3 w-full">
                      <Shield className="h-4 w-4 shrink-0" />
                      <span>Beveiliging</span>
                    </Link>
                  </AppDropdownItem>
                  <AppDropdownItem
                    asChild
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#9FE870] dark:hover:bg-[#9FE870]/70 hover:text-[#163300] dark:hover:text-[#163300] focus:bg-[#9FE870] dark:focus:bg-[#9FE870]/70 focus:text-[#163300] dark:focus:text-[#163300]"
                  >
                    <Link href={`${basePath}/settings?tab=abonnement`} className="flex items-center gap-3 w-full">
                      <CreditCard className="h-4 w-4 shrink-0" />
                      <span>Abonnement</span>
                    </Link>
                  </AppDropdownItem>
                  <AppDropdownItem
                    asChild
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#9FE870] dark:hover:bg-[#9FE870]/70 hover:text-[#163300] dark:hover:text-[#163300] focus:bg-[#9FE870] dark:focus:bg-[#9FE870]/70 focus:text-[#163300] dark:focus:text-[#163300]"
                  >
                    <Link href={`${basePath}/settings?tab=koppelingen`} className="flex items-center gap-3 w-full">
                      <SettingsIcon className="h-4 w-4 shrink-0" />
                      <span>Koppelingen</span>
                    </Link>
                  </AppDropdownItem>
                </div>
                <div className="mx-3 my-0.5 h-px bg-[#e8e8e8] dark:bg-neutral-700" />
                <div className="px-1.5 py-1">
                  <AppDropdownItem
                    asChild
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#f4f4f4] dark:hover:bg-neutral-700 hover:text-gray-900 dark:hover:text-white focus:bg-[#f4f4f4] dark:focus:bg-neutral-700 focus:text-gray-900 dark:focus:text-white"
                  >
                    <Link href="/privacy" className="flex items-center gap-3 w-full">
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      <span>Privacy</span>
                    </Link>
                  </AppDropdownItem>
                  <AppDropdownItem
                    asChild
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#f4f4f4] dark:hover:bg-neutral-700 hover:text-gray-900 dark:hover:text-white focus:bg-[#f4f4f4] dark:focus:bg-neutral-700 focus:text-gray-900 dark:focus:text-white"
                  >
                    <Link href="/terms" className="flex items-center gap-3 w-full">
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      <span>Algemene voorwaarden</span>
                    </Link>
                  </AppDropdownItem>
                </div>
                <div className="mx-3 my-0.5 h-px bg-[#e8e8e8] dark:bg-neutral-700" />
                <div className="px-1.5 pt-1 pb-1.5">
                  <AppDropdownItem
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
                  </AppDropdownItem>
                </div>
              </AppDropdownContent>
            </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  )
}


