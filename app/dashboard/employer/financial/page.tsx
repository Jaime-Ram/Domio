'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  LayoutDashboard,
  CalendarClock,
} from 'lucide-react'
import { CoinsStacked01, BarChart01, CalendarCheck01 } from '@untitledui/icons'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { MetricCard } from '@/components/finance/MetricCard'
import { AddPaymentTile } from '@/components/finance/add-payment-tile'
import { RendementChart } from '@/components/finance/RendementChart'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'
import { getFinancialNav } from './nav'

interface DashboardData {
  totalReceived: number
  receivedThisMonth: number
  expectedThisMonth: number
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
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthStart = `${currentPeriod}-01`
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`

  useEffect(() => {
    async function fetchDashboard() {
      const [txRes, leasesRes, propertiesRes] = await Promise.all([
        supabase
          .from('raw_transactions')
          .select('id, value_date, amount'),
        supabase
          .from('leases')
          .select('monthly_rent, status, start_date, end_date'),
        supabase
          .from('properties')
          .select('id, name'),
      ])

      const allTx = txRes.data ?? []
      const leases = leasesRes.data ?? []

      // Verwachte huur deze maand = som maandhuren portefeuille (actieve leases in deze kalendermaand)
      let expectedThisMonth = 0
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
      }

      // Total received (all time)
      const totalReceived = allTx.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)

      // Current month transactions
      const monthTx = allTx.filter((tx: any) => {
        if (!tx.value_date) return false
        return tx.value_date >= monthStart && tx.value_date < monthEnd
      })
      const receivedThisMonth = monthTx.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)

      setData({
        totalReceived,
        receivedThisMonth,
        expectedThisMonth,
      })
      setProperties(propertiesRes.data ?? [])
      setLoading(false)
    }

    fetchDashboard()
  }, [])

  const betalingenUrl = `${basePath}/financial/betalingen`

  return (
    <div className="space-y-content-blocks">
      <SectionNavDashboard
              title="Financieel"
              items={FINANCIAL_NAV}
              titleVariant="hero"
              widgetMenu={
                <SectionWidgetMenu>
                  <SectionWidgetMenuPlaceholder />
                </SectionWidgetMenu>
              }
            />

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

          {properties.length > 0 && <RendementChart properties={properties} />}
        </div>
      ) : null}
    </div>
  )
}
