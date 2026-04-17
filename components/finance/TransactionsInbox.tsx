'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DashboardTableHead, DashboardTableCell } from '@/components/dashboard/dashboard-table'
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Euro,
  Plus,
  Loader2,
} from 'lucide-react'
import { DashboardTableBlock } from '@/components/dashboard/dashboard-table-block'
import { AssignDrawer } from './AssignDrawer'
import { cn } from '@/lib/utils'
import {
  dashboardCardClass,
  DASHBOARD_TABLE_TOOLBAR_HEADER_DASHBOARD_CLASS,
  DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS,
} from '@/app/dashboard/employer/dashboard-ui'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type BankConnectionIdRow = Pick<
  Database['public']['Tables']['bank_connections']['Row'],
  'id'
>
type RawTransactionInsert = Database['public']['Tables']['raw_transactions']['Insert']

export interface TransactionRow {
  id: string
  value_date: string | null
  amount: number
  currency: string
  sender_name: string | null
  sender_iban: string | null
  description: string | null
  is_manual_transaction?: boolean
  assignment: {
    id: string
    confidence_score: number
    match_method: string
    is_manual: boolean
    property_id: string | null
    unit_id: string | null
    tenant_id: string | null
    lease_id: string | null
    category: string | null
    tenant_name: string | null
    property_name: string | null
    property_address: string | null
  } | null
}

export interface PropertyHierarchy {
  id: string
  name: string
  address: string
  city: string
  units: {
    id: string
    unit_number: string
    leases: {
      id: string
      tenant_id: string | null
      tenant_name: string | null
      monthly_rent: number
      status: string
    }[]
  }[]
}

type Filter = 'all' | 'matched' | 'unmatched'
type SortColumn = 'date' | 'amount' | 'sender' | 'status'

const METHOD_LABELS: Record<string, string> = {
  iban: 'IBAN',
  reference: 'Referentie',
  amount_date: 'Bedrag+datum',
  historical: 'Historisch',
  manual: 'Handmatig',
}

const CATEGORY_LABELS: Record<string, string> = {
  huur: 'Huur',
  onderhoud: 'Onderhoud',
  verzekering: 'Verzekering',
  belasting: 'Belasting',
  energie: 'Energie',
  vve: 'VvE',
  hypotheek: 'Hypotheek',
  beheer: 'Beheer',
  prive: 'Privé',
  overig: 'Overig',
}

interface TransactionsInboxProps {
  transactions: TransactionRow[]
  properties: PropertyHierarchy[]
  onRefresh?: () => void
}

function todayISODate() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function ensureManualBankConnection(ownerId: string): Promise<string> {
  const { data: existing, error: selErr } = await supabase
    .from('bank_connections')
    .select('id')
    .eq('owner_id', ownerId)
    .eq('provider', 'manual')
    .maybeSingle()

  if (selErr) throw selErr
  const existingRow = existing as BankConnectionIdRow | null
  if (existingRow?.id) return existingRow.id

  const insertPayload: Database['public']['Tables']['bank_connections']['Insert'] = {
    owner_id: ownerId,
    provider: 'manual',
    access_token: '',
    refresh_token: null,
  }

  const { data: inserted, error: insErr } = await supabase
    .from('bank_connections')
    .insert(insertPayload as never)
    .select('id')
    .single()

  if (insErr) throw insErr
  const insertedRow = inserted as BankConnectionIdRow | null
  if (!insertedRow?.id) throw new Error('Kon handmatige bankkoppeling niet aanmaken')
  return insertedRow.id
}

