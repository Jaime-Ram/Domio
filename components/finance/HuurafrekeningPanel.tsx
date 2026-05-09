'use client'

import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus,
  Loader2,
  Trash2,
  Ban,
  Send,
  FileText,
  Search,
  Table2,
  Columns3,
  Building2,
  Home,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isBefore, isAfter, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ADD_DIALOG_BODY_SCROLL_CLASS,
  ADD_DIALOG_CLOSE_BUTTON_CLASS,
  ADD_DIALOG_FOOTER_SPLIT_CLASS,
  ADD_DIALOG_HEADER_CLASS,
  ADD_DIALOG_TITLE_CLASS,
  addDialogContentClassName,
} from '@/components/ui/add-dialog-layout'
import {
  dashboardCardClass,
  DASHBOARD_TABLE_HEAD_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS,
} from '@/app/dashboard/employer/dashboard-ui'
import { supabase } from '@/lib/supabase/client'

// ── Types ────────────────────────────────────────────────────────────────────

type SettlementStatus = 'concept' | 'definitief' | 'verzonden' | 'verrekend' | 'nietig'

interface Settlement {
  id: string
  property_id: string
  unit_id: string
  tenant_id: string | null
  lease_id: string | null
  period_start: string
  period_end: string
  total_voorschot: number
  total_actual_costs: number
  balance: number
  cost_breakdown: BreakdownRow[] | null
  status: SettlementStatus
  notes: string | null
  created_at: string
  published_at: string | null
  sent_at: string | null
  voided_at: string | null
  properties?: { name: string; address: string }
  units?: { unit_number: string }
  tenants?: { full_name: string }
}

/** Unified row for both income and expense lines in the settlement breakdown */
interface BreakdownRow {
  id: string
  type: 'income' | 'expense'
  source: 'payment' | 'transaction' | 'manual' | 'inline'
  description: string
  income: number
  expense: number
  btw: number
  total: number
  category?: string
  date?: string
  selected: boolean
  cost_allocation_key_id?: string | null
  cost_allocation_key_name?: string | null
  allocation_pct?: number | null
  full_amount?: number | null
  is_property_level?: boolean
}

interface PropertyOption {
  id: string
  name: string
  address: string
  units: UnitOption[]
}

interface UnitOption {
  id: string
  unit_number: string
  leases: LeaseOption[]
}

interface LeaseOption {
  id: string
  tenant_id: string
  tenant_name: string | null
  monthly_rent: number
  servicekosten_voorschot: number
  status: string
}

const CATEGORY_LABELS: Record<string, string> = {
  onderhoud: 'Onderhoud',
  verzekering: 'Verzekering',
  belasting: 'Belasting',
  energie: 'Energie',
  vve: 'VvE',
  beheer: 'Beheer',
  overig: 'Overig',
}



const MONTH_ABBRS = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
const WEEKDAYS_NL = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

