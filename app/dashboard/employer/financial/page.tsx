'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import {
  CreditCard,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard,
  Link2Off,
  Building2,
  Tag,
  CalendarClock,
} from 'lucide-react'
import { CoinsStacked01, BarChart01, CalendarCheck01 } from '@untitledui/icons'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { MetricCard } from '@/components/finance/MetricCard'
import { AddPaymentTile } from '@/components/finance/add-payment-tile'

const getFinancialNav = (basePath: string) => [
  { label: 'Dashboard', href: `${basePath}/financial`, icon: LayoutDashboard },
  { label: 'Betalingen', href: `${basePath}/financial/betalingen`, icon: CreditCard },
  { label: 'Achterstanden', href: `${basePath}/financial/achterstanden`, icon: CalendarClock },
]

interface DashboardData {
  totalReceived: number
  receivedThisMonth: number
  expectedThisMonth: number
  unmatchedCount: number
  rentDiscrepancyCount: number
  overdueCount: number
  uncategorizedCount: number
  categoryBreakdown: { category: string; count: number }[]
}

const formatEur = (amount: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)

/** Lease loopt in de gegeven kalendermaand (monthStart … monthEndExclusive). */
function leaseOverlapsCalendarMonth(
  status: string,
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  monthStart: string,
  monthEndExclusive: string
): boolean {
  if (status !== 'actief') return false
  if (!startDate) return false
  if (startDate >= monthEndExclusive) return false
  if (endDate != null && endDate !== '' && endDate < monthStart) return false
  return true
}

