'use client'

import { useEffect, useState } from 'react'
import {
  portfolioTotals,
  recentActivities,
  complianceSummary,
  complianceAlerts,
  monthlyFinancials,
  upcomingTasks,
  openInvoicesTotal,
} from '@/lib/mock-data/domio-dashboard'
import {
  Building2,
  Users,
  TrendingUp,
  Euro,
  Wrench,
  FileText,
  UserPlus,
  ArrowUpRight,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FunctieBlock } from '@/components/ui/functie-block'
import { TransactionListWidget } from '@/components/ui/transaction-list-widget'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'

const CARD_CLASS = 'rounded-[1.75rem] border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden'
const INNER_BLOCK_CLASS = 'rounded-2xl bg-gray-100 dark:bg-neutral-800'

// Bar heights voor weergave (relatief)
const FINANCIAL_BARS = [
  { label: 'Huurinkomsten', value: monthlyFinancials.huurinkomsten, color: 'bg-white/20' },
  { label: 'Onderhoud', value: monthlyFinancials.onderhoud, color: 'bg-white/15' },
  { label: 'Beheerkosten', value: monthlyFinancials.beheerkosten, color: 'bg-white/10' },
  { label: 'Netto', value: monthlyFinancials.netto, color: 'bg-[#9FE870]' },
]
const maxFinancial = Math.max(...FINANCIAL_BARS.map((b) => b.value))

function ActivityIcon({ type }: { type: string }) {
  const iconClass = 'h-4 w-4 text-white'
  switch (type) {
    case 'huur_ontvangen':
      return <Euro className={iconClass} />
    case 'storingsmelding':
      return <Wrench className={iconClass} />
    case 'contract_verlengd':
      return <FileText className={iconClass} />
    case 'nieuwe_huurder':
      return <UserPlus className={iconClass} />
    case 'wws_herberekening':
      return <TrendingUp className={iconClass} />
    default:
      return <ArrowUpRight className={iconClass} />
  }
}

function AlertIcon({ type }: { type: string }) {
  if (type === 'huur_boven_max') return <span className="text-red-500"><AlertTriangle className="h-4 w-4" /></span>
  if (type === 'puntentelling_verlopen') return <span className="text-amber-500"><AlertTriangle className="h-4 w-4" /></span>
  return <span className="text-blue-500"><FileText className="h-4 w-4" /></span>
}

