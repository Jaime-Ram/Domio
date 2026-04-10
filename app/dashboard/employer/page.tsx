'use client'

import { useEffect, useState } from 'react'
import {
  Building2, Plus, Users, Ticket, TrendingUp, AlertTriangle,
  Euro, CheckCircle2, Clock, FileText, UserPlus, Wrench,
  ChevronRight, ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  portfolioTotals,
  recentActivities,
  complianceSummary,
  complianceAlerts,
  upcomingTasks,
  monthlyFinancials,
  type ActivityItem,
} from '@/lib/mock-data/domio-dashboard'

const CARD_CLASS =
  'rounded-card border-[0.5px] border-gray-200 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900'

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const base = 'h-8 w-8 rounded-full flex items-center justify-center shrink-0'
  switch (type) {
    case 'huur_ontvangen':
      return (
        <div className={cn(base, 'bg-emerald-50 dark:bg-emerald-500/10')}>
          <Euro className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      )
    case 'storingsmelding':
      return (
        <div className={cn(base, 'bg-orange-50 dark:bg-orange-500/10')}>
          <Wrench className="h-4 w-4 text-orange-500 dark:text-orange-400" />
        </div>
      )
    case 'contract_verlengd':
      return (
        <div className={cn(base, 'bg-blue-50 dark:bg-blue-500/10')}>
          <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        </div>
      )
    case 'wws_herberekening':
      return (
        <div className={cn(base, 'bg-purple-50 dark:bg-purple-500/10')}>
          <CheckCircle2 className="h-4 w-4 text-purple-500 dark:text-purple-400" />
        </div>
      )
    case 'nieuwe_huurder':
      return (
        <div className={cn(base, 'bg-[#163300]/5 dark:bg-[#9FE870]/10')}>
          <UserPlus className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
        </div>
      )
    default:
      return (
        <div className={cn(base, 'bg-gray-100 dark:bg-neutral-800')}>
          <Clock className="h-4 w-4 text-gray-500" />
        </div>
      )
  }
}

