'use client'

import { useState, useEffect } from 'react'
import { Loader2, Search, Table2, Columns3, Building2 } from 'lucide-react'
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
import { classifyUnit, type UnitStatus, type PaymentProfile } from '@/lib/finance/classification'
import { STATUS_CONFIG } from '@/components/finance/statusConfig'
import { LeaseDrawer } from '@/components/finance/LeaseDrawer'

// ── Types ────────────────────────────────────────────────────────────────────

interface UnitRow {
  lease_id: string
  unit_number: string | null
  property_id: string | null
  property_name: string | null
  tenant_name: string | null
  status: UnitStatus
}

interface LeaseRow {
  id: string
  units: {
    id: string
    unit_number: string | null
    properties: { id: string; name: string } | null
  } | null
  tenants: { id: string; full_name: string } | null
  payment_profiles: PaymentProfile | null
}

interface ExpectationRow {
  id: string
  lease_id: string
  due_period: string
  amount_expected: number
}

// ── Priority for sorting ──────────────────────────────────────────────────────

const STATUS_PRIORITY: Record<UnitStatus, number> = {
  betaald: 0,
  verwacht: 1,
  aandacht: 2,
  achterstand: 3,
}

// ── Main component ───────────────────────────────────────────────────────────

interface AchterstandenPanelProps {
  onMetrics?: (m: { betaald: number; verwacht: number; aandacht: number; achterstand: number }) => void
}

export function AchterstandenPanel({ onMetrics }: AchterstandenPanelProps) {
  const [rows, setRows] = useState<UnitRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'board'>('board')
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // 1. Fetch active leases — payment profile is on the lease, not the tenant
        const { data: leasesData, error: leaseErr } = await supabase
          .from('leases')
          .select(`
            id,
            units ( id, unit_number,
              properties ( id, name )
            ),
            tenants ( id, full_name ),
            payment_profiles!payment_profile_id ( pay_date, reminders )
          `)
          .eq('status', 'actief')

        if (leaseErr) throw leaseErr

        const leases = (leasesData ?? []) as LeaseRow[]
        if (leases.length === 0) {
          setRows([])
          onMetrics?.({ betaald: 0, verwacht: 0, aandacht: 0, achterstand: 0 })
          return
        }

        const leaseIds = leases.map(l => l.id)

        // 2. Fetch rent_expectations for these leases
        const { data: expectationsData, error: expErr } = await supabase
          .from('rent_expectations')
          .select('id, lease_id, due_period, amount_expected')
          .in('lease_id', leaseIds)

        if (expErr) throw expErr

        const expectations = (expectationsData ?? []) as ExpectationRow[]

        // 3. Sum payment_assignments per expectation
        const paidByExp = new Map<string, number>()
        if (expectations.length > 0) {
          const expectationIds = expectations.map(e => e.id)
          const { data: assignmentsData, error: assignErr } = await supabase
            .from('payment_assignments')
            .select('rent_expectation_id, amount_assigned')
            .in('rent_expectation_id', expectationIds)

          if (assignErr) throw assignErr

          for (const a of (assignmentsData ?? []) as { rent_expectation_id: string; amount_assigned: number }[]) {
            paidByExp.set(a.rent_expectation_id, (paidByExp.get(a.rent_expectation_id) ?? 0) + Number(a.amount_assigned))
          }
        }

        // Group expectations by lease
        const expsByLease = new Map<string, ExpectationRow[]>()
        for (const exp of expectations) {
          const list = expsByLease.get(exp.lease_id) ?? []
          list.push(exp)
          expsByLease.set(exp.lease_id, list)
        }

        // 4. Classify each lease
        const result: UnitRow[] = []
        for (const lease of leases) {
          const unit = lease.units ?? null
          const property = unit?.properties ?? null
          const leaseExps = expsByLease.get(lease.id) ?? []
          const status = classifyUnit(leaseExps, paidByExp, lease.payment_profiles, today, lease.id)

          result.push({
            lease_id: lease.id,
            unit_number: unit?.unit_number ?? null,
            property_id: property?.id ?? null,
            property_name: property?.name ?? null,
            tenant_name: lease.tenants?.full_name ?? null,
            status,
          })
        }

        // Sort: worst status first, then alphabetically by property name
        result.sort((a, b) => {
          const diff = STATUS_PRIORITY[b.status] - STATUS_PRIORITY[a.status]
          if (diff !== 0) return diff
          return (a.property_name ?? '').localeCompare(b.property_name ?? '')
        })

        setRows(result)
        onMetrics?.({
          betaald: result.filter(r => r.status === 'betaald').length,
          verwacht: result.filter(r => r.status === 'verwacht').length,
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
      (r.property_name ?? '').toLowerCase().includes(q) ||
      (r.unit_number ?? '').toLowerCase().includes(q) ||
      (r.tenant_name ?? '').toLowerCase().includes(q) ||
      STATUS_CONFIG[r.status].label.toLowerCase().includes(q)
    )
  })

  const selectedRow = rows.find(r => r.lease_id === selectedLeaseId) ?? null

  return (
    <>
      <Card className={dashboardCardClass()}>
        <CardHeader className={cn('space-y-3', DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                Betalingsstatus eenheden
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Actuele betaalstatus per eenheid op basis van ontvangen betalingen
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3 sm:min-w-[180px] sm:max-w-[240px]">
                <Search className="h-4 w-4 text-gray-400 shrink-0" />
                <Input
                  placeholder="Zoek op pand, eenheid..."
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
            <BoardView rows={filtered} onSelect={setSelectedLeaseId} />
          ) : (
            <TableView rows={filtered} onSelect={setSelectedLeaseId} />
          )}
        </CardContent>
      </Card>

      <LeaseDrawer
        leaseId={selectedLeaseId}
        status={selectedRow?.status ?? null}
        onClose={() => setSelectedLeaseId(null)}
      />
    </>
  )
}