export default function EmployerDashboardPage() {
  const { profile, user, isDemo, loading } = useDashboardUser()
  const [propertyCount, setPropertyCount] = useState<number | null>(null)

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'daar'
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Goedemorgen'
    if (h < 18) return 'Goedemiddag'
    return 'Goedenavond'
  })()

  useEffect(() => {
    if (isDemo) {
      setPropertyCount(24) // mock data: altijd vol dashboard
      return
    }
    if (!user?.id) return
    supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .then(({ count }) => setPropertyCount(count ?? 0))
  }, [user?.id, isDemo])

  const isBlank = !isDemo && propertyCount !== null && propertyCount === 0

  // Tijdens laden: geen mockdata of placeholder tonen, voorkomt flash van verkeerde content
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 w-48 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-2" />
          <div className="h-4 w-64 rounded-block bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn(CARD_CLASS, 'p-5')}>
              <div className="h-12 w-12 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-3" />
              <div className="h-6 w-24 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-2" />
              <div className="h-4 w-16 rounded-block bg-gray-100 dark:bg-neutral-800 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={cn(CARD_CLASS, 'p-5 h-64')}>
            <div className="h-5 w-32 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-block bg-gray-100 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          </div>
          <div className={cn(CARD_CLASS, 'p-5 h-64')}>
            <div className="h-5 w-40 rounded-block bg-gray-200 dark:bg-neutral-700 animate-pulse mb-4" />
            <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-neutral-800 animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (isBlank) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {greeting}, {firstName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welkom bij Domio. Begin met het toevoegen van je panden.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-gray-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden p-8 sm:p-12">
          <div className="max-w-md mx-auto text-center">
            <div className="h-16 w-16 rounded-2xl bg-[#163300]/10 dark:bg-[#9FE870]/10 flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-8 w-8 text-[#163300] dark:text-[#9FE870]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nog geen panden toegevoegd
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Voeg je eerste verhuurobject toe om te beginnen met beheer, huurders en facturatie.
            </p>
            <Button asChild className="bg-[#163300] hover:bg-[#356258] text-white rounded-full px-6">
              <Link href="/dashboard/employer/portfolio/properties/new">
                <Plus className="h-4 w-4 mr-2" />
                Je panden toevoegen
              </Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Welkomstbanner */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {propertyCount !== null ? (
            <>Overzicht van je portefeuille</>
          ) : (
            <>Laden...</>
          )}
        </p>
      </div>

      {/* KPI strip – gevarieerde stijlen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <FunctieBlock
          icon={<Building2 className="h-4 w-4 text-white" />}
          title="Totaal objecten"
          value={String(portfolioTotals.totalObjects)}
          subtitle={`↑${portfolioTotals.objectsThisMonth} deze maand`}
        />
        <FunctieBlock
          icon={<Users className="h-4 w-4 text-white" />}
          title="Bezettingsgraad"
          value={`${portfolioTotals.occupancyPercent}%`}
          subtitle="Portefeuille"
        />
        <FunctieBlock
          icon={<Euro className="h-4 w-4 text-white" />}
          iconBgClassName="bg-amber-500"
          title="Openstaande facturen"
          value={`€${openInvoicesTotal.toLocaleString('nl-NL')}`}
          subtitle="Te innen"
        />
        <FunctieBlock
          icon={<CheckCircle2 className="h-4 w-4 text-white" />}
          trend={<span className="text-lg font-bold text-[#163300] dark:text-[#9FE870]">{complianceSummary.score}%</span>}
          title="Compliance score"
          value={null}
          subtitle={`${complianceSummary.compliant} van ${complianceSummary.total} compliant`}
        />
      </div>

      {/* 2 kolommen: Recente activiteit | Compliance status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {/* Recente activiteit – SaaS transactie-widget */}
        <TransactionListWidget
          title="Recente activiteit"
          seeAllHref="/dashboard/employer/portfolio"
          seeAllLabel="Alles"
          items={recentActivities.slice(0, 5).map((item, i) => ({
            icon: <ActivityIcon type={item.type} />,
            iconAccent: i === 0,
            name: item.title,
            description: `${item.subtitle} • ${item.time}`,
            amount: item.amount != null ? `€${item.amount.toLocaleString('nl-NL')}` : undefined,
          }))}
        />

        {/* Compliance status – donut-achtig + alerts */}
        <div className={cn(CARD_CLASS, 'p-5')}>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Compliance status
          </h3>
          <div className="flex flex-wrap items-center gap-6 mb-4">
            {/* Donut-achtige weergave: 3 segmenten */}
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgb(229, 231, 235)"
                  strokeWidth="2.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#163300"
                  strokeWidth="2.5"
                  strokeDasharray={`${(complianceSummary.compliant / complianceSummary.total) * 100}, 100`}
                  className="transition-all"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeDasharray={`${(complianceSummary.actionNeeded / complianceSummary.total) * 100}, 100`}
                  strokeDashoffset={`-${(complianceSummary.compliant / complianceSummary.total) * 100}`}
                  className="transition-all"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  strokeDasharray={`${(complianceSummary.expired / complianceSummary.total) * 100}, 100`}
                  strokeDashoffset={`-${((complianceSummary.compliant + complianceSummary.actionNeeded) / complianceSummary.total) * 100}`}
                  className="transition-all"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900 dark:text-white">
                {complianceSummary.score}%
              </span>
            </div>
            <div className="flex flex-col gap-1.5 text-sm">
              <span className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#163300]" />
                {complianceSummary.compliant} compliant
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
                {complianceSummary.actionNeeded} actie nodig
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                {complianceSummary.expired} verlopen
              </span>
            </div>
          </div>
          <div className={cn('rounded-2xl p-3 space-y-2', INNER_BLOCK_CLASS)}>
            {complianceAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <AlertIcon type={alert.type} />
                <span className="text-gray-700 dark:text-gray-300 font-medium">{alert.address}:</span>
                <span className="text-gray-600 dark:text-gray-400">{alert.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Onderste rij: Financieel (met balken) | Aankomende taken */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Financieel deze maand – donkere kaart met balken (zoals homepage Maandelijkse inkomsten) */}
        <div className={cn(CARD_CLASS, '!bg-[#163300] !border-[#163300]/20 p-6')}>
          <p className="text-white/80 text-sm font-medium mb-1">
            Financieel deze maand
          </p>
          <p className="text-3xl font-bold text-white mb-5">
            €{monthlyFinancials.huurinkomsten.toLocaleString('nl-NL')}
          </p>
          <div className="space-y-3 mb-5">
            {FINANCIAL_BARS.map((bar) => (
              <div key={bar.label} className="flex items-center gap-3">
                <div className="w-24 text-xs text-white/80 shrink-0">{bar.label}</div>
                <div className="flex-1 h-6 rounded-xl bg-white/10 overflow-hidden">
                  <div
                    className={cn('h-full rounded-xl transition-all duration-500', bar.color)}
                    style={{ width: `${(bar.value / maxFinancial) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-white w-20 text-right">
                  €{bar.value.toLocaleString('nl-NL')}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/employer/financial"
            className="inline-flex items-center justify-center gap-2 w-full rounded-full py-2.5 px-4 bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90 text-sm font-semibold transition-colors"
          >
            Bekijk financieel
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Aankomende taken – witte kaart, grijze rijen */}
        <div className={cn(CARD_CLASS, 'p-5')}>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Aankomende taken
          </h3>
          <ul className="space-y-2">
            {upcomingTasks.map((task) => (
              <li
                key={task.id}
                className={cn(
                  'flex items-center gap-3 py-3 px-4',
                  INNER_BLOCK_CLASS
                )}
              >
                <div className="h-10 w-10 rounded-full bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {task.title}
                  </p>
                  {task.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {task.subtitle}
                    </p>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
                  {task.date}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
