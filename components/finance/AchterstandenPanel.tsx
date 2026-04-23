'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Clock, Loader2, Search, Table2, Columns3, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DashboardTableBlock } from '@/components/dashboard/dashboard-table-block'
import { cn } from '@/lib/utils'
import {
  dashboardCardClass,
  DASHBOARD_TABLE_HEAD_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS,
} from '@/app/dashboard/employer/dashboard-ui'
import { supabase } from '@/lib/supabase/client'

// ── Types ────────────────────────────────────────────────────────────────────

type TenantStatus = 'betaald' | 'aandacht' | 'achterstand'

interface TenantRow {
  id: string
  full_name: string
  property_name: string | null
  unit_number: string | null
  profile_name: string | null
  pay_date: number
  reminders: number[]
  evaluated_due_date: Date
  status: TenantStatus
  days_overdue: number          // today − evaluated_due_date (negative = before due)
  days_until_last_reminder: number  // last_reminder_date − today (negative = past)
}

// ── Status computation ────────────────────────────────────────────────────────

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function classifyTenant(payDate: number, reminders: number[], today: Date): {
  evaluated_due_date: Date
  status: TenantStatus
  days_overdue: number
  days_until_last_reminder: number
} {
  const year = today.getFullYear()
  const month = today.getMonth()
  // Clamp pay_date to valid day for month
  const maxDay = new Date(year, month + 1, 0).getDate()
  const day = Math.min(payDate, maxDay)
  const evaluated_due_date = new Date(year, month, day)

  const sorted = [...reminders].sort((a, b) => a - b)
  const first_reminder_date = sorted.length > 0
    ? addDays(evaluated_due_date, sorted[0])
    : evaluated_due_date
  const last_reminder_date = sorted.length > 0
    ? addDays(evaluated_due_date, sorted[sorted.length - 1])
    : evaluated_due_date

  const days_overdue = Math.floor((today.getTime() - evaluated_due_date.getTime()) / 86400000)
  const days_until_last_reminder = Math.floor((last_reminder_date.getTime() - today.getTime()) / 86400000)

  let status: TenantStatus
  if (today < first_reminder_date) {
    status = 'betaald'
  } else if (today <= last_reminder_date) {
    status = 'aandacht'
  } else {
    status = 'achterstand'
  }

  return { evaluated_due_date, status, days_overdue, days_until_last_reminder }
}

// ── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TenantStatus, { label: string; classes: string; icon: React.ReactNode }> = {
  betaald: {
    label: 'Betaald',
    classes: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  aandacht: {
    label: 'Aandacht',
    classes: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  achterstand: {
    label: 'Achterstand',
    classes: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })

// ── Main component ───────────────────────────────────────────────────────────

interface AchterstandenPanelProps {
  onMetrics?: (m: { betaald: number; aandacht: number; achterstand: number }) => void
}

export function AchterstandenPanel({ onMetrics }: AchterstandenPanelProps) {
  const [rows, setRows] = useState<TenantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'board'>('board')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await (supabase as any)
          .from('tenants')
          .select(`
            id, full_name, payment_profile_id,
            payment_profiles ( id, name, pay_date, reminders ),
            leases ( id, status, unit_id,
              units ( id, unit_number,
                properties ( id, name )
              )
            )
          `)
          .not('payment_profile_id', 'is', null)
          .order('full_name')

        const result: TenantRow[] = ((data ?? []) as any[]).map((t: any) => {
          const profile = t.payment_profiles
          const activeLease = (t.leases ?? []).find((l: any) => l.status === 'actief')
          const unit = activeLease?.units ?? null
          const property = unit?.properties ?? null

          const payDate: number = profile?.pay_date ?? 1
          const reminders: number[] = profile?.reminders ?? []

          const { evaluated_due_date, status, days_overdue, days_until_last_reminder } =
            classifyTenant(payDate, reminders, today)

          return {
            id: t.id,
            full_name: t.full_name,
            property_name: property?.name ?? null,
            unit_number: unit?.unit_number ?? null,
            profile_name: profile?.name ?? null,
            pay_date: payDate,
            reminders,
            evaluated_due_date,
            status,
            days_overdue,
            days_until_last_reminder,
          }
        })

        // Sort within groups
        result.sort((a, b) => {
          if (a.status !== b.status) return 0
          if (a.status === 'betaald') return b.days_overdue - a.days_overdue
          if (a.status === 'aandacht') return a.days_until_last_reminder - b.days_until_last_reminder
          // achterstand: by evaluated_due_date ASC
          return a.evaluated_due_date.getTime() - b.evaluated_due_date.getTime()
        })

        setRows(result)
        onMetrics?.({
          betaald: result.filter(r => r.status === 'betaald').length,
          aandacht: result.filter(r => r.status === 'aandacht').length,
          achterstand: result.filter(r => r.status === 'achterstand').length,
        })
      } catch {
        // ignore
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = rows.filter(r => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      r.full_name.toLowerCase().includes(q) ||
      (r.property_name ?? '').toLowerCase().includes(q) ||
      (r.unit_number ?? '').toLowerCase().includes(q) ||
      (r.profile_name ?? '').toLowerCase().includes(q) ||
      STATUS_CONFIG[r.status].label.toLowerCase().includes(q)
    )
  })

  return (
    <Card className={dashboardCardClass()}>
      <CardHeader className={cn('space-y-3', DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
              Betalingsstatus huurders
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Classificatie per huurder op basis van betaalprofiel
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3 sm:min-w-[180px] sm:max-w-[240px]">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <Input
                placeholder="Zoek op huurder, pand..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-2 text-sm min-w-0 flex-1 bg-transparent py-0"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 shrink-0"
              onClick={() => setViewMode(v => v === 'table' ? 'board' : 'table')}
              aria-label={viewMode === 'table' ? 'Toon als bord' : 'Toon als lijst'}
            >
              {viewMode === 'table' ? <Columns3 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn(
        'p-0 px-0 pb-0',
        !loading && viewMode === 'board' ? 'px-5 pb-5 pt-2' : DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS
      )}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : viewMode === 'board' ? (
          <BoardView rows={filtered} today={today} />
        ) : (
          <TableView rows={filtered} />
        )}
      </CardContent>
    </Card>
  )
}

