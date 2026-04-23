'use client'

import { useState, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import {
  Search,
  Building2,
  Home,
  User,
  Check,
  Loader2,
  Wrench,
  Shield,
  Landmark,
  Zap,
  Building,
  Briefcase,
  UserX,
  MoreHorizontal,
  Pencil,
  ChevronsUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import type { TransactionRow, PropertyHierarchy } from './TransactionsInbox'
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
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import {
  dashboardCardClass,
  DASHBOARD_TABLE_HEAD_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS,
} from '@/app/dashboard/employer/dashboard-ui'

const tile = 'bg-gray-50 dark:bg-neutral-800/60 rounded-2xl px-4 py-3'
const fieldLabel = 'text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5'
const inputCls =
  'w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0'

// ─── Constants ────────────────────────────────────────────────────────

type Filter = 'all' | 'inkomsten' | 'kosten' | 'unmatched'
type RightPanelMode = 'empty' | 'detail'

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


const EXPENSE_CATEGORIES_SET = new Set(['onderhoud', 'verzekering', 'belasting', 'energie', 'vve', 'hypotheek', 'beheer'])

const CATEGORIES = [
  { key: 'onderhoud', label: 'Onderhoud', icon: Wrench },
  { key: 'verzekering', label: 'Verzekering', icon: Shield },
  { key: 'belasting', label: 'Belasting', icon: Landmark },
  { key: 'energie', label: 'Energie', icon: Zap },
  { key: 'vve', label: 'VvE', icon: Building },
  { key: 'hypotheek', label: 'Hypotheek', icon: Home },
  { key: 'beheer', label: 'Beheer', icon: Briefcase },
  { key: 'prive', label: 'Privé', icon: UserX },
  { key: 'overig', label: 'Overig', icon: MoreHorizontal },
] as const

// ─── Helpers ──────────────────────────────────────────────────────────

const formatEur = (amount: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)

const formatDate = (date: string | null) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Helpers ──────────────────────────────────────────────────────────

function todayISODate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function ensureManualBankConnection(ownerId: string): Promise<string> {
  const { data: existingRaw } = await supabase
    .from('bank_connections')
    .select('id')
    .eq('owner_id', ownerId)
    .eq('provider', 'manual')
    .maybeSingle()
  const existing = existingRaw as { id: string } | null
  if (existing?.id) return existing.id

  const { data: inserted, error } = await supabase
    .from('bank_connections')
    .insert({ owner_id: ownerId, provider: 'manual', access_token: '', refresh_token: null } as never)
    .select('id')
    .single()
  if (error) throw error
  const insertedRow = inserted as { id: string } | null
  if (!insertedRow?.id) throw new Error('Kon handmatige bankkoppeling niet aanmaken')
  return insertedRow.id
}

// ─── Component ────────────────────────────────────────────────────────

interface GeldstromenPanelProps {
  transactions: TransactionRow[]
  properties: PropertyHierarchy[]
  onRefresh: () => void
}

export interface GeldstromenPanelRef {
  openPaymentForm: () => void
}

export const GeldstromenPanel = forwardRef<GeldstromenPanelRef, GeldstromenPanelProps>(function GeldstromenPanel({ transactions, properties, onRefresh }, ref) {
  const { user, isDemo } = useDashboardUser()
  const [filter, setFilter] = useState<Filter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)
  const [rightMode, setRightMode] = useState<RightPanelMode>('empty')

  // Assignment state
  const [assignTab, setAssignTab] = useState<'rent' | 'category'>('rent')
  const [assignSearch, setAssignSearch] = useState('')
  const [selectedRent, setSelectedRent] = useState<{ property_id: string; unit_id: string; tenant_id: string | null; lease_id: string } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCategoryProperty, setSelectedCategoryProperty] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Manual payment state
  const [showManualPayForm, setShowManualPayForm] = useState(false)
  const [payStep, setPayStep] = useState<1 | 2>(1)
  const [payDirection, setPayDirection] = useState<'inkomsten' | 'uitgaven'>('inkomsten')
  const [payDate, setPayDate] = useState(todayISODate())
  const [payAmount, setPayAmount] = useState('')
  const [payDescription, setPayDescription] = useState('')
  const [payCategory, setPayCategory] = useState<string | null>(null)
  const [payPropertyId, setPayPropertyId] = useState<string | null>(null)
  const [payUnitId, setPayUnitId] = useState<string | null>(null)
  const [savingPayment, setSavingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [payAllocationKeyId, setPayAllocationKeyId] = useState<string | null>(null)
  const [allocationKeys, setAllocationKeys] = useState<{ id: string; name: string; method: string }[]>([])

  // Load allocation keys when a property is picked in the payment form
  useEffect(() => {
    if (!payPropertyId || !showManualPayForm) {
      setAllocationKeys([])
      setPayAllocationKeyId(null)
      return
    }
    supabase
      .from('cost_allocation_keys')
      .select('id, name, method')
      .or(`property_id.eq.${payPropertyId},property_id.is.null`)
      .then(({ data }) => setAllocationKeys(data ?? []))
  }, [payPropertyId, showManualPayForm])

  useImperativeHandle(ref, () => ({ openPaymentForm: handleShowManualPaymentForm }))

  // Tab indicator refs
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const filterButtonRefs = useRef<Partial<Record<Filter, HTMLButtonElement | null>>>({})
  const [tabIndicator, setTabIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 })

  const selectedTx = useMemo(() =>
    transactions.find(tx => tx.id === selectedTxId) ?? null,
    [transactions, selectedTxId]
  )

  // Counts
  const counts = useMemo(() => {
    let inkomsten = 0, kosten = 0, unmatched = 0
    for (const tx of transactions) {
      if (!tx.assignment) { unmatched++; continue }
      const cat = tx.assignment.category
      if (!cat || cat === 'huur') { inkomsten++ }
      else if (EXPENSE_CATEGORIES_SET.has(cat)) { kosten++ }
      else { inkomsten++ } // prive/overig count as other
    }
    return { all: transactions.length, inkomsten, kosten, unmatched }
  }, [transactions])

  // Filter + search
  const filteredTx = useMemo(() => {
    let list = transactions

    // Tab filter
    if (filter === 'inkomsten') {
      list = list.filter(tx => tx.assignment && (!tx.assignment.category || tx.assignment.category === 'huur'))
    } else if (filter === 'kosten') {
      list = list.filter(tx => tx.assignment?.category && EXPENSE_CATEGORIES_SET.has(tx.assignment.category))
    } else if (filter === 'unmatched') {
      list = list.filter(tx => !tx.assignment)
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(tx => {
        const amountStr = formatEur(tx.amount).toLowerCase()
        return (
          (tx.sender_name ?? '').toLowerCase().includes(q) ||
          (tx.sender_iban ?? '').toLowerCase().includes(q) ||
          (tx.description ?? '').toLowerCase().includes(q) ||
          amountStr.includes(q) ||
          String(tx.amount).includes(q) ||
          (tx.assignment?.tenant_name ?? '').toLowerCase().includes(q) ||
          (tx.assignment?.property_name ?? '').toLowerCase().includes(q) ||
          (tx.assignment?.category ? (CATEGORY_LABELS[tx.assignment.category] ?? '').toLowerCase().includes(q) : false)
        )
      })
    }

    return list
  }, [transactions, filter, searchQuery])

  // Tab indicator
  useEffect(() => {
    const container = tabsContainerRef.current
    const btn = filterButtonRefs.current[filter]
    if (!container || !btn) return
    const containerRect = container.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setTabIndicator({ left: btnRect.left - containerRect.left, width: btnRect.width })
  }, [filter, counts.all, counts.inkomsten, counts.kosten, counts.unmatched])

  function handleSelectTx(tx: TransactionRow) {
    setSelectedTxId(tx.id)
    setRightMode('detail')
    setIsEditing(false)
    resetAssignState(tx)
  }

  function resetAssignState(tx: TransactionRow | null) {
    setAssignSearch('')
    setSubmitting(false)
    if (tx?.assignment?.category && tx.assignment.category !== 'huur') {
      setAssignTab('category')
      setSelectedCategory(tx.assignment.category)
      setSelectedCategoryProperty(tx.assignment.property_id)
      setSelectedRent(null)
    } else if (tx?.assignment?.lease_id && tx.assignment.unit_id && tx.assignment.property_id) {
      setAssignTab('rent')
      setSelectedRent({ property_id: tx.assignment.property_id, unit_id: tx.assignment.unit_id, tenant_id: tx.assignment.tenant_id, lease_id: tx.assignment.lease_id })
      setSelectedCategory(null)
      setSelectedCategoryProperty(null)
    } else {
      setAssignTab('rent')
      setSelectedRent(null)
      setSelectedCategory(null)
      setSelectedCategoryProperty(null)
    }
  }

  function handleShowManualPaymentForm() {
    setPaymentError('')
    setPayStep(1)
    setPayDirection('inkomsten')
    setPayDate(todayISODate())
    setPayAmount('')
    setPayDescription('')
    setPayCategory(null)
    setPayPropertyId(null)
    setPayUnitId(null)
    setPayAllocationKeyId(null)
    setAllocationKeys([])
    setShowManualPayForm(true)
  }

  async function handleSaveManualPayment() {
    if (!user?.id) return
    setPaymentError('')
    const raw = payAmount.replace(',', '.').trim()
    const absAmount = Number(raw)
    if (!Number.isFinite(absAmount) || absAmount === 0) {
      setPaymentError('Vul een geldig bedrag in (niet nul).')
      return
    }
    const amountNum = payDirection === 'uitgaven' ? -Math.abs(absAmount) : Math.abs(absAmount)
    setSavingPayment(true)
    try {
      const connId = await ensureManualBankConnection(user.id)
      const { data: inserted, error } = await supabase.from('raw_transactions').insert({
        owner_id: user.id,
        bank_connection_id: connId,
        external_id: `manual-${crypto.randomUUID()}`,
        value_date: payDate || null,
        amount: amountNum,
        currency: 'EUR',
        sender_name: null,
        sender_iban: null,
        description: payDescription.trim() || null,
      } as never).select('id').single()
      if (error) throw error

      // If category or property was selected in step 2, assign immediately
      const txId = (inserted as { id: string } | null)?.id
      if (txId && (payCategory || payPropertyId)) {
        const res = await fetch(`/api/finance/transactions/${txId}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: payPropertyId ?? null,
            unit_id: payUnitId ?? null,
            tenant_id: null,
            lease_id: null,
            category: payCategory ?? null,
            cost_allocation_key_id: payAllocationKeyId ?? null,
          }),
        })
        if (!res.ok) throw new Error('Toewijzing mislukt.')
      }

      setShowManualPayForm(false)
      onRefresh()
    } catch (e: unknown) {
      setPaymentError(e instanceof Error ? e.message : 'Opslaan mislukt.')
    } finally {
      setSavingPayment(false)
    }
  }

  // Filtered properties for rent assignment
  const filteredProperties = useMemo(() => {
    const q = assignSearch.toLowerCase()
    return properties
      .map(p => ({
        ...p,
        units: p.units
          .map(u => ({ ...u, leases: u.leases.filter(l => l.status === 'actief') }))
          .filter(u => u.leases.length > 0),
      }))
      .filter(p => {
        if (!q) return p.units.length > 0
        const propMatch = p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
        const unitMatch = p.units.some(u => u.unit_number.toLowerCase().includes(q) || u.leases.some(l => l.tenant_name?.toLowerCase().includes(q)))
        return (propMatch || unitMatch) && p.units.length > 0
      })
  }, [properties, assignSearch])

  // Assignment submit
  async function handleAssign() {
    if (!selectedTx) return
    const canSubmit = assignTab === 'rent' ? !!selectedRent : !!selectedCategory
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const body = assignTab === 'rent'
        ? { ...selectedRent, category: 'huur' }
        : { property_id: selectedCategoryProperty, unit_id: null, tenant_id: null, lease_id: null, category: selectedCategory }

      const res = await fetch(`/api/finance/transactions/${selectedTx.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setIsEditing(false)
        onRefresh()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Alle', count: counts.all },
    { key: 'inkomsten', label: 'Inkomsten', count: counts.inkomsten },
    { key: 'kosten', label: 'Kosten', count: counts.kosten },
    { key: 'unmatched', label: 'Niet gekoppeld', count: counts.unmatched },
  ]

  const showAssignForm = !selectedTx?.assignment || isEditing

  return (
    <>
    <Card className={cn(dashboardCardClass(undefined, isDemo), 'overflow-hidden flex flex-col lg:h-[calc(100vh-180px)] min-h-[500px]')}>

      {/* ─── Toolbar ─── */}
      <CardHeader className={cn(DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div
            ref={tabsContainerRef}
            className="relative flex w-full sm:w-auto min-w-0 overflow-x-auto text-sm border-b border-gray-200 dark:border-neutral-700 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((tab, index) => (
              <button
                key={tab.key}
                type="button"
                ref={(el) => { filterButtonRefs.current[tab.key] = el }}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'shrink-0 flex-1 sm:flex-initial pb-2 text-left sm:text-center whitespace-nowrap transition-colors duration-200 font-semibold',
                  index < tabs.length - 1 ? 'mr-4 sm:mr-6' : '',
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
              style={{ left: tabIndicator.left, width: tabIndicator.width }}
            />
          </div>

          <div className="relative flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3 sm:min-w-[180px] sm:max-w-[240px]">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <Input
              placeholder="Zoek op bedrag, huurder, pand..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-2 text-sm min-w-0 flex-1 bg-transparent py-0"
            />
          </div>
        </div>
      </CardHeader>

      {/* ─── Body: table + optional detail panel ─── */}
      <CardContent className={cn('p-0 px-0 pb-0 flex flex-col flex-1 overflow-hidden', DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS)}>

        {/* ─── Table panel ─── */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            {filteredTx.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Geen transacties gevonden</p>
              </div>
            ) : (
              <DashboardTableBlock empty={false}>
                <Table className="w-full">
                  <TableHeader className="sticky top-0 z-10 bg-white dark:bg-neutral-900">
                    <TableRow>
                      <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-[30%]')}>
                        <span className="flex items-center gap-1">Omschrijving <ChevronsUpDown className="h-3 w-3 opacity-40" /></span>
                      </TableHead>
                      <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-[20%]')}>
                        <span className="flex items-center gap-1">Categorie <ChevronsUpDown className="h-3 w-3 opacity-40" /></span>
                      </TableHead>
                      <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'hidden md:table-cell')}>
                        <span className="flex items-center gap-1">Pand / Huurder <ChevronsUpDown className="h-3 w-3 opacity-40" /></span>
                      </TableHead>
                      <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-[15%] hidden sm:table-cell')}>
                        <span className="flex items-center gap-1">Datum <ChevronsUpDown className="h-3 w-3 opacity-40" /></span>
                      </TableHead>
                      <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-[12%] text-right')}>
                        <span className="flex items-center justify-end gap-1">Bedrag <ChevronsUpDown className="h-3 w-3 opacity-40" /></span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTx.map(tx => {
                      const isSelected = selectedTxId === tx.id && rightMode === 'detail'
                      const isMatched = !!tx.assignment
                      const isExpenseCat = tx.assignment?.category && EXPENSE_CATEGORIES_SET.has(tx.assignment.category)
                      const catLabel = tx.assignment?.category ? CATEGORY_LABELS[tx.assignment.category] ?? tx.assignment.category : null

                      return (
                        <TableRow
                          key={tx.id}
                          onClick={() => handleSelectTx(tx)}
                          className={cn(
                            'cursor-pointer transition-colors',
                            isSelected
                              ? 'bg-[#163300]/[0.04] dark:bg-[#9FE870]/[0.04]'
                              : 'hover:bg-gray-50/80 dark:hover:bg-neutral-800/30'
                          )}
                        >
                          <TableCell className={cn(
                            'border-l-2',
                            isSelected ? 'border-l-[#163300] dark:border-l-[#9FE870]' : 'border-l-transparent'
                          )}>
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">{tx.description || tx.sender_name || '—'}</p>
                              {tx.is_manual_transaction && (
                                <span className="shrink-0 inline-flex items-center rounded-full bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                  Handmatig
                                </span>
                              )}
                            </div>
                            {tx.sender_name && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{tx.sender_name}</p>
                            )}
                          </TableCell>

                          <TableCell>
                            <span className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
                              !isMatched
                                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                                : isExpenseCat
                                ? 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400'
                                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            )}>
                              <span className={cn(
                                'h-1.5 w-1.5 rounded-full shrink-0',
                                !isMatched ? 'bg-amber-400' : isExpenseCat ? 'bg-gray-400' : 'bg-green-500'
                              )} />
                              {catLabel || (!isMatched ? 'Niet gekoppeld' : 'Huur')}
                            </span>
                          </TableCell>

                          <TableCell className="hidden md:table-cell">
                            {tx.assignment?.property_name ? (
                              <>
                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{tx.assignment.property_name}</p>
                                {tx.assignment.tenant_name && (
                                  <p className="text-xs text-gray-400 truncate">{tx.assignment.tenant_name}</p>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-300 dark:text-neutral-600">—</span>
                            )}
                          </TableCell>

                          <TableCell className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden sm:table-cell">
                            {formatDate(tx.value_date)}
                          </TableCell>

                          <TableCell className="text-right">
                            <span className={cn(
                              'font-semibold whitespace-nowrap',
                              tx.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            )}>
                              {formatEur(tx.amount)}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </DashboardTableBlock>
            )}
          </div>
        </div>

      </CardContent>
    </Card>

    {/* ─── Payment detail dialog ─── */}
    <Dialog open={rightMode === 'detail' && !!selectedTx} onOpenChange={(v) => { if (!v) { setRightMode('empty'); setSelectedTxId(null) } }}>
      <DialogContent
        className={addDialogContentClassName('max-w-md')}
        closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
      >
        {selectedTx && (
          <>
            <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
              <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>
                {selectedTx.description || selectedTx.sender_name || 'Betaling'}
              </DialogTitle>
              <p className={cn(
                'text-2xl font-bold mt-1',
                selectedTx.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {formatEur(selectedTx.amount)}
              </p>
            </DialogHeader>

            <div className={ADD_DIALOG_BODY_SCROLL_CLASS}>
              <div className="space-y-3">

                {/* Date + Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={tile}>
                    <p className={fieldLabel}>Datum</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedTx.value_date)}</p>
                  </div>
                  <div className={tile}>
                    <p className={fieldLabel}>Status</p>
                    <p className={cn('text-sm font-medium', selectedTx.assignment ? 'text-gray-900 dark:text-white' : 'text-amber-600 dark:text-amber-400')}>
                      {selectedTx.assignment ? 'Gekoppeld' : 'Niet gekoppeld'}
                    </p>
                  </div>
                </div>

                {/* Source */}
                {selectedTx.is_manual_transaction && (
                  <div className={tile}>
                    <p className={fieldLabel}>Bron</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Handmatig</p>
                  </div>
                )}

                {/* Sender */}
                {selectedTx.sender_name && (
                  <div className={tile}>
                    <p className={fieldLabel}>Afzender</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTx.sender_name}</p>
                  </div>
                )}

                {selectedTx.sender_iban && (
                  <div className={tile}>
                    <p className={fieldLabel}>IBAN</p>
                    <p className="text-sm font-mono text-gray-600 dark:text-gray-400">{selectedTx.sender_iban}</p>
                  </div>
                )}

                {selectedTx.description && selectedTx.sender_name && (
                  <div className={tile}>
                    <p className={fieldLabel}>Omschrijving</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedTx.description}</p>
                  </div>
                )}

                {/* Assignment info */}
                {selectedTx.assignment?.category && (
                  <div className={tile}>
                    <p className={fieldLabel}>Categorie</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {CATEGORY_LABELS[selectedTx.assignment.category] ?? selectedTx.assignment.category}
                    </p>
                  </div>
                )}

                {selectedTx.assignment?.property_name && (
                  <div className={tile}>
                    <p className={fieldLabel}>Pand</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTx.assignment.property_name}</p>
                  </div>
                )}

                {selectedTx.assignment?.tenant_name && (
                  <div className={tile}>
                    <p className={fieldLabel}>Huurder</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTx.assignment.tenant_name}</p>
                  </div>
                )}

                {/* Assignment form — shown when not yet assigned or editing */}
                {showAssignForm && (
                  <div className="space-y-3">
                    {/* Tabs */}
                    <div className="flex text-sm border-b border-gray-200 dark:border-neutral-700">
                      <button
                        onClick={() => setAssignTab('rent')}
                        className={cn('pb-2.5 pt-1 mr-6 whitespace-nowrap font-semibold transition-colors border-b-2', assignTab === 'rent' ? 'text-[#163300] dark:text-[#9FE870] border-[#163300] dark:border-[#9FE870]' : 'text-gray-500 dark:text-gray-400 border-transparent')}
                      >
                        Huurkoppeling
                      </button>
                      <button
                        onClick={() => setAssignTab('category')}
                        className={cn('pb-2.5 pt-1 whitespace-nowrap font-semibold transition-colors border-b-2', assignTab === 'category' ? 'text-[#163300] dark:text-[#9FE870] border-[#163300] dark:border-[#9FE870]' : 'text-gray-500 dark:text-gray-400 border-transparent')}
                      >
                        Categoriseren
                      </button>
                    </div>

                    {assignTab === 'rent' ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Zoek op pand, eenheid of huurder..."
                            value={assignSearch}
                            onChange={e => setAssignSearch(e.target.value)}
                            className="w-full h-8 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#163300] dark:focus:ring-[#9FE870]"
                          />
                        </div>
                        {filteredProperties.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-4">Geen resultaten gevonden</p>
                        )}
                        {filteredProperties.map(property => (
                          <div key={property.id} className="rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-neutral-800/50">
                              <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span className="font-medium text-sm text-gray-900 dark:text-white">{property.name}</span>
                              <span className="text-xs text-gray-400 ml-auto">{property.address}, {property.city}</span>
                            </div>
                            {property.units.map(unit =>
                              unit.leases.map(lease => {
                                const isSelected = selectedRent?.lease_id === lease.id && selectedRent?.unit_id === unit.id
                                return (
                                  <button
                                    key={`${unit.id}-${lease.id}`}
                                    onClick={() => setSelectedRent(isSelected ? null : { property_id: property.id, unit_id: unit.id, tenant_id: lease.tenant_id, lease_id: lease.id })}
                                    className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-left border-t border-gray-100 dark:border-neutral-700/50 transition-colors', isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-neutral-800/50')}
                                  >
                                    <Home className="h-3 w-3 text-gray-400 shrink-0" />
                                    <span className="text-sm font-medium w-12 shrink-0">{unit.unit_number}</span>
                                    <User className="h-3 w-3 text-gray-400 shrink-0" />
                                    <span className="text-sm flex-1 truncate">{lease.tenant_name || 'Onbekend'}</span>
                                    <span className="text-xs text-gray-400">{formatEur(lease.monthly_rent)}/mnd</span>
                                    {isSelected && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                                  </button>
                                )
                              })
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Categorie</p>
                          <div className="grid grid-cols-3 gap-2">
                            {CATEGORIES.map(cat => {
                              const Icon = cat.icon
                              const isSelected = selectedCategory === cat.key
                              return (
                                <button key={cat.key} onClick={() => setSelectedCategory(isSelected ? null : cat.key)}
                                  className={cn('flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs transition-colors', isSelected ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]' : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300')}
                                >
                                  <Icon className="h-4 w-4" />
                                  <span className="font-medium">{cat.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Pand (optioneel)</p>
                          <div className="space-y-1">
                            {properties.map(p => {
                              const isSelected = selectedCategoryProperty === p.id
                              return (
                                <button key={p.id} onClick={() => setSelectedCategoryProperty(isSelected ? null : p.id)}
                                  className={cn('w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors', isSelected ? 'border-[#163300] bg-[#163300]/5 dark:border-[#9FE870] dark:bg-[#9FE870]/10' : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300')}
                                >
                                  <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                  <span className="font-medium flex-1">{p.name}</span>
                                  {isSelected && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={ADD_DIALOG_FOOTER_SPLIT_CLASS}>
              <button
                type="button"
                onClick={() => { setRightMode('empty'); setSelectedTxId(null) }}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                Sluiten
              </button>

              {selectedTx.assignment && !showAssignForm ? (
                <button
                  type="button"
                  onClick={() => { setIsEditing(true); resetAssignState(selectedTx) }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#163300] dark:text-[#9FE870] hover:opacity-80 transition-opacity"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Toewijzing wijzigen
                </button>
              ) : showAssignForm ? (
                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={submitting || (assignTab === 'rent' ? !selectedRent : !selectedCategory)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isEditing ? 'Opslaan' : 'Toewijzen'}
                </button>
              ) : null}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>

    {/* ─── Manual payment dialog ─── */}
    <Dialog open={showManualPayForm} onOpenChange={(v) => { if (!v) setShowManualPayForm(false) }}>
      <DialogContent
        className={addDialogContentClassName('max-w-md')}
        closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
      >
        <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
          <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>
            {payStep === 1 ? 'Betalingsdetails' : 'Categorisatie'}
          </DialogTitle>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={cn('h-1.5 rounded-full transition-all bg-[#163300] dark:bg-[#9FE870]', payStep === 1 ? 'w-6' : 'w-3 opacity-30')} />
            <span className={cn('h-1.5 rounded-full transition-all bg-[#163300] dark:bg-[#9FE870]', payStep === 2 ? 'w-6' : 'w-3 opacity-30')} />
            <span className="ml-1 text-xs text-gray-400">Stap {payStep} van 2</span>
          </div>
        </DialogHeader>

        <div className={ADD_DIALOG_BODY_SCROLL_CLASS}>

          {/* ── Step 1 ── */}
          {payStep === 1 && (
            <div className="space-y-3">
              {/* Direction toggle */}
              <div className="flex rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-700 p-0.5 gap-0.5 bg-gray-50 dark:bg-neutral-800">
                <button
                  type="button"
                  onClick={() => setPayDirection('inkomsten')}
                  className={cn(
                    'flex-1 py-1.5 text-sm font-medium rounded-xl transition-colors',
                    payDirection === 'inkomsten'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  )}
                >
                  Inkomsten
                </button>
                <button
                  type="button"
                  onClick={() => setPayDirection('uitgaven')}
                  className={cn(
                    'flex-1 py-1.5 text-sm font-medium rounded-xl transition-colors',
                    payDirection === 'uitgaven'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  )}
                >
                  Uitgaven
                </button>
              </div>

              {/* Datum + Bedrag */}
              <div className="grid grid-cols-2 gap-3">
                <div className={tile}>
                  <p className={fieldLabel}>Datum *</p>
                  <input
                    type="date"
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className={tile}>
                  <p className={fieldLabel}>Bedrag (€) *</p>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Omschrijving */}
              <div className={tile}>
                <p className={fieldLabel}>Omschrijving *</p>
                <textarea
                  rows={2}
                  placeholder="Bijv. huurinkomsten januari"
                  value={payDescription}
                  onChange={e => setPayDescription(e.target.value)}
                  className={cn(inputCls, 'resize-none')}
                />
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {payStep === 2 && (
            <div className="space-y-3">
              <div className={tile}>
                <p className={fieldLabel}>Categorie</p>
                <select
                  value={payCategory ?? ''}
                  onChange={e => setPayCategory(e.target.value || null)}
                  className={inputCls}
                >
                  <option value="">— Geen categorie —</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className={tile}>
                <p className={fieldLabel}>
                  Koppel aan pand{' '}
                  <span className="text-gray-300 dark:text-neutral-600">(optioneel)</span>
                </p>
                <select
                  value={payPropertyId ?? ''}
                  onChange={e => { setPayPropertyId(e.target.value || null); setPayUnitId(null) }}
                  className={inputCls}
                >
                  <option value="">— Geen pand —</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {payPropertyId && (() => {
                const prop = properties.find(p => p.id === payPropertyId)
                const units = prop?.units ?? []
                if (units.length === 0) return null
                return (
                  <div className={tile}>
                    <p className={fieldLabel}>
                      Eenheid{' '}
                      <span className="text-gray-300 dark:text-neutral-600">(optioneel)</span>
                    </p>
                    <select
                      value={payUnitId ?? ''}
                      onChange={e => setPayUnitId(e.target.value || null)}
                      className={inputCls}
                    >
                      <option value="">— Geen eenheid —</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.unit_number}</option>
                      ))}
                    </select>
                  </div>
                )
              })()}

              {payPropertyId && allocationKeys.length > 0 && (
                <div className={tile}>
                  <p className={fieldLabel}>
                    Verdeelsleutel{' '}
                    <span className="text-gray-300 dark:text-neutral-600">(optioneel)</span>
                  </p>
                  <select
                    value={payAllocationKeyId ?? ''}
                    onChange={e => setPayAllocationKeyId(e.target.value || null)}
                    className={inputCls}
                  >
                    <option value="">— Standaard —</option>
                    {allocationKeys.map(k => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {paymentError && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">
              {paymentError}
            </p>
          )}
        </div>

        <div className={ADD_DIALOG_FOOTER_SPLIT_CLASS}>
          {payStep === 1 ? (
            <button
              type="button"
              onClick={() => setShowManualPayForm(false)}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              Annuleren
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPayStep(1)}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              ← Terug
            </button>
          )}

          {payStep === 1 ? (
            <button
              type="button"
              disabled={!payDate || !payAmount || !payDescription.trim()}
              onClick={() => setPayStep(2)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
            >
              Volgende →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveManualPayment}
              disabled={savingPayment}
              className="inline-flex items-center gap-2 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
            >
              {savingPayment && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Opslaan
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
})