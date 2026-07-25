'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle, CalendarDays } from 'lucide-react'
import { mockPayments } from '@/lib/mock-data/vastgoed'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import { format, isThisMonth } from 'date-fns'
import { nl } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  classifyExpectation,
  type ExpectationStatus,
  type PaymentProfile,
} from '@/lib/finance/classification'

type ExpRow = {
  id: string
  due_period: string
  amount_expected: number
  paid: number
  booking_dates: string[]
  status: ExpectationStatus
}

function formatEur(amount: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function dutchMonthLabel(duePeriod: string) {
  return format(new Date(duePeriod), 'MMMM', { locale: nl })
}

const STATUS_BADGE: Record<ExpectationStatus, React.ReactNode> = {
  betaald: (
    <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400 gap-1">
      <CheckCircle2 className="h-3 w-3" />Betaald
    </Badge>
  ),
  achterstand: (
    <Badge className="bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 gap-1">
      <AlertCircle className="h-3 w-3" />Achterstallig
    </Badge>
  ),
  aandacht: (
    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400 gap-1">
      <AlertCircle className="h-3 w-3" />Gedeeltelijk
    </Badge>
  ),
  verwacht: (
    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 gap-1">
      <Clock className="h-3 w-3" />Openstaand
    </Badge>
  ),
  toekomst: (
    <Badge className="bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400 gap-1">
      <CalendarDays className="h-3 w-3" />Gepland
    </Badge>
  ),
}

const STATUS_DOT: Record<ExpectationStatus, string> = {
  betaald: 'bg-green-500',
  achterstand: 'bg-red-500',
  aandacht: 'bg-orange-400',
  verwacht: 'bg-blue-400',
  toekomst: 'bg-gray-300 dark:bg-neutral-600',
}

export default function TenantFinancialPage() {
  const { user, isDemo } = useDashboardUser()
  const [rows, setRows] = useState<ExpRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemo) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const demo = (mockPayments as any[])
        .filter((p) => p.tenantId === 't-1' && !p.id.startsWith('borg'))
        .map((p): ExpRow => {
          const paid = p.paidDate ? p.amount : 0
          const status: ExpectationStatus =
            p.status === 'betaald' ? 'betaald'
            : p.status === 'achterstallig' ? 'achterstand'
            : isThisMonth(new Date(p.dueDate)) ? 'verwacht'
            : new Date(p.dueDate) > today ? 'toekomst'
            : 'achterstand'
          return {
            id: p.id,
            due_period: p.dueDate,
            amount_expected: p.amount,
            paid,
            booking_dates: p.paidDate ? [p.paidDate] : [],
            status,
          }
        })
        .sort((a, b) => b.due_period.localeCompare(a.due_period))
      setRows(demo)
      setLoading(false)
      return
    }

    if (!user?.id) {
      setRows([])
      setLoading(false)
      return
    }

    async function load() {
      try {
        const { data: tenant } = await supabase
          .from('tenants').select('id').eq('profile_id', user!.id).maybeSingle()
        if (!tenant) return

        const { data: leaseTenantRows } = await supabase
          .from('lease_tenants').select('lease_id').eq('tenant_id', (tenant as any).id)
        const leaseIds = ((leaseTenantRows ?? []) as any[]).map((r) => r.lease_id)
        if (!leaseIds.length) return

        const { data: leaseData } = await supabase
          .from('leases')
          .select('id, payment_profiles!payment_profile_id ( pay_date, reminders )')
          .in('id', leaseIds).eq('status', 'actief').limit(1).maybeSingle()
        if (!leaseData) return

        const leaseId = (leaseData as any).id
        const profile: PaymentProfile | null = (leaseData as any).payment_profiles ?? null

        const { data: expsData } = await supabase
          .from('rent_expectations').select('id, due_period, amount_expected')
          .eq('lease_id', leaseId).order('due_period', { ascending: false })
        const exps = (expsData ?? []) as { id: string; due_period: string; amount_expected: number }[]
        if (!exps.length) return

        const expIds = exps.map((e) => e.id)
        const { data: assignsData } = await supabase
          .from('payment_assignments')
          .select('rent_expectation_id, amount_assigned, payments ( booking_date )')
          .in('rent_expectation_id', expIds)

        const paidByExp = new Map<string, number>()
        const datesByExp = new Map<string, string[]>()
        for (const a of (assignsData ?? []) as any[]) {
          const eid = a.rent_expectation_id as string
          paidByExp.set(eid, (paidByExp.get(eid) ?? 0) + Number(a.amount_assigned))
          if (a.payments?.booking_date) {
            const existing = datesByExp.get(eid) ?? []
            existing.push(a.payments.booking_date as string)
            datesByExp.set(eid, existing)
          }
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        setRows(exps.map((e) => {
          const paid = paidByExp.get(e.id) ?? 0
          const status = profile
            ? classifyExpectation(paid, Number(e.amount_expected), e.due_period, profile, today)
            : paid >= Number(e.amount_expected) - 0.005 ? 'betaald'
              : new Date(e.due_period) > today ? 'toekomst' : 'achterstand'
          return {
            id: e.id,
            due_period: e.due_period,
            amount_expected: Number(e.amount_expected),
            paid,
            booking_dates: (datesByExp.get(e.id) ?? []).sort().reverse(),
            status,
          }
        }))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user?.id, isDemo])

  const stats = useMemo(() => {
    const yearStr = String(new Date().getFullYear())
    const paidThisYear = rows
      .filter((r) => r.status === 'betaald' && r.due_period.startsWith(yearStr))
      .reduce((s, r) => s + r.paid, 0)
    const overdue = rows.filter((r) => r.status === 'achterstand')
    const current = rows.find((r) => isThisMonth(new Date(r.due_period)))
    return { paidThisYear, overdue, current }
  }, [rows])

  const grouped = useMemo(() => {
    const byYear = new Map<number, ExpRow[]>()
    for (const r of rows) {
      const year = new Date(r.due_period).getFullYear()
      if (!byYear.has(year)) byYear.set(year, [])
      byYear.get(year)!.push(r)
    }
    return [...byYear.entries()].sort(([a], [b]) => b - a)
  }, [rows])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-5 py-4">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Betaald {new Date().getFullYear()}</p>
          <p className="text-2xl font-bold text-[#161f13] dark:text-[#94f477] mt-1">{formatEur(stats.paidThisYear)}</p>
        </div>

        <div className={cn(
          'rounded-2xl border px-5 py-4',
          stats.current
            ? stats.current.status === 'betaald'
              ? 'border-green-200 bg-green-50 dark:border-green-500/20 dark:bg-green-500/5'
              : 'border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/5'
            : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'
        )}>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            {format(new Date(), 'MMMM yyyy', { locale: nl })}
          </p>
          {stats.current ? (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatEur(stats.current.amount_expected)}</p>
              {STATUS_BADGE[stats.current.status]}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Geen verwachte betaling</p>
          )}
        </div>

        <div className={cn(
          'rounded-2xl border px-5 py-4',
          stats.overdue.length > 0
            ? 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5'
            : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'
        )}>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Achterstallig</p>
          {stats.overdue.length > 0 ? (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatEur(stats.overdue.reduce((s, r) => s + (r.amount_expected - r.paid), 0))}
              </p>
              <span className="text-xs text-red-500 font-medium">{stats.overdue.length} maand{stats.overdue.length > 1 ? 'en' : ''}</span>
            </div>
          ) : (
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">Alles in orde</p>
          )}
        </div>
      </div>

      {/* Payment list */}
      {rows.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">Geen betalingen gevonden.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([year, yearRows]) => (
            <div key={year}>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">{year}</p>
              <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden divide-y divide-gray-100 dark:divide-neutral-800">
                {yearRows.map((r) => {
                  const current = isThisMonth(new Date(r.due_period))
                  const latestBookingDate = r.booking_dates[0] ?? null
                  return (
                    <div
                      key={r.id}
                      className={cn(
                        'flex items-center gap-4 px-5 py-4',
                        current && 'bg-blue-50/50 dark:bg-blue-500/5'
                      )}
                    >
                      <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', STATUS_DOT[r.status])} />

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-semibold capitalize',
                          current ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                        )}>
                          {dutchMonthLabel(r.due_period)}
                          {current && <span className="ml-2 text-xs font-normal text-blue-500 dark:text-blue-400">deze maand</span>}
                        </p>
                        {r.status === 'betaald' && latestBookingDate ? (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            Betaald op {format(new Date(latestBookingDate), 'd MMMM', { locale: nl })}
                          </p>
                        ) : r.status === 'aandacht' ? (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {formatEur(r.paid)} ontvangen · {formatEur(r.amount_expected - r.paid)} openstaand
                          </p>
                        ) : null}
                      </div>

                      <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                        {formatEur(r.amount_expected)}
                      </p>

                      <div className="shrink-0">
                        {STATUS_BADGE[r.status]}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
