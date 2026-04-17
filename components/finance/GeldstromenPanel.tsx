'use client'

import { useState, useMemo, useRef } from 'react'
import {
  Search,
  Building2,
  Home,
  User,
  Check,
  Loader2,
  Plus,
  X,
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

const METHOD_LABELS: Record<string, string> = {
  iban: 'IBAN',
  reference: 'Referentie',
  amount_date: 'Bedrag+datum',
  historical: 'Historisch',
  manual: 'Handmatig',
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

export function GeldstromenPanel({ transactions, properties, onRefresh }: GeldstromenPanelProps) {
  const { user } = useDashboardUser()
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
  const [payDate, setPayDate] = useState(todayISODate())
  const [payAmount, setPayAmount] = useState('')
  const [paySender, setPaySender] = useState('')
  const [payIban, setPayIban] = useState('')
  const [payDescription, setPayDescription] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  // Mobile detail ref
  const detailRef = useRef<HTMLDivElement>(null)

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

  // Stats for summary bar
  const stats = useMemo(() => {
    let totalIncome = 0
    let totalExpenses = 0
    let minDate: string | null = null
    let maxDate: string | null = null
    for (const tx of filteredTx) {
      if (tx.amount > 0) totalIncome += tx.amount
      else totalExpenses += tx.amount
      if (tx.value_date) {
        if (!minDate || tx.value_date < minDate) minDate = tx.value_date
        if (!maxDate || tx.value_date > maxDate) maxDate = tx.value_date
      }
    }
    return { totalIncome, totalExpenses, minDate, maxDate }
  }, [filteredTx])

  function handleSelectTx(tx: TransactionRow) {
    setSelectedTxId(tx.id)
    setRightMode('detail')
    setIsEditing(false)
    resetAssignState(tx)
    // Mobile: scroll to detail
    if (window.innerWidth < 1024) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
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
    setPayDate(todayISODate()); setPayAmount(''); setPaySender(''); setPayIban(''); setPayDescription('')
    setShowManualPayForm(true)
  }

  async function handleSaveManualPayment() {
    if (!user?.id) return
    setPaymentError('')
    const raw = payAmount.replace(',', '.').trim()
    const amountNum = Number(raw)
    if (!Number.isFinite(amountNum) || amountNum === 0) {
      setPaymentError('Vul een geldig bedrag in (niet nul).')
      return
    }
    setSavingPayment(true)
    try {
      const connId = await ensureManualBankConnection(user.id)
      const { error } = await supabase.from('raw_transactions').insert({
        owner_id: user.id,
        bank_connection_id: connId,
        external_id: `manual-${crypto.randomUUID()}`,
        value_date: payDate || null,
        amount: amountNum,
        currency: 'EUR',
        sender_name: paySender.trim() || null,
        sender_iban: payIban.trim() || null,
        description: payDescription.trim() || null,
      } as never)
      if (error) throw error
      setShowManualPayForm(false)
      setPayDate(todayISODate()); setPayAmount(''); setPaySender(''); setPayIban(''); setPayDescription('')
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
    <div className="flex flex-col lg:h-[calc(100vh-180px)] min-h-[500px] rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">

      {/* ─── Toolbar ─── */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-neutral-800 flex-wrap">
        <div className="flex gap-1 flex-1 flex-wrap min-w-0">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap',
                filter === tab.key
                  ? 'bg-[#163300] dark:bg-[#9FE870] text-white dark:text-[#163300]'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
              )}
            >
              {tab.label}
              <span className={cn(
                'ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full text-xs font-semibold px-1',
                filter === tab.key
                  ? 'bg-white/20 dark:bg-[#163300]/20 text-white dark:text-[#163300]'
                  : 'bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-gray-400'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek op bedrag, huurder, pand..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-8 w-56 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#163300] dark:focus:ring-[#9FE870]"
          />
        </div>

        <div className="w-px h-5 bg-gray-200 dark:bg-neutral-700" />

        <button
          onClick={handleShowManualPaymentForm}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#163300] dark:text-[#9FE870] hover:bg-[#163300]/5 dark:hover:bg-[#9FE870]/10 transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Betaling toevoegen
        </button>
      </div>

      {/* ─── Body: table + optional detail panel ─── */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* ─── Table panel ─── */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Summary bar */}
          <div className="flex items-stretch divide-x divide-gray-100 dark:divide-neutral-800 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/60 dark:bg-neutral-800/30">
            <div className="px-5 py-2.5 flex-1">
              <p className="text-xs text-gray-400 mb-0.5">Totaal transacties</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{filteredTx.length.toLocaleString('nl-NL')}</p>
            </div>
            {(stats.minDate || stats.maxDate) && (
              <div className="px-5 py-2.5 flex-[2] hidden sm:block">
                <p className="text-xs text-gray-400 mb-0.5">Periode</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.minDate ? formatDate(stats.minDate) : '—'} – {stats.maxDate ? formatDate(stats.maxDate) : '—'}
                </p>
              </div>
            )}
            <div className="px-5 py-2.5 flex-1">
              <p className="text-xs text-gray-400 mb-0.5">Totaal kosten</p>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">{formatEur(stats.totalExpenses)}</p>
            </div>
            <div className="px-5 py-2.5 flex-1">
              <p className="text-xs text-gray-400 mb-0.5">Totaal inkomsten</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">{formatEur(stats.totalIncome)}</p>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            {filteredTx.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Geen transacties gevonden</p>
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[30%]">
                      <span className="flex items-center gap-1">Omschrijving <ChevronsUpDown className="h-3 w-3 opacity-40" /></span>
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[20%]">
                      <span className="flex items-center gap-1">Categorie <ChevronsUpDown className="h-3 w-3 opacity-40" /></span>
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">
                      <span className="flex items-center gap-1">Pand / Huurder <ChevronsUpDown className="h-3 w-3 opacity-40" /></span>
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[15%] hidden sm:table-cell">
                      <span className="flex items-center gap-1">Datum <ChevronsUpDown className="h-3 w-3 opacity-40" /></span>
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[12%]">
                      <span className="flex items-center justify-end gap-1">Bedrag <ChevronsUpDown className="h-3 w-3 opacity-40" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-neutral-800/60">
                  {filteredTx.map(tx => {
                    const isSelected = selectedTxId === tx.id && rightMode === 'detail'
                    const isMatched = !!tx.assignment
                    const isExpenseCat = tx.assignment?.category && EXPENSE_CATEGORIES_SET.has(tx.assignment.category)
                    const catLabel = tx.assignment?.category ? CATEGORY_LABELS[tx.assignment.category] ?? tx.assignment.category : null

                    return (
                      <tr
                        key={tx.id}
                        onClick={() => handleSelectTx(tx)}
                        className={cn(
                          'cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-[#163300]/[0.04] dark:bg-[#9FE870]/[0.04]'
                            : 'hover:bg-gray-50/80 dark:hover:bg-neutral-800/30'
                        )}
                      >
                        <td className={cn(
                          'px-4 py-3 border-l-2',
                          isSelected ? 'border-l-[#163300] dark:border-l-[#9FE870]' : 'border-l-transparent'
                        )}>
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{tx.sender_name || '—'}</p>
                            {tx.is_manual_transaction && (
                              <span className="shrink-0 inline-flex items-center rounded-full bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                Handmatig
                              </span>
                            )}
                          </div>
                          {tx.description && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{tx.description}</p>
                          )}
                        </td>

                        <td className="px-3 py-3">
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
                        </td>

                        <td className="px-3 py-3 hidden md:table-cell">
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
                        </td>

                        <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden sm:table-cell">
                          {formatDate(tx.value_date)}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            'font-semibold whitespace-nowrap',
                            tx.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          )}>
                            {formatEur(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ─── Right detail panel ─── */}
        {rightMode === 'detail' && selectedTx && (
          <div ref={detailRef} className="lg:w-[380px] shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-neutral-800 overflow-y-auto">

            {/* Transaction detail card */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Transactie</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{formatEur(selectedTx.amount)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTx.is_manual_transaction && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-neutral-700 px-2.5 py-0.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Handmatig
                    </span>
                  )}
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    selectedTx.assignment
                      ? selectedTx.assignment.category && selectedTx.assignment.category !== 'huur'
                        ? 'bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300'
                        : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                  )}>
                    {selectedTx.assignment
                      ? selectedTx.assignment.category && selectedTx.assignment.category !== 'huur'
                        ? CATEGORY_LABELS[selectedTx.assignment.category] ?? selectedTx.assignment.category
                        : 'Gekoppeld'
                      : 'Niet gekoppeld'
                    }
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-400 text-xs">Datum</span>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedTx.value_date)}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Afzender</span>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTx.sender_name || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">IBAN</span>
                  <p className="font-mono text-xs text-gray-600 dark:text-gray-400">{selectedTx.sender_iban || '—'}</p>
                </div>
                {selectedTx.description && (
                  <div className="col-span-2">
                    <span className="text-gray-400 text-xs">Omschrijving</span>
                    <p className="text-gray-700 dark:text-gray-300">{selectedTx.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment info or form */}
            {selectedTx.assignment && !showAssignForm ? (
              <div className="px-5 py-4 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Toewijzing</h3>
                  <button
                    onClick={() => { setIsEditing(true); resetAssignState(selectedTx) }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#163300] dark:text-[#9FE870] hover:underline"
                  >
                    <Pencil className="h-3 w-3" />
                    Wijzigen
                  </button>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-neutral-700 p-4 space-y-2 text-sm">
                  {selectedTx.assignment.property_name && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-gray-900 dark:text-white font-medium">{selectedTx.assignment.property_name}</span>
                      {selectedTx.assignment.property_address && <span className="text-gray-400">{selectedTx.assignment.property_address}</span>}
                    </div>
                  )}
                  {selectedTx.assignment.tenant_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{selectedTx.assignment.tenant_name}</span>
                    </div>
                  )}
                  {selectedTx.assignment.category && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">Categorie:</span>
                      <span className="text-gray-700 dark:text-gray-300">{CATEGORY_LABELS[selectedTx.assignment.category] ?? selectedTx.assignment.category}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 border-t border-gray-100 dark:border-neutral-800">
                    <span>Score: {selectedTx.assignment.confidence_score}%</span>
                    <span>Methode: {METHOD_LABELS[selectedTx.assignment.match_method] ?? selectedTx.assignment.match_method}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="flex text-sm border-b border-gray-200 dark:border-neutral-700 px-5">
                  <button
                    onClick={() => setAssignTab('rent')}
                    className={cn('pb-2.5 pt-3 mr-6 whitespace-nowrap font-semibold transition-colors border-b-2', assignTab === 'rent' ? 'text-[#163300] dark:text-[#9FE870] border-[#163300] dark:border-[#9FE870]' : 'text-gray-500 dark:text-gray-400 border-transparent')}
                  >
                    Huurkoppeling
                  </button>
                  <button
                    onClick={() => setAssignTab('category')}
                    className={cn('pb-2.5 pt-3 whitespace-nowrap font-semibold transition-colors border-b-2', assignTab === 'category' ? 'text-[#163300] dark:text-[#9FE870] border-[#163300] dark:border-[#9FE870]' : 'text-gray-500 dark:text-gray-400 border-transparent')}
                  >
                    Categoriseren
                  </button>
                </div>

                {assignTab === 'rent' ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-5 py-3">
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
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-2">
                      {filteredProperties.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-6">Geen resultaten gevonden</p>
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
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
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

                <div className="px-5 py-3 border-t border-gray-100 dark:border-neutral-800">
                  <button
                    onClick={handleAssign}
                    disabled={submitting || (assignTab === 'rent' ? !selectedRent : !selectedCategory)}
                    className="w-full py-2 rounded-lg bg-[#163300] dark:bg-[#9FE870] text-white dark:text-[#163300] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isEditing ? 'Opslaan' : 'Toewijzen'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* ─── Manual payment popup ─── */}
    {showManualPayForm && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 w-full max-w-xl px-4">
        <div className="rounded-2xl bg-gray-900 dark:bg-white px-5 py-4 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white dark:text-gray-900">Betaling toevoegen</p>
            <button
              onClick={() => setShowManualPayForm(false)}
              className="text-gray-500 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 dark:text-gray-500">Datum *</label>
              <input
                type="date"
                value={payDate}
                onChange={e => setPayDate(e.target.value)}
                className="w-full h-9 rounded-lg bg-white/10 dark:bg-gray-100 border border-white/15 dark:border-gray-200 text-white dark:text-gray-900 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-white/30 dark:focus:ring-gray-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 dark:text-gray-500">Bedrag (€) *</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className="w-full h-9 rounded-lg bg-white/10 dark:bg-gray-100 border border-white/15 dark:border-gray-200 text-white dark:text-gray-900 placeholder:text-gray-500 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-white/30 dark:focus:ring-gray-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 dark:text-gray-500">Naam afzender</label>
              <input
                type="text"
                placeholder="Optioneel"
                value={paySender}
                onChange={e => setPaySender(e.target.value)}
                className="w-full h-9 rounded-lg bg-white/10 dark:bg-gray-100 border border-white/15 dark:border-gray-200 text-white dark:text-gray-900 placeholder:text-gray-500 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-white/30 dark:focus:ring-gray-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 dark:text-gray-500">IBAN</label>
              <input
                type="text"
                placeholder="Optioneel"
                value={payIban}
                onChange={e => setPayIban(e.target.value)}
                className="w-full h-9 rounded-lg bg-white/10 dark:bg-gray-100 border border-white/15 dark:border-gray-200 text-white dark:text-gray-900 placeholder:text-gray-500 text-sm px-3 font-mono focus:outline-none focus:ring-1 focus:ring-white/30 dark:focus:ring-gray-400"
              />
            </div>
          </div>
          <div className="space-y-1 mb-4">
            <label className="text-xs font-medium text-gray-400 dark:text-gray-500">Omschrijving</label>
            <input
              type="text"
              placeholder="Optioneel"
              value={payDescription}
              onChange={e => setPayDescription(e.target.value)}
              className="w-full h-9 rounded-lg bg-white/10 dark:bg-gray-100 border border-white/15 dark:border-gray-200 text-white dark:text-gray-900 placeholder:text-gray-500 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-white/30 dark:focus:ring-gray-400"
            />
          </div>

          {paymentError && (
            <p className="text-xs text-red-400 dark:text-red-500 mb-3">{paymentError}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowManualPayForm(false)}
              className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-200 dark:hover:text-gray-700 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSaveManualPayment}
              disabled={savingPayment || !payDate || !payAmount}
              className="inline-flex items-center gap-2 rounded-full bg-[#9FE870] text-[#163300] px-4 py-1.5 text-sm font-medium hover:bg-[#8AD45F] transition-colors disabled:opacity-40"
            >
              {savingPayment && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Opslaan
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
