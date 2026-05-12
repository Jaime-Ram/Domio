'use client'

import { useState, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
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
  Key,
  Pencil,
  ChevronDown,
  ChevronLeft,
  ChevronsUpDown,
  AlertTriangle,
  Tag,
  Trash2,
  Plus,
  X as XIcon,
} from 'lucide-react'
import { useTransactionCategories } from '@/lib/finance/useTransactionCategories'
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
import { DetailShell } from '@/components/ui/detail-shell'
import { WiseDatePicker } from '@/components/ui/wise-date-picker'
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
} from '@/app/dashboard/landlord/dashboard-ui'

const tile = 'bg-gray-50 dark:bg-neutral-800/60 rounded-2xl px-4 py-3'
const fieldLabel = 'text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5'
const inputCls =
  'w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0'

// ─── Constants ────────────────────────────────────────────────────────

type Filter = 'all' | 'inkomsten' | 'kosten' | 'unmatched'
type RightPanelMode = 'empty' | 'detail'

// Fixed icons for the built-in category ids; custom categories fall back to Tag
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  huur: Key,
  onderhoud: Wrench,
  verzekering: Shield,
  belasting: Landmark,
  energie: Zap,
  vve: Building,
  hypotheek: Home,
  beheer: Briefcase,
  prive: UserX,
  overig: MoreHorizontal,
}

function getCategoryIcon(id: string): React.ComponentType<{ className?: string }> {
  return CATEGORY_ICONS[id] ?? Tag
}

const METHOD_LABELS: Record<string, string> = {
  iban: 'IBAN',
  reference: 'Referentie',
  amount_date: 'Bedrag+datum',
  historical: 'Historisch',
  manual: 'Handmatig',
}

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


// ─── Component ────────────────────────────────────────────────────────

interface GeldstromenPanelProps {
  transactions: TransactionRow[]
  properties: PropertyHierarchy[]
  onRefresh: () => void
  headerActions?: React.ReactNode
}

export interface GeldstromenPanelRef {
  openPaymentForm: () => void
}