const fmt = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const STATUS_CONFIG: Record<SettlementStatus, { label: string; classes: string }> = {
  concept: { label: 'Concept', classes: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400' },
  definitief: { label: 'Gepubliceerd', classes: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  verzonden: { label: 'Verzonden', classes: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
  verrekend: { label: 'Verrekend', classes: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
  nietig: { label: 'Nietig', classes: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
}

// ── Shared table component ───────────────────────────────────────────────────

function OverzichtTable({
  incomeRows,
  expenseRows,
  editable,
  onToggle,
  onUpdateExpense,
  onRemoveExpense,
  onAddExpense,
}: {
  incomeRows: BreakdownRow[]
  expenseRows: BreakdownRow[]
  editable: boolean
  onToggle?: (id: string, checked: boolean) => void
  onUpdateExpense?: (id: string, field: string, value: string | number | boolean) => void
  onRemoveExpense?: (id: string) => void
  onAddExpense?: () => void
}) {
  const totalIncome = incomeRows.reduce((s, r) => s + r.income, 0)
  const totalExpense = expenseRows.filter((r) => r.selected).reduce((s, r) => s + r.expense, 0)
  const netTotal = totalIncome - totalExpense

  // Split expenses by level so we can render them as separate sections.
  const propertyExpenseRows = expenseRows.filter((r) => r.is_property_level)
  const unitExpenseRows = expenseRows.filter((r) => !r.is_property_level)

  const colSpan = editable ? 9 : 8

  const SectionLabel = ({ label }: { label: string }) => (
    <tr className="bg-gray-50/60 dark:bg-neutral-800/40">
      <td
        colSpan={colSpan}
        className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
      >
        {label}
      </td>
    </tr>
  )

  const renderExpenseRow = (r: BreakdownRow) => (
    <tr
      key={r.id}
      className={`border-b border-gray-50 dark:border-neutral-800/50 ${
        editable && !r.selected ? 'opacity-40' : ''
      }`}
    >
      {editable && (
        <td className="px-3 py-2">
          <Checkbox
            checked={r.selected}
            onCheckedChange={(v) => onToggle?.(r.id, !!v)}
          />
        </td>
      )}
      <td className="px-3 py-2">
        {editable && r.source === 'inline' ? (
          <Input
            value={r.description}
            onChange={(e) => onUpdateExpense?.(r.id, 'description', e.target.value)}
            placeholder="Omschrijving"
            className="h-8 text-sm"
          />
        ) : (
          <span className="text-gray-900 dark:text-white">
            {r.description || '—'}
            {r.category && (
              <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                {CATEGORY_LABELS[r.category] ?? r.category}
              </span>
            )}
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-sm">
        {r.is_property_level && r.cost_allocation_key_name && r.allocation_pct != null ? (
          <div className="flex flex-col leading-tight">
            <span className="text-gray-700 dark:text-gray-300">{r.cost_allocation_key_name}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{r.allocation_pct.toFixed(1)}%</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">
        {r.is_property_level && r.full_amount != null ? fmt(-r.full_amount) : '—'}
      </td>
      <td className="px-3 py-2 text-right text-gray-400">—</td>
      <td className="px-3 py-2 text-right">
        {editable && r.source === 'inline' ? (
          <Input
            type="number"
            value={r.expense || ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0
              onUpdateExpense?.(r.id, 'expense', val)
              onUpdateExpense?.(r.id, 'total', -val)
            }}
            placeholder="0,00"
            className="h-8 text-sm w-28 text-right"
            min="0"
            step="0.01"
          />
        ) : (
          <span className="text-red-600 dark:text-red-400 font-medium">
            {fmt(-r.expense)}
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-right text-gray-400">—</td>
      <td className="px-3 py-2 text-right font-medium text-red-600 dark:text-red-400">
        {editable && r.source === 'inline' ? fmt(-r.expense) : fmt(r.total)}
      </td>
      {editable && (
        <td className="px-3 py-2">
          {r.source === 'inline' && (
            <button
              onClick={() => onRemoveExpense?.(r.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </td>
      )}
    </tr>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-neutral-700 text-left">
            {editable && <th className="px-3 py-2.5 w-8"></th>}
            <th className="px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400">Omschrijving</th>
            <th className="px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400">Verdeelsleutel</th>
            <th className="px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400 text-right">Origineel</th>
            <th className="px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400 text-right">Inkomen</th>
            <th className="px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400 text-right">Uitgaven</th>
            <th className="px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400 text-right">BTW</th>
            <th className="px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400 text-right">Totaal</th>
            {editable && <th className="px-3 py-2.5 w-8"></th>}
          </tr>
        </thead>
        <tbody>
          {/* ── Income section ── */}
          {incomeRows.length > 0 && <SectionLabel label="Inkomsten" />}
          {incomeRows.map((r) => (
            <tr key={r.id} className="border-b border-gray-50 dark:border-neutral-800/50">
              {editable && <td className="px-3 py-2"></td>}
              <td className="px-3 py-2 text-gray-900 dark:text-white">{r.description}</td>
              <td className="px-3 py-2 text-gray-400">—</td>
              <td className="px-3 py-2 text-right text-gray-400">—</td>
              <td className="px-3 py-2 text-right text-green-600 dark:text-green-400 font-medium">
                {r.income > 0 ? fmt(r.income) : '—'}
              </td>
              <td className="px-3 py-2 text-right text-gray-400">—</td>
              <td className="px-3 py-2 text-right text-gray-400">—</td>
              <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{fmt(r.total)}</td>
              {editable && <td className="px-3 py-2"></td>}
            </tr>
          ))}

          {/* ── Unit-level expenses ── */}
          {unitExpenseRows.length > 0 && <SectionLabel label="Kosten — eenheid" />}
          {unitExpenseRows.map(renderExpenseRow)}

          {/* ── Property-level expenses ── */}
          {propertyExpenseRows.length > 0 && <SectionLabel label="Kosten — pand (verdeeld)" />}
          {propertyExpenseRows.map(renderExpenseRow)}

          {/* ── Add cost (editable only) ── */}
          {editable && onAddExpense && (
            <tr>
              <td colSpan={9} className="px-3 py-2">
                <button
                  onClick={onAddExpense}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#163300] dark:text-[#9FE870] hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Kosten toevoegen
                </button>
              </td>
            </tr>
          )}

          {/* ── Totals row ── */}
          <tr className="border-t-2 border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/30">
            {editable && <td className="px-3 py-3"></td>}
            <td className="px-3 py-3 font-semibold text-gray-900 dark:text-white">Totaal</td>
            <td className="px-3 py-3"></td>
            <td className="px-3 py-3"></td>
            <td className="px-3 py-3 text-right font-semibold text-green-600 dark:text-green-400">{fmt(totalIncome)}</td>
            <td className="px-3 py-3 text-right font-semibold text-red-600 dark:text-red-400">{fmt(-totalExpense)}</td>
            <td className="px-3 py-3 text-right font-semibold text-gray-400">—</td>
            <td className="px-3 py-3 text-right font-bold text-gray-900 dark:text-white">{fmt(netTotal)}</td>
            {editable && <td className="px-3 py-3"></td>}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export interface HuurafrekeningPanelRef {
  openNew: () => void
}

interface HuurafrekeningPanelProps {
  onMetrics?: (m: { betaald: number; verzonden: number; concept: number }) => void
}

export const HuurafrekeningPanel = forwardRef<HuurafrekeningPanelRef, HuurafrekeningPanelProps>(
  function HuurafrekeningPanel({ onMetrics }, ref) {
  const [editId, setEditId] = useState<string | null>(null)
  const [detailSettlement, setDetailSettlement] = useState<Settlement | null>(null)
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'board'>('board')

  const filteredSettlements = settlements.filter(s => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (s.properties?.name ?? '').toLowerCase().includes(q) ||
      (s.properties?.address ?? '').toLowerCase().includes(q) ||
      (s.units?.unit_number ?? '').toLowerCase().includes(q) ||
      (s.tenants?.full_name ?? '').toLowerCase().includes(q) ||
      (STATUS_CONFIG[s.status]?.label ?? '').toLowerCase().includes(q) ||
      s.period_start.includes(q) ||
      s.period_end.includes(q)
    )
  })

  const fetchSettlements = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/finance/settlements')
      if (res.ok) {
        const data = await res.json()
        setSettlements(data)
      }
    } catch {
      // ignore
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSettlements()
  }, [])

  useImperativeHandle(ref, () => ({ openNew }))

  useEffect(() => {
    if (!loading) {
      onMetrics?.({
        concept: settlements.filter(s => s.status === 'concept').length,
        verzonden: settlements.filter(s => s.status === 'verzonden').length,
        betaald: settlements.filter(s => s.status === 'verrekend').length,
      })
    }
  }, [settlements, loading])

  const openNew = () => {
    setEditId(null)
    setWizardOpen(true)
  }

  const openSettlement = (s: Settlement) => {
    if (s.status === 'concept') {
      setEditId(s.id)
      setWizardOpen(true)
    } else {
      setDetailSettlement(s)
      setDetailOpen(true)
    }
  }

  const closeDetail = () => {
    setDetailOpen(false)
    setDetailSettlement(null)
    fetchSettlements()
  }

  const closeWizard = () => {
    setWizardOpen(false)
    setEditId(null)
    fetchSettlements()
  }

  return (
    <>
    <Card className={dashboardCardClass()}>
      <CardHeader className={cn('space-y-3', DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
              Huurafrekeningen
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Periodieke afrekening van servicekosten per huurder
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3 sm:min-w-[180px] sm:max-w-[240px]">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <Input
                placeholder="Zoek op pand, huurder..."
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { key: 'concept',   label: 'Concepten',  statuses: ['concept'] as SettlementStatus[] },
              { key: 'verzonden', label: 'Verzonden',   statuses: ['definitief', 'verzonden'] as SettlementStatus[] },
              { key: 'betaald',   label: 'Betaald',    statuses: ['verrekend'] as SettlementStatus[] },
              { key: 'nietig',    label: 'Nietig',     statuses: ['nietig'] as SettlementStatus[] },
            ] as const).map((col) => {
              const colItems = filteredSettlements.filter(s => (col.statuses as readonly string[]).includes(s.status))
              return (
                <div key={col.key} className="flex flex-col gap-0 rounded-2xl bg-gray-100/80 dark:bg-neutral-800/50 p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{col.label}</span>
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300]/15 text-[11px] font-medium text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870] px-1.5">
                      {colItems.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 min-h-[80px]">
                    {colItems.length === 0 && (
                      <div className="rounded-xl px-4 py-5 text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">Geen</p>
                      </div>
                    )}
                    {colItems.map(s => {
                      const isVoided = s.status === 'nietig'
                      const balanceColor = isVoided
                        ? 'text-gray-400 dark:text-gray-500'
                        : s.balance > 0.01
                          ? 'text-green-600 dark:text-green-400'
                          : s.balance < -0.01
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => openSettlement(s)}
                          className={cn(
                            'w-full text-left rounded-2xl bg-white dark:bg-neutral-900 px-4 py-4 flex flex-col gap-1.5 shadow-sm',
                            'transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#163300]',
                            isVoided && 'opacity-50'
                          )}
                        >
                          <p className={cn('text-sm font-semibold leading-tight', isVoided ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white')}>
                            {s.properties?.name ?? '—'}
                          </p>
                          {s.tenants?.full_name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{s.tenants.full_name}</p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {fmtDate(s.period_start)} — {fmtDate(s.period_end)}
                          </p>
                          <p className={cn('text-base font-bold tabular-nums', balanceColor)}>
                            {fmt(s.balance)}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <DashboardTableBlock empty={filteredSettlements.length === 0}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Pand</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Eenheid</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Huurder</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Periode</TableHead>
                  <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'text-right')}>Voorschot</TableHead>
                  <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'text-right')}>Werkelijk</TableHead>
                  <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'text-right')}>Saldo</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSettlements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="h-8 w-8 text-gray-300 dark:text-neutral-600" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {searchQuery ? 'Geen afrekeningen gevonden' : 'Nog geen afrekeningen aangemaakt'}
                        </p>
                        {!searchQuery && (
                          <Button onClick={openNew} variant="outline" size="sm" className="rounded-full text-xs mt-1">
                            <Plus className="h-3.5 w-3.5 mr-1" />Maak je eerste afrekening
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {filteredSettlements.map((s) => {
                  const isVoided = s.status === 'nietig'
                  const balanceColor = isVoided
                    ? 'text-gray-400 dark:text-gray-500'
                    : s.balance > 0.01
                      ? 'text-green-600 dark:text-green-400'
                      : s.balance < -0.01
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                  const cfg = STATUS_CONFIG[s.status]
                  return (
                    <TableRow
                      key={s.id}
                      className={cn('cursor-pointer', isVoided && 'opacity-50')}
                      onClick={() => openSettlement(s)}
                    >
                      <TableCell className={cn('px-3.5 py-3', isVoided ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white')}>
                        {s.properties?.name ?? '—'}
                      </TableCell>
                      <TableCell className={cn('px-3.5 py-3', isVoided ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300')}>
                        {s.units?.unit_number ?? '—'}
                      </TableCell>
                      <TableCell className={cn('px-3.5 py-3', isVoided ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300')}>
                        {s.tenants?.full_name ?? '—'}
                      </TableCell>
                      <TableCell className={cn('px-3.5 py-3', isVoided ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300')}>
                        {fmtDate(s.period_start)} — {fmtDate(s.period_end)}
                      </TableCell>
                      <TableCell className={cn('px-3.5 py-3 text-right', isVoided ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300')}>
                        {fmt(s.total_voorschot)}
                      </TableCell>
                      <TableCell className={cn('px-3.5 py-3 text-right', isVoided ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300')}>
                        {fmt(s.total_actual_costs)}
                      </TableCell>
                      <TableCell className={cn('px-3.5 py-3 text-right font-medium', balanceColor)}>
                        {fmt(s.balance)}
                      </TableCell>
                      <TableCell className="px-3.5 py-3">
                        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.classes)}>
                          {cfg.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </DashboardTableBlock>
        )}
      </CardContent>
    </Card>
    <SettlementWizard
      key={`${wizardOpen}-${editId ?? 'new'}`}
      open={wizardOpen}
      onOpenChange={(v) => { if (!v) closeWizard() }}
      settlementId={editId}
      onClose={closeWizard}
    />
    <SettlementDetail
      open={detailOpen}
      onOpenChange={(v) => { if (!v) closeDetail() }}
      settlement={detailSettlement}
      onClose={closeDetail}
    />
    </>
  )
})

// ── Read-only detail view (for published / sent / voided settlements) ────────

interface DetailProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  settlement: Settlement | null
  onClose: () => void
}

function SettlementDetail({ open, onOpenChange, settlement, onClose }: DetailProps) {
  if (!settlement) return null
  const [voidOpen, setVoidOpen] = useState(false)
  const [voiding, setVoiding] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(settlement.status)

  const isVoided = currentStatus === 'nietig'
  const canVoid = currentStatus === 'definitief' || currentStatus === 'verzonden'

  const incomeRows = (settlement.cost_breakdown ?? []).filter((r) => r.type === 'income')
  const expenseRows = (settlement.cost_breakdown ?? []).filter((r) => r.type === 'expense')

  const totalIncome = incomeRows.reduce((s, r) => s + r.income, 0)
  const totalExpenses = expenseRows.reduce((s, r) => s + r.expense, 0)

  const handleVoid = async () => {
    setVoiding(true)
    try {
      const res = await fetch(`/api/finance/settlements/${settlement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'nietig' }),
      })
      if (res.ok) {
        setCurrentStatus('nietig')
      }
    } catch {
      // ignore
    }
    setVoiding(false)
    setVoidOpen(false)
  }

  const cfg = STATUS_CONFIG[currentStatus]

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={addDialogContentClassName('sm:max-w-2xl')}
        closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
      >
        <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
          <div className="flex items-center gap-3">
            <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>
              Huurafrekening
            </DialogTitle>
            <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.classes)}>
              {cfg.label}
            </span>
          </div>
        </DialogHeader>

        <div className={cn(ADD_DIALOG_BODY_SCROLL_CLASS, isVoided && 'opacity-60')}>
          <div className="space-y-4">

          {/* Voided banner */}
          {isVoided && (
            <div className="rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10 px-4 py-3 flex items-center gap-3">
              <Ban className="h-4 w-4 text-red-500 shrink-0" />
              <div className="text-sm">
                <span className="font-medium text-red-700 dark:text-red-400">Deze afrekening is nietig verklaard</span>
                {settlement.voided_at && (
                  <span className="text-red-600/70 dark:text-red-400/70 ml-1">op {fmtDateTime(settlement.voided_at)}</span>
                )}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4">
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">Huurder</span>
              <span className="font-medium text-gray-900 dark:text-white">{settlement.tenants?.full_name ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">Eenheid</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {settlement.properties?.name}, {settlement.units?.unit_number}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">Periode</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {fmtDate(settlement.period_start)} — {fmtDate(settlement.period_end)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">Aangemaakt</span>
              <span className="font-medium text-gray-900 dark:text-white">{fmtDateTime(settlement.created_at)}</span>
            </div>
          </div>

          {/* Lifecycle timestamps */}
          {(settlement.published_at || settlement.sent_at || settlement.voided_at) && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400 px-1">
              {settlement.published_at && <span>Gepubliceerd: {fmtDateTime(settlement.published_at)}</span>}
              {settlement.sent_at && <span>Verzonden: {fmtDateTime(settlement.sent_at)}</span>}
              {settlement.voided_at && <span className="text-red-500 dark:text-red-400">Nietig verklaard: {fmtDateTime(settlement.voided_at)}</span>}
            </div>
          )}

          {/* Breakdown table */}
          <OverzichtTable
            incomeRows={incomeRows.map((r) => ({ ...r, selected: true }))}
            expenseRows={expenseRows.map((r) => ({ ...r, selected: true }))}
            editable={false}
          />

          {/* Summary */}
          <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Servicekosten afrekening</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Totaal ontvangen</span>
              <span className="text-right font-medium text-green-600 dark:text-green-400">{fmt(totalIncome)}</span>
              <span className="text-gray-500 dark:text-gray-400">Totaal uitgaven</span>
              <span className="text-right font-medium text-red-600 dark:text-red-400">{fmt(-totalExpenses)}</span>
            </div>
            <div className="border-t border-gray-100 dark:border-neutral-800 pt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Voorschot</span>
              <span className="text-right font-medium text-gray-900 dark:text-white">{fmt(settlement.total_voorschot)}</span>
              <span className="text-gray-500 dark:text-gray-400">Werkelijke kosten</span>
              <span className="text-right font-medium text-gray-900 dark:text-white">{fmt(settlement.total_actual_costs)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Saldo servicekosten</span>
              <span className={cn(
                'text-lg font-bold',
                settlement.balance > 0.01 ? 'text-green-600 dark:text-green-400'
                  : settlement.balance < -0.01 ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500'
              )}>
                {fmt(settlement.balance)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {settlement.notes && (
            <div className="space-y-1">
              <Label>Notities</Label>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{settlement.notes}</p>
            </div>
          )}
          </div>
        </div>

        <div className={ADD_DIALOG_FOOTER_SPLIT_CLASS}>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            Sluiten
          </button>
          {!isVoided && (
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled className="gap-2 rounded-full" title="Binnenkort beschikbaar">
                <Send className="h-4 w-4" />
                Versturen
              </Button>
              {canVoid && (
                <Button
                  variant="outline"
                  onClick={() => setVoidOpen(true)}
                  className="gap-2 rounded-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  <Ban className="h-4 w-4" />
                  Nietig verklaren
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={voidOpen} onOpenChange={setVoidOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Afrekening nietig verklaren</AlertDialogTitle>
          <AlertDialogDescription>
            Weet je zeker dat je deze afrekening nietig wilt verklaren? De afrekening blijft zichtbaar maar wordt als ongeldig gemarkeerd. Dit kan niet ongedaan worden gemaakt.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuleren</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleVoid}
            disabled={voiding}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {voiding ? 'Bezig...' : 'Nietig verklaren'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

// ── Wizard (concept settlements only) ────────────────────────────────────────

interface WizardProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  settlementId: string | null
  onClose: () => void
}

function SettlementWizard({ open, onOpenChange, settlementId, onClose }: WizardProps) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Picker state
  const [propPickerOpen, setPropPickerOpen] = useState(false)
  const [unitPickerOpen, setUnitPickerOpen] = useState(false)
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number; width: number } | null>(null)

  // Period state
  const [periodMode, setPeriodMode] = useState<'months' | 'custom'>('months')
  const [yearView, setYearView] = useState(new Date().getFullYear())
  const [monthRangeStart, setMonthRangeStart] = useState('')   // "yyyy-MM"
  const [monthRangeEnd, setMonthRangeEnd] = useState('')       // "yyyy-MM"
  const [monthHover, setMonthHover] = useState<string | null>(null)
  const [calView, setCalView] = useState<Date>(startOfMonth(new Date()))
  const [dayHover, setDayHover] = useState<Date | null>(null)

  // Step 1 state
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [propertyId, setPropertyId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [loadingProps, setLoadingProps] = useState(true)

  // Derived from selection
  const selectedProperty = properties.find((p) => p.id === propertyId)
  const selectedUnit = selectedProperty?.units.find((u) => u.id === unitId)
  const activeLease = selectedUnit?.leases.find((l) => l.status === 'actief')
  const tenantName = activeLease?.tenant_name ?? null
  const tenantId = activeLease?.tenant_id ?? null
  const leaseId = activeLease?.id ?? null
  const voorschotPerMonth = activeLease?.servicekosten_voorschot ?? 0

  // Compute months in period
  const monthsInPeriod = useMemo(() => {
    if (!periodStart || !periodEnd) return []
    const months: { month: number; year: number }[] = []
    const start = new Date(periodStart)
    const end = new Date(periodEnd)
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1)
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
    while (cursor <= endMonth) {
      months.push({ month: cursor.getMonth(), year: cursor.getFullYear() })
      cursor.setMonth(cursor.getMonth() + 1)
    }
    return months
  }, [periodStart, periodEnd])

  const expectedVoorschotForPeriod = voorschotPerMonth * monthsInPeriod.length

  // Step 2 state — income and expense rows (both fetched from API)
  const [incomeRows, setIncomeRows] = useState<BreakdownRow[]>([])
  const [expenseRows, setExpenseRows] = useState<BreakdownRow[]>([])
  const [loadingCosts, setLoadingCosts] = useState(false)

  // Step 3 state
  const [notes, setNotes] = useState('')

  // Existing settlement (edit mode)
  const [existingLoaded, setExistingLoaded] = useState(false)

  // Load properties
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('properties')
        .select(`
          id, name, address,
          units (
            id, unit_number,
            leases (
              id, tenant_id, monthly_rent, servicekosten_voorschot, status,
              tenants ( full_name )
            )
          )
        `)
        .order('name')
      const mapped: PropertyOption[] = ((data as any) ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        units: (p.units ?? []).map((u: any) => ({
          id: u.id,
          unit_number: u.unit_number,
          leases: (u.leases ?? []).map((l: any) => ({
            id: l.id,
            tenant_id: l.tenant_id,
            tenant_name: l.tenants?.full_name ?? null,
            monthly_rent: l.monthly_rent,
            servicekosten_voorschot: l.servicekosten_voorschot ?? 0,
            status: l.status,
          })),
        })),
      }))
      setProperties(mapped)
      setLoadingProps(false)
    }
    load()
  }, [])

  // Load existing settlement for editing
  useEffect(() => {
    if (!settlementId || existingLoaded || loadingProps) return
    const load = async () => {
      const res = await fetch('/api/finance/settlements')
      if (!res.ok) return
      const all: Settlement[] = await res.json()
      const s = all.find((x) => x.id === settlementId)
      if (!s) return
      setPropertyId(s.property_id)
      setUnitId(s.unit_id)
      setPeriodStart(s.period_start)
      setPeriodEnd(s.period_end)
      setNotes(s.notes ?? '')
      // Restore period mode
      const sd = parseISO(s.period_start)
      const ed = parseISO(s.period_end)
      const isFullMonths =
        s.period_start === format(startOfMonth(sd), 'yyyy-MM-dd') &&
        s.period_end === format(endOfMonth(ed), 'yyyy-MM-dd')
      if (isFullMonths) {
        setPeriodMode('months')
        setMonthRangeStart(s.period_start.slice(0, 7))
        setMonthRangeEnd(s.period_end.slice(0, 7))
        setYearView(sd.getFullYear())
      } else {
        setPeriodMode('custom')
        setCalView(startOfMonth(sd))
      }
      if (s.cost_breakdown) {
        const income = s.cost_breakdown
          .filter((r) => r.type === 'income')
          .map((r) => ({ ...r, selected: true }))
        const expenses = s.cost_breakdown
          .filter((r) => r.type === 'expense')
          .map((r) => ({ ...r, selected: true }))
        setIncomeRows(income)
        setExpenseRows(expenses)
      }
      setExistingLoaded(true)
    }
    load()
  }, [settlementId, existingLoaded, loadingProps])

  // Reset unit when property changes
  useEffect(() => {
    if (!existingLoaded) setUnitId('')
  }, [propertyId])

  // Fetch income + expense data for step 2
  const fetchCosts = async () => {
    if (!propertyId || !periodStart || !periodEnd) return
    setLoadingCosts(true)
    try {
      const qs = new URLSearchParams({
        property_id: propertyId,
        period_start: periodStart,
        period_end: periodEnd,
      })
      if (unitId) qs.set('unit_id', unitId)
      const res = await fetch(`/api/finance/settlements/_/costs?${qs}`)
      if (res.ok) {
        const data: {
          income: { id: string; source: string; date: string; description: string; counterparty_name: string; amount: number }[]
          expenses: {
            id: string
            source: string
            date: string
            description: string
            category: string
            amount: number
            full_amount: number
            is_property_level: boolean
            cost_allocation_key_id: string | null
            cost_allocation_key_name: string | null
            allocation_pct: number | null
          }[]
        } = await res.json()

        setIncomeRows(
          data.income.map((p) => {
            const label = p.counterparty_name
              ? `Betaling ${fmtDate(p.date)} — ${p.counterparty_name}`
              : p.description
                ? `Betaling ${fmtDate(p.date)} — ${p.description}`
                : `Betaling ${fmtDate(p.date)}`
            return {
              id: p.id,
              type: 'income' as const,
              source: 'payment' as const,
              description: label,
              income: p.amount,
              expense: 0,
              btw: 0,
              total: p.amount,
              date: p.date,
              selected: true,
            }
          })
        )

        setExpenseRows(
          data.expenses.map((c) => ({
            id: c.id,
            type: 'expense' as const,
            source: c.source as BreakdownRow['source'],
            description: c.description,
            income: 0,
            expense: Math.abs(c.amount),
            btw: 0,
            total: -Math.abs(c.amount),
            category: c.category,
            date: c.date,
            selected: true,
            cost_allocation_key_id: c.cost_allocation_key_id,
            cost_allocation_key_name: c.cost_allocation_key_name,
            allocation_pct: c.allocation_pct,
            full_amount: c.full_amount,
            is_property_level: c.is_property_level,
          }))
        )
      }
    } catch {
      // ignore
    }
    setLoadingCosts(false)
  }

  const goToStep2 = () => {
    if (!existingLoaded || (incomeRows.length === 0 && expenseRows.length === 0)) fetchCosts()
    setStep(2)
  }

  // Inline expense addition
  const addInlineExpense = () => {
    setExpenseRows((prev) => [
      ...prev,
      {
        id: `inline-${Date.now()}`,
        type: 'expense',
        source: 'inline',
        description: '',
        income: 0,
        expense: 0,
        btw: 0,
        total: 0,
        category: 'overig',
        date: periodStart || new Date().toISOString().slice(0, 10),
        selected: true,
      },
    ])
  }

  const updateExpense = (id: string, field: string, value: string | number | boolean) => {
    setExpenseRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const toggleExpense = (id: string, checked: boolean) => {
    setExpenseRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: checked } : r))
    )
  }

  const removeExpense = (id: string) => {
    setExpenseRows((prev) => prev.filter((r) => r.id !== id))
  }

  // ── Period helpers ────────────────────────────────────────────────────────

  function handleMonthClick(ym: string) {
    if (!monthRangeStart || monthRangeEnd) {
      setMonthRangeStart(ym)
      setMonthRangeEnd('')
      const [y, m] = ym.split('-').map(Number)
      setPeriodStart(format(new Date(y, m - 1, 1), 'yyyy-MM-dd'))
      setPeriodEnd(format(new Date(y, m, 0), 'yyyy-MM-dd'))
    } else {
      const [start, end] = ym >= monthRangeStart ? [monthRangeStart, ym] : [ym, monthRangeStart]
      setMonthRangeStart(start)
      setMonthRangeEnd(end)
      const [sy, sm] = start.split('-').map(Number)
      const [ey, em] = end.split('-').map(Number)
      setPeriodStart(format(new Date(sy, sm - 1, 1), 'yyyy-MM-dd'))
      setPeriodEnd(format(new Date(ey, em, 0), 'yyyy-MM-dd'))
    }
  }

  function handleRangeDayClick(day: Date) {
    const dayStr = format(day, 'yyyy-MM-dd')
    if (!periodStart || periodEnd) {
      setPeriodStart(dayStr)
      setPeriodEnd('')
      setDayHover(null)
    } else {
      const start = parseISO(periodStart)
      if (isBefore(day, start)) {
        setPeriodEnd(periodStart)
        setPeriodStart(dayStr)
      } else {
        setPeriodEnd(dayStr)
      }
      setDayHover(null)
    }
  }

  // Computed totals
  const selectedExpenses = expenseRows.filter((r) => r.selected)
  const totalIncome = incomeRows.reduce((s, r) => s + r.income, 0)
  const totalExpenses = selectedExpenses.reduce((s, r) => s + r.expense, 0)
  // Saldo = actual income received minus actual costs
  const servicekostenSaldo = totalIncome - totalExpenses

  // Save
  const save = async (status: 'concept' | 'definitief') => {
    setSaving(true)
    // Store full breakdown: all income rows + selected expense rows
    const fullBreakdown: Omit<BreakdownRow, 'selected'>[] = [
      ...incomeRows.map(({ selected: _, ...rest }) => rest),
      ...selectedExpenses.map(({ selected: _, ...rest }) => rest),
    ]

    const payload = {
      property_id: propertyId,
      unit_id: unitId,
      tenant_id: tenantId,
      lease_id: leaseId,
      period_start: periodStart,
      period_end: periodEnd,
      total_voorschot: totalIncome,
      total_actual_costs: totalExpenses,
      balance: servicekostenSaldo,
      cost_breakdown: fullBreakdown,
      status,
      notes: notes || null,
    }

    try {
      const url = settlementId
        ? `/api/finance/settlements/${settlementId}`
        : '/api/finance/settlements'
      const method = settlementId ? 'PUT' : 'POST'
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      onClose()
    } catch {
      // ignore
    }
    setSaving(false)
  }

  const step1Valid = propertyId && unitId && periodStart && periodEnd

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={addDialogContentClassName('sm:max-w-5xl')}
          closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
        >
          <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
            <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>
              {settlementId ? 'Afrekening bewerken' : 'Nieuwe afrekening'}
            </DialogTitle>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={cn('h-1.5 rounded-full transition-all bg-[#163300] dark:bg-[#9FE870]', step === 1 ? 'w-6' : 'w-3 opacity-30')} />
              <span className={cn('h-1.5 rounded-full transition-all bg-[#163300] dark:bg-[#9FE870]', step === 2 ? 'w-6' : 'w-3 opacity-30')} />
              <span className={cn('h-1.5 rounded-full transition-all bg-[#163300] dark:bg-[#9FE870]', step === 3 ? 'w-6' : 'w-3 opacity-30')} />
              <span className="ml-1 text-xs text-gray-400">
                {step === 1 ? 'Eenheid & periode' : step === 2 ? 'Overzicht' : 'Samenvatting'}
              </span>
            </div>
          </DialogHeader>

          <div className={ADD_DIALOG_BODY_SCROLL_CLASS}>

            {/* ── Step 1 ── */}
            {step === 1 && (
              loadingProps ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pand picker */}
                    <div className="space-y-2">
                      <Label>Pand *</Label>
                      <button type="button"
                        onClick={e => {
                          const r = e.currentTarget.getBoundingClientRect()
                          setPickerPos({ top: r.bottom + 4, left: r.left, width: r.width })
                          setPropPickerOpen(v => !v); setUnitPickerOpen(false)
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                          propertyId
                            ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                            : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
                        )}
                      >
                        <Building2 className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{properties.find(p => p.id === propertyId)?.name ?? 'Pand kiezen'}</span>
                        {propertyId ? <Check className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />}
                      </button>
                      {propPickerOpen && pickerPos && createPortal(
                        <>
                          <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'auto' }} onClick={() => setPropPickerOpen(false)} />
                          <div style={{ position: 'fixed', top: pickerPos.top, left: pickerPos.left, width: pickerPos.width, zIndex: 9999, pointerEvents: 'auto' }}
                            className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 max-h-60 overflow-y-auto"
                          >
                            {properties.map(p => {
                              const isSel = propertyId === p.id
                              return (
                                <button key={p.id} type="button"
                                  onClick={() => { setPropertyId(p.id); setUnitId(''); setPropPickerOpen(false) }}
                                  className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                                    isSel ? 'bg-[#163300]/5 dark:bg-[#9FE870]/10 text-[#163300] dark:text-[#9FE870] font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                  )}
                                >
                                  <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                  <span className="flex-1">{p.name}</span>
                                  {isSel && <Check className="h-3.5 w-3.5 shrink-0" />}
                                </button>
                              )
                            })}
                          </div>
                        </>,
                        document.body
                      )}
                    </div>

                    {/* Eenheid picker */}
                    <div className="space-y-2">
                      <Label>Eenheid *</Label>
                      <button type="button"
                        disabled={!propertyId}
                        onClick={e => {
                          const r = e.currentTarget.getBoundingClientRect()
                          setPickerPos({ top: r.bottom + 4, left: r.left, width: r.width })
                          setUnitPickerOpen(v => !v); setPropPickerOpen(false)
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                          unitId
                            ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                            : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600 disabled:opacity-40'
                        )}
                      >
                        <Home className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{selectedProperty?.units.find(u => u.id === unitId)?.unit_number ?? 'Eenheid kiezen'}</span>
                        {unitId ? <Check className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />}
                      </button>
                      {unitPickerOpen && pickerPos && createPortal(
                        <>
                          <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'auto' }} onClick={() => setUnitPickerOpen(false)} />
                          <div style={{ position: 'fixed', top: pickerPos.top, left: pickerPos.left, width: pickerPos.width, zIndex: 9999, pointerEvents: 'auto' }}
                            className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 max-h-60 overflow-y-auto"
                          >
                            {(selectedProperty?.units ?? []).map(u => {
                              const isSel = unitId === u.id
                              return (
                                <button key={u.id} type="button"
                                  onClick={() => { setUnitId(u.id); setUnitPickerOpen(false) }}
                                  className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                                    isSel ? 'bg-[#163300]/5 dark:bg-[#9FE870]/10 text-[#163300] dark:text-[#9FE870] font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                  )}
                                >
                                  <Home className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                  <span className="flex-1">{u.unit_number}</span>
                                  {isSel && <Check className="h-3.5 w-3.5 shrink-0" />}
                                </button>
                              )
                            })}
                          </div>
                        </>,
                        document.body
                      )}
                    </div>
                  </div>

                  {/* ── Period selector ── */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Periode *</Label>
                      <div className="inline-flex rounded-full border border-gray-200 dark:border-neutral-700 p-0.5">
                        {(['months', 'custom'] as const).map((mode) => (
                          <button key={mode} type="button"
                            onClick={() => { setPeriodMode(mode); setPeriodStart(''); setPeriodEnd(''); setMonthRangeStart(''); setMonthRangeEnd('') }}
                            className={cn(
                              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                              periodMode === mode
                                ? 'bg-[#163300] text-white dark:bg-[#9FE870] dark:text-[#163300]'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            )}
                          >
                            {mode === 'months' ? 'Maanden' : 'Aangepast'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Month grid */}
                    {periodMode === 'months' && (
                      <div className="rounded-xl border border-gray-200 dark:border-neutral-700 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <button type="button" onClick={() => setYearView(y => y - 1)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{yearView}</span>
                          <button type="button" onClick={() => setYearView(y => y + 1)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5">
                          {MONTH_ABBRS.map((label, i) => {
                            const ym = `${yearView}-${String(i + 1).padStart(2, '0')}`
                            const effectiveEnd = !monthRangeEnd && monthHover && monthRangeStart
                              ? (monthHover >= monthRangeStart ? monthHover : monthRangeStart)
                              : (monthRangeEnd || monthRangeStart)
                            const effectiveStart = !monthRangeEnd && monthHover && monthHover < monthRangeStart
                              ? monthHover : monthRangeStart
                            const inRange = !!monthRangeStart && ym >= effectiveStart && ym <= effectiveEnd
                            const isEdge = ym === effectiveStart || ym === effectiveEnd
                            return (
                              <button key={ym} type="button"
                                onClick={() => handleMonthClick(ym)}
                                onMouseEnter={() => { if (monthRangeStart && !monthRangeEnd) setMonthHover(ym) }}
                                onMouseLeave={() => setMonthHover(null)}
                                className={cn(
                                  'rounded-lg py-2.5 text-sm font-medium transition-colors',
                                  inRange && isEdge
                                    ? 'bg-[#163300] text-white dark:bg-[#9FE870] dark:text-[#163300]'
                                    : inRange
                                      ? 'bg-[#163300]/10 text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                                )}
                              >
                                {label}
                              </button>
                            )
                          })}
                        </div>

                        {monthRangeStart && (
                          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            {monthRangeEnd && monthRangeEnd !== monthRangeStart
                              ? `${format(parseISO(`${monthRangeStart}-01`), 'MMM yyyy', { locale: nl })} — ${format(parseISO(`${monthRangeEnd}-01`), 'MMM yyyy', { locale: nl })}`
                              : format(parseISO(`${monthRangeStart}-01`), 'MMMM yyyy', { locale: nl })
                            }
                          </p>
                        )}
                      </div>
                    )}

                    {/* Custom date range calendar */}
                    {periodMode === 'custom' && (
                      <div className="rounded-xl border border-gray-200 dark:border-neutral-700 p-4 space-y-3">
                        <p className="text-xs text-gray-400">
                          {!periodStart ? 'Klik op een startdatum' : !periodEnd ? 'Klik op een einddatum' : 'Bereik geselecteerd — klik om opnieuw te beginnen'}
                        </p>

                        <div className="flex items-center justify-between">
                          <button type="button" onClick={() => setCalView(d => subMonths(d, 1))}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                            {format(calView, 'MMMM yyyy', { locale: nl })}
                          </span>
                          <button type="button" onClick={() => setCalView(d => addMonths(d, 1))}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7">
                          {WEEKDAYS_NL.map((wd, i) => (
                            <div key={wd} className={cn('text-center text-xs font-semibold py-1', i >= 5 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300')}>
                              {wd}
                            </div>
                          ))}
                          {Array.from({ length: (getDay(startOfMonth(calView)) + 6) % 7 }).map((_, i) => <div key={i} />)}
                          {eachDayOfInterval({ start: startOfMonth(calView), end: endOfMonth(calView) }).map(day => {
                            const startDate = periodStart ? parseISO(periodStart) : null
                            const endDate = periodEnd ? parseISO(periodEnd) : null
                            const isStart = startDate ? isSameDay(day, startDate) : false
                            const isEnd = endDate ? isSameDay(day, endDate) : false
                            const isHoverEnd = !endDate && dayHover && startDate ? isSameDay(day, dayHover) : false
                            let inRange = false
                            if (startDate && endDate) {
                              inRange = !isBefore(day, startDate) && !isAfter(day, endDate)
                            } else if (startDate && dayHover) {
                              const [s, e] = isBefore(dayHover, startDate) ? [dayHover, startDate] : [startDate, dayHover]
                              inRange = !isBefore(day, s) && !isAfter(day, e)
                            }
                            const isSelected = isStart || isEnd || isHoverEnd
                            return (
                              <button key={day.toISOString()} type="button"
                                onClick={() => handleRangeDayClick(day)}
                                onMouseEnter={() => { if (periodStart && !periodEnd) setDayHover(day) }}
                                onMouseLeave={() => setDayHover(null)}
                                className={cn(
                                  'flex items-center justify-center h-8 w-8 mx-auto text-sm transition-colors',
                                  isSelected
                                    ? 'rounded-full bg-[#163300] text-white dark:bg-[#9FE870] dark:text-[#163300] font-semibold'
                                    : inRange
                                      ? 'bg-[#163300]/10 text-[#163300] dark:bg-[#9FE870]/15 dark:text-[#9FE870]'
                                      : 'rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800'
                                )}
                              >
                                {format(day, 'd')}
                              </button>
                            )
                          })}
                        </div>

                        {(periodStart || periodEnd) && (
                          <div className="flex items-center gap-2 text-xs pt-2 border-t border-gray-100 dark:border-neutral-800">
                            <span className="text-gray-400">Van:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{periodStart ? format(parseISO(periodStart), 'd MMM yyyy', { locale: nl }) : '—'}</span>
                            <span className="text-gray-300 dark:text-neutral-600 mx-0.5">→</span>
                            <span className="text-gray-400">Tot:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{periodEnd ? format(parseISO(periodEnd), 'd MMM yyyy', { locale: nl }) : '—'}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              loadingCosts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <OverzichtTable
                  incomeRows={incomeRows}
                  expenseRows={expenseRows}
                  editable
                  onToggle={toggleExpense}
                  onUpdateExpense={updateExpense}
                  onRemoveExpense={removeExpense}
                  onAddExpense={addInlineExpense}
                />
              )
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Huurder</span>
                    <span className="font-medium text-gray-900 dark:text-white">{tenantName ?? '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Eenheid</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedProperty?.name}, {selectedUnit?.unit_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Periode</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {fmtDate(periodStart)} — {fmtDate(periodEnd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">Maanden</span>
                    <span className="font-medium text-gray-900 dark:text-white">{monthsInPeriod.length}</span>
                  </div>
                </div>

                <OverzichtTable
                  incomeRows={incomeRows}
                  expenseRows={selectedExpenses}
                  editable={false}
                />

                <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Servicekosten afrekening</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Totaal ontvangen (werkelijk)</span>
                    <span className="text-right font-medium text-green-600 dark:text-green-400">{fmt(totalIncome)}</span>
                    <span className="text-gray-500 dark:text-gray-400">Totaal uitgaven</span>
                    <span className="text-right font-medium text-red-600 dark:text-red-400">{fmt(-totalExpenses)}</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-neutral-800 pt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Totaal voorschot betaald</span>
                    <span className="text-right font-medium text-gray-900 dark:text-white">{fmt(expectedVoorschotForPeriod)}</span>
                    <span className="text-gray-500 dark:text-gray-400">Werkelijke kosten</span>
                    <span className="text-right font-medium text-gray-900 dark:text-white">{fmt(totalExpenses)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-neutral-700 pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Saldo servicekosten</span>
                    <span className={cn(
                      'text-lg font-bold',
                      servicekostenSaldo > 0.01 ? 'text-green-600 dark:text-green-400'
                        : servicekostenSaldo < -0.01 ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500'
                    )}>
                      {fmt(servicekostenSaldo)}
                    </span>
                  </div>
                  <p className={cn(
                    'text-xs',
                    servicekostenSaldo > 0.01 ? 'text-green-600 dark:text-green-400'
                      : servicekostenSaldo < -0.01 ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500'
                  )}>
                    {servicekostenSaldo > 0.01
                      ? `Terug te betalen aan huurder: ${fmt(servicekostenSaldo)}`
                      : servicekostenSaldo < -0.01
                        ? `Bij te betalen door huurder: ${fmt(Math.abs(servicekostenSaldo))}`
                        : 'Geen verschil'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Notities (optioneel)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Eventuele opmerkingen bij deze afrekening..."
                    rows={3}
                  />
                </div>
              </div>
            )}

          </div>

          <div className={ADD_DIALOG_FOOTER_SPLIT_CLASS}>
            {step === 1 ? (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                Annuleren
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                ← Vorige
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                disabled={!step1Valid}
                onClick={goToStep2}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
              >
                Volgende →
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] px-4 py-2 text-sm font-semibold transition-colors"
              >
                Volgende →
              </button>
            )}
            {step === 3 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => save('concept')} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Opslaan als concept
                </Button>
                <Button
                  onClick={() => setConfirmOpen(true)}
                  disabled={saving}
                  className="bg-[#163300] hover:bg-[#356258]"
                >
                  Publiceren
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Afrekening publiceren</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze afrekening wilt publiceren? Na publicatie kan de inhoud niet meer worden gewijzigd.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => save('definitief')}
              disabled={saving}
              className="bg-[#163300] hover:bg-[#356258]"
            >
              {saving ? 'Bezig...' : 'Publiceren'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