export default function FinancialPage() {
  const router = useRouter()
  const { basePath } = useDashboardUser()
  const FINANCIAL_NAV = getFinancialNav(basePath)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthStart = `${currentPeriod}-01`
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  useEffect(() => {
    async function fetchDashboard() {
      const [txRes, leasesRes, expOverdueRes, assignRes] = await Promise.all([
        supabase
          .from('raw_transactions')
          .select('id, value_date, amount'),
        supabase
          .from('leases')
          .select('monthly_rent, status, start_date, end_date, units(property_id)'),
        supabase
          .from('rent_expectations')
          .select('id')
          .eq('status', 'pending')
          .lt('due_date', today),
        supabase
          .from('payment_assignments')
          .select('id, transaction_id, property_id, category'),
      ])

      const allTx = txRes.data ?? []
      const leases = leasesRes.data ?? []
      const overdueExpectations = expOverdueRes.data ?? []
      const assignments = assignRes.data ?? []

      // Verwachte huur deze maand = som maandhuren portefeuille (actieve leases in deze kalendermaand)
      let expectedThisMonth = 0
      const expectedByProp = new Map<string, number>()
      for (const row of leases as any[]) {
        if (
          !leaseOverlapsCalendarMonth(
            row.status,
            row.start_date,
            row.end_date,
            monthStart,
            monthEnd
          )
        ) {
          continue
        }
        const rent = Number(row.monthly_rent) || 0
        expectedThisMonth += rent
        const pid = row.units?.property_id as string | undefined
        if (pid) {
          expectedByProp.set(pid, (expectedByProp.get(pid) ?? 0) + rent)
        }
      }

      // Total received (all time)
      const totalReceived = allTx.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)

      // Current month transactions
      const monthTx = allTx.filter((tx: any) => {
        if (!tx.value_date) return false
        return tx.value_date >= monthStart && tx.value_date < monthEnd
      })
      const receivedThisMonth = monthTx.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)

      // Unmatched
      const assignedTxIds = new Set(assignments.map((a: any) => a.transaction_id))
      const unmatchedCount = allTx.filter((tx: any) => !assignedTxIds.has(tx.id)).length

      // Uncategorized: assigned but category is null
      const uncategorizedCount = assignments.filter((a: any) => a.category === null).length

      // Rent discrepancy: properties where ontvangen deze maand (huur) ≠ verwacht uit portefeuille
      const monthTxMap = new Map<string, any>(monthTx.map((tx: any) => [tx.id, tx]))
      const receivedByProp = new Map<string, number>()
      for (const a of assignments) {
        const tx = monthTxMap.get((a as any).transaction_id)
        if (tx && (a as any).property_id && (!(a as any).category || (a as any).category === 'huur')) {
          const pid = (a as any).property_id
          receivedByProp.set(pid, (receivedByProp.get(pid) ?? 0) + Number(tx.amount))
        }
      }

      let rentDiscrepancyCount = 0
      expectedByProp.forEach((expected, pid) => {
        const received = receivedByProp.get(pid) ?? 0
        if (Math.abs(received - expected) > 0.01) rentDiscrepancyCount++
      })

      // Category breakdown
      const catCounts = new Map<string, number>()
      for (const a of assignments) {
        const cat = (a as any).category || 'huur'
        catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1)
      }
      if (unmatchedCount > 0) {
        catCounts.set('_unmatched', unmatchedCount)
      }
      const categoryBreakdown = Array.from(catCounts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)

      setData({
        totalReceived,
        receivedThisMonth,
        expectedThisMonth,
        unmatchedCount,
        rentDiscrepancyCount,
        overdueCount: overdueExpectations.length,
        uncategorizedCount,
        categoryBreakdown,
      })
      setLoading(false)
    }

    fetchDashboard()
  }, [])

  const betalingenUrl = `${basePath}/financial/betalingen`
  const achterstandenUrl = `${basePath}/financial/achterstanden`

  // Build action items
  const actionItems: {
    key: string
    icon: React.ReactNode
    color: 'amber' | 'red'
    label: string
    detail: string
    href: string
    linkLabel: string
  }[] = []

  if (data) {
    if (data.unmatchedCount > 0) {
      actionItems.push({
        key: 'unmatched',
        icon: <Link2Off className="h-4 w-4" />,
        color: 'amber',
        label: 'Niet-gekoppelde transacties',
        detail: `${data.unmatchedCount} transactie${data.unmatchedCount !== 1 ? 's' : ''}`,
        href: betalingenUrl,
        linkLabel: 'Bekijken',
      })
    }
    if (data.rentDiscrepancyCount > 0) {
      actionItems.push({
        key: 'discrepancy',
        icon: <Building2 className="h-4 w-4" />,
        color: 'amber',
        label: 'Huurverschillen',
        detail: `${data.rentDiscrepancyCount} pand${data.rentDiscrepancyCount !== 1 ? 'en' : ''} met afwijkend bedrag`,
        href: achterstandenUrl,
        linkLabel: 'Bekijken',
      })
    }
    if (data.overdueCount > 0) {
      actionItems.push({
        key: 'overdue',
        icon: <CalendarClock className="h-4 w-4" />,
        color: 'red',
        label: 'Achterstallige huur',
        detail: `${data.overdueCount} huurder${data.overdueCount !== 1 ? 's' : ''} met achterstallige huur`,
        href: achterstandenUrl,
        linkLabel: 'Bekijken',
      })
    }
    if (data.uncategorizedCount > 0) {
      actionItems.push({
        key: 'uncategorized',
        icon: <Tag className="h-4 w-4" />,
        color: 'amber',
        label: 'Niet-gecategoriseerde transacties',
        detail: `${data.uncategorizedCount} transactie${data.uncategorizedCount !== 1 ? 's' : ''} zonder categorie`,
        href: betalingenUrl,
        linkLabel: 'Bekijken',
      })
    }
  }

  const colorMap = {
    amber: {
      border: 'border-l-amber-400 dark:border-l-amber-500',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconText: 'text-amber-600 dark:text-amber-400',
    },
    red: {
      border: 'border-l-red-400 dark:border-l-red-500',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconText: 'text-red-600 dark:text-red-400',
    },
  }

  return (
    <div className="space-y-content-blocks">
      <SectionNavDashboard title="Financieel" items={FINANCIAL_NAV} titleVariant="hero" />

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Laden...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Totaal ontvangen"
              value={formatEur(data.totalReceived)}
              icon={<CoinsStacked01 />}
            />
            <MetricCard
              label="Ontvangen deze maand"
              value={formatEur(data.receivedThisMonth)}
              icon={<BarChart01 />}
            />
            <MetricCard
              label="Verwacht deze maand"
              value={formatEur(data.expectedThisMonth)}
              icon={<CalendarCheck01 />}
            />
            <AddPaymentTile
              className="h-full min-h-[160px]"
              onClick={() => router.push(betalingenUrl)}
            />
          </div>

          {/* Actiepunten */}
          <Card className={dashboardCardClass()}>
              <CardContent className="pt-5 pb-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Actiepunten
                </h3>

                {actionItems.length === 0 ? (
                  <div className="flex items-center gap-3 py-8 justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Alles is up-to-date — geen actiepunten.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {actionItems.map((item) => {
                      const colors = colorMap[item.color]
                      return (
                        <div
                          key={item.key}
                          className={`flex items-center gap-3 rounded-lg border border-gray-100 dark:border-neutral-800 border-l-[3px] ${colors.border} px-4 py-3`}
                        >
                          <div className={`h-8 w-8 rounded-full ${colors.iconBg} flex items-center justify-center shrink-0`}>
                            <span className={colors.iconText}>{item.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.detail}
                            </p>
                          </div>
                          <button
                            onClick={() => router.push(item.href)}
                            className="text-xs font-medium text-[#163300] dark:text-[#9FE870] hover:underline whitespace-nowrap flex items-center gap-1 shrink-0"
                          >
                            {item.linkLabel}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      ) : null}
    </div>
  )
}