export const GeldstromenPanel = forwardRef<GeldstromenPanelRef, GeldstromenPanelProps>(function GeldstromenPanel({ transactions, properties, onRefresh, headerActions }, ref) {
  const { user, isDemo } = useDashboardUser()
  const { categories: txCategories, addCategory, deleteCategory, renameCategory } = useTransactionCategories()
  const [filter, setFilter] = useState<Filter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)
  const [rightMode, setRightMode] = useState<RightPanelMode>('empty')

  // Assignment state
  const [assignStep, setAssignStep] = useState<1 | 2 | 3>(1)
  const [assignLevel, setAssignLevel] = useState<'geen' | 'pand' | 'eenheid' | null>(null)
  const [propPickerOpen, setPropPickerOpen] = useState(false)
  const [unitPickerOpen, setUnitPickerOpen] = useState(false)
  const [allocKeyPickerOpen, setAllocKeyPickerOpen] = useState(false)
const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCategoryProperty, setSelectedCategoryProperty] = useState<string | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [selectedAllocationKey, setSelectedAllocationKey] = useState<string | null>(null)
  const [assignAllocKeys, setAssignAllocKeys] = useState<{ id: string; name: string; method: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Category management state (shared between dropdown and tile grid)
  const [catEditId, setCatEditId] = useState<string | null>(null)
  const [catEditLabel, setCatEditLabel] = useState('')
  const [catAddLabel, setCatAddLabel] = useState('')
  const [catAddOpen, setCatAddOpen] = useState(false)

  const getCategoryLabel = (id: string) => txCategories.find(c => c.id === id)?.label ?? id

  // IBAN check state
  const [ibanStatus, setIbanStatus] = useState<'loading' | 'matched' | 'unmatched' | null>(null)
  const [ibanMatchedTenant, setIbanMatchedTenant] = useState<{ id: string; name: string } | null>(null)
  const [showIbanAssignForm, setShowIbanAssignForm] = useState(false)
  const [selectedIbanTenantId, setSelectedIbanTenantId] = useState<string | null>(null)
  const [savingIban, setSavingIban] = useState(false)

  // Manual payment state
  const [showManualPayForm, setShowManualPayForm] = useState(false)
  const [payStep, setPayStep] = useState<1 | 2 | 3 | 4>(1)
  const [payLevel, setPayLevel] = useState<'pand' | 'eenheid' | 'geen' | null>(null)
  const [payPropOpen, setPayPropOpen] = useState(false)
  const [payUnitOpen, setPayUnitOpen] = useState(false)
  const [payAllocOpen, setPayAllocOpen] = useState(false)
  const [payPickerPos, setPayPickerPos] = useState<{ top: number; left: number; width: number } | null>(null)
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
      if (!tx.assignment) { unmatched++ }
      if (Number(tx.amount) >= 0) { inkomsten++ }
      else { kosten++ }
    }
    return { all: transactions.length, inkomsten, kosten, unmatched }
  }, [transactions])

  // Filter + search
  const filteredTx = useMemo(() => {
    let list = transactions

    // Tab filter
    if (filter === 'inkomsten') {
      list = list.filter(tx => Number(tx.amount) >= 0)
    } else if (filter === 'kosten') {
      list = list.filter(tx => Number(tx.amount) < 0)
    } else if (filter === 'unmatched') {
      list = list.filter(tx => !tx.assignment)
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(tx => {
        const amountStr = formatEur(tx.amount).toLowerCase()
        return (
          (tx.counterparty_name ?? '').toLowerCase().includes(q) ||
          (tx.counterparty_iban ?? '').toLowerCase().includes(q) ||
          (tx.description ?? '').toLowerCase().includes(q) ||
          amountStr.includes(q) ||
          String(tx.amount).includes(q) ||
          (tx.assignment?.tenant_name ?? '').toLowerCase().includes(q) ||
          (tx.assignment?.property_name ?? '').toLowerCase().includes(q)
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
    setShowCategoryDropdown(false)
    resetAssignState(tx)
    setShowIbanAssignForm(false)
    setSelectedIbanTenantId(null)
  }

  function resetAssignState(tx: TransactionRow | null) {
    setSubmitting(false)
    setPropPickerOpen(false)
    setUnitPickerOpen(false)
    setAllocKeyPickerOpen(false)
    setSelectedAllocationKey(null)
    if (tx?.assignment?.category && tx.assignment.category !== 'huur') {
      const level = tx.assignment.unit_id ? 'eenheid' : tx.assignment.property_id ? 'pand' : null
      setSelectedCategory(tx.assignment.category)
      setSelectedCategoryProperty(tx.assignment.property_id ?? null)
      setSelectedUnit(tx.assignment.unit_id ?? null)
      setAssignLevel(level)
      setAssignStep(level ? 3 : 2)
    } else if (tx?.assignment?.lease_id && tx.assignment.unit_id && tx.assignment.property_id) {
      setSelectedCategory('huur')
      setSelectedCategoryProperty(tx.assignment.property_id)
      setSelectedUnit(tx.assignment.unit_id)
      setAssignLevel('eenheid')
      setAssignStep(3)
    } else {
      setSelectedCategory(null)
      setSelectedCategoryProperty(null)
      setSelectedUnit(null)
      setAssignLevel(null)
      setAssignStep(1)
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
    setPayLevel(null)
    setPayPropertyId(null)
    setPayUnitId(null)
    setPayAllocationKeyId(null)
    setAllocationKeys([])
    setPayPropOpen(false)
    setPayUnitOpen(false)
    setPayAllocOpen(false)
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
    if (!payDate) {
      setPaymentError('Vul een datum in.')
      return
    }
    const amountNum = payDirection === 'uitgaven' ? -Math.abs(absAmount) : Math.abs(absAmount)
    setSavingPayment(true)
    try {
      const { data: newTx, error } = await (supabase as any).from('raw_transactions').insert({
        owner_id: user.id,
        source: 'manual',
        bank_connection_id: null,
        external_id: null,
        booking_date: payDate,
        value_date: payDate,
        amount: amountNum,
        currency: 'EUR',
        counterparty_name: null,
        counterparty_iban: null,
        description: payDescription.trim() || null,
      }).select('id').single()
      if (error) throw error

      // Assign category + level if set
      if (payCategory && payLevel) {
        let body: Record<string, unknown>
        if (payLevel === 'geen') {
          body = { category: payCategory, property_id: null, unit_id: null, cost_allocation_key_id: null }
        } else if (payCategory === 'huur' && payUnitId) {
          const prop = properties.find(p => p.id === payPropertyId)
          const unit = prop?.units.find(u => u.id === payUnitId)
          const lease = unit?.leases.find(l => l.status === 'actief')
          body = { category: 'huur', lease_id: lease?.id ?? null, property_id: payPropertyId, unit_id: payUnitId }
        } else if (payLevel === 'pand') {
          body = { category: payCategory, property_id: payPropertyId, unit_id: null, cost_allocation_key_id: payAllocationKeyId }
        } else {
          body = { category: payCategory, property_id: payPropertyId, unit_id: payUnitId, cost_allocation_key_id: null }
        }
        await fetch(`/api/finance/transactions/${newTx.id}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }).catch(() => null)
      }

      setShowManualPayForm(false)
      onRefresh()
    } catch (e: unknown) {
      setPaymentError(e instanceof Error ? e.message : 'Opslaan mislukt.')
    } finally {
      setSavingPayment(false)
    }
  }

  // All active tenants across the property hierarchy (for IBAN assignment)
  const allActiveTenants = useMemo(() => {
    const seen = new Set<string>()
    const result: { id: string; name: string; propertyName: string }[] = []
    for (const prop of properties) {
      for (const unit of prop.units) {
        for (const lease of unit.leases) {
          if (lease.status === 'actief' && lease.tenant_id && lease.tenant_name && !seen.has(lease.tenant_id)) {
            seen.add(lease.tenant_id)
            result.push({ id: lease.tenant_id, name: lease.tenant_name, propertyName: prop.name })
          }
        }
      }
    }
    return result
  }, [properties])

  // Check if counterparty IBAN is stored on any tenant when a transaction is selected
  useEffect(() => {
    if (!selectedTx?.counterparty_iban) {
      setIbanStatus(null)
      setIbanMatchedTenant(null)
      setShowIbanAssignForm(false)
      return
    }
    if (isDemo) {
      setIbanStatus('unmatched')
      setIbanMatchedTenant(null)
      return
    }
    if (!user?.id || allActiveTenants.length === 0) {
      setIbanStatus('unmatched')
      return
    }
    setIbanStatus('loading')
    const tenantIds = allActiveTenants.map(t => t.id)
    const normalizedTxIban = selectedTx.counterparty_iban.replace(/\s/g, '').toUpperCase()
    supabase
      .from('tenants')
      .select('id, full_name, iban')
      .eq('owner_id', user.id)
      .in('id', tenantIds)
      .then(({ data }) => {
        if (!data) { setIbanStatus('unmatched'); return }
        const rows = data as { id: string; full_name: string; iban: string | null }[]
        const match = rows.find(t => t.iban && t.iban.replace(/\s/g, '').toUpperCase() === normalizedTxIban)
        if (match) {
          setIbanStatus('matched')
          setIbanMatchedTenant({ id: match.id, name: match.full_name })
        } else {
          setIbanStatus('unmatched')
          setIbanMatchedTenant(null)
        }
      })
  }, [selectedTx?.counterparty_iban, allActiveTenants, isDemo, user?.id])

  async function handleSaveIban() {
    if (!selectedIbanTenantId || !selectedTx?.counterparty_iban || !user?.id) return
    setSavingIban(true)
    try {
      const { error } = await (supabase as any)
        .from('tenants')
        .update({ iban: selectedTx.counterparty_iban })
        .eq('id', selectedIbanTenantId)
        .eq('owner_id', user.id)
      if (error) throw error

      const tenant = allActiveTenants.find(t => t.id === selectedIbanTenantId)
      setIbanStatus('matched')
      setIbanMatchedTenant(tenant ? { id: tenant.id, name: tenant.name } : null)
      setShowIbanAssignForm(false)
      setSelectedIbanTenantId(null)

      // Run the match engine so existing unassigned transactions from this IBAN get linked
      if (!isDemo) {
        await fetch('/api/finance/match').catch(() => null)
        onRefresh()
      }
    } finally {
      setSavingIban(false)
    }
  }

  // Units for property selected in manual payment form (step 4)
  const unitsForPayProperty = useMemo(() => {
    if (!payPropertyId) return []
    return properties.find(p => p.id === payPropertyId)?.units ?? []
  }, [properties, payPropertyId])

  // Units for the currently selected property (for unit picker in step 1)
  const unitsForSelectedProperty = useMemo(() => {
    if (!selectedCategoryProperty) return []
    const prop = properties.find(p => p.id === selectedCategoryProperty)
    return prop?.units ?? []
  }, [properties, selectedCategoryProperty])

  // Active leases for the currently selected unit (for huur tenant picker in step 2)
  const leasesForSelectedUnit = useMemo(() => {
    if (!selectedCategoryProperty || !selectedUnit) return []
    const prop = properties.find(p => p.id === selectedCategoryProperty)
    if (!prop) return []
    const unit = prop.units.find(u => u.id === selectedUnit)
    return (unit?.leases ?? []).filter(l => l.status === 'actief')
  }, [properties, selectedCategoryProperty, selectedUnit])

  // Load allocation keys when pand level + property selected in assign form
  useEffect(() => {
    if (!selectedCategoryProperty || assignLevel !== 'pand') {
      setAssignAllocKeys([])
      setSelectedAllocationKey(null)
      return
    }
    supabase
      .from('cost_allocation_keys')
      .select('id, name, method')
      .or(`property_id.eq.${selectedCategoryProperty},property_id.is.null`)
      .then(({ data }) => setAssignAllocKeys(data ?? []))
  }, [selectedCategoryProperty, assignLevel])

  // Assignment submit
  async function handleAssign() {
    if (!selectedTx || !selectedCategory) return
    setSubmitting(true)
    try {
      let body: Record<string, unknown>
      if (selectedCategory === 'huur') {
        const lease = leasesForSelectedUnit[0] ?? null
        body = { category: 'huur', lease_id: lease?.id ?? null, property_id: selectedCategoryProperty, unit_id: selectedUnit }
      } else {
        body = { category: selectedCategory, property_id: selectedCategoryProperty, unit_id: selectedUnit, cost_allocation_key_id: selectedAllocationKey }
      }
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

          <div className="flex items-center gap-2">
            <div className="relative flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3 sm:min-w-[180px] sm:max-w-[240px]">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <Input
                placeholder="Zoek op bedrag, huurder, pand..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-2 text-sm min-w-0 flex-1 bg-transparent py-0"
              />
            </div>
            {headerActions}
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
                              <p className="font-medium text-gray-900 dark:text-white truncate">{tx.description || tx.counterparty_name || '—'}</p>
                              {tx.is_manual_transaction && (
                                <span className="shrink-0 inline-flex items-center rounded-full bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                  Handmatig
                                </span>
                              )}
                            </div>
                            {tx.counterparty_name && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{tx.counterparty_name}</p>
                            )}
                          </TableCell>

                          <TableCell>
                            {!isMatched ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                                <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-amber-400" />
                                Niet gekoppeld
                              </span>
                            ) : (() => {
                              const cat = tx.assignment!.category
                              const Icon = cat ? getCategoryIcon(cat) : null
                              return (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">
                                  {Icon && <Icon className="h-3 w-3 shrink-0" />}
                                  {cat ? getCategoryLabel(cat) : '—'}
                                </span>
                              )
                            })()}
                          </TableCell>

                          <TableCell className="hidden md:table-cell">
                            {tx.assignment?.property_name ? (
                              <div className="flex items-center gap-1.5">
                                {tx.assignment.unit_id
                                  ? <Home className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                  : <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                }
                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                  {tx.assignment.unit_id
                                    ? (tx.assignment.unit_name ?? tx.assignment.property_name)
                                    : tx.assignment.property_name
                                  }
                                </p>
                              </div>
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

    {/* ─── Payment detail sheet ─── */}
    <DetailShell
      open={rightMode === 'detail' && !!selectedTx}
      onClose={() => { setRightMode('empty'); setSelectedTxId(null) }}
      title={selectedTx?.description || selectedTx?.counterparty_name || 'Betaling'}
      footer={
        <div className={ADD_DIALOG_FOOTER_SPLIT_CLASS}>
          <button
            type="button"
            onClick={() => { setRightMode('empty'); setSelectedTxId(null) }}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            Sluiten
          </button>

          {selectedTx?.assignment && !showAssignForm ? (
            <button
              type="button"
              onClick={() => { setIsEditing(true); resetAssignState(selectedTx) }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#163300] dark:text-[#9FE870] hover:opacity-80 transition-opacity"
            >
              <Pencil className="h-3.5 w-3.5" />
              Toewijzing wijzigen
            </button>
          ) : showAssignForm ? (() => {
            const canSave = !!selectedCategory && assignLevel !== null && (
              assignLevel === 'geen' ||
              (!!selectedCategoryProperty && (
                assignLevel === 'pand' ? !!selectedAllocationKey : !!selectedUnit
              ))
            )
            return (
              <button
                type="button"
                onClick={handleAssign}
                disabled={submitting || !canSave}
                className="inline-flex items-center gap-2 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Opslaan
              </button>
            )
          })() : null}
        </div>
      }
    >
      {selectedTx && (
        <>
          {/* ── Amount — centered hero ── */}
          <div className="px-6 pt-8 pb-6 text-center">
            {selectedCategory && (() => {
              const Icon = getCategoryIcon(selectedCategory)
              return (
                <div className="flex justify-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800">
                    <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              )
            })()}
            <p className={cn('text-3xl font-bold tracking-tight',
              selectedTx.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}>
              {formatEur(selectedTx.amount)}
            </p>
            <p className="text-sm text-gray-400 mt-1.5">{formatDate(selectedTx.value_date)}</p>

            {/* Category pill — shown in read mode only */}
            {!showAssignForm && <div className="relative inline-flex justify-center mt-3">
              {showCategoryDropdown && (
                <div className="fixed inset-0 z-10" onClick={() => {
                  setShowCategoryDropdown(false)
                  setCatEditId(null)
                  setCatAddOpen(false)
                  setCatAddLabel('')
                }} />
              )}
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(v => !v)}
                className="relative z-20 inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 px-3.5 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
              >
                {selectedCategory && (() => { const Icon = getCategoryIcon(selectedCategory); return <Icon className="h-3.5 w-3.5 shrink-0" /> })()}
                <span>{selectedCategory ? getCategoryLabel(selectedCategory) : 'Categorie kiezen'}</span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-20 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 min-w-[220px]">
                  {txCategories.map(cat => {
                    const Icon = getCategoryIcon(cat.id)
                    const isSelected = selectedCategory === cat.id
                    const isEditingThis = catEditId === cat.id
                    return (
                      <div key={cat.id} className="group flex items-center">
                        {isEditingThis ? (
                          <div className="flex items-center gap-1.5 w-full px-2 py-1">
                            <input
                              autoFocus
                              value={catEditLabel}
                              onChange={e => setCatEditLabel(e.target.value)}
                              onKeyDown={async e => {
                                if (e.key === 'Enter') { await renameCategory(cat.id, catEditLabel); setCatEditId(null) }
                                if (e.key === 'Escape') setCatEditId(null)
                              }}
                              className="flex-1 min-w-0 h-7 rounded-md border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#163300] dark:focus:ring-[#9FE870]"
                            />
                            <button type="button" onClick={async () => { await renameCategory(cat.id, catEditLabel); setCatEditId(null) }}
                              className="h-7 px-2 rounded-md bg-[#9FE870] text-[#163300] text-xs font-semibold shrink-0">
                              Ok
                            </button>
                            <button type="button" onClick={() => setCatEditId(null)}
                              className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800">
                              <XIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat.id)
                                if (cat.id === 'huur') setSelectedCategoryProperty(null)
                                setIsEditing(true)
                                setShowCategoryDropdown(false)
                                setCatEditId(null)
                              }}
                              className={cn(
                                'flex-1 flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                                isSelected
                                  ? 'bg-[#163300]/5 dark:bg-[#9FE870]/10 text-[#163300] dark:text-[#9FE870] font-semibold'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                              <span className="flex-1">{cat.label}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#163300] dark:text-[#9FE870]" />}
                            </button>
                            <button type="button"
                              onClick={e => { e.stopPropagation(); setCatEditId(cat.id); setCatEditLabel(cat.label) }}
                              className="opacity-0 group-hover:opacity-100 mr-1 h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-opacity">
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button type="button"
                              onClick={e => { e.stopPropagation(); deleteCategory(cat.id); if (selectedCategory === cat.id) setSelectedCategory(null) }}
                              className="opacity-0 group-hover:opacity-100 mr-2 h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 transition-opacity">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    )
                  })}

                  {/* Add new category */}
                  <div className="border-t border-gray-100 dark:border-neutral-800 mt-1 pt-1">
                    {catAddOpen ? (
                      <div className="flex items-center gap-1.5 px-2 py-1">
                        <input
                          autoFocus
                          value={catAddLabel}
                          onChange={e => setCatAddLabel(e.target.value)}
                          placeholder="Naam categorie"
                          onKeyDown={async e => {
                            if (e.key === 'Enter' && catAddLabel.trim()) { await addCategory(catAddLabel); setCatAddLabel(''); setCatAddOpen(false) }
                            if (e.key === 'Escape') { setCatAddOpen(false); setCatAddLabel('') }
                          }}
                          className="flex-1 min-w-0 h-7 rounded-md border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#163300] dark:focus:ring-[#9FE870]"
                        />
                        <button type="button"
                          disabled={!catAddLabel.trim()}
                          onClick={async () => { await addCategory(catAddLabel); setCatAddLabel(''); setCatAddOpen(false) }}
                          className="h-7 px-2 rounded-md bg-[#9FE870] text-[#163300] text-xs font-semibold shrink-0 disabled:opacity-40">
                          Ok
                        </button>
                        <button type="button" onClick={() => { setCatAddOpen(false); setCatAddLabel('') }}
                          className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800">
                          <XIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setCatAddOpen(true)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                        Nieuwe categorie
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>}
          </div>

          {/* ── Transaction detail rows ── */}
          <div className="border-t border-gray-100 dark:border-neutral-800">

            {selectedTx.counterparty_name && (
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm text-gray-400 shrink-0">Afzender</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white text-right ml-6 truncate">{selectedTx.counterparty_name}</span>
              </div>
            )}

            {selectedTx.counterparty_iban && (
              <div className="border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-start justify-between px-6 py-3.5">
                  <span className="text-sm text-gray-400 shrink-0">IBAN</span>
                  <div className="text-right ml-6 min-w-0">
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedTx.counterparty_iban}</p>
                    {ibanStatus === 'loading' && (
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                        <span className="text-xs text-gray-400">Controleren…</span>
                      </div>
                    )}
                    {ibanStatus === 'matched' && ibanMatchedTenant && (
                      <div className="flex items-center justify-end gap-1 mt-1 text-xs font-medium text-green-600 dark:text-green-400">
                        <Check className="h-3 w-3 shrink-0" />
                        {ibanMatchedTenant.name}
                      </div>
                    )}
                    {ibanStatus === 'unmatched' && (
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          Onbekend
                        </span>
                        {!showIbanAssignForm && (
                          <button type="button" onClick={() => setShowIbanAssignForm(true)}
                            className="text-xs font-medium text-[#163300] dark:text-[#9FE870] underline underline-offset-2"
                          >
                            Koppelen
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {showIbanAssignForm && ibanStatus === 'unmatched' && (
                  <div className="px-6 pb-4 space-y-2">
                    {allActiveTenants.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2 text-center">Geen actieve huurders gevonden</p>
                    ) : (
                      <div className="space-y-1">
                        {allActiveTenants.map(tenant => (
                          <button key={tenant.id} type="button"
                            onClick={() => setSelectedIbanTenantId(tenant.id === selectedIbanTenantId ? null : tenant.id)}
                            className={cn('w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                              selectedIbanTenantId === tenant.id
                                ? 'border-[#163300] bg-[#163300]/5 dark:border-[#9FE870] dark:bg-[#9FE870]/10'
                                : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                            )}
                          >
                            <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="font-medium flex-1 truncate">{tenant.name}</span>
                            <span className="text-xs text-gray-400 shrink-0">{tenant.propertyName}</span>
                            {selectedIbanTenantId === tenant.id && <Check className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870] shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-1">
                      <button type="button"
                        onClick={() => { setShowIbanAssignForm(false); setSelectedIbanTenantId(null) }}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        Annuleren
                      </button>
                      <button type="button" onClick={handleSaveIban}
                        disabled={!selectedIbanTenantId || savingIban}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-40"
                      >
                        {savingIban && <Loader2 className="h-3 w-3 animate-spin" />}
                        Opslaan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTx.description && (
              <div className="flex items-start justify-between px-6 py-3.5 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm text-gray-400 shrink-0">Omschrijving</span>
                <span className="text-sm text-gray-900 dark:text-white text-right ml-6">{selectedTx.description}</span>
              </div>
            )}
          </div>

          {/* ── Assignment section ── */}
          <div>
            <p className="px-6 pt-5 pb-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Toewijzing
            </p>

            {!showAssignForm ? (
              /* Assignment rows — read-only */
              (() => {
                const a = selectedTx.assignment!
                const CatIcon = a.category ? getCategoryIcon(a.category) : null
                return (
                  <div className="border-t border-gray-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 dark:border-neutral-800">
                      <span className="text-sm text-gray-400 shrink-0">Categorie</span>
                      <div className="flex items-center gap-2 ml-6">
                        {CatIcon && <CatIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {a.category ? getCategoryLabel(a.category) : '—'}
                        </span>
                      </div>
                    </div>
                    {a.property_name && (
                      <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm text-gray-400 shrink-0">Pand</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white text-right ml-6">{a.property_name}</span>
                      </div>
                    )}
                    {a.tenant_name && (
                      <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-sm text-gray-400 shrink-0">Huurder</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white text-right ml-6">{a.tenant_name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-6 py-3.5">
                      <span className="text-sm text-gray-400 shrink-0">Gekoppeld via</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 text-right ml-6">
                        {a.is_manual ? 'Handmatig' : `${a.confidence_score ?? 0}% — ${METHOD_LABELS[a.match_method] ?? a.match_method}`}
                      </span>
                    </div>
                  </div>
                )
              })()
            ) : (
              /* Assignment wizard */
              <div className="px-6 space-y-4 pb-4">
                {/* Step indicator with back button */}
                <div className="flex items-center gap-2">
                  {assignStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setAssignStep(s => (s - 1) as 1 | 2 | 3)}
                      className="h-6 w-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  <div className="flex items-center gap-1">
                    {([1, 2, 3] as const).map(s => (
                      <span key={s} className={cn('h-1.5 rounded-full transition-all bg-[#163300] dark:bg-[#9FE870]', assignStep === s ? 'w-6' : 'w-2 opacity-30')} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">Stap {assignStep} van 3</span>
                </div>

                {/* ── Step 1: Category ── */}
                {assignStep === 1 && (
                  <>
                    <p className="text-xs text-gray-400">Wat voor betaling is dit?</p>
                    <div className="grid grid-cols-5 gap-2">
                      {txCategories.map(cat => {
                        const Icon = getCategoryIcon(cat.id)
                        const isSel = selectedCategory === cat.id
                        return (
                          <div key={cat.id} className="relative group">
                            <button type="button"
                              onClick={() => {
                                if (isSel) return
                                setSelectedCategory(cat.id)
                                setAssignStep(2)
                              }}
                              className={cn('w-full flex flex-col items-center gap-1.5 rounded-lg border px-1 py-3 transition-colors',
                                isSel
                                  ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                                  : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="font-medium text-[11px] leading-tight text-center">{cat.label}</span>
                            </button>
                            <div className="absolute -top-2 -right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button type="button"
                                onClick={e => { e.stopPropagation(); setCatEditId(cat.id); setCatEditLabel(cat.label) }}
                                className="h-5 w-5 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 shadow text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button type="button"
                                onClick={e => { e.stopPropagation(); deleteCategory(cat.id); if (selectedCategory === cat.id) setSelectedCategory(null) }}
                                className="h-5 w-5 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 shadow text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                      {catEditId && (
                        <div className="col-span-5 flex items-center gap-1.5">
                          <input autoFocus value={catEditLabel} onChange={e => setCatEditLabel(e.target.value)} placeholder="Nieuwe naam"
                            onKeyDown={async e => {
                              if (e.key === 'Enter' && catEditLabel.trim()) { await renameCategory(catEditId, catEditLabel); setCatEditId(null) }
                              if (e.key === 'Escape') setCatEditId(null)
                            }}
                            className="flex-1 h-8 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#163300] dark:focus:ring-[#9FE870]"
                          />
                          <button type="button" disabled={!catEditLabel.trim()}
                            onClick={async () => { await renameCategory(catEditId, catEditLabel); setCatEditId(null) }}
                            className="h-8 px-3 rounded-lg bg-[#9FE870] text-[#163300] text-xs font-semibold shrink-0 disabled:opacity-40">Ok</button>
                          <button type="button" onClick={() => setCatEditId(null)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800">
                            <XIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      {catAddOpen ? (
                        <div className="col-span-5 flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={catAddLabel}
                            onChange={e => setCatAddLabel(e.target.value)}
                            placeholder="Naam categorie"
                            onKeyDown={async e => {
                              if (e.key === 'Enter' && catAddLabel.trim()) { await addCategory(catAddLabel); setCatAddLabel(''); setCatAddOpen(false) }
                              if (e.key === 'Escape') { setCatAddOpen(false); setCatAddLabel('') }
                            }}
                            className="flex-1 h-8 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#163300] dark:focus:ring-[#9FE870]"
                          />
                          <button type="button"
                            disabled={!catAddLabel.trim()}
                            onClick={async () => { await addCategory(catAddLabel); setCatAddLabel(''); setCatAddOpen(false) }}
                            className="h-8 px-3 rounded-lg bg-[#9FE870] text-[#163300] text-xs font-semibold shrink-0 disabled:opacity-40">
                            Ok
                          </button>
                          <button type="button" onClick={() => { setCatAddOpen(false); setCatAddLabel('') }}
                            className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800">
                            <XIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setCatAddOpen(true)}
                          className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-gray-200 dark:border-neutral-700 px-1 py-3 text-gray-400 dark:text-neutral-600 hover:border-gray-300 dark:hover:border-neutral-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors">
                          <Plus className="h-4 w-4" />
                          <span className="font-medium text-[11px] leading-tight text-center">Toevoegen</span>
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* ── Step 2: Pand or Eenheid ── */}
                {assignStep === 2 && (
                  <>
                    <p className="text-xs text-gray-400">Koppelen aan een pand of eenheid?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { key: 'pand', label: 'Pand', Icon: Building2, sub: 'Met verdeelsleutel' },
                        { key: 'eenheid', label: 'Eenheid', Icon: Home, sub: 'Specifieke huurder' },
                      ] as const).map(({ key, label, Icon, sub }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setAssignLevel(key)
                            setSelectedUnit(null)
                            setSelectedAllocationKey(null)
                            setAssignStep(3)
                          }}
                          className={cn(
                            'flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors',
                            assignLevel === key
                              ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                              : 'border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-neutral-600'
                          )}
                        >
                          <Icon className="h-4 w-4 mb-0.5" />
                          <span className="text-sm font-medium">{label}</span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAssignLevel('geen')
                        setSelectedCategoryProperty(null)
                        setSelectedUnit(null)
                        setSelectedAllocationKey(null)
                        setAssignStep(3)
                      }}
                      className={cn(
                        'w-full flex items-center justify-center rounded-lg border px-4 py-2 text-xs font-medium transition-colors',
                        assignLevel === 'geen'
                          ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                          : 'border-gray-200 dark:border-neutral-700 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-neutral-600 hover:text-gray-600 dark:hover:text-gray-300'
                      )}
                    >
                      Niet koppelen
                    </button>
                  </>
                )}

                {/* ── Step 3: Property + unit/verdeelsleutel ── */}
                {assignStep === 3 && (
                  <>
                    <p className="text-xs text-gray-400">
                      {assignLevel === 'pand' ? 'Kies een pand en verdeelsleutel' : assignLevel === 'eenheid' ? 'Kies een pand en eenheid' : 'Alleen categorie wordt opgeslagen'}
                    </p>

                    <div className="flex flex-col gap-2">
                      {/* Property picker */}
                      <div className="relative">
                        {propPickerOpen && <div className="fixed inset-0 z-10" onClick={() => setPropPickerOpen(false)} />}
                        <button type="button"
                          onClick={() => { setPropPickerOpen(v => !v); setUnitPickerOpen(false); setAllocKeyPickerOpen(false) }}
                          className={cn(
                            'relative z-20 w-full flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                            selectedCategoryProperty
                              ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                              : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
                          )}
                        >
                          <Building2 className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left">{properties.find(p => p.id === selectedCategoryProperty)?.name ?? 'Pand kiezen'}</span>
                          {selectedCategoryProperty && <Check className="h-4 w-4 shrink-0" />}
                          {!selectedCategoryProperty && <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />}
                        </button>
                        {propPickerOpen && (
                          <div className="absolute top-full left-0 mt-1 z-20 w-full bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 max-h-60 overflow-y-auto">
                            {properties.map(p => {
                              const isSel = selectedCategoryProperty === p.id
                              return (
                                <button key={p.id} type="button"
                                  onClick={() => { setSelectedCategoryProperty(p.id); setSelectedUnit(null); setPropPickerOpen(false) }}
                                  className={cn(
                                    'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
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
                        )}
                      </div>

                      {/* Unit picker — eenheid level */}
                      {assignLevel === 'eenheid' && selectedCategoryProperty && (
                        <div className="relative">
                          {unitPickerOpen && <div className="fixed inset-0 z-10" onClick={() => setUnitPickerOpen(false)} />}
                          <button type="button"
                            onClick={() => { setUnitPickerOpen(v => !v); setPropPickerOpen(false); setAllocKeyPickerOpen(false) }}
                            className={cn(
                              'relative z-20 w-full flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                              selectedUnit
                                ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                                : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
                            )}
                          >
                            <Home className="h-4 w-4 shrink-0" />
                            <span className="flex-1 text-left">{unitsForSelectedProperty.find(u => u.id === selectedUnit)?.unit_number ?? 'Eenheid kiezen'}</span>
                            {selectedUnit && <Check className="h-4 w-4 shrink-0" />}
                            {!selectedUnit && <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />}
                          </button>
                          {unitPickerOpen && (
                            <div className="absolute top-full left-0 mt-1 z-20 w-full bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 max-h-60 overflow-y-auto">
                              {unitsForSelectedProperty.length === 0 ? (
                                <p className="px-4 py-3 text-sm text-gray-400">Geen eenheden gevonden</p>
                              ) : unitsForSelectedProperty.map(u => {
                                const isSel = selectedUnit === u.id
                                return (
                                  <button key={u.id} type="button"
                                    onClick={() => { setSelectedUnit(isSel ? null : u.id); setUnitPickerOpen(false) }}
                                    className={cn(
                                      'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
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
                          )}
                        </div>
                      )}

                      {/* Allocation key picker — pand level (mandatory) */}
                      {assignLevel === 'pand' && selectedCategoryProperty && (
                        <div className="relative">
                          {allocKeyPickerOpen && <div className="fixed inset-0 z-10" onClick={() => setAllocKeyPickerOpen(false)} />}
                          <button type="button"
                            onClick={() => { setAllocKeyPickerOpen(v => !v); setPropPickerOpen(false) }}
                            className={cn(
                              'relative z-20 w-full flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                              selectedAllocationKey
                                ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                                : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
                            )}
                          >
                            <span className="flex-1 text-left">{assignAllocKeys.find(k => k.id === selectedAllocationKey)?.name ?? (assignAllocKeys.length === 0 ? 'Geen verdeelsleutels beschikbaar' : 'Verdeelsleutel kiezen')}</span>
                            {selectedAllocationKey && <Check className="h-4 w-4 shrink-0" />}
                            {!selectedAllocationKey && assignAllocKeys.length > 0 && <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />}
                          </button>
                          {allocKeyPickerOpen && assignAllocKeys.length > 0 && (
                            <div className="absolute top-full left-0 mt-1 z-20 w-full bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 max-h-60 overflow-y-auto">
                              {assignAllocKeys.map(k => {
                                const isSel = selectedAllocationKey === k.id
                                return (
                                  <button key={k.id} type="button"
                                    onClick={() => { setSelectedAllocationKey(isSel ? null : k.id); setAllocKeyPickerOpen(false) }}
                                    className={cn(
                                      'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                                      isSel ? 'bg-[#163300]/5 dark:bg-[#9FE870]/10 text-[#163300] dark:text-[#9FE870] font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                    )}
                                  >
                                    <span className="flex-1">{k.name}</span>
                                    {isSel && <Check className="h-3.5 w-3.5 shrink-0" />}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </DetailShell>

    {/* ─── Manual payment dialog ─── */}
    <Dialog open={showManualPayForm} onOpenChange={(v) => { if (!v) setShowManualPayForm(false) }}>
      <DialogContent
        className={addDialogContentClassName('max-w-md')}
        closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
      >
        <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
          <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>
            {payStep === 1 ? 'Nieuwe betaling' : payStep === 2 ? 'Categorie' : payStep === 3 ? 'Koppeling' : 'Details'}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            {payStep > 1 && (
              <button
                type="button"
                onClick={() => setPayStep(s => (s - 1) as 1 | 2 | 3 | 4)}
                className="h-6 w-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-1">
              {([1, 2, 3, 4] as const).map(s => (
                <span key={s} className={cn('h-1.5 rounded-full transition-all bg-[#163300] dark:bg-[#9FE870]', payStep === s ? 'w-6' : 'w-2 opacity-30')} />
              ))}
            </div>
            <span className="text-xs text-gray-400">Stap {payStep} van 4</span>
          </div>
        </DialogHeader>

        <div className={ADD_DIALOG_BODY_SCROLL_CLASS}>

          {/* ── Step 1: Payment details ── */}
          {payStep === 1 && (
            <div className="space-y-3">
              <div className="flex rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-700 p-0.5 gap-0.5 bg-gray-50 dark:bg-neutral-800">
                <button type="button" onClick={() => setPayDirection('inkomsten')}
                  className={cn('flex-1 py-1.5 text-sm font-medium rounded-xl transition-colors',
                    payDirection === 'inkomsten' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  )}>
                  Inkomsten
                </button>
                <button type="button" onClick={() => setPayDirection('uitgaven')}
                  className={cn('flex-1 py-1.5 text-sm font-medium rounded-xl transition-colors',
                    payDirection === 'uitgaven' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  )}>
                  Uitgaven
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={tile}>
                  <p className={fieldLabel}>Datum *</p>
                  <WiseDatePicker value={payDate} onChange={setPayDate} />
                </div>
                <div className={tile}>
                  <p className={fieldLabel}>Bedrag (€) *</p>
                  <input type="text" inputMode="decimal" placeholder="0,00" value={payAmount} onChange={e => setPayAmount(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className={tile}>
                <p className={fieldLabel}>Omschrijving</p>
                <textarea rows={2} placeholder="Bijv. huurinkomsten januari" value={payDescription} onChange={e => setPayDescription(e.target.value)} className={cn(inputCls, 'resize-none')} />
              </div>
            </div>
          )}

          {/* ── Step 2: Category tiles ── */}
          {payStep === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">Wat voor betaling is dit?</p>
              <div className="grid grid-cols-5 gap-2">
                {txCategories.map(cat => {
                  const Icon = getCategoryIcon(cat.id)
                  const isSel = payCategory === cat.id
                  return (
                    <div key={cat.id} className="relative group">
                      <button type="button"
                        onClick={() => { setPayCategory(cat.id); setPayStep(3) }}
                        className={cn('w-full flex flex-col items-center gap-1.5 rounded-lg border px-1 py-3 transition-colors',
                          isSel
                            ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                            : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-[11px] leading-tight text-center">{cat.label}</span>
                      </button>
                      <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button type="button"
                          onClick={e => { e.stopPropagation(); setCatEditId(cat.id); setCatEditLabel(cat.label) }}
                          className="h-4 w-4 flex items-center justify-center rounded bg-white/90 dark:bg-neutral-900/90 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          <Pencil className="h-2.5 w-2.5" />
                        </button>
                        <button type="button"
                          onClick={e => { e.stopPropagation(); deleteCategory(cat.id); if (payCategory === cat.id) setPayCategory(null) }}
                          className="h-4 w-4 flex items-center justify-center rounded bg-white/90 dark:bg-neutral-900/90 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        >
                          <XIcon className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {catEditId && (
                  <div className="col-span-5 flex items-center gap-1.5">
                    <input autoFocus value={catEditLabel} onChange={e => setCatEditLabel(e.target.value)} placeholder="Nieuwe naam"
                      onKeyDown={async e => {
                        if (e.key === 'Enter' && catEditLabel.trim()) { await renameCategory(catEditId, catEditLabel); setCatEditId(null) }
                        if (e.key === 'Escape') setCatEditId(null)
                      }}
                      className="flex-1 h-8 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#163300] dark:focus:ring-[#9FE870]"
                    />
                    <button type="button" disabled={!catEditLabel.trim()}
                      onClick={async () => { await renameCategory(catEditId, catEditLabel); setCatEditId(null) }}
                      className="h-8 px-3 rounded-lg bg-[#9FE870] text-[#163300] text-xs font-semibold shrink-0 disabled:opacity-40">Ok</button>
                    <button type="button" onClick={() => setCatEditId(null)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800">
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {catAddOpen ? (
                  <div className="col-span-5 flex items-center gap-1.5">
                    <input
                      autoFocus
                      value={catAddLabel}
                      onChange={e => setCatAddLabel(e.target.value)}
                      placeholder="Naam categorie"
                      onKeyDown={async e => {
                        if (e.key === 'Enter' && catAddLabel.trim()) { await addCategory(catAddLabel); setCatAddLabel(''); setCatAddOpen(false) }
                        if (e.key === 'Escape') { setCatAddOpen(false); setCatAddLabel('') }
                      }}
                      className="flex-1 h-8 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#163300] dark:focus:ring-[#9FE870]"
                    />
                    <button type="button"
                      disabled={!catAddLabel.trim()}
                      onClick={async () => { await addCategory(catAddLabel); setCatAddLabel(''); setCatAddOpen(false) }}
                      className="h-8 px-3 rounded-lg bg-[#9FE870] text-[#163300] text-xs font-semibold shrink-0 disabled:opacity-40">
                      Ok
                    </button>
                    <button type="button" onClick={() => { setCatAddOpen(false); setCatAddLabel('') }}
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800">
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setCatAddOpen(true)}
                    className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-gray-200 dark:border-neutral-700 px-1 py-3 text-gray-400 dark:text-neutral-600 hover:border-gray-300 dark:hover:border-neutral-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span className="font-medium text-[11px] leading-tight text-center">Toevoegen</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Pand or Eenheid ── */}
          {payStep === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">Koppelen aan een pand of eenheid?</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'pand', label: 'Pand', Icon: Building2, sub: 'Met verdeelsleutel' },
                  { key: 'eenheid', label: 'Eenheid', Icon: Home, sub: 'Specifieke huurder' },
                ] as const).map(({ key, label, Icon, sub }) => (
                  <button key={key} type="button"
                    onClick={() => { setPayLevel(key); setPayPropertyId(null); setPayUnitId(null); setPayAllocationKeyId(null); setPayStep(4) }}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors',
                      payLevel === key
                        ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                        : 'border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-neutral-600'
                    )}
                  >
                    <Icon className="h-4 w-4 mb-0.5" />
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => { setPayLevel('geen'); setPayPropertyId(null); setPayUnitId(null); setPayAllocationKeyId(null); setPayStep(4) }}
                className={cn(
                  'w-full flex items-center justify-center rounded-lg border px-4 py-2 text-xs font-medium transition-colors',
                  payLevel === 'geen'
                    ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                    : 'border-gray-200 dark:border-neutral-700 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-neutral-600 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                Niet koppelen
              </button>
            </div>
          )}

          {/* ── Step 4: Property + unit/verdeelsleutel ── */}
          {payStep === 4 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                {payLevel === 'pand' ? 'Kies een pand en verdeelsleutel' : payLevel === 'eenheid' ? 'Kies een pand en eenheid' : 'Alleen categorie wordt opgeslagen'}
              </p>
              {payLevel !== 'geen' && <>
              {/* Property picker */}
              <button type="button"
                onClick={e => {
                  const r = e.currentTarget.getBoundingClientRect()
                  setPayPickerPos({ top: r.bottom + 4, left: r.left, width: r.width })
                  setPayPropOpen(v => !v); setPayUnitOpen(false); setPayAllocOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                  payPropertyId
                    ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                    : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
                )}
              >
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{properties.find(p => p.id === payPropertyId)?.name ?? 'Pand kiezen'}</span>
                {payPropertyId ? <Check className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />}
              </button>
              {payPropOpen && payPickerPos && createPortal(
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'auto' }} onClick={() => setPayPropOpen(false)} />
                  <div style={{ position: 'fixed', top: payPickerPos.top, left: payPickerPos.left, width: payPickerPos.width, zIndex: 9999, pointerEvents: 'auto' }}
                    className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 max-h-60 overflow-y-auto"
                  >
                    {properties.map(p => {
                      const isSel = payPropertyId === p.id
                      return (
                        <button key={p.id} type="button"
                          onClick={() => { setPayPropertyId(p.id); setPayUnitId(null); setPayAllocationKeyId(null); setPayPropOpen(false) }}
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

              {/* Unit picker — eenheid level */}
              {payLevel === 'eenheid' && payPropertyId && (
                <>
                  <button type="button"
                    onClick={e => {
                      const r = e.currentTarget.getBoundingClientRect()
                      setPayPickerPos({ top: r.bottom + 4, left: r.left, width: r.width })
                      setPayUnitOpen(v => !v); setPayPropOpen(false); setPayAllocOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                      payUnitId
                        ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                        : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
                    )}
                  >
                    <Home className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{unitsForPayProperty.find(u => u.id === payUnitId)?.unit_number ?? 'Eenheid kiezen'}</span>
                    {payUnitId ? <Check className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />}
                  </button>
                  {payUnitOpen && payPickerPos && createPortal(
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'auto' }} onClick={() => setPayUnitOpen(false)} />
                      <div style={{ position: 'fixed', top: payPickerPos.top, left: payPickerPos.left, width: payPickerPos.width, zIndex: 9999, pointerEvents: 'auto' }}
                        className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 max-h-60 overflow-y-auto"
                      >
                        {unitsForPayProperty.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-gray-400">Geen eenheden gevonden</p>
                        ) : unitsForPayProperty.map(u => {
                          const isSel = payUnitId === u.id
                          return (
                            <button key={u.id} type="button"
                              onClick={() => { setPayUnitId(isSel ? null : u.id); setPayUnitOpen(false) }}
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
                </>
              )}

              {/* Allocation key picker — pand level (mandatory) */}
              {payLevel === 'pand' && payPropertyId && (
                <>
                  <button type="button"
                    onClick={e => {
                      const r = e.currentTarget.getBoundingClientRect()
                      setPayPickerPos({ top: r.bottom + 4, left: r.left, width: r.width })
                      setPayAllocOpen(v => !v); setPayPropOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                      payAllocationKeyId
                        ? 'border-[#163300] bg-[#163300]/5 text-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]/10 dark:text-[#9FE870]'
                        : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600'
                    )}
                  >
                    <span className="flex-1 text-left">{allocationKeys.find(k => k.id === payAllocationKeyId)?.name ?? (allocationKeys.length === 0 ? 'Geen verdeelsleutels beschikbaar' : 'Verdeelsleutel kiezen')}</span>
                    {payAllocationKeyId ? <Check className="h-4 w-4 shrink-0" /> : (allocationKeys.length > 0 && <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />)}
                  </button>
                  {payAllocOpen && payPickerPos && allocationKeys.length > 0 && createPortal(
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'auto' }} onClick={() => setPayAllocOpen(false)} />
                      <div style={{ position: 'fixed', top: payPickerPos.top, left: payPickerPos.left, width: payPickerPos.width, zIndex: 9999, pointerEvents: 'auto' }}
                        className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 max-h-60 overflow-y-auto"
                      >
                        {allocationKeys.map(k => {
                          const isSel = payAllocationKeyId === k.id
                          return (
                            <button key={k.id} type="button"
                              onClick={() => { setPayAllocationKeyId(isSel ? null : k.id); setPayAllocOpen(false) }}
                              className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                                isSel ? 'bg-[#163300]/5 dark:bg-[#9FE870]/10 text-[#163300] dark:text-[#9FE870] font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                              )}
                            >
                              <span className="flex-1">{k.name}</span>
                              {isSel && <Check className="h-3.5 w-3.5 shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    </>,
                    document.body
                  )}
                </>
              )}
              </>}
            </div>
          )}

          {paymentError && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">
              {paymentError}
            </p>
          )}
        </div>

        <div className={ADD_DIALOG_FOOTER_SPLIT_CLASS}>
          <button
            type="button"
            onClick={() => setShowManualPayForm(false)}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            Annuleren
          </button>

          {payStep === 1 ? (
            <button
              type="button"
              disabled={!payDate || !payAmount.trim()}
              onClick={() => setPayStep(2)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
            >
              Volgende →
            </button>
          ) : (() => {
            const payCanSave = !!payCategory && payLevel !== null && (
              payLevel === 'geen' ||
              (!!payPropertyId && (
                payLevel === 'pand' ? !!payAllocationKeyId : !!payUnitId
              ))
            )
            return (
              <button
                type="button"
                onClick={handleSaveManualPayment}
                disabled={savingPayment || !payCanSave}
                className="inline-flex items-center gap-2 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
              >
                {savingPayment && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Opslaan
              </button>
            )
          })()}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
})