// ── Board view ───────────────────────────────────────────────────────────────

const BOARD_COLUMNS: { key: UnitStatus; label: string }[] = [
  { key: 'betaald',     label: 'Betaald' },
  { key: 'verwacht',    label: 'Verwacht' },
  { key: 'aandacht',    label: 'Aandacht' },
  { key: 'achterstand', label: 'Achterstand' },
]

function BoardView({ rows, onSelect }: { rows: UnitRow[]; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {BOARD_COLUMNS.map(col => {
        const colRows = rows.filter(r => r.status === col.key)
        const cfg = STATUS_CONFIG[col.key]
        return (
          <div key={col.key} className="flex flex-col gap-0 rounded-2xl bg-gray-100/80 dark:bg-neutral-800/50 p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {col.label}
              </span>
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
                <BoardCard key={r.lease_id} row={r} cfg={cfg} onClick={() => onSelect(r.lease_id)} />
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
  cfg,
  onClick,
}: {
  row: UnitRow
  cfg: (typeof STATUS_CONFIG)[UnitStatus]
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-white dark:bg-neutral-900 px-4 py-4 flex flex-col gap-1 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all cursor-pointer"
    >
      <p className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">
        {row.property_name ?? '—'}
        {row.unit_number && (
          <span className="font-normal text-gray-500 dark:text-gray-400"> · {row.unit_number}</span>
        )}
      </p>
      {row.tenant_name && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{row.tenant_name}</p>
      )}
      <span className={cn(
        'mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        cfg.classes
      )}>
        {cfg.icon}
        {cfg.label}
      </span>
    </button>
  )
}

// ── Table view ───────────────────────────────────────────────────────────────

function TableView({ rows, onSelect }: { rows: UnitRow[]; onSelect: (id: string) => void }) {
  return (
    <DashboardTableBlock empty={rows.length === 0}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Pand · Eenheid</TableHead>
            <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Huurder</TableHead>
            <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Building2 className="h-8 w-8 text-gray-300 dark:text-neutral-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Geen eenheden gevonden
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {rows.map(r => {
            const cfg = STATUS_CONFIG[r.status]
            return (
              <TableRow
                key={r.lease_id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                onClick={() => onSelect(r.lease_id)}
              >
                <TableCell className="px-3.5 py-3 text-gray-900 dark:text-white font-medium">
                  {r.property_name ?? '—'}
                  {r.unit_number && (
                    <span className="font-normal text-gray-500 dark:text-gray-300"> · {r.unit_number}</span>
                  )}
                </TableCell>
                <TableCell className="px-3.5 py-3 text-gray-600 dark:text-gray-300">
                  {r.tenant_name ?? '—'}
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
