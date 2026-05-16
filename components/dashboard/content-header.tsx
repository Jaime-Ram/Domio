'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Menu, Bell, User, Mail, FileText, Wrench, LogOut, Shield,
  ExternalLink, AlertTriangle, CreditCard, Settings as SettingsIcon,
  HelpCircle, Search,
} from 'lucide-react'
import { getSubscriptionClient, trialDaysRemaining, type Subscription } from '@/lib/supabase/subscription'
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
  stickyOffsetClassName?: string
  basePath?: string
}

const iconBtnCls =
  'h-[34px] w-[34px] flex items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0'

function getInitials(name: string | null, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

function clearDemoCookie() {
  document.cookie = 'domio_demo=; path=/; max-age=0'
}

export function ContentHeader({
  onMenuClick,
  stickyOffsetClassName,
  basePath = '/dashboard/landlord',
}: ContentHeaderProps) {
  const { profile, user, isDemo, loading } = useDashboardUser()
  const router = useRouter()

  const [menusReady, setMenusReady] = useState(false)
  const [sub, setSub] = useState<Subscription | null>(null)

  useEffect(() => { setMenusReady(true) }, [])
  useEffect(() => {
    if (!user || isDemo) return
    getSubscriptionClient(user.id).then(setSub)
  }, [user, isDemo])

  const showTrialPill =
    sub && sub.status === 'trialing' && new Date(sub.trial_ends_at) > new Date() && !isDemo
  const trialDays = sub ? trialDaysRemaining(sub) : 0
  const trialPct = Math.round((trialDays / 30) * 100)
  const circumference = 2 * Math.PI * 7

  const notifications = isDemo ? mockNotifications : []
  const userName = profile?.full_name || user?.email?.split('@')[0] || (loading ? 'Laden...' : 'Gebruiker')
  const userEmail = user?.email || profile?.email || ''
  const avatarInitials = getInitials(profile?.full_name ?? null, userEmail || '')
  const unreadCount = 0

  return (
    <header className={cn('sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur', stickyOffsetClassName)}>
      <div className="mx-auto max-w-7xl px-10 sm:px-14 lg:pl-16 lg:pr-20 h-14 flex items-center gap-2">

        {/* Hamburger (mobile only) */}
        <button
          type="button"
          className={cn(iconBtnCls, 'md:hidden shrink-0')}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMenuClick?.() }}
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-[420px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-gray-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Zoeken…"
              className="h-[34px] w-full rounded-full bg-gray-100 dark:bg-neutral-800 pl-9 pr-4 text-[13px] text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-neutral-500 border-0 focus:outline-none focus:ring-2 focus:ring-[#163300]/15 dark:focus:ring-[#9FE870]/15"
            />
          </div>
        </div>

        <div className="flex-1" />

        {/* Help */}
        <Link href={`${basePath}/hulp`} className={iconBtnCls} title="Hulp">
          <HelpCircle className="h-[18px] w-[18px]" />
        </Link>

        {/* Notifications + profile */}
        {!menusReady ? (
          <>
            <div className={cn(iconBtnCls, 'pointer-events-none opacity-60')}>
              <Bell className="h-[18px] w-[18px]" />
            </div>
            <div className="h-[34px] py-0 pl-1.5 pr-2.5 rounded-full flex items-center gap-1.5 opacity-60 pointer-events-none">
              <span className={cn(
                'h-[26px] w-[26px] rounded-full text-white text-[10px] font-semibold flex items-center justify-center shrink-0',
                loading ? 'bg-gray-300 dark:bg-neutral-600 animate-pulse' : 'bg-[#163300] dark:bg-[#9FE870] dark:text-[#163300]'
              )}>
                {loading ? '' : avatarInitials}
              </span>
              <span className="text-[13px] font-medium text-gray-900 dark:text-white hidden sm:inline max-w-[100px] truncate">
                {userName}
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={cn(iconBtnCls, 'relative')}>
                  <Bell className="h-[18px] w-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-semibold bg-red-500 text-white rounded-full border-2 border-white dark:border-neutral-900">
                      {unreadCount}
                    </span>
                  )}
                </button>
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
                        <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 bg-[#f4f4f4] dark:bg-neutral-900">
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

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-[34px] py-0 pl-1.5 pr-2.5 rounded-full flex items-center gap-1.5 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <span className={cn(
                    'h-[26px] w-[26px] rounded-full text-white text-[10px] font-semibold flex items-center justify-center shrink-0',
                    loading ? 'bg-gray-300 dark:bg-neutral-600 animate-pulse' : 'bg-[#163300] dark:bg-[#9FE870] dark:text-[#163300]'
                  )}>
                    {loading ? '' : avatarInitials}
                  </span>
                  <span className="text-[13px] font-medium text-gray-900 dark:text-white hidden sm:inline max-w-[100px] truncate">
                    {userName}
                  </span>
                </button>
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
                  {[
                    { href: `${basePath}/settings?tab=account`, icon: User, label: 'Account' },
                    { href: `${basePath}/settings?tab=beveiliging`, icon: Shield, label: 'Beveiliging' },
                    { href: `${basePath}/settings?tab=abonnement`, icon: CreditCard, label: 'Abonnement' },
                    { href: `${basePath}/settings?tab=koppelingen`, icon: SettingsIcon, label: 'Koppelingen' },
                  ].map(({ href, icon: Icon, label }) => (
                    <AppDropdownItem
                      key={label}
                      asChild
                      className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#9FE870] dark:hover:bg-[#9FE870]/70 hover:text-[#163300] dark:hover:text-[#163300] focus:bg-[#9FE870] dark:focus:bg-[#9FE870]/70 focus:text-[#163300] dark:focus:text-[#163300]"
                    >
                      <Link href={href} className="flex items-center gap-3 w-full">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{label}</span>
                      </Link>
                    </AppDropdownItem>
                  ))}
                </div>
                <div className="mx-3 my-0.5 h-px bg-[#e8e8e8] dark:bg-neutral-700" />
                <div className="px-1.5 py-1">
                  {[
                    { href: '/privacy', label: 'Privacy' },
                    { href: '/terms', label: 'Algemene voorwaarden' },
                  ].map(({ href, label }) => (
                    <AppDropdownItem
                      key={label}
                      asChild
                      className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#f4f4f4] dark:hover:bg-neutral-700 hover:text-gray-900 dark:hover:text-white"
                    >
                      <Link href={href} className="flex items-center gap-3 w-full">
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        <span>{label}</span>
                      </Link>
                    </AppDropdownItem>
                  ))}
                </div>
                <div className="mx-3 my-0.5 h-px bg-[#e8e8e8] dark:bg-neutral-700" />
                <div className="px-1.5 pt-1 pb-1.5">
                  <AppDropdownItem
                    className="flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#f4f4f4] dark:hover:bg-neutral-700 hover:text-red-600 dark:hover:text-red-400"
                    onSelect={async () => {
                      if (isDemo) { clearDemoCookie(); window.location.href = '/' }
                      else { await signOut(); window.location.href = '/' }
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

        {/* Trial pill */}
        {showTrialPill && (
          <Link
            href={`${basePath}/upgrade`}
            className="hidden sm:flex items-center gap-1.5 h-[34px] rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 px-2.5 transition-colors"
          >
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Proefperiode</span>
            <svg width="16" height="16" viewBox="0 0 18 18" className="shrink-0 -rotate-90">
              <circle cx="9" cy="9" r="7" fill="none" strokeWidth="4" className="stroke-[#163300]/15 dark:stroke-[#9FE870]/20" />
              <circle cx="9" cy="9" r="7" fill="none" strokeWidth="4" strokeLinecap="round"
                className="stroke-[#163300] dark:stroke-[#9FE870]"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - trialPct / 100)} />
            </svg>
          </Link>
        )}
      </div>
    </header>
  )
}
