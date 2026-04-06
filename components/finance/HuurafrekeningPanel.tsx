'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ArrowLeft,
  Plus,
  Check,
  Loader2,
  Trash2,
  ChevronRight,
  Ban,
  Send,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { WiseDatePicker } from '@/components/ui/wise-date-picker'
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-neutral-700 text-left">
            {editable && <th className="px-3 py-2.5 w-8"></th>}
            <th className="px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400">Omschrijving</th>
            <th className="px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400 text-right">Inkomen</th>
            <th className="px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400 text-right">Uitgaven</th>
            <th className="px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400 text-right">BTW</th>
            <th className="px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400 text-right">Totaal</th>
            {editable && <th className="px-3 py-2.5 w-8"></th>}
          </tr>
        </thead>
        <tbody>
          {/* ── Income section ── */}
          {incomeRows.map((r) => (
            <tr key={r.id} className="border-b border-gray-50 dark:border-neutral-800/50">
              {editable && <td className="px-3 py-2"></td>}
              <td className="px-3 py-2 text-gray-900 dark:text-white">{r.description}</td>
              <td className="px-3 py-2 text-right text-green-600 dark:text-green-400 font-medium">
                {r.income > 0 ? fmt(r.income) : '—'}
              </td>
              <td className="px-3 py-2 text-right text-gray-400">—</td>
              <td className="px-3 py-2 text-right text-gray-400">—</td>
              <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{fmt(r.total)}</td>
              {editable && <td className="px-3 py-2"></td>}
            </tr>
          ))}

          {/* ── Divider ── */}
          {incomeRows.length > 0 && expenseRows.length > 0 && (
            <tr>
              <td colSpan={editable ? 7 : 6} className="py-1">
                <div className="border-t border-gray-200 dark:border-neutral-700" />
              </td>
            </tr>
          )}

          {/* ── Expense section ── */}
          {expenseRows.map((r) => (
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
                    className="h-8 text-xs"
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
                    className="h-8 text-xs w-28 text-right"
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
          ))}

          {/* ── Add cost (editable only) ── */}
          {editable && onAddExpense && (
            <tr>
              <td colSpan={7} className="px-3 py-2">
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

export function HuurafrekeningPanel() {
  const [view, setView] = useState<'list' | 'wizard' | 'detail'>('list')
  const [editId, setEditId] = useState<string | null>(null)
  const [detailSettlement, setDetailSettlement] = useState<Settlement | null>(null)
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)

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

  const openNew = () => {
    setEditId(null)
    setView('wizard')
  }

  const openSettlement = (s: Settlement) => {
    if (s.status === 'concept') {
      setEditId(s.id)
      setView('wizard')
    } else {
      setDetailSettlement(s)
      setView('detail')
    }
  }

  const closeView = () => {
    setView('list')
    setEditId(null)
    setDetailSettlement(null)
    fetchSettlements()
  }

  if (view === 'wizard') {
    return <SettlementWizard settlementId={editId} onClose={closeView} />
  }

  if (view === 'detail' && detailSettlement) {
    return (
      <SettlementDetail
        settlement={detailSettlement}
        onClose={closeView}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Huurafrekeningen</h2>
        <Button onClick={openNew} className="bg-[#163300] hover:bg-[#356258]">
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe afrekening
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : settlements.length === 0 ? (
        <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nog geen afrekeningen aangemaakt.
            </p>
            <Button onClick={openNew} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Maak je eerste afrekening
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800 overflow-hidden')}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-neutral-800 text-left">
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Pand</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Eenheid</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Huurder</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Periode</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Voorschot</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Werkelijk</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Saldo</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => {
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
                    <tr
                      key={s.id}
                      className={`border-b border-gray-50 dark:border-neutral-800/50 hover:bg-gray-50 dark:hover:bg-neutral-800/30 cursor-pointer transition-colors ${
                        isVoided ? 'opacity-50' : ''
                      }`}
                      onClick={() => openSettlement(s)}
                    >
                      <td className={`px-4 py-3 ${isVoided ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                        {s.properties?.name ?? '—'}
                      </td>
                      <td className={`px-4 py-3 ${isVoided ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {s.units?.unit_number ?? '—'}
                      </td>
                      <td className={`px-4 py-3 ${isVoided ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {s.tenants?.full_name ?? '—'}
                      </td>
                      <td className={`px-4 py-3 ${isVoided ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {fmtDate(s.period_start)} — {fmtDate(s.period_end)}
                      </td>
                      <td className={`px-4 py-3 text-right ${isVoided ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {fmt(s.total_voorschot)}
                      </td>
                      <td className={`px-4 py-3 text-right ${isVoided ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {fmt(s.total_actual_costs)}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${balanceColor}`}>{fmt(s.balance)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.classes}`}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

// ── Read-only detail view (for published / sent / voided settlements) ────────

interface DetailProps {
  settlement: Settlement
  onClose: () => void
}

function SettlementDetail({ settlement, onClose }: DetailProps) {
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
    <div className={`space-y-6 ${isVoided ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#163300] dark:hover:text-[#9FE870]"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Huurafrekening
          </h2>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Voided banner */}
      {isVoided && (
        <div className="rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10 px-4 py-3 flex items-center gap-3">
          <Ban className="h-4 w-4 text-red-500 shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-red-700 dark:text-red-400">
              Deze afrekening is nietig verklaard
            </span>
            {settlement.voided_at && (
              <span className="text-red-600/70 dark:text-red-400/70 ml-1">
                op {fmtDateTime(settlement.voided_at)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Info header */}
      <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
          <div className="border-t border-gray-100 dark:border-neutral-800 pt-3 flex flex-wrap gap-x-8 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            {settlement.published_at && (
              <span>Gepubliceerd: {fmtDateTime(settlement.published_at)}</span>
            )}
            {settlement.sent_at && (
              <span>Verzonden: {fmtDateTime(settlement.sent_at)}</span>
            )}
            {settlement.voided_at && (
              <span className="text-red-500 dark:text-red-400">Nietig verklaard: {fmtDateTime(settlement.voided_at)}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Read-only unified table */}
      <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
        <CardContent className="pt-6">
          <OverzichtTable
            incomeRows={incomeRows.map((r) => ({ ...r, selected: true }))}
            expenseRows={expenseRows.map((r) => ({ ...r, selected: true }))}
            editable={false}
          />
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
        <CardContent className="pt-6 space-y-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Servicekosten afrekening</h3>
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
          <div className="border-t border-gray-200 dark:border-neutral-700 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Saldo servicekosten</span>
              <span
                className={`text-lg font-bold ${
                  settlement.balance > 0.01
                    ? 'text-green-600 dark:text-green-400'
                    : settlement.balance < -0.01
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500'
                }`}
              >
                {fmt(settlement.balance)}
              </span>
            </div>
            <p
              className={`text-xs mt-1 ${
                settlement.balance > 0.01
                  ? 'text-green-600 dark:text-green-400'
                  : settlement.balance < -0.01
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500'
              }`}
            >
              {settlement.balance > 0.01
                ? `Terug te betalen aan huurder: ${fmt(settlement.balance)}`
                : settlement.balance < -0.01
                  ? `Bij te betalen door huurder: ${fmt(Math.abs(settlement.balance))}`
                  : 'Geen verschil'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notes (read-only) */}
      {settlement.notes && (
        <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
          <CardContent className="pt-6 space-y-2">
            <Label>Notities</Label>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{settlement.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!isVoided && (
        <div className="flex items-center justify-between">
          <div />
          <div className="flex gap-3">
            <Button
              variant="outline"
              disabled
              className="gap-2"
              title="Binnenkort beschikbaar"
            >
              <Send className="h-4 w-4" />
              Versturen
            </Button>
            {canVoid && (
              <Button
                variant="outline"
                onClick={() => setVoidOpen(true)}
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <Ban className="h-4 w-4" />
                Nietig verklaren
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Void confirmation */}
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
    </div>
  )
}

// ── Wizard (concept settlements only) ────────────────────────────────────────

interface WizardProps {
  settlementId: string | null
  onClose: () => void
}

function SettlementWizard({ settlementId, onClose }: WizardProps) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

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
  const monthlyRent = activeLease?.monthly_rent ?? 0
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

  const expectedRentForPeriod = (monthlyRent + voorschotPerMonth) * monthsInPeriod.length
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
      if (tenantId) qs.set('tenant_id', tenantId)
      if (unitId) qs.set('unit_id', unitId)
      const res = await fetch(`/api/finance/settlements/_/costs?${qs}`)
      if (res.ok) {
        const data: {
          income: { id: string; source: string; date: string; description: string; sender_name: string; amount: number }[]
          expenses: { id: string; source: string; date: string; description: string; category: string; amount: number }[]
        } = await res.json()

        setIncomeRows(
          data.income.map((p) => {
            const label = p.sender_name
              ? `Betaling ${fmtDate(p.date)} — ${p.sender_name}`
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#163300] dark:hover:text-[#9FE870]"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {settlementId ? 'Afrekening bewerken' : 'Nieuwe afrekening'}
        </h2>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (s < step) setStep(s)
                if (s === 2 && step === 1 && step1Valid) goToStep2()
              }}
              className={`h-8 w-8 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
                s === step
                  ? 'bg-[#163300] text-white'
                  : s < step
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-neutral-800'
              }`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </button>
            {s < 3 && (
              <div className={`w-12 h-0.5 ${s < step ? 'bg-green-300 dark:bg-green-700' : 'bg-gray-200 dark:bg-neutral-700'}`} />
            )}
          </div>
        ))}
        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
          {step === 1 ? 'Eenheid & periode' : step === 2 ? 'Overzicht' : 'Samenvatting'}
        </span>
      </div>

      {/* Step 1 — Unit & period */}
      {step === 1 && (
        <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
          <CardContent className="pt-6 space-y-5">
            {loadingProps ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pand *</Label>
                    <Select value={propertyId} onValueChange={setPropertyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer pand" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Eenheid *</Label>
                    <Select value={unitId} onValueChange={setUnitId} disabled={!propertyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer eenheid" />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectedProperty?.units ?? []).map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.unit_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {activeLease && (
                  <div className="rounded-lg bg-gray-50 dark:bg-neutral-800/50 p-3 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">Huurder:</span>{' '}
                    {tenantName ?? '—'}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Startdatum periode *</Label>
                    <WiseDatePicker
                      value={periodStart}
                      onChange={setPeriodStart}
                      placeholder="Kies startdatum"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Einddatum periode *</Label>
                    <WiseDatePicker
                      value={periodEnd}
                      onChange={setPeriodEnd}
                      placeholder="Kies einddatum"
                    />
                  </div>
                </div>

                {unitId && periodStart && periodEnd && (
                  <div className="rounded-lg border border-gray-100 dark:border-neutral-800 p-4 space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Kale huur per maand:{' '}
                      <span className="font-medium text-gray-900 dark:text-white">{fmt(monthlyRent)}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Voorschot servicekosten per maand:{' '}
                      <span className="font-medium text-gray-900 dark:text-white">{fmt(voorschotPerMonth)}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Totaal voorschot voor deze periode ({monthsInPeriod.length} maanden):{' '}
                      <span className="font-medium text-gray-900 dark:text-white">{fmt(expectedVoorschotForPeriod)}</span>
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={goToStep2}
                    disabled={!step1Valid}
                    className="bg-[#163300] hover:bg-[#356258]"
                  >
                    Volgende
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Overzicht (unified income + expense table) */}
      {step === 2 && (
        <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
          <CardContent className="pt-6 space-y-4">
            {loadingCosts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <OverzichtTable
                  incomeRows={incomeRows}
                  expenseRows={expenseRows}
                  editable
                  onToggle={toggleExpense}
                  onUpdateExpense={updateExpense}
                  onRemoveExpense={removeExpense}
                  onAddExpense={addInlineExpense}
                />

                <div className="flex items-center justify-end border-t border-gray-100 dark:border-neutral-800 pt-4">
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Vorige
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="bg-[#163300] hover:bg-[#356258]"
                    >
                      Volgende
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Review & confirm */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Info header */}
          <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
            <CardContent className="pt-6 space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                  <span className="text-gray-500 dark:text-gray-400 block">Aantal maanden</span>
                  <span className="font-medium text-gray-900 dark:text-white">{monthsInPeriod.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Read-only unified table */}
          <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
            <CardContent className="pt-6">
              <OverzichtTable
                incomeRows={incomeRows}
                expenseRows={selectedExpenses}
                editable={false}
              />
            </CardContent>
          </Card>

          {/* Servicekosten saldo summary */}
          <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
            <CardContent className="pt-6 space-y-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Servicekosten afrekening</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Totaal ontvangen (werkelijk)</span>
                <span className="text-right font-medium text-green-600 dark:text-green-400">{fmt(totalIncome)}</span>
                <span className="text-gray-500 dark:text-gray-400">Totaal uitgaven</span>
                <span className="text-right font-medium text-red-600 dark:text-red-400">{fmt(-totalExpenses)}</span>
                <span className="text-gray-400 dark:text-gray-500 italic">Verwachte huur voor deze periode</span>
                <span className="text-right text-gray-400 dark:text-gray-500 italic">{fmt(expectedRentForPeriod)}</span>
              </div>
              <div className="border-t border-gray-100 dark:border-neutral-800 pt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Totaal voorschot betaald</span>
                <span className="text-right font-medium text-gray-900 dark:text-white">{fmt(expectedVoorschotForPeriod)}</span>
                <span className="text-gray-500 dark:text-gray-400">Werkelijke kosten</span>
                <span className="text-right font-medium text-gray-900 dark:text-white">{fmt(totalExpenses)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-neutral-700 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Saldo servicekosten</span>
                  <span
                    className={`text-lg font-bold ${
                      servicekostenSaldo > 0.01
                        ? 'text-green-600 dark:text-green-400'
                        : servicekostenSaldo < -0.01
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500'
                    }`}
                  >
                    {fmt(servicekostenSaldo)}
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    servicekostenSaldo > 0.01
                      ? 'text-green-600 dark:text-green-400'
                      : servicekostenSaldo < -0.01
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500'
                  }`}
                >
                  {servicekostenSaldo > 0.01
                    ? `Terug te betalen aan huurder: ${fmt(servicekostenSaldo)}`
                    : servicekostenSaldo < -0.01
                      ? `Bij te betalen door huurder: ${fmt(Math.abs(servicekostenSaldo))}`
                      : 'Geen verschil'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className={dashboardCardClass('border border-gray-100 dark:border-neutral-800')}>
            <CardContent className="pt-6 space-y-2">
              <Label>Notities (optioneel)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Eventuele opmerkingen bij deze afrekening..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Vorige
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => save('concept')}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
          </div>

          {/* Confirmation dialog */}
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
        </div>
      )}
    </div>
  )
}