export function TransactionsInbox({
  transactions,
  properties,
  onRefresh,
}: TransactionsInboxProps) {
  const { user, isDemo } = useDashboardUser()
  const [filter, setFilter] = useState<Filter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [drawerTx, setDrawerTx] = useState<TransactionRow | null>(null)
  const [sort, setSort] = useState<{ column: SortColumn | null; direction: 'asc' | 'desc' | null }>({
    column: null,
    direction: null,
  })

  const [addOpen, setAddOpen] = useState(false)
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [addError, setAddError] = useState('')
  const [addForm, setAddForm] = useState({
    value_date: todayISODate(),
    amount: '',
    sender_name: '',
    sender_iban: '',
    description: '',
  })

  const resetAddForm = useCallback(() => {
    setAddForm({
      value_date: todayISODate(),
      amount: '',
      sender_name: '',
      sender_iban: '',
      description: '',
    })
    setAddError('')
  }, [])

  const handleAddPayment = async () => {
    if (isDemo || !user?.id) return
    setAddError('')
    const raw = String(addForm.amount).replace(',', '.').trim()
    const amountNum = Number(raw)
    if (!Number.isFinite(amountNum) || amountNum === 0) {
      setAddError('Vul een geldig bedrag in (niet nul).')
      return
    }
    setAddSubmitting(true)
    try {
      const connId = await ensureManualBankConnection(user.id)
      const externalId = `manual-${crypto.randomUUID()}`
      const row: RawTransactionInsert = {
        owner_id: user.id,
        bank_connection_id: connId,
        external_id: externalId,
        value_date: addForm.value_date || null,
        amount: amountNum,
        currency: 'EUR',
        sender_name: addForm.sender_name.trim() || null,
        sender_iban: addForm.sender_iban.trim() || null,
        description: addForm.description.trim() || null,
      }
      const { error } = await supabase.from('raw_transactions').insert(row as never)
      if (error) throw error
      setAddOpen(false)
      resetAddForm()
      onRefresh?.()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Opslaan mislukt.'
      setAddError(msg)
    } finally {
      setAddSubmitting(false)
    }
  }

  // Sliding underline refs
  const tabsContainerRef = useRef<HTMLDivElement | null>(null)
  const allRef = useRef<HTMLButtonElement | null>(null)
  const matchedRef = useRef<HTMLButtonElement | null>(null)
  const unmatchedRef = useRef<HTMLButtonElement | null>(null)
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 })

  const matched = transactions.filter((tx) => tx.assignment)
  const unmatched = transactions.filter((tx) => !tx.assignment)

  const tabs: { key: Filter; label: string; count: number; ref: React.RefObject<HTMLButtonElement | null> }[] = [
    { key: 'all', label: 'Alle', count: transactions.length, ref: allRef },
    { key: 'matched', label: 'Gekoppeld', count: matched.length, ref: matchedRef },
    { key: 'unmatched', label: 'Niet gekoppeld', count: unmatched.length, ref: unmatchedRef },
  ]

  // Onderstreepje: alleen breedte van label + badge (geen flex-1-stretch)
  useEffect(() => {
    const updateIndicator = () => {
      const container = tabsContainerRef.current
      const btn = tabs.find((t) => t.key === filter)?.ref.current
      if (!container || !btn) return

      const containerRect = container.getBoundingClientRect()
      const btnRect = btn.getBoundingClientRect()
      setIndicator({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      })
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateIndicator) : null
    if (ro && tabsContainerRef.current) ro.observe(tabsContainerRef.current)

    return () => {
      window.removeEventListener('resize', updateIndicator)
      ro?.disconnect()
    }
  }, [filter, transactions.length])

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)

  const formatDate = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Filter by tab
  const tabFiltered =
    filter === 'matched'
      ? matched
      : filter === 'unmatched'
        ? unmatched
        : transactions

  // Filter by search
  const searchFiltered = tabFiltered.filter((tx) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    // Normalize amount query: strip €, dots (thousand sep), replace comma with dot
    const amountStr = formatAmount(tx.amount).toLowerCase()
    const rawAmount = String(tx.amount)
    const dateStr = formatDate(tx.value_date).toLowerCase()

    // Status / category label
    let statusLabel = 'niet toegewezen'
    if (tx.assignment) {
      if (tx.assignment.category && tx.assignment.category !== 'huur') {
        statusLabel = (CATEGORY_LABELS[tx.assignment.category] || tx.assignment.category).toLowerCase()
      } else {
        statusLabel = tx.assignment.is_manual
          ? 'handmatig'
          : (METHOD_LABELS[tx.assignment.match_method] || tx.assignment.match_method).toLowerCase()
      }
    }

    return (
      (tx.sender_name ?? '').toLowerCase().includes(q) ||
      (tx.sender_iban ?? '').toLowerCase().includes(q) ||
      (tx.description ?? '').toLowerCase().includes(q) ||
      amountStr.includes(q) ||
      rawAmount.includes(q) ||
      dateStr.includes(q) ||
      statusLabel.includes(q) ||
      (tx.assignment?.tenant_name ?? '').toLowerCase().includes(q) ||
      (tx.assignment?.property_name ?? '').toLowerCase().includes(q) ||
      (tx.assignment?.property_address ?? '').toLowerCase().includes(q)
    )
  })

  // Sort
  const toggleSort = (column: SortColumn) => {
    setSort((prev) => {
      if (prev.column !== column || prev.direction === null) return { column, direction: 'asc' }
      if (prev.direction === 'asc') return { column, direction: 'desc' }
      return { column: null, direction: null }
    })
  }

  const getSortIcon = (column: SortColumn) => {
    if (sort.column !== column || !sort.direction) {
      return <ChevronsUpDown className="h-3 w-3 text-gray-400" />
    }
    if (sort.direction === 'asc') {
      return <ChevronUp className="h-3 w-3 text-[#163300] dark:text-[#9FE870]" />
    }
    return <ChevronDown className="h-3 w-3 text-[#163300] dark:text-[#9FE870]" />
  }

  const sortedTransactions = [...searchFiltered]
  if (sort.column && sort.direction) {
    sortedTransactions.sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1
      switch (sort.column) {
        case 'date':
          return dir * ((a.value_date ?? '').localeCompare(b.value_date ?? ''))
        case 'amount':
          return dir * (a.amount - b.amount)
        case 'sender':
          return dir * ((a.sender_name ?? '').localeCompare(b.sender_name ?? '', 'nl'))
        case 'status': {
          const statusA = a.assignment ? 1 : 0
          const statusB = b.assignment ? 1 : 0
          return dir * (statusA - statusB)
        }
        default:
          return 0
      }
    })
  }

  const transactionsToolbar = (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          {/* Segment tabs with sliding underline */}
          <div
            ref={tabsContainerRef}
            className="relative flex flex-wrap items-end gap-x-6 gap-y-1 w-full sm:w-auto text-sm border-b border-gray-200 dark:border-neutral-700"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                ref={tab.ref}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'inline-flex items-center justify-center gap-0 pb-2 shrink-0 whitespace-nowrap transition-colors duration-200 font-semibold',
                  filter === tab.key
                    ? 'text-[#163300] dark:text-[#9FE870]'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <span>{tab.label}</span>
                <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300]/25 text-[11px] font-medium text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]">
                  {tab.count}
                </span>
              </button>
            ))}
            <div
              className="absolute bottom-0 h-[2px] rounded-full bg-[#163300] dark:bg-[#9FE870] transition-all duration-200"
              style={{ left: indicator.left, width: indicator.width }}
            />
          </div>

          {/* Betaling toevoegen + zoeken */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 w-full sm:w-auto justify-end min-w-0">
            <div className="relative flex-1 sm:flex-initial sm:min-w-[140px] sm:max-w-[260px] flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3">
              <Search className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
              <Input
                placeholder="Zoek op bedrag, huurder, pand, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-2 text-sm min-w-0 flex-1 bg-transparent py-0"
              />
            </div>
            <Button
              type="button"
              onClick={() => {
                resetAddForm()
                setAddOpen(true)
              }}
              disabled={isDemo || !user?.id}
              title={isDemo ? 'Niet beschikbaar in demo' : !user?.id ? 'Niet ingelogd' : undefined}
              className="shrink-0 h-9 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] font-medium px-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Betaling toevoegen
            </Button>
          </div>
        </div>
  )

  return (
    <Card className={cn(dashboardCardClass(), 'overflow-hidden')}>
      <CardHeader className={DASHBOARD_TABLE_TOOLBAR_HEADER_DASHBOARD_CLASS}>
        {transactionsToolbar}
      </CardHeader>
      <CardContent className={cn('p-0 px-0 pb-0', DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS)}>
        <DashboardTableBlock empty={sortedTransactions.length === 0}>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <DashboardTableHead>
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('date')}>
                    <span>Datum</span>
                    {getSortIcon('date')}
                  </button>
                </DashboardTableHead>
                <DashboardTableHead>
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('amount')}>
                    <span>Bedrag</span>
                    {getSortIcon('amount')}
                  </button>
                </DashboardTableHead>
                <DashboardTableHead>
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('sender')}>
                    <span>Afzender</span>
                    {getSortIcon('sender')}
                  </button>
                </DashboardTableHead>
                <DashboardTableHead className="hidden lg:table-cell">
                  IBAN
                </DashboardTableHead>
                <DashboardTableHead className="hidden md:table-cell">
                  Omschrijving
                </DashboardTableHead>
                <DashboardTableHead>
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('status')}>
                    <span>Status</span>
                    {getSortIcon('status')}
                  </button>
                </DashboardTableHead>
                <DashboardTableHead className="w-px p-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <DashboardTableCell className="whitespace-nowrap text-gray-900 dark:text-white">
                    {formatDate(tx.value_date)}
                  </DashboardTableCell>
                  <DashboardTableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Euro className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {formatAmount(tx.amount)}
                      </span>
                    </div>
                  </DashboardTableCell>
                  <DashboardTableCell className="max-w-[160px]">
                    <span className="text-sm text-gray-900 dark:text-white truncate block">
                      {tx.sender_name || '—'}
                    </span>
                  </DashboardTableCell>
                  <DashboardTableCell className="hidden lg:table-cell">
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                      {tx.sender_iban || '—'}
                    </span>
                  </DashboardTableCell>
                  <DashboardTableCell className="hidden md:table-cell max-w-[200px]">
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate block">
                      {tx.description || '—'}
                    </span>
                  </DashboardTableCell>
                  <DashboardTableCell>
                    {tx.assignment ? (
                      tx.assignment.category && tx.assignment.category !== 'huur' ? (
                        <Badge
                          style={{ backgroundColor: '#E2E8F0', color: '#334155' }}
                        >
                          {CATEGORY_LABELS[tx.assignment.category] || tx.assignment.category}
                        </Badge>
                      ) : (
                        <Badge
                          style={{ backgroundColor: '#2F5711', color: '#FFFFFF' }}
                        >
                          {tx.assignment.is_manual
                            ? 'Handmatig'
                            : `${tx.assignment.confidence_score}% — ${METHOD_LABELS[tx.assignment.match_method] || tx.assignment.match_method}`}
                        </Badge>
                      )
                    ) : (
                      <Badge
                        style={{ backgroundColor: '#EDC843', color: '#2F5711' }}
                      >
                        Niet toegewezen
                      </Badge>
                    )}
                  </DashboardTableCell>
                  <DashboardTableCell className="w-px text-right pr-6">
                    {tx.assignment ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDrawerTx(tx)}
                        className="rounded-full text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Wijzigen
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDrawerTx(tx)}
                        className="rounded-full text-sm font-medium"
                      >
                        Toewijzen
                      </Button>
                    )}
                  </DashboardTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashboardTableBlock>
      </CardContent>

      {/* Assign drawer */}
      <AssignDrawer
        transaction={drawerTx}
        properties={properties}
        open={!!drawerTx}
        onClose={() => setDrawerTx(null)}
        onAssigned={() => onRefresh?.()}
        existingAssignment={drawerTx?.assignment ? {
          property_id: drawerTx.assignment.property_id ?? null,
          unit_id: drawerTx.assignment.unit_id ?? null,
          tenant_id: drawerTx.assignment.tenant_id ?? null,
          lease_id: drawerTx.assignment.lease_id ?? null,
          category: drawerTx.assignment.category ?? null,
        } : undefined}
      />

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) resetAddForm()
        }}
      >
        <DialogContent className="border border-gray-200 dark:border-neutral-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#163300] dark:text-[#9FE870]">Betaling toevoegen</DialogTitle>
            <DialogDescription>
              Handmatige inkomende betaling registreren. Daarna kun je hem koppelen aan een pand of huurder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="add-pay-date">Datum</Label>
              <Input
                id="add-pay-date"
                type="date"
                value={addForm.value_date}
                onChange={(e) => setAddForm((f) => ({ ...f, value_date: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-pay-amount">Bedrag (EUR) *</Label>
              <Input
                id="add-pay-amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="Bijv. 1250,50"
                value={addForm.amount}
                onChange={(e) => setAddForm((f) => ({ ...f, amount: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-pay-sender">Naam afzender</Label>
              <Input
                id="add-pay-sender"
                placeholder="Optioneel"
                value={addForm.sender_name}
                onChange={(e) => setAddForm((f) => ({ ...f, sender_name: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-pay-iban">IBAN</Label>
              <Input
                id="add-pay-iban"
                placeholder="Optioneel"
                value={addForm.sender_iban}
                onChange={(e) => setAddForm((f) => ({ ...f, sender_iban: e.target.value }))}
                className="rounded-xl font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-pay-desc">Omschrijving</Label>
              <Input
                id="add-pay-desc"
                placeholder="Optioneel"
                value={addForm.description}
                onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            {addError ? <p className="text-sm text-red-600 dark:text-red-400">{addError}</p> : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setAddOpen(false)}
              disabled={addSubmitting}
            >
              Annuleren
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F]"
              onClick={handleAddPayment}
              disabled={addSubmitting}
            >
              {addSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opslaan…
                </>
              ) : (
                'Opslaan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