// ── Board view ───────────────────────────────────────────────────────────────

const BOARD_COLUMNS: { key: TenantStatus; label: string }[] = [
  { key: 'betaald', label: 'Betaald' },
  { key: 'aandacht', label: 'Aandacht' },
  { key: 'achterstand', label: 'Achterstand' },
]

function BoardView({ rows, today }: { rows: TenantRow[]; today: Date }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {BOARD_COLUMNS.map(col => {
        const colRows = rows.filter(r => r.status === col.key)
        const cfg = STATUS_CONFIG[col.key]
        return (
          <div key={col.key} className="flex flex-col gap-0 rounded-2xl bg-gray-100/80 dark:bg-neutral-800/50 p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{col.label}</span>
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300]/15 text-[11px] font-medium text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870] px-1.5">
                {colRows.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 min-h-[80px]">
              {colRows.length === 0 && (
                <div className="rounded-xl px-4 py-5 text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500">Geen</p>
                </div>
              )}
              {colRows.map(r => (
                <BoardCard key={r.id} row={r} today={today} cfg={cfg} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BoardCard({
  row,
  today,
  cfg,
}: {
  row: TenantRow
  today: Date
  cfg: (typeof STATUS_CONFIG)[TenantStatus]
}) {
  const sublabel = getBoardSublabel(row, today)

  return (
    <div className="w-full text-left rounded-2xl bg-white dark:bg-neutral-900 px-4 py-4 flex flex-col gap-1.5 shadow-sm">
      <p className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">
        {row.full_name}
      </p>
      {(row.property_name || row.unit_number) && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {[row.property_name, row.unit_number].filter(Boolean).join(' · ')}
        </p>
      )}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Vervaldatum {fmtDate(row.evaluated_due_date)}
      </p>
      {sublabel && (
        <p className={cn('text-xs font-medium', cfg.classes.replace(/bg-\S+/g, '').trim())}>
          {sublabel}
        </p>
      )}
    </div>
  )
}

function getBoardSublabel(row: TenantRow, today: Date): string | null {
  const sorted = [...row.reminders].sort((a, b) => a - b)
  if (row.status === 'betaald') {
    const firstReminderDate = sorted.length > 0
      ? addDays(row.evaluated_due_date, sorted[0])
      : row.evaluated_due_date
    const daysUntil = Math.ceil((firstReminderDate.getTime() - today.getTime()) / 86400000)
    return daysUntil > 0 ? `Eerste herinnering over ${daysUntil} dag${daysUntil === 1 ? '' : 'en'}` : null
  }
  if (row.status === 'aandacht') {
    return row.days_until_last_reminder >= 0
      ? `Laatste herinnering over ${row.days_until_last_reminder} dag${row.days_until_last_reminder === 1 ? '' : 'en'}`
      : null
  }
  if (row.status === 'achterstand') {
    const daysLate = Math.abs(row.days_until_last_reminder)
    return `${daysLate} dag${daysLate === 1 ? '' : 'en'} na laatste herinnering`
  }
  return null
}

// ── Table view ───────────────────────────────────────────────────────────────

function TableView({ rows }: { rows: TenantRow[] }) {
  return (
    <DashboardTableBlock empty={rows.length === 0}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Huurder</TableHead>
            <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Pand · Eenheid</TableHead>
            <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Betaalprofiel</TableHead>
            <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'text-right')}>Vervaldatum</TableHead>
            <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Users className="h-8 w-8 text-gray-300 dark:text-neutral-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Geen huurders gevonden
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {rows.map(r => {
            const cfg = STATUS_CONFIG[r.status]
            return (
              <TableRow key={r.id}>
                <TableCell className="px-3.5 py-3 text-gray-900 dark:text-white font-medium">
                  {r.full_name}
                </TableCell>
                <TableCell className="px-3.5 py-3 text-gray-600 dark:text-gray-300">
                  {r.property_name && r.unit_number
                    ? `${r.property_name} · ${r.unit_number}`
                    : r.property_name ?? r.unit_number ?? '—'}
                </TableCell>
                <TableCell className="px-3.5 py-3 text-gray-600 dark:text-gray-300">
                  {r.profile_name ?? '—'}
                </TableCell>
                <TableCell className="px-3.5 py-3 text-right text-gray-600 dark:text-gray-300 tabular-nums">
                  {fmtDate(r.evaluated_due_date)}
                </TableCell>
                <TableCell className="px-3.5 py-3">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    cfg.classes
                  )}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </DashboardTableBlock>
  )
}
