'use client'

import { useEffect, useState, useCallback, useRef, Fragment } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CreditCard,
  LayoutDashboard,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Building2,
  Send,
  CheckCircle2,
  X,
  RotateCcw,
  EyeOff,
  Eye,
  AlertTriangle,
  Minus,
  Check,
  ChevronDownIcon,
} from 'lucide-react'
import {
  CurrencyEuroCircle,
  Users01,
  CheckCircle,
} from '@untitledui/icons'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import {
  dashboardCardClass,
  DASHBOARD_TABLE_HEAD_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS,
} from '@/app/dashboard/employer/dashboard-ui'
import { DashboardTableBlock } from '@/components/dashboard/dashboard-table-block'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { MetricCard } from '@/components/finance/MetricCard'
import { cn } from '@/lib/utils'

const getFinancialNav = (basePath: string) => [
  { label: 'Dashboard', href: `${basePath}/financial`, icon: LayoutDashboard },
  { label: 'Betalingen', href: `${basePath}/financial/betalingen`, icon: CreditCard },
  { label: 'Achterstanden', href: `${basePath}/financial/achterstanden`, icon: CalendarClock },
]

// --- Types ---

interface TimelineMonth {
  period_label: string
  expected_amount: number
  received_amount: number | null
  difference: number | null
  status: string
  due_date: string
  expectation_id: string
}

interface UnitData {
  unit_id: string
  unit_number: string
  tenant_id: string | null
  tenant_name: string | null
  lease_id: string | null
  monthly_rent: number
  issue: 'achterstand' | null
  saldo: number
  total_outstanding: number
  timeline: TimelineMonth[]
  expectations: { id: string; status: string }[]
}

interface PropertyData {
  property_id: string
  property_name: string
  property_address: string
  property_city: string
  total_expected: number
  total_received: number
  units: UnitData[]
  hasIssues: boolean
}

interface PageData {
  totalOverdue: number
  tenantCount: number
  paidCount: number
  settledCount: number
  ignoredCount: number
  properties: PropertyData[]
}

// --- Helpers ---

const MONTH_NAMES: Record<string, string> = {
  '01': 'Januari', '02': 'Februari', '03': 'Maart', '04': 'April',
  '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Augustus',
  '09': 'September', '10': 'Oktober', '11': 'November', '12': 'December',
}

const formatEur = (amount: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)

const formatPeriod = (label: string) => {
  const [year, month] = label.split('-')
  return `${MONTH_NAMES[month] ?? month} ${year}`
}

const getPaymentWindow = (periodLabel: string) => {
  const [year, month] = periodLabel.split('-').map(Number)
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  return {
    start: `${prevYear}-${String(prevMonth).padStart(2, '0')}-20`,
    end: `${year}-${String(month).padStart(2, '0')}-19`,
  }
}

// Checkbox component
function Checkbox({ checked, indeterminate, onClick, className }: {
  checked: boolean
  indeterminate?: boolean
  onClick: (e: React.MouseEvent) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'h-4 w-4 rounded border-[1.5px] flex items-center justify-center transition-colors cursor-pointer shrink-0',
        checked || indeterminate
          ? 'bg-[#163300] border-[#163300] dark:bg-[#9FE870] dark:border-[#9FE870]'
          : 'border-gray-300 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-500',
        className,
      )}
      onClick={onClick}
    >
      {checked && (
        <svg className="h-3 w-3 text-white dark:text-[#163300]" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {!checked && indeterminate && (
        <Minus className="h-3 w-3 text-white dark:text-[#163300]" />
      )}
    </div>
  )
}

function TimelineStatusIcon({ month, todayStr }: { month: TimelineMonth; todayStr: string }) {
  const { status, received_amount, expected_amount, due_date } = month
  const isFuture = due_date > todayStr

  if (status === 'settled' || status === 'ignored') {
    return <Minus className="h-4 w-4 text-gray-400" />
  }
  if (isFuture && status === 'pending') {
    return <span className="h-4 w-4" />
  }
  if (status === 'paid') {
    return <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
  }
  if (status === 'partial' || (received_amount !== null && Math.abs((received_amount) - expected_amount) >= 0.01)) {
    return <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
  }
  if ((status === 'pending' || status === 'overdue') && due_date < todayStr) {
    return <X className="h-4 w-4 text-red-500 dark:text-red-400" />
  }
  return <span className="h-4 w-4" />
}

