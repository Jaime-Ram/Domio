'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Search,
  Building2,
  Home,
  User,
  Check,
  Loader2,
  ArrowRight,
  CalendarClock,
  Plus,
  Wrench,
  Shield,
  Landmark,
  Zap,
  Building,
  Briefcase,
  UserX,
  MoreHorizontal,
  FileText,
  Pencil,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WiseDatePicker } from '@/components/ui/wise-date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { TransactionRow, PropertyHierarchy } from './TransactionsInbox'

// ─── Constants ────────────────────────────────────────────────────────

type Filter = 'all' | 'inkomsten' | 'kosten' | 'unmatched'
type RightPanelMode = 'empty' | 'detail' | 'expense'

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

const MANUAL_EXPENSE_CATEGORIES = [
  'onderhoud', 'verzekering', 'belasting', 'energie', 'vve', 'hypotheek', 'beheer', 'overig',
] as const

// ─── Helpers ──────────────────────────────────────────────────────────

const formatEur = (amount: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)

const formatDate = (date: string | null) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Component ────────────────────────────────────────────────────────

interface GeldstromenPanelProps {
  transactions: TransactionRow[]
  properties: PropertyHierarchy[]
  onRefresh: () => void
  achterstandenUrl: string
}

export function GeldstromenPanel({ transactions, properties, onRefresh, achterstandenUrl }: GeldstromenPanelProps) {
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

  // Manual expense state
  const [expPropertyId, setExpPropertyId] = useState('')
  const [expCategory, setExpCategory] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expDate, setExpDate] = useState('')
  const [expDescription, setExpDescription] = useState('')
  const [savingExpense, setSavingExpense] = useState(false)
  const [expenseSuccess, setExpenseSuccess] = useState(false)

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

  function handleShowExpenseForm() {
    setSelectedTxId(null)
    setRightMode('expense')
    setExpenseSuccess(false)
    setExpPropertyId(''); setExpCategory(''); setExpAmount(''); setExpDate(''); setExpDescription('')
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

  // Manual expense submit
  async function handleSaveExpense() {
    if (!expPropertyId || !expCategory || !expAmount || !expDate) return
    setSavingExpense(true)
    try {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: expPropertyId, category: expCategory, amount: parseFloat(expAmount.replace(',', '.')), date: expDate, description: expDescription || null }),
      })
      if (res.ok) {
        setExpenseSuccess(true)
        setExpPropertyId(''); setExpCategory(''); setExpAmount(''); setExpDate(''); setExpDescription('')
        onRefresh()
      }
    } finally {
      setSavingExpense(false)
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
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-180px)] min-h-[500px] rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      {/* ─── Left panel ─── */}
      <div className="lg:w-[40%] flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-neutral-800 min-h-[400px] lg:min-h-0">
        {/* Filter tabs */}
        <div className="flex gap-1 px-3 pt-3 pb-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap',
                filter === tab.key
                  ? 'bg-[#163300] dark:bg-[#9FE870] text-white dark:text-[#163300]'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
              )}
            >
              {tab.label}
              <span className={cn(
                'ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full text-[10px] font-semibold px-1',
                filter === tab.key
                  ? 'bg-white/20 dark:bg-[#163300]/20 text-white dark:text-[#163300]'
                  : 'bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-gray-400'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek op bedrag, huurder, pand..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-8 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#163300] dark:focus:ring-[#9FE870]"
            />
          </div>
        </div>

        {/* Transaction list */}
        <div className="flex-1 overflow-y-auto">
          {filteredTx.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-400">Geen transacties gevonden</p>
            </div>
          ) : filteredTx.map(tx => {
            const isSelected = selectedTxId === tx.id && rightMode === 'detail'
            const isMatched = !!tx.assignment
            const isExpenseCat = tx.assignment?.category && EXPENSE_CATEGORIES_SET.has(tx.assignment.category)
            const catLabel = tx.assignment?.category ? CATEGORY_LABELS[tx.assignment.category] ?? tx.assignment.category : null

            return (
              <button
                key={tx.id}
                onClick={() => handleSelectTx(tx)}
                className={cn(
                  'w-full text-left px-3 py-2.5 border-b border-gray-50 dark:border-neutral-800/50 transition-colors',
                  isSelected
                    ? 'bg-[#163300]/5 dark:bg-[#9FE870]/5 border-l-2 border-l-[#163300] dark:border-l-[#9FE870]'
                    : 'hover:bg-gray-50 dark:hover:bg-neutral-800/30 border-l-2 border-l-transparent'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {/* Status dot */}
                      <span className={cn(
                        'inline-block h-2 w-2 rounded-full shrink-0',
                        !isMatched ? 'bg-amber-400' : isExpenseCat ? 'bg-gray-400' : 'bg-green-500'
                      )} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {tx.sender_name || '—'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 ml-4 truncate">
                      {formatDate(tx.value_date)}
                      {catLabel && <span className="ml-2 text-gray-500 dark:text-gray-400">{catLabel}</span>}
                    </p>
                  </div>
                  <span className={cn(
                    'text-sm font-semibold whitespace-nowrap shrink-0',
                    tx.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {formatEur(tx.amount)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Bottom links */}
        <div className="px-3 py-2.5 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
          <button
            onClick={() => window.location.href = achterstandenUrl}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#163300] dark:text-[#9FE870] hover:underline"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Bekijk achterstanden
            <ArrowRight className="h-3 w-3" />
          </button>
          <button
            onClick={handleShowExpenseForm}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#163300] dark:text-[#9FE870] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Kosten toevoegen
          </button>
        </div>
      </div>

      {/* ─── Right panel ─── */}
      <div ref={detailRef} className="lg:w-[60%] flex flex-col overflow-y-auto">
        {rightMode === 'empty' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
            <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400">Selecteer een transactie om details te bekijken</p>
          </div>
        )}

        {rightMode === 'detail' && selectedTx && (
          <div className="flex flex-col h-full">
            {/* Transaction detail card */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Transactie</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{formatEur(selectedTx.amount)}</p>
                </div>
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

            {/* Assignment info or assignment form */}
            {selectedTx.assignment && !showAssignForm ? (
              /* State 3: Show current assignment */
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
              /* State 2: Assignment form */
              <div className="flex-1 flex flex-col">
                {/* Tabs */}
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
                    {/* Search */}
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

                    {/* Property list */}
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
                    {/* Category grid */}
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
                    {/* Optional property picker */}
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

                {/* Submit button */}
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

        {rightMode === 'expense' && (
          <div className="flex-1 flex flex-col p-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Kosten toevoegen</h3>

            {expenseSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kosten opgeslagen</p>
                <button
                  onClick={() => setExpenseSuccess(false)}
                  className="text-sm font-medium text-[#163300] dark:text-[#9FE870] hover:underline"
                >
                  Nieuwe kosten toevoegen
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Pand *</Label>
                  <Select value={expPropertyId} onValueChange={setExpPropertyId}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecteer een pand" /></SelectTrigger>
                    <SelectContent>{properties.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Categorie *</Label>
                  <Select value={expCategory} onValueChange={setExpCategory}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecteer een categorie" /></SelectTrigger>
                    <SelectContent>{MANUAL_EXPENSE_CATEGORIES.map(cat => (<SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Bedrag (&euro;) *</Label>
                  <Input type="text" inputMode="decimal" placeholder="0,00" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Datum *</Label>
                  <WiseDatePicker
                    value={expDate}
                    onChange={setExpDate}
                    placeholder="Kies datum"
                    className="[&_button]:h-9 [&_button]:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Omschrijving</Label>
                  <Input type="text" placeholder="Optioneel..." value={expDescription} onChange={e => setExpDescription(e.target.value)} className="h-9 text-sm" />
                </div>
                <button
                  onClick={handleSaveExpense}
                  disabled={savingExpense || !expPropertyId || !expCategory || !expAmount || !expDate}
                  className="w-full py-2 rounded-lg bg-[#163300] dark:bg-[#9FE870] text-white dark:text-[#163300] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {savingExpense && <Loader2 className="h-4 w-4 animate-spin" />}
                  {savingExpense ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