export default function EmployerDashboardPage() {
  const { profile, user, isDemo, loading, basePath } = useDashboardUser()
  const [propertyCount, setPropertyCount] = useState<number | null>(null)
  const [tenantCount, setTenantCount] = useState<number | null>(null)
  const [openTicketCount, setOpenTicketCount] = useState<number | null>(null)

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'daar'
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Goedemorgen'
    if (h < 18) return 'Goedemiddag'
    return 'Goedenavond'
  })()

  useEffect(() => {
    if (isDemo) {
      setPropertyCount(portfolioTotals.totalObjects)
      setTenantCount(Math.round(portfolioTotals.totalObjects * portfolioTotals.occupancyPercent / 100))
      setOpenTicketCount(5)
      return
    }
    if (!user?.id) return
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('owner_id', user.id)
      .then(({ count }) => setPropertyCount(count ?? 0))
    supabase.from('leases').select('id', { count: 'exact', head: true }).eq('status', 'active')
      .then(({ count }) => setTenantCount(count ?? 0))
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).in('status', ['open', 'in_behandeling'])
      .then(({ count }) => setOpenTicketCount(count ?? 0))
  }, [user?.id, isDemo])

  const isBlank = !isDemo && propertyCount !== null && propertyCount === 0

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 w-48 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-2" />
          <div className="h-4 w-64 rounded-block bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-content-blocks">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn(CARD_CLASS, 'p-5')}>
              <div className="h-10 w-10 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-3" />
              <div className="h-7 w-16 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-1" />
              <div className="h-4 w-24 rounded-block bg-gray-100 dark:bg-neutral-800 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-content-blocks">
          <div className={cn(CARD_CLASS, 'p-5 h-80 lg:col-span-2')} />
          <div className={cn(CARD_CLASS, 'p-5 h-80')} />
        </div>
      </div>
    )
  }

  if (isBlank) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#163300] dark:text-[#9FE870] mb-2">
            {greeting}, {firstName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welkom bij Domio. Begin met het toevoegen van je panden.
          </p>
        </div>
        <div className={cn(CARD_CLASS, 'p-8 sm:p-12')}>
          <div className="max-w-md mx-auto text-center">
            <div className="h-16 w-16 rounded-2xl bg-[#163300]/10 dark:bg-[#9FE870]/10 flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-8 w-8 text-[#163300] dark:text-[#9FE870]" />
            </div>
            <h2 className="text-xl font-semibold text-[#163300] dark:text-[#9FE870] mb-2">
              Nog geen panden toegevoegd
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Voeg je eerste verhuurobject toe om te beginnen met beheer, huurders en facturatie.
            </p>
            <Button asChild className="bg-[#163300] hover:bg-[#356258] text-white rounded-full px-6">
              <Link href={`${basePath}/portfolio/properties/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Je panden toevoegen
              </Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  const metrics = [
    {
      label: 'Objecten',
      value: propertyCount ?? '—',
      icon: Building2,
      href: `${basePath}/portfolio`,
      sub: isDemo ? `+${portfolioTotals.objectsThisMonth} deze maand` : undefined,
      color: 'text-[#163300] dark:text-[#9FE870]',
      bg: 'bg-[#163300]/5 dark:bg-[#9FE870]/10',
    },
    {
      label: 'Actieve huurders',
      value: tenantCount ?? '—',
      icon: Users,
      href: `${basePath}/tenants`,
      sub: isDemo ? `${portfolioTotals.occupancyPercent}% bezettingsgraad` : undefined,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      label: 'Open tickets',
      value: openTicketCount ?? '—',
      icon: Ticket,
      href: `${basePath}/maintenance`,
      sub: openTicketCount === 0 ? 'Alles up-to-date' : undefined,
      color: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-500/10',
    },
    {
      label: 'Compliance score',
      value: isDemo ? `${complianceSummary.score}%` : '—',
      icon: TrendingUp,
      href: `${basePath}/compliance`,
      sub: isDemo ? `${complianceSummary.actionNeeded} acties vereist` : undefined,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#163300] dark:text-[#9FE870] mb-1">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-content-blocks">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <Link key={m.label} href={m.href} className="group">
              <div className={cn(CARD_CLASS, 'p-5 hover:border-gray-300 dark:hover:border-neutral-600 transition-colors')}>
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center mb-3', m.bg)}>
                  <Icon className={cn('h-5 w-5', m.color)} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
                  {m.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{m.label}</div>
                {m.sub && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{m.sub}</div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Compliance alert strip */}
      {isDemo && complianceAlerts.length > 0 && (
        <div className="rounded-card border border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-400 mb-1">
                {complianceAlerts.length} compliance{complianceAlerts.length === 1 ? ' actie' : ' acties'} vereist
              </p>
              <div className="flex flex-wrap gap-2">
                {complianceAlerts.map((a) => (
                  <span key={a.address} className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 rounded-full px-2 py-0.5">
                    {a.address} — {a.label}
                  </span>
                ))}
              </div>
            </div>
            <Link href={`${basePath}/compliance`}>
              <Button size="sm" variant="outline" className="rounded-full border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:text-amber-400 shrink-0">
                Bekijk
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main grid: activity + upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-content-blocks">
        {/* Recent activity */}
        <div className={cn(CARD_CLASS, 'lg:col-span-2 overflow-hidden')}>
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-neutral-800">
            <h2 className="text-base font-semibold text-[#163300] dark:text-[#9FE870]">Recente activiteit</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-neutral-800/80">
            {(isDemo ? recentActivities.slice(0, 7) : []).map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                <ActivityIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.amount != null && (
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      +€{item.amount.toLocaleString('nl-NL')}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{item.time}</span>
                </div>
              </div>
            ))}
            {!isDemo && (
              <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                Activiteiten worden hier weergegeven zodra je panden en huurders hebt.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming tasks + quick actions */}
        <div className="flex flex-col gap-content-blocks">
          {/* Upcoming tasks */}
          <div className={cn(CARD_CLASS, 'overflow-hidden')}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-neutral-800">
              <h2 className="text-base font-semibold text-[#163300] dark:text-[#9FE870]">Aankomend</h2>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-neutral-800/80">
              {(isDemo ? upcomingTasks : []).map((task) => (
                <div key={task.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#9FE870] mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                    {task.subtitle && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{task.subtitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">{task.date}</span>
                </div>
              ))}
              {!isDemo && (
                <div className="px-5 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  Geen aankomende taken.
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className={cn(CARD_CLASS, 'p-5')}>
            <h2 className="text-base font-semibold text-[#163300] dark:text-[#9FE870] mb-3">Snelle acties</h2>
            <div className="space-y-2">
              {[
                { label: 'Pand toevoegen', href: `${basePath}/portfolio/properties/new`, icon: Building2 },
                { label: 'Nieuw ticket', href: `${basePath}/maintenance`, icon: Ticket },
                { label: 'Huurder toevoegen', href: `${basePath}/tenants`, icon: Users },
                { label: 'Document uploaden', href: `${basePath}/documents`, icon: FileText },
              ].map((a) => {
                const Icon = a.icon
                return (
                  <Link key={a.label} href={a.href}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                      <div className="h-8 w-8 rounded-lg bg-[#163300]/5 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-1">{a.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Financial summary */}
          {isDemo && (
            <div className={cn(CARD_CLASS, 'p-5')}>
              <h2 className="text-base font-semibold text-[#163300] dark:text-[#9FE870] mb-3">Deze maand</h2>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Huurinkomsten</span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    +€{monthlyFinancials.huurinkomsten.toLocaleString('nl-NL')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Onderhoud</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    −€{monthlyFinancials.onderhoud.toLocaleString('nl-NL')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Beheerkosten</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    −€{monthlyFinancials.beheerkosten.toLocaleString('nl-NL')}
                  </span>
                </div>
                <div className="border-t border-gray-100 dark:border-neutral-800 pt-2.5 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Netto</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    +€{monthlyFinancials.netto.toLocaleString('nl-NL')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
