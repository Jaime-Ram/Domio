'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarDays, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import {
  computePaymentWindow,
  classifyExpectation,
  type UnitStatus,
  type ExpectationStatus,
  type PaymentProfile,
} from '@/lib/finance/classification'
import { STATUS_CONFIG } from '@/components/finance/statusConfig'

const EXP_STATUS_CONFIG: Record<ExpectationStatus, { label: string; classes: string; icon: React.ReactNode }> = {
  ...STATUS_CONFIG,
  toekomst: {
    label: 'Toekomst',
    classes: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400',
    icon: <CalendarDays className="h-3.5 w-3.5" />,
  },
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 6

const DUTCH_MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
]

const MATCH_METHOD_LABEL: Record<string, string> = {
  iban: 'IBAN',
  description_full: 'naam',
  description_huur: 'omschrijving',
  description_address: 'adres',
  manual: 'handmatig',
}

// ── Formatters ────────────────────────────────────────────────────────────────

function dutchPeriodLabel(duePeriod: string): string {
  const d = new Date(duePeriod)
  return `${DUTCH_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function fmtAmt(n: number): string {
  return n.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function fmtShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface DrawerHeader {
  monthlyRent: number
  startDate: string
  unitNumber: string | null
  propertyName: string | null
  tenantName: string | null
  tenantIban: string | null
  profile: PaymentProfile | null
}

interface SummaryExp {
  id: string
  due_period: string
  amount_expected: number
}

interface TxDetail {
  amount_assigned: number
  match_method: string
  booking_date: string
  description: string | null
}

interface ExpDetail {
  id: string
  due_period: string
  amount_expected: number
  expectation_type: string
  transactions: TxDetail[]
}

interface UnmatchedTx {
  id: string
  amount: number
  booking_date: string
  description: string | null
}

// ── Summary sentence ──────────────────────────────────────────────────────────

function buildSummary(
  allExps: SummaryExp[],
  paidByExp: Map<string, number>,
  profile: PaymentProfile,
  today: Date,
  status: UnitStatus
): string {
  if (status === 'betaald') return 'Alle betalingen voldaan'

  if (status === 'verwacht') {
    const exp = allExps.find(e => {
      const paid = paidByExp.get(e.id) ?? 0
      if (paid !== 0) return false
      const { first, last } = computePaymentWindow(e.due_period, profile)
      return today >= first && today <= last
    })
    if (!exp) return 'Betaling verwacht'
    return `${dutchPeriodLabel(exp.due_period)} verwacht (€${fmtAmt(Number(exp.amount_expected))})`
  }

  if (status === 'aandacht') {
    const exp = allExps.find(e => {
      const paid = paidByExp.get(e.id) ?? 0
      const expected = Number(e.amount_expected)
      return paid > 0 && Math.abs(paid - expected) >= 0.005
    })
    if (!exp) return 'Gedeeltelijk betaald'
    const paid = paidByExp.get(exp.id) ?? 0
    const expected = Number(exp.amount_expected)
    const open = expected - paid
    return `${dutchPeriodLabel(exp.due_period)}: €${fmtAmt(paid)} / €${fmtAmt(expected)} betaald · €${fmtAmt(open)} openstaand`
  }

  // achterstand — sum all overdue unpaid, find earliest period
  let total = 0
  let earliestPeriod: string | null = null
  for (const exp of allExps) {
    const paid = paidByExp.get(exp.id) ?? 0
    if (paid !== 0) continue
    const { last } = computePaymentWindow(exp.due_period, profile)
    if (today > last) {
      total += Number(exp.amount_expected)
      if (!earliestPeriod || exp.due_period < earliestPeriod) earliestPeriod = exp.due_period
    }
  }
  if (!earliestPeriod) return 'Betalingsachterstand'
  return `€${fmtAmt(total)} achterstand sinds ${dutchPeriodLabel(earliestPeriod)}`
}

// ── Main component ────────────────────────────────────────────────────────────

interface LeaseDrawerProps {
  leaseId: string | null
  status: UnitStatus | null
  onClose: () => void
}

export function LeaseDrawer({ leaseId, status, onClose }: LeaseDrawerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [header, setHeader] = useState<DrawerHeader | null>(null)
  const [loadingHeader, setLoadingHeader] = useState(false)

  const [summaryExps, setSummaryExps] = useState<SummaryExp[]>([])
  const [summaryPaid, setSummaryPaid] = useState<Map<string, number>>(new Map())
  const [loadingSummary, setLoadingSummary] = useState(false)

  const [expDetails, setExpDetails] = useState<ExpDetail[]>([])
  const [loadingExps, setLoadingExps] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const [unmatched, setUnmatched] = useState<UnmatchedTx[]>([])
  const [loadingUnmatched, setLoadingUnmatched] = useState(false)

  const loadExpPage = useCallback(
    async (id: string, offset: number, signal: { cancelled: boolean }) => {
      setLoadingExps(true)
      const { data: exps } = await supabase
        .from('rent_expectations')
        .select('id, due_period, amount_expected, expectation_type')
        .eq('lease_id', id)
        .order('due_period', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      if (signal.cancelled) return
      const page = (exps ?? []) as Omit<ExpDetail, 'transactions'>[]

      const expIds = page.map(e => e.id)
      let txDetails: (TxDetail & { rent_expectation_id: string })[] = []

      if (expIds.length > 0) {
        const { data: assigns } = await supabase
          .from('payment_assignments')
          .select('rent_expectation_id, amount_assigned, match_method, raw_transactions ( booking_date, description )')
          .in('rent_expectation_id', expIds)

        if (!signal.cancelled) {
          txDetails = ((assigns ?? []) as any[]).map(a => ({
            rent_expectation_id: a.rent_expectation_id as string,
            amount_assigned: Number(a.amount_assigned),
            match_method: a.match_method as string,
            booking_date: (a.raw_transactions?.booking_date ?? '') as string,
            description: (a.raw_transactions?.description ?? null) as string | null,
          }))
        }
      }

      if (signal.cancelled) return

      const details: ExpDetail[] = page.map(exp => ({
        ...exp,
        transactions: txDetails
          .filter(t => t.rent_expectation_id === exp.id)
          .sort((a, b) => b.booking_date.localeCompare(a.booking_date)),
      }))

      setExpDetails(prev => offset === 0 ? details : [...prev, ...details])
      setHasMore(page.length === PAGE_SIZE)
      setLoadingExps(false)
    },
    []
  )

  useEffect(() => {
    if (!leaseId) {
      setHeader(null)
      setSummaryExps([])
      setSummaryPaid(new Map())
      setExpDetails([])
      setHasMore(false)
      setUnmatched([])
      return
    }

    const signal = { cancelled: false }
    const id = leaseId  // captured as string (non-null guard above)

    setHeader(null)
    setSummaryExps([])
    setSummaryPaid(new Map())
    setExpDetails([])
    setHasMore(false)
    setUnmatched([])

    async function run() {
      // ── Header ───────────────────────────────────────────────────────────
      setLoadingHeader(true)
      const { data: leaseData } = await supabase
        .from('leases')
        .select(`
          monthly_rent, start_date,
          units ( unit_number, properties ( name ) ),
          tenants ( full_name, iban ),
          payment_profiles!payment_profile_id ( pay_date, reminders )
        `)
        .eq('id', id)
        .single()

      if (signal.cancelled) return

      const raw = leaseData as any
      const h: DrawerHeader = {
        monthlyRent: Number(raw?.monthly_rent ?? 0),
        startDate: raw?.start_date ?? '',
        unitNumber: raw?.units?.unit_number ?? null,
        propertyName: raw?.units?.properties?.name ?? null,
        tenantName: raw?.tenants?.full_name ?? null,
        tenantIban: raw?.tenants?.iban ?? null,
        profile: raw?.payment_profiles
          ? { pay_date: raw.payment_profiles.pay_date, reminders: raw.payment_profiles.reminders }
          : null,
      }
      setHeader(h)
      setLoadingHeader(false)

      // ── Summary (all expectations for sentence) ───────────────────────────
      setLoadingSummary(true)
      const { data: allExpsData } = await supabase
        .from('rent_expectations')
        .select('id, due_period, amount_expected')
        .eq('lease_id', id)
        .order('due_period', { ascending: false })

      if (signal.cancelled) return

      const allExps = (allExpsData ?? []) as SummaryExp[]
      const expIds = allExps.map(e => e.id)
      const paid = new Map<string, number>()

      if (expIds.length > 0) {
        const { data: assigns } = await supabase
          .from('payment_assignments')
          .select('rent_expectation_id, amount_assigned')
          .in('rent_expectation_id', expIds)

        if (!signal.cancelled) {
          for (const a of (assigns ?? []) as { rent_expectation_id: string; amount_assigned: number }[]) {
            paid.set(a.rent_expectation_id, (paid.get(a.rent_expectation_id) ?? 0) + Number(a.amount_assigned))
          }
        }
      }

      if (signal.cancelled) return
      setSummaryExps(allExps)
      setSummaryPaid(paid)
      setLoadingSummary(false)

      // ── First page of detailed expectations ───────────────────────────────
      await loadExpPage(id, 0, signal)

      // ── Unmatched transactions ────────────────────────────────────────────
      if (h.tenantIban) {
        setLoadingUnmatched(true)
        const { data: txns } = await supabase
          .from('raw_transactions')
          .select('id, amount, booking_date, description')
          .eq('counterparty_iban', h.tenantIban)
          .order('booking_date', { ascending: false })
          .limit(100)

        if (signal.cancelled) return

        const txnIds = (txns ?? []).map((t: any) => t.id as string)
        let assignedTxIds = new Set<string>()

        if (txnIds.length > 0) {
          const { data: assigned } = await supabase
            .from('payment_assignments')
            .select('raw_transaction_id')
            .in('raw_transaction_id', txnIds)

          if (!signal.cancelled) {
            assignedTxIds = new Set(((assigned ?? []) as { raw_transaction_id: string }[]).map(a => a.raw_transaction_id))
          }
        }

        if (signal.cancelled) return

        setUnmatched(
          ((txns ?? []) as any[])
            .filter(t => !assignedTxIds.has(t.id))
            .map(t => ({
              id: t.id as string,
              amount: Number(t.amount),
              booking_date: t.booking_date as string,
              description: (t.description ?? null) as string | null,
            }))
        )
        setLoadingUnmatched(false)
      }
    }

    run()
    return () => { signal.cancelled = true }
  }, [leaseId, loadExpPage])

  const handleLoadMore = useCallback(() => {
    if (!leaseId || !hasMore || loadingExps) return
    loadExpPage(leaseId, expDetails.length, { cancelled: false })
  }, [leaseId, hasMore, loadingExps, expDetails.length, loadExpPage])

  // ── Derived ──────────────────────────────────────────────────────────────

  const summarySentence =
    status && header?.profile && !loadingSummary
      ? buildSummary(summaryExps, summaryPaid, header.profile, today, status)
      : null

  const statusCfg = status ? STATUS_CONFIG[status] : null

  // Paid amounts from summary query (used for per-expectation pills)
  const paidByExpDetail = summaryPaid

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Sheet open={leaseId !== null} onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent
        side="right"
        className="sm:max-w-[520px] p-0 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="border-b border-gray-100 dark:border-neutral-800 px-6 py-5 shrink-0">
          {loadingHeader ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Laden…</span>
            </div>
          ) : (
            <>
              <SheetTitle className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                {header?.propertyName ?? '—'}
                {header?.unitNumber && (
                  <span className="font-normal text-gray-500 dark:text-gray-400">
                    {' · '}{header.unitNumber}
                  </span>
                )}
              </SheetTitle>
              <SheetDescription asChild>
                <div className="space-y-0.5 mt-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {header?.tenantName ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {header ? `€${fmtAmt(header.monthlyRent)}/maand · sinds ${fmtShortDate(header.startDate)}` : '—'}
                  </p>
                </div>
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Status section */}
          {statusCfg && (
            <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  statusCfg.classes
                )}>
                  {statusCfg.icon}
                  {statusCfg.label}
                </span>
              </div>
              {loadingSummary ? (
                <p className="text-xs text-gray-400">Laden…</p>
              ) : summarySentence ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">{summarySentence}</p>
              ) : null}
            </div>
          )}

          {/* Betalingsoverzicht */}
          <div className="px-6 py-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Betalingsoverzicht
            </h3>

            {expDetails.length === 0 && loadingExps && (
              <div className="flex items-center gap-2 py-4 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Laden…</span>
              </div>
            )}

            {expDetails.length === 0 && !loadingExps && (
              <p className="text-sm text-gray-400 py-4">Geen verwachtingen gevonden</p>
            )}

            <div className="space-y-4">
              {(() => {
                // Only show the nearest future (not-yet-due) expectation — the one
                // with the smallest due_period where today < first reminder date.
                // (The list is DESC so we must scan all to find the minimum.)
                let nearestFutureId: string | null = null
                if (header?.profile) {
                  for (const exp of expDetails) {
                    const paid = paidByExpDetail.get(exp.id) ?? 0
                    if (paid > 0) continue
                    const { first } = computePaymentWindow(exp.due_period, header.profile)
                    if (today < first) {
                      if (!nearestFutureId || exp.due_period < expDetails.find(e => e.id === nearestFutureId)!.due_period) {
                        nearestFutureId = exp.id
                      }
                    }
                  }
                }
                return expDetails.filter(exp => {
                  const paid = paidByExpDetail.get(exp.id) ?? 0
                  if (paid > 0 || !header?.profile) return true
                  const { first } = computePaymentWindow(exp.due_period, header.profile)
                  return today >= first || exp.id === nearestFutureId
                })
              })().map(exp => {
                const paid = paidByExpDetail.get(exp.id) ?? 0
                const expected = Number(exp.amount_expected)
                const expStatus = header?.profile
                  ? classifyExpectation(paid, expected, exp.due_period, header.profile, today)
                  : 'toekomst'
                const expCfg = EXP_STATUS_CONFIG[expStatus]

                return (
                  <div key={exp.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {dutchPeriodLabel(exp.due_period)}
                          {exp.expectation_type === 'service_charges' && (
                            <span className="ml-1.5 text-[11px] font-normal text-gray-400">(servicekosten)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Verwacht €{fmtAmt(expected)} · Betaald €{fmtAmt(paid)}
                        </p>
                      </div>
                      <span className={cn(
                        'shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                        expCfg.classes
                      )}>
                        {expCfg.icon}
                        {expCfg.label}
                      </span>
                    </div>

                    {/* Matched transactions */}
                    {exp.transactions.length > 0 ? (
                      <div className="mt-1.5 ml-3 space-y-1 border-l-2 border-gray-100 dark:border-neutral-800 pl-3">
                        {exp.transactions.map((tx, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <span className="text-gray-300 dark:text-neutral-600 shrink-0">↳</span>
                            <span>€{fmtAmt(tx.amount_assigned)} op {fmtShortDate(tx.booking_date)}</span>
                            <span className="rounded-full bg-gray-100 dark:bg-neutral-800 px-1.5 py-0 text-[10px] font-medium text-gray-500 dark:text-gray-400 shrink-0">
                              {MATCH_METHOD_LABEL[tx.match_method] ?? tx.match_method}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1.5 ml-3 pl-3 border-l-2 border-gray-100 dark:border-neutral-800">
                        <p className="text-xs text-gray-400 dark:text-gray-600">Geen betalingen gekoppeld</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={handleLoadMore}
                disabled={loadingExps}
              >
                {loadingExps ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Toon meer
              </Button>
            )}
          </div>

          <Separator className="mx-6" />

          {/* Niet-gekoppelde betalingen */}
          <div className="px-6 py-4 pb-8">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Niet-gekoppelde betalingen
            </h3>

            {!header?.tenantIban && !loadingHeader && (
              <p className="text-sm text-gray-400">Geen IBAN bekend voor deze huurder</p>
            )}

            {header?.tenantIban && loadingUnmatched && (
              <div className="flex items-center gap-2 py-2 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Laden…</span>
              </div>
            )}

            {header?.tenantIban && !loadingUnmatched && unmatched.length === 0 && (
              <p className="text-sm text-gray-400">Geen</p>
            )}

            {unmatched.length > 0 && (
              <div className="space-y-3">
                {unmatched.map(tx => (
                  <div key={tx.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        €{fmtAmt(tx.amount)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        op {fmtShortDate(tx.booking_date)}
                      </span>
                    </div>
                    {tx.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                        {tx.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
