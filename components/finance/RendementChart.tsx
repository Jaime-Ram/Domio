'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { BarChartSquare02 } from '@untitledui/icons'
import { Search, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────

type ChartView = 'inkomsten' | 'kosten'
type ChartPeriod = '1W' | '1M' | '3M' | '1J' | 'MAX'

const CHART_PERIODS: { key: ChartPeriod; label: string }[] = [
  { key: '1W', label: '1W' },
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
  { key: '1J', label: '1J' },
  { key: 'MAX', label: 'MAX' },
]

const INCOME_CATEGORIES = ['huur', 'overig'] as const
const EXPENSE_CATEGORIES = ['onderhoud', 'verzekering', 'belasting', 'energie', 'vve', 'hypotheek', 'beheer', 'overig'] as const

const INCOME_COLORS: Record<string, string> = {
  huur: '#22c55e',
  overig: '#9ca3af',
}

const EXPENSE_COLORS: Record<string, string> = {
  onderhoud: '#3b82f6',
  verzekering: '#a855f7',
  belasting: '#f59e0b',
  energie: '#14b8a6',
  vve: '#ec4899',
  hypotheek: '#f87171',
  beheer: '#6b7280',
  overig: '#d1d5db',
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
  overig: 'Overig',
}

// ─── Helpers ──────────────────────────────────────────────────────────

const formatEur = (amount: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function getChartRange(period: ChartPeriod): { start: string; end: string } | null {
  const now = new Date()
  let start: Date
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  switch (period) {
    case '1W':
      start = new Date(now)
      start.setDate(now.getDate() - 6)
      break
    case '1M':
      start = new Date(now)
      start.setMonth(now.getMonth() - 1)
      break
    case '3M':
      start = new Date(now)
      start.setMonth(now.getMonth() - 3)
      break
    case '1J':
      start = new Date(now)
      start.setFullYear(now.getFullYear() - 1)
      break
    case 'MAX':
      return null
  }

  return { start: fmtDate(start!), end: fmtDate(end) }
}

interface Bucket { start: string; end: string; label: string }

function getBuckets(period: ChartPeriod): Bucket[] {
  const range = getChartRange(period)
  const now = new Date()
  const buckets: Bucket[] = []

  if (period === '1W' || period === '1M') {
    // Daily buckets
    const startDate = range ? new Date(range.start) : new Date(now.getFullYear() - 5, 0, 1)
    const endDate = range ? new Date(range.end) : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    let cursor = new Date(startDate)
    while (cursor < endDate) {
      const next = new Date(cursor)
      next.setDate(cursor.getDate() + 1)
      buckets.push({
        start: fmtDate(cursor),
        end: fmtDate(next),
        label: cursor.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
      })
      cursor = next
    }
  } else if (period === '3M') {
    // Weekly buckets
    const startDate = new Date(range!.start)
    const endDate = new Date(range!.end)
    // Align to Monday
    const day = startDate.getDay()
    const diff = day === 0 ? 6 : day - 1
    startDate.setDate(startDate.getDate() - diff)
    let cursor = new Date(startDate)
    while (cursor < endDate) {
      const next = new Date(cursor)
      next.setDate(cursor.getDate() + 7)
      const weekEnd = new Date(next)
      weekEnd.setDate(weekEnd.getDate() - 1)
      buckets.push({
        start: fmtDate(cursor),
        end: fmtDate(next),
        label: `${cursor.getDate()} ${cursor.toLocaleDateString('nl-NL', { month: 'short' })}`,
      })
      cursor = next
    }
  } else {
    // Monthly buckets (1J, MAX)
    const startDate = range ? new Date(range.start) : null
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // For MAX, start from 2 years ago or use first data
    let cursor = startDate
      ? new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      : new Date(now.getFullYear() - 2, 0, 1)

    while (cursor < endDate) {
      const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
      buckets.push({
        start: fmtDate(cursor),
        end: fmtDate(next),
        label: cursor.toLocaleDateString('nl-NL', { month: 'short', year: period === 'MAX' ? '2-digit' : undefined }),
      })
      cursor = next
    }
  }
  return buckets
}

// ─── Tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, view }: any) {
  if (!active || !payload?.length) return null
  const colors = view === 'inkomsten' ? INCOME_COLORS : EXPENSE_COLORS
  const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0)
  return (
    <div className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2.5 shadow-lg text-sm min-w-[160px]">
      <p className="font-medium text-gray-900 dark:text-white mb-1.5">{label}</p>
      <p className="text-xs text-gray-500 mb-1">Totaal: {formatEur(total)}</p>
      <div className="space-y-0.5">
        {payload.filter((p: any) => p.value > 0).map((entry: any) => (
          <p key={entry.dataKey} className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: colors[entry.dataKey] || '#ccc' }} />
            {CATEGORY_LABELS[entry.dataKey] ?? entry.dataKey}: {formatEur(entry.value)}
          </p>
        ))}
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────