// --- Component ---

export default function AchterstandenPage() {
  const { basePath } = useDashboardUser()
  const FINANCIAL_NAV = getFinancialNav(basePath)
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)

  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set())
  const [collapsedProperties, setCollapsedProperties] = useState<Set<string>>(new Set())
  const [timelineLimits, setTimelineLimits] = useState<Map<string, number>>(new Map())
  const [showResolved, setShowResolved] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const lastClickedRef = useRef<number | null>(null)
  const [bulkProcessing, setBulkProcessing] = useState(false)

  const [toast, setToast] = useState<{ message: string; undoAction?: () => void } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  const fetchData = useCallback(async () => {
    const [propsRes, unitsRes, leasesRes, expectationsRes, assignmentsRes, txRes, resolvedRes] = await Promise.all([
      supabase.from('properties').select('id, name, address, city').order('name'),
      supabase.from('units').select('id, property_id, unit_number'),
      supabase.from('leases').select('id, unit_id, tenant_id, monthly_rent, status, tenants (full_name)').eq('status', 'actief'),
      supabase.from('rent_expectations').select('id, lease_id, tenant_id, unit_id, property_id, expected_amount, due_date, period_label, status'),
      supabase.from('payment_assignments').select('id, transaction_id, lease_id, property_id, unit_id, category'),
      supabase.from('raw_transactions').select('id, amount, value_date'),
      supabase.from('rent_expectations').select('status, period_label').in('status', ['paid', 'settled', 'ignored']),
    ])

    const properties = propsRes.data ?? []
    const units = unitsRes.data ?? []
    const leases = leasesRes.data ?? []
    const expectations = expectationsRes.data ?? []
    const assignments = assignmentsRes.data ?? []
    const transactions = txRes.data ?? []
    const resolved = resolvedRes.data ?? []

    const txMap = new Map<string, { amount: number; value_date: string }>()
    for (const tx of transactions) {
      txMap.set((tx as any).id, { amount: Number((tx as any).amount), value_date: (tx as any).value_date })
    }

    const txByLease = new Map<string, { amount: number; value_date: string }[]>()
    for (const a of assignments) {
      const aa = a as any
      if (!aa.lease_id || (aa.category && aa.category !== 'huur')) continue
      const tx = txMap.get(aa.transaction_id)
      if (!tx || !tx.value_date) continue
      const arr = txByLease.get(aa.lease_id) ?? []
      arr.push(tx)
      txByLease.set(aa.lease_id, arr)
    }

    let paidCount = 0
    let settledCount = 0
    let ignoredCount = 0
    for (const r of resolved) {
      const row = r as any
      if (row.status === 'paid' && (row.period_label as string).startsWith(currentMonth)) paidCount++
      else if (row.status === 'settled') settledCount++
      else if (row.status === 'ignored') ignoredCount++
    }

    const leaseByUnit = new Map<string, any>()
    for (const l of leases) {
      leaseByUnit.set((l as any).unit_id, l)
    }

    const expsByUnit = new Map<string, any[]>()
    for (const e of expectations) {
      const uid = (e as any).unit_id
      const arr = expsByUnit.get(uid) ?? []
      arr.push(e)
      expsByUnit.set(uid, arr)
    }

    let totalOverdue = 0
    const overduetenantIds = new Set<string>()

    const propertyDataList: PropertyData[] = properties.map((prop: any) => {
      const propUnits = units.filter((u: any) => u.property_id === prop.id)
      let propExpected = 0
      let propReceived = 0

      const unitDataList: UnitData[] = propUnits.map((unit: any) => {
        const lease = leaseByUnit.get(unit.id)
        const unitExps = (expsByUnit.get(unit.id) ?? []).sort((a: any, b: any) =>
          b.period_label.localeCompare(a.period_label)
        )

        const monthlyRent = lease ? Number((lease as any).monthly_rent) : 0
        const tenantName = lease ? (lease as any).tenants?.full_name ?? null : null
        const tenantId = lease ? (lease as any).tenant_id : null
        const leaseId = lease ? (lease as any).id : null

        const leaseTxs = leaseId ? (txByLease.get(leaseId) ?? []) : []
        const timeline: TimelineMonth[] = unitExps.map((exp: any) => {
          const window = getPaymentWindow(exp.period_label)
          const windowTxs = leaseTxs.filter(tx => tx.value_date >= window.start && tx.value_date <= window.end)
          const received = windowTxs.length > 0 ? windowTxs.reduce((s, tx) => s + tx.amount, 0) : null
          return {
            period_label: exp.period_label,
            expected_amount: Number(exp.expected_amount),
            received_amount: received,
            difference: received !== null ? received - Number(exp.expected_amount) : null,
            status: exp.status,
            due_date: exp.due_date,
            expectation_id: exp.id,
          }
        })

        let totalExpectedForSaldo = 0
        let totalReceivedForSaldo = 0
        for (const exp of unitExps) {
          const st = (exp as any).status as string
          if (st === 'settled' || st === 'ignored') continue
          totalExpectedForSaldo += Number((exp as any).expected_amount)
          const window = getPaymentWindow((exp as any).period_label)
          const windowTxs = leaseTxs.filter(tx => tx.value_date >= window.start && tx.value_date <= window.end)
          totalReceivedForSaldo += windowTxs.reduce((s, tx) => s + tx.amount, 0)
        }
        const saldo = totalExpectedForSaldo - totalReceivedForSaldo
        const totalOutstanding = Math.max(0, saldo)
        const hasAchterstand = saldo > 0.01

        const issue: UnitData['issue'] = hasAchterstand ? 'achterstand' : null

        if (hasAchterstand && tenantId) {
          totalOverdue += totalOutstanding
          overduetenantIds.add(tenantId)
        }

        for (const m of timeline) {
          propExpected += m.expected_amount
          if (m.received_amount !== null) propReceived += m.received_amount
        }

        return {
          unit_id: unit.id,
          unit_number: unit.unit_number ?? '—',
          tenant_id: tenantId,
          tenant_name: tenantName,
          lease_id: leaseId,
          monthly_rent: monthlyRent,
          issue,
          saldo,
          total_outstanding: totalOutstanding,
          timeline,
          expectations: unitExps.map((e: any) => ({ id: e.id, status: e.status })),
        }
      })

      const hasIssues = unitDataList.some((u) => u.issue !== null)

      return {
        property_id: prop.id,
        property_name: prop.name ?? 'Onbekend',
        property_address: prop.address ?? '',
        property_city: prop.city ?? '',
        total_expected: propExpected,
        total_received: propReceived,
        units: unitDataList,
        hasIssues,
      }
    })

    propertyDataList.sort((a, b) => {
      if (a.hasIssues !== b.hasIssues) return a.hasIssues ? -1 : 1
      return a.property_name.localeCompare(b.property_name)
    })

    setData({
      totalOverdue,
      tenantCount: overduetenantIds.size,
      paidCount,
      settledCount,
      ignoredCount,
      properties: propertyDataList,
    })
    setLoading(false)
  }, [todayStr, currentMonth])

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (toast) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 6000)
      return () => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      }
    }
  }, [toast])

  const toggleUnit = (unitKey: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev)
      if (next.has(unitKey)) next.delete(unitKey)
      else next.add(unitKey)
      return next
    })
  }

  const toggleProperty = (pid: string) => {
    setCollapsedProperties((prev) => {
      const next = new Set(prev)
      if (next.has(pid)) next.delete(pid)
      else next.add(pid)
      return next
    })
  }

  const allExpIds: string[] = []
  if (data) {
    for (const prop of data.properties) {
      for (const unit of prop.units) {
        if (!expandedUnits.has(unit.unit_id)) continue
        for (const month of unit.timeline) {
          const isActive = month.status === 'pending' || month.status === 'overdue'
          const isResolved = month.status === 'settled' || month.status === 'ignored'
          if (isActive || (showResolved && isResolved)) {
            allExpIds.push(month.expectation_id)
          }
        }
      }
    }
  }

  const handleExpCheckbox = (expId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const flatIndex = allExpIds.indexOf(expId)

    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (e.shiftKey && lastClickedRef.current !== null) {
        const start = Math.min(lastClickedRef.current, flatIndex)
        const end = Math.max(lastClickedRef.current, flatIndex)
        for (let i = start; i <= end; i++) {
          next.add(allExpIds[i])
        }
      } else {
        if (next.has(expId)) next.delete(expId)
        else next.add(expId)
      }
      if (flatIndex >= 0) lastClickedRef.current = flatIndex
      return next
    })
  }

  const handleUnitSelectAll = (unit: UnitData, e: React.MouseEvent) => {
    e.stopPropagation()
    const selectableIds = unit.expectations
      .filter((exp) => {
        const isActive = exp.status === 'pending' || exp.status === 'overdue'
        const isResolved = exp.status === 'settled' || exp.status === 'ignored'
        return isActive || (showResolved && isResolved)
      })
      .map((exp) => exp.id)
    const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id))

    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        selectableIds.forEach((id) => next.delete(id))
      } else {
        selectableIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    lastClickedRef.current = null
  }

  const handleBulkAction = async (action: 'settled' | 'ignored' | 'pending') => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setBulkProcessing(true)

    try {
      const res = await fetch('/api/finance/arrears/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectation_ids: ids, action }),
      })
      const result = await res.json()

      if (res.ok) {
        const savedIds = [...ids]
        const undoAction = action !== 'pending' ? () => handleUndoAction(savedIds) : undefined
        const label = action === 'settled' ? 'als voldaan gemarkeerd'
          : action === 'ignored' ? 'genegeerd'
          : 'gereset naar openstaand'

        setToast({
          message: `${result.updated} verwachting${result.updated !== 1 ? 'en' : ''} ${label}`,
          undoAction,
        })
        clearSelection()
        await fetchData()
      }
    } finally {
      setBulkProcessing(false)
    }
  }

  const handleUndoAction = async (expIds: string[]) => {
    setToast(null)
    setBulkProcessing(true)
    try {
      const res = await fetch('/api/finance/arrears/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectation_ids: expIds, action: 'pending' }),
      })
      const result = await res.json()
      if (res.ok) {
        setToast({ message: `${result.updated} verwachting${result.updated !== 1 ? 'en' : ''} ongedaan gemaakt` })
        await fetchData()
      }
    } finally {
      setBulkProcessing(false)
    }
  }

  const handleSingleAction = async (expId: string, action: 'pending' | 'paid' | 'ignored') => {
    setBulkProcessing(true)
    try {
      const res = await fetch('/api/finance/arrears/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectation_ids: [expId], action }),
      })
      const result = await res.json()
      if (res.ok) {
        const label = action === 'paid' ? 'geaccepteerd' : action === 'ignored' ? 'genegeerd' : 'gereset'
        setToast({ message: `${result.updated} verwachting ${label}` })
        await fetchData()
      }
    } finally {
      setBulkProcessing(false)
    }
  }

  const showSimpleToast = (msg: string) => setToast({ message: msg })
  const hasSelection = selectedIds.size > 0

  const issueProperties = data?.properties.filter((p) => p.hasIssues) ?? []
  const clearProperties = data?.properties.filter((p) => !p.hasIssues) ?? []

  // --- Render helpers ---

  function renderUnitRows(unit: UnitData, showCheckbox: boolean) {
    const unitKey = unit.unit_id
    const isExpanded = expandedUnits.has(unitKey)
    const selectableIds = unit.expectations
      .filter((exp) => {
        const isActive = exp.status === 'pending' || exp.status === 'overdue'
        const isResolved = exp.status === 'settled' || exp.status === 'ignored'
        return isActive || (showResolved && isResolved)
      })
      .map((exp) => exp.id)
    const selectedCount = selectableIds.filter((id) => selectedIds.has(id)).length
    const allSelected = selectableIds.length > 0 && selectedCount === selectableIds.length
    const someSelected = selectedCount > 0 && !allSelected

    const timelineLimit = timelineLimits.get(unitKey) ?? 12
    const filteredTimeline = showResolved
      ? unit.timeline
      : unit.timeline.filter((m) => m.status !== 'settled' && m.status !== 'ignored')
    const visibleTimeline = filteredTimeline.slice(0, timelineLimit)
    const hasMoreMonths = filteredTimeline.length > timelineLimit

    const totalExpected = unit.timeline.reduce((s, m) => s + m.expected_amount, 0)
    const totalReceived = unit.timeline.reduce((s, m) => s + (m.received_amount ?? 0), 0)
    const totalOpen = totalExpected - totalReceived

    return (
      <Fragment key={unitKey}>
        {/* Unit row */}
        <TableRow
          className={cn(
            'cursor-pointer',
            someSelected || allSelected ? '!bg-blue-50/50 dark:!bg-blue-900/5' : undefined
          )}
          onClick={() => toggleUnit(unitKey)}
        >
          {/* Checkbox */}
          <TableCell className="py-3 pl-3.5 pr-0 w-[32px]">
            {showCheckbox && selectableIds.length > 0 ? (
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onClick={(e) => {
                  if (!isExpanded) {
                    setExpandedUnits((prev) => new Set(prev).add(unitKey))
                  }
                  handleUnitSelectAll(unit, e)
                }}
              />
            ) : <div className="w-4" />}
          </TableCell>

          {/* Unit number + chevron */}
          <TableCell className="py-3 w-[96px]">
            <div className="flex items-center gap-1.5">
              {isExpanded
                ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                : <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              }
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{unit.unit_number}</span>
            </div>
          </TableCell>

          {/* Tenant name + badge */}
          <TableCell className="py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {unit.tenant_name ?? <span className="text-gray-400 dark:text-gray-500 italic">Leegstand</span>}
              </span>
              {unit.issue === 'achterstand' ? (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 whitespace-nowrap text-xs shrink-0">Achterstand</Badge>
              ) : unit.saldo < -0.01 ? (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 whitespace-nowrap text-xs shrink-0">Vooruitbetaald</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 whitespace-nowrap text-xs shrink-0">Up-to-date</Badge>
              )}
            </div>
          </TableCell>

          {/* Huurprijs */}
          <TableCell className="py-3 text-right w-[112px]">
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {formatEur(unit.monthly_rent)}
            </span>
          </TableCell>

          {/* Achterstallig */}
          <TableCell className="py-3 text-right w-[120px]">
            <span className={cn(
              'text-sm whitespace-nowrap',
              unit.issue === 'achterstand'
                ? 'font-semibold text-red-600 dark:text-red-400'
                : unit.saldo < -0.01
                  ? 'font-semibold text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500'
            )}>
              {unit.issue === 'achterstand'
                ? formatEur(unit.total_outstanding)
                : unit.saldo < -0.01
                  ? formatEur(Math.abs(unit.saldo))
                  : '—'}
            </span>
          </TableCell>

          {/* Verschil — empty at unit level */}
          <TableCell className="w-[100px]" />

          {/* Action */}
          <TableCell className="py-3 text-right w-[140px]" onClick={(e) => e.stopPropagation()}>
            {unit.tenant_name && (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => showSimpleToast('Binnenkort beschikbaar')}
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                <span className="hidden lg:inline">Herinnering</span>
              </Button>
            )}
          </TableCell>
        </TableRow>

        {/* Expanded timeline rows */}
        {isExpanded && (
          <>
            {/* Timeline sub-header */}
            <TableRow className="hover:!bg-transparent">
              <TableCell colSpan={2} className="!bg-gray-50/80 dark:!bg-neutral-800/20 py-2" />
              <TableCell className="!bg-gray-50/80 dark:!bg-neutral-800/20 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Periode
              </TableCell>
              <TableCell className="!bg-gray-50/80 dark:!bg-neutral-800/20 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">
                Verwacht
              </TableCell>
              <TableCell className="!bg-gray-50/80 dark:!bg-neutral-800/20 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">
                Ontvangen
              </TableCell>
              <TableCell className="!bg-gray-50/80 dark:!bg-neutral-800/20 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">
                Verschil
              </TableCell>
              <TableCell className="!bg-gray-50/80 dark:!bg-neutral-800/20 py-2" />
            </TableRow>

            {/* Timeline rows */}
            {visibleTimeline.map((month) => {
              const isActive = month.status === 'pending' || month.status === 'overdue'
              const isResolved = month.status === 'settled' || month.status === 'ignored'
              const isSelectable = isActive || (showResolved && isResolved)
              const isSelected = selectedIds.has(month.expectation_id)

              const hasDiscrepancy = !isResolved && month.status !== 'paid' && month.received_amount !== null &&
                Math.abs(month.received_amount - month.expected_amount) >= 0.01
              const isAcceptedDiscrepancy = month.status === 'paid' && month.received_amount !== null &&
                Math.abs(month.received_amount - month.expected_amount) >= 0.01

              const rowBg = isSelected
                ? '!bg-blue-50 dark:!bg-blue-900/10'
                : isResolved
                  ? '!bg-gray-50/80 dark:!bg-neutral-800/30'
                  : '!bg-gray-50/40 dark:!bg-neutral-900/30'

              return (
                <TableRow key={month.expectation_id} className={cn('hover:!bg-transparent', rowBg)}>
                  {/* Checkbox */}
                  <TableCell className={cn('pl-3.5 pr-0 py-2.5', rowBg)}>
                    {isSelectable ? (
                      <Checkbox
                        checked={isSelected}
                        onClick={(e) => handleExpCheckbox(month.expectation_id, e)}
                      />
                    ) : <div className="w-4" />}
                  </TableCell>

                  {/* Empty unit-number col */}
                  <TableCell className={cn('py-2.5', rowBg)} />

                  {/* Period + badges */}
                  <TableCell className={cn('py-2.5', rowBg)}>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-sm',
                        isResolved ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
                      )}>
                        {formatPeriod(month.period_label)}
                      </span>
                      {isResolved && month.status === 'settled' && (
                        <Badge className="bg-gray-100 text-gray-500 dark:bg-neutral-700 dark:text-gray-400 text-[10px] px-1.5 py-0">Voldaan</Badge>
                      )}
                      {isResolved && month.status === 'ignored' && (
                        <Badge className="bg-gray-100 text-gray-400 dark:bg-neutral-700 dark:text-gray-500 text-[10px] px-1.5 py-0">Genegeerd</Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Verwacht */}
                  <TableCell className={cn('py-2.5 text-right', rowBg)}>
                    <span className={cn(
                      'text-sm whitespace-nowrap',
                      isResolved ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'
                    )}>
                      {formatEur(month.expected_amount)}
                    </span>
                  </TableCell>

                  {/* Ontvangen */}
                  <TableCell className={cn('py-2.5 text-right', rowBg)}>
                    <span className={cn(
                      'text-sm whitespace-nowrap',
                      isResolved
                        ? 'text-gray-400 dark:text-gray-500'
                        : month.received_amount !== null
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-500'
                    )}>
                      {month.received_amount !== null ? formatEur(month.received_amount) : '—'}
                    </span>
                  </TableCell>

                  {/* Verschil */}
                  <TableCell className={cn('py-2.5 text-right', rowBg)}>
                    <span className={cn(
                      'text-sm whitespace-nowrap font-medium',
                      isResolved || isAcceptedDiscrepancy
                        ? 'text-gray-400 dark:text-gray-500'
                        : month.difference === null
                          ? 'text-gray-400'
                          : month.difference < -0.01
                            ? 'text-red-600 dark:text-red-400'
                            : month.difference > 0.01
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-500'
                    )}>
                      {month.difference !== null
                        ? `${month.difference >= 0 ? '+' : ''}${formatEur(month.difference)}`
                        : '—'}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className={cn('py-2.5 text-right', rowBg)}>
                    {hasDiscrepancy ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSingleAction(month.expectation_id, 'paid')}
                          disabled={bulkProcessing}
                          className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors flex items-center gap-0.5 disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" />
                          Accepteren
                        </button>
                        <button
                          onClick={() => handleSingleAction(month.expectation_id, 'ignored')}
                          disabled={bulkProcessing}
                          className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors flex items-center gap-0.5 disabled:opacity-50"
                        >
                          <EyeOff className="h-3 w-3" />
                          Negeren
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <TimelineStatusIcon month={month} todayStr={todayStr} />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}

            {/* Show more */}
            {hasMoreMonths && (
              <TableRow className="hover:!bg-transparent">
                <TableCell colSpan={7} className="!bg-gray-50/40 dark:!bg-neutral-900/30 py-2 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 dark:text-gray-400"
                    onClick={() => setTimelineLimits((prev) => {
                      const next = new Map(prev)
                      next.set(unitKey, timelineLimit + 12)
                      return next
                    })}
                  >
                    <ChevronDownIcon className="h-3.5 w-3.5 mr-1" />
                    Toon meer ({filteredTimeline.length - timelineLimit} maanden)
                  </Button>
                </TableCell>
              </TableRow>
            )}

            {/* Summary row */}
            {unit.timeline.length > 0 && (
              <TableRow className="hover:!bg-transparent">
                <TableCell colSpan={3} className="!bg-gray-100/60 dark:!bg-neutral-800/40 py-2.5" />
                <TableCell className="!bg-gray-100/60 dark:!bg-neutral-800/40 py-2.5 text-right">
                  <strong className="text-sm text-gray-700 dark:text-gray-300">{formatEur(totalExpected)}</strong>
                </TableCell>
                <TableCell className="!bg-gray-100/60 dark:!bg-neutral-800/40 py-2.5 text-right">
                  <strong className="text-sm text-gray-700 dark:text-gray-300">{formatEur(totalReceived)}</strong>
                </TableCell>
                <TableCell className="!bg-gray-100/60 dark:!bg-neutral-800/40 py-2.5 text-right">
                  <strong className={cn('text-sm', totalOpen > 0.01 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300')}>
                    {formatEur(totalOpen)}
                  </strong>
                </TableCell>
                <TableCell className="!bg-gray-100/60 dark:!bg-neutral-800/40 py-2.5" />
              </TableRow>
            )}
          </>
        )}
      </Fragment>
    )
  }

  function renderSection(properties: PropertyData[], variant: 'issue' | 'normal') {
    return (
      <DashboardTableBlock empty={properties.length === 0}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-[32px] pl-3.5 pr-0')} />
              <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-[96px]')}>Eenheid</TableHead>
              <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Huurder</TableHead>
              <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-[112px] text-right')}>Huurprijs</TableHead>
              <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-[120px] text-right')}>Achterstallig</TableHead>
              <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-[100px] text-right')}>Verschil</TableHead>
              <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-[140px]')} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((prop) => {
              const isCollapsed = collapsedProperties.has(prop.property_id)
              const unitsToShow = variant === 'issue'
                ? prop.units.filter((u) => u.issue !== null)
                : prop.units
              const issueCount = prop.units.filter((u) => u.issue !== null).length

              return (
                <Fragment key={prop.property_id}>
                  {/* Property header row */}
                  <TableRow
                    className="cursor-pointer hover:!bg-transparent"
                    onClick={() => toggleProperty(prop.property_id)}
                  >
                    <TableCell
                      colSpan={7}
                      className={cn(
                        'py-3 px-4',
                        variant === 'issue'
                          ? '!bg-amber-50/70 dark:!bg-amber-900/10'
                          : '!bg-gray-50 dark:!bg-neutral-800/50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {isCollapsed
                          ? <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                          : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                        }
                        <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {prop.property_name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {prop.property_address}{prop.property_city ? `, ${prop.property_city}` : ''}
                        </span>
                        <div className="ml-auto flex items-center gap-4 shrink-0">
                          {variant === 'normal' && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {prop.units.length} eenhe{prop.units.length !== 1 ? 'den' : 'id'}
                            </span>
                          )}
                          {variant === 'issue' && issueCount > 0 && (
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                              {issueCount} eenhe{issueCount !== 1 ? 'den' : 'id'} met problemen
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Unit rows */}
                  {!isCollapsed && unitsToShow.map((unit) => renderUnitRows(unit, variant === 'issue'))}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </DashboardTableBlock>
    )
  }

  return (
    <div className="space-y-content-blocks">
      <SectionNavDashboard title="Financieel" items={FINANCIAL_NAV} titleVariant="hero" />

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Laden...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Section 1 — Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Totaal achterstallig"
              value={formatEur(data.totalOverdue)}
              icon={<CurrencyEuroCircle />}
              accent="red"
            />
            <MetricCard
              label="Huurders met achterstand"
              value={String(data.tenantCount)}
              subtitle={data.tenantCount === 1 ? 'huurder' : 'huurders'}
              icon={<Users01 className="h-5 w-5" />}
              accent="amber"
            />
            <MetricCard
              label="Afgehandeld"
              value={String(data.paidCount + data.settledCount + data.ignoredCount)}
              subtitle={`${data.paidCount} betaald · ${data.settledCount} voldaan · ${data.ignoredCount} genegeerd`}
              icon={<CheckCircle />}
              accent="green"
            />
          </div>

          {/* Section 2 — Actie vereist */}
          <Card className={dashboardCardClass()}>
            <CardHeader className={cn(DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS, 'space-y-0')}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Actie vereist
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs text-gray-500 dark:text-gray-400"
                  onClick={() => setShowResolved((v) => !v)}
                >
                  {showResolved ? (
                    <><EyeOff className="h-3.5 w-3.5 mr-1.5" />Verberg afgehandeld</>
                  ) : (
                    <><Eye className="h-3.5 w-3.5 mr-1.5" />Toon afgehandeld</>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className={cn('p-0 px-0 pb-0', DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS)}>
              {issueProperties.length === 0 ? (
                <div className="flex items-center gap-3 py-8 px-4 justify-center">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Alle huurders zijn up-to-date
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Geen achterstanden gevonden.
                    </p>
                  </div>
                </div>
              ) : renderSection(issueProperties, 'issue')}
            </CardContent>
          </Card>

          {/* Section 3 — Alle panden */}
          {clearProperties.length > 0 && (
            <Card className={dashboardCardClass()}>
              <CardHeader className={cn(DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS, 'space-y-0')}>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Alle panden
                </h3>
              </CardHeader>
              <CardContent className={cn('p-0 px-0 pb-0', DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS)}>
                {renderSection(clearProperties, 'normal')}
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {/* Floating bulk action bar */}
      {hasSelection && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-900 dark:bg-white px-5 py-3 shadow-2xl">
            <span className="text-sm font-medium text-white dark:text-gray-900 whitespace-nowrap">
              {selectedIds.size} maand{selectedIds.size !== 1 ? 'en' : ''} geselecteerd
            </span>
            <div className="h-5 w-px bg-gray-700 dark:bg-gray-300" />
            <Button
              size="sm"
              disabled={bulkProcessing}
              className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
              onClick={() => handleBulkAction('settled')}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Markeer als voldaan
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={bulkProcessing}
              className="rounded-full text-xs h-8 bg-gray-700 hover:bg-gray-600 text-gray-200 dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-800"
              onClick={() => handleBulkAction('ignored')}
            >
              <EyeOff className="h-3.5 w-3.5 mr-1" />
              Negeren
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkProcessing}
              className="rounded-full text-xs h-8 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 dark:border-gray-400 dark:text-gray-600 dark:hover:text-gray-900 dark:hover:border-gray-500"
              onClick={() => handleBulkAction('pending')}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
            <div className="h-5 w-px bg-gray-700 dark:bg-gray-300" />
            <button
              onClick={clearSelection}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-200 dark:hover:text-gray-700 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && !hasSelection && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 rounded-full bg-gray-900 dark:bg-white px-5 py-2.5 shadow-lg">
            <span className="text-sm font-medium text-white dark:text-gray-900">
              {toast.message}
            </span>
            {toast.undoAction && (
              <button
                onClick={toast.undoAction}
                className="text-sm font-medium text-[#9FE870] dark:text-[#163300] hover:underline whitespace-nowrap"
              >
                Ongedaan maken
              </button>
            )}
            <button
              onClick={() => setToast(null)}
              className="text-gray-500 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