interface RendementChartProps {
  properties: { id: string; name: string }[]
}

export function RendementChart({ properties }: RendementChartProps) {
  const [view, setView] = useState<ChartView>('inkomsten')
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('1J')
  const [propertyFilter, setPropertyFilter] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [chartData, setChartData] = useState<Record<string, any>[]>([])
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [chartLoading, setChartLoading] = useState(true)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredProperties = useMemo(() => {
    if (!searchQuery) return properties
    const q = searchQuery.toLowerCase()
    return properties.filter(p => p.name.toLowerCase().includes(q))
  }, [properties, searchQuery])

  const selectedPropertyName = propertyFilter
    ? properties.find(p => p.id === propertyFilter)?.name ?? null
    : null

  const fetchChartData = useCallback(async () => {
    setChartLoading(true)

    const buckets = getBuckets(chartPeriod)
    const range = getChartRange(chartPeriod)

    // Fetch raw data
    const [txRes, assignRes, manualRes] = await Promise.all([
      supabase.from('raw_transactions').select('id, amount, value_date'),
      supabase.from('payment_assignments').select('id, transaction_id, property_id, category'),
      (supabase as any).from('manual_expenses').select('id, property_id, category, amount, date'),
    ])

    const allTx = txRes.data ?? []
    const assignments = assignRes.data ?? []
    const manualExpenses = (manualRes.data ?? []) as any[]

    const txMap = new Map<string, { amount: number; value_date: string | null }>(
      allTx.map((t: any) => [t.id, { amount: Number(t.amount), value_date: t.value_date }])
    )

    // Filter by date range
    const filteredAssignments = assignments.filter((a: any) => {
      if (!range) return true
      const tx = txMap.get(a.transaction_id)
      if (!tx?.value_date) return false
      return tx.value_date >= range.start && tx.value_date < range.end
    })

    const filteredManual = manualExpenses.filter((m: any) => {
      if (!range) return true
      return m.date >= range.start && m.date < range.end
    })

    // Apply property filter
    const propFilter = propertyFilter
    const pAssignments = propFilter
      ? filteredAssignments.filter((a: any) => a.property_id === propFilter)
      : filteredAssignments
    const pManual = propFilter
      ? filteredManual.filter((m: any) => m.property_id === propFilter)
      : filteredManual

    const expenseCategories = new Set(['onderhoud', 'verzekering', 'belasting', 'energie', 'vve', 'hypotheek', 'beheer', 'overig'])
    const activeCats = new Set<string>()

    const data = buckets.map((bucket) => {
      const row: Record<string, any> = { label: bucket.label }

      if (view === 'inkomsten') {
        let huur = 0
        let overig = 0
        for (const a of pAssignments) {
          const tx = txMap.get((a as any).transaction_id)
          if (!tx?.value_date) continue
          if (tx.value_date < bucket.start || tx.value_date >= bucket.end) continue
          const cat = (a as any).category
          if (!cat || cat === 'huur') {
            huur += tx.amount
          } else if (!expenseCategories.has(cat)) {
            overig += tx.amount
          }
        }
        if (huur > 0) activeCats.add('huur')
        if (overig > 0) activeCats.add('overig')
        row.huur = huur
        row.overig = overig
      } else {
        const catTotals: Record<string, number> = {}
        for (const cat of EXPENSE_CATEGORIES) catTotals[cat] = 0

        // Auto expenses from assignments
        for (const a of pAssignments) {
          const tx = txMap.get((a as any).transaction_id)
          if (!tx?.value_date) continue
          if (tx.value_date < bucket.start || tx.value_date >= bucket.end) continue
          const cat = (a as any).category as string
          if (cat && expenseCategories.has(cat)) {
            catTotals[cat] = (catTotals[cat] ?? 0) + Math.abs(tx.amount)
          }
        }

        // Manual expenses
        for (const m of pManual) {
          if (m.date < bucket.start || m.date >= bucket.end) continue
          const cat = m.category as string
          catTotals[cat] = (catTotals[cat] ?? 0) + Math.abs(Number(m.amount))
        }

        for (const [cat, val] of Object.entries(catTotals)) {
          if (val > 0) activeCats.add(cat)
          row[cat] = val
        }
      }
      return row
    })

    setChartData(data)
    setActiveCategories([...activeCats])
    setChartLoading(false)
  }, [view, chartPeriod, propertyFilter])

  useEffect(() => { fetchChartData() }, [fetchChartData])

  const colors = view === 'inkomsten' ? INCOME_COLORS : EXPENSE_COLORS
  const categories = view === 'inkomsten' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const visibleCategories = (categories as readonly string[]).filter(c => activeCategories.includes(c))
  const hasData = chartData.some(row =>
    visibleCategories.some(cat => (row[cat] ?? 0) > 0)
  )

  return (
    <Card className={dashboardCardClass()}>
      <CardContent className="pt-5 pb-4 px-5">
        {/* Controls row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Left: View toggle */}
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-neutral-800 p-0.5">
            <button
              onClick={() => setView('inkomsten')}
              className={cn(
                'px-3.5 py-1.5 text-sm font-medium rounded-md transition-all',
                view === 'inkomsten'
                  ? 'bg-white dark:bg-neutral-700 text-green-700 dark:text-green-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              Inkomsten
            </button>
            <button
              onClick={() => setView('kosten')}
              className={cn(
                'px-3.5 py-1.5 text-sm font-medium rounded-md transition-all',
                view === 'kosten'
                  ? 'bg-white dark:bg-neutral-700 text-red-700 dark:text-red-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              Kosten
            </button>
          </div>

          {/* Right: Property filter */}
          <div ref={searchRef} className="relative">
            {selectedPropertyName ? (
              <button
                onClick={() => { setPropertyFilter(null); setSearchQuery('') }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
              >
                {selectedPropertyName}
                <X className="h-3.5 w-3.5 text-gray-400" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => inputRef.current?.focus(), 50) }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <Search className="h-3.5 w-3.5" />
                  Alle panden
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-1 z-20 w-64 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-neutral-800">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Zoek pand..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <button
                        onClick={() => { setPropertyFilter(null); setSearchOpen(false); setSearchQuery('') }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800"
                      >
                        Alle panden
                      </button>
                      {filteredProperties.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setPropertyFilter(p.id); setSearchOpen(false); setSearchQuery('') }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800"
                        >
                          {p.name}
                        </button>
                      ))}
                      {filteredProperties.length === 0 && (
                        <p className="px-3 py-2 text-sm text-gray-400">Geen resultaten</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Chart area */}
        <div className="h-[320px]">
          {chartLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-400">Laden...</p>
            </div>
          ) : !hasData ? (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <BarChartSquare02 className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400">Geen gegevens voor deze periode</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156,163,175,0.15)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => formatEur(v)}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip
                  content={<ChartTooltip view={view} />}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                {visibleCategories.map((cat, i) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    name={CATEGORY_LABELS[cat] ?? cat}
                    fill={colors[cat]}
                    stackId="stack"
                    radius={i === visibleCategories.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                    animationDuration={400}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        {hasData && visibleCategories.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 mb-2 justify-center">
            {visibleCategories.map(cat => (
              <div key={cat} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colors[cat] }} />
                {CATEGORY_LABELS[cat] ?? cat}
              </div>
            ))}
          </div>
        )}

        {/* Period selector (Trading212 style) */}
        <div className="flex items-center justify-center gap-1 mt-1">
          {CHART_PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setChartPeriod(key)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full transition-all',
                chartPeriod === key
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
