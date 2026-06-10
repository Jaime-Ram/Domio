'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { propertyQueries, tenantQueries, leaseQueries, paymentQueries } from '@/lib/supabase/queries'

function fmt(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function lastMonths(n: number) {
  const out: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push({ key: `${m.getFullYear()}-${m.getMonth()}`, label: m.toLocaleDateString('nl-NL', { month: 'short' }) })
  }
  return out
}

function SectionLabel({ children, href }: { children: React.ReactNode; href?: string }) {
  const cls = 'text-sm font-semibold text-gray-500 dark:text-gray-400'
  if (href) {
    return (
      <Link href={href} className={cn(cls, 'group inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors')}>
        {children}
        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    )
  }
  return <p className={cls}>{children}</p>
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 shadow-soft px-3 py-2.5 text-xs space-y-1">
      <p className="font-medium text-gray-700 dark:text-white mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.name === 'income' ? '#163300' : '#9ca3af' }} />
          <span className="text-gray-500 dark:text-gray-400">{p.name === 'income' ? 'Huurinkomsten' : 'Uitgaven'}</span>
          <span className="font-medium text-gray-800 dark:text-white ml-auto">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function TrendBadge({ value }: { value: number }) {
  if (!value) return null
  const up = value > 0
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {up
          ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>
          : <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></>}
      </svg>
      {Math.abs(value)}%
    </span>
  )
}

function MetricItem({ label, value, href }: { label: string; value: React.ReactNode; href?: string }) {
  const inner = (
    <>
      <p className="text-xs text-gray-400 dark:text-gray-500 leading-none mb-1.5">{label}</p>
      <p className="text-2xl font-bold text-[#163300] dark:text-[#9FE870] leading-none">{value}</p>
    </>
  )
  return href ? <Link href={href} className="group">{inner}</Link> : <div>{inner}</div>
}

export default function EmployerDashboardPage() {
  const { user } = useDashboardUser()
  const [kpi, setKpi] = useState({ panden: 0, eenheden: 0, huurders: 0, bezetting: 0 })
  const [verwacht, setVerwacht] = useState(0)
  const [history, setHistory] = useState<{ month: string; income: number; uitgaven: number }[]>([])

  useEffect(() => {
    if (!user?.id) return
    const uid = user.id
    let cancelled = false

    Promise.all([
      propertyQueries.getByOwner(uid),
      tenantQueries.getByOwner(uid),
      leaseQueries.getByOwner(uid),
      paymentQueries.getByOwner(uid).catch(() => []),
    ]).then(([props, tenants, leases, payments]) => {
      if (cancelled) return
      const P = (props ?? []) as any[]
      const L = (leases ?? []) as any[]
      const PAY = (payments ?? []) as any[]

      const totalUnits = P.reduce((s, p) => s + (p.units?.length ?? 0), 0)
      const actieveHuurders = ((tenants ?? []) as any[]).filter((t) => !t.status || t.status === 'actief').length
      setKpi({
        panden: P.length,
        eenheden: totalUnits,
        huurders: actieveHuurders,
        bezetting: totalUnits > 0 ? Math.min(100, Math.round((actieveHuurders / totalUnits) * 100)) : 0,
      })

      const verwachtTotaal = L.filter((l) => l.status === 'actief').reduce((s, l) => s + Number(l.monthly_rent ?? 0), 0)
      setVerwacht(verwachtTotaal)

      // Inkomsten = positieve betalingen, uitgaven = negatieve betalingen (per maand)
      const months = lastMonths(6)
      const incomeB = new Map(months.map((m) => [m.key, 0]))
      const uitB = new Map(months.map((m) => [m.key, 0]))
      let hasIncome = false
      for (const p of PAY) {
        const amt = Number(p.amount)
        const d = new Date(p.booking_date)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (amt > 0 && incomeB.has(key)) { incomeB.set(key, (incomeB.get(key) ?? 0) + amt); hasIncome = true }
        if (amt < 0 && uitB.has(key)) { uitB.set(key, (uitB.get(key) ?? 0) + Math.abs(amt)) }
      }
      setHistory(months.map((m) => ({
        month: m.label,
        income: Math.round(hasIncome ? (incomeB.get(m.key) ?? 0) : verwachtTotaal),
        uitgaven: Math.round(uitB.get(m.key) ?? 0),
      })))
    }).catch(() => {})

    return () => { cancelled = true }
  }, [user?.id])

  const lastIncome = history[history.length - 1]?.income ?? 0
  const prevIncome = history[history.length - 2]?.income ?? lastIncome
  const incomeTrendPct = prevIncome ? Math.round(((lastIncome - prevIncome) / prevIncome) * 100) : 0

  const bezet = Math.min(kpi.huurders, kpi.eenheden)
  const leeg = Math.max(0, kpi.eenheden - bezet)
  const bezettingData = [
    { name: 'Bezet', value: bezet, color: '#163300' },
    { name: 'Leeg', value: leeg, color: '#e5e7eb' },
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_288px] gap-x-10 gap-y-8 items-stretch">

      {/* ——— Links: KPI-kaart ——— */}
      <div className="rounded-2xl bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 flex flex-col lg:flex-row">
        {/* Grafiek */}
        <div className="flex flex-col flex-1 min-w-0 p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <SectionLabel href="/dashboard/landlord/financial/betalingen">Huurinkomsten</SectionLabel>
              <div className="flex items-baseline gap-2 mt-1.5">
                <p className="text-[26px] font-bold text-[#163300] dark:text-[#9FE870] leading-none">{fmt(verwacht)}</p>
                <TrendBadge value={incomeTrendPct} />
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-full bg-[#163300] dark:bg-[#9FE870] inline-block" />
                Huurinkomsten
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-px w-3 border-t-2 border-dashed border-gray-300 dark:border-neutral-600 inline-block" />
                Uitgaven
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#163300" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#163300" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="uitgavenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.10} />
                  <stop offset="100%" stopColor="#9ca3af" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`} width={44} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="uitgaven" name="uitgaven" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#uitgavenGradient)" dot={false} activeDot={{ r: 3, fill: '#9ca3af' }} />
              <Area type="monotone" dataKey="income" name="income" stroke="#163300" strokeWidth={2.5} fill="url(#incomeGradient)" dot={false} activeDot={{ r: 4, fill: '#163300' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-gray-100 dark:bg-neutral-700 my-5 shrink-0" />

        {/* Kerncijfers */}
        <div className="flex flex-row lg:flex-col justify-around gap-4 px-5 lg:px-6 py-4 lg:py-5 lg:w-48 shrink-0 border-t lg:border-t-0 border-gray-100 dark:border-neutral-700">
          <MetricItem label="Panden" value={kpi.panden} href="/dashboard/landlord/portfolio" />
          <MetricItem label="Eenheden" value={kpi.eenheden} href="/dashboard/landlord/portfolio" />
          <MetricItem label="Huurders" value={kpi.huurders} href="/dashboard/landlord/tenants" />
          <MetricItem label="Bezetting" value={`${kpi.bezetting}%`} />
        </div>
      </div>

      {/* ——— Rechts: Bezetting ——— */}
      <div className="rounded-2xl bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 p-5 flex flex-col h-full">
        <SectionLabel>Bezetting</SectionLabel>
        <div className="flex items-baseline gap-2 mt-1.5">
          <p className="text-[26px] font-bold text-[#163300] dark:text-[#9FE870] leading-none">{kpi.bezetting}%</p>
          <span className="text-xs text-gray-400 dark:text-gray-500">{bezet} / {kpi.eenheden} eenheden</span>
        </div>

        {/* Grote donut — vult de hoogte */}
        <div className="flex-1 flex items-center justify-center min-h-[150px] py-4">
          <div className="relative h-[160px] w-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bezettingData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={78} paddingAngle={2} stroke="none">
                  {bezettingData.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[28px] font-bold text-[#163300] dark:text-[#9FE870] leading-none">{kpi.bezetting}%</span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">bezet</span>
            </div>
          </div>
        </div>

        {/* Legenda onderaan */}
        <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full shrink-0 bg-[#163300] dark:bg-[#9FE870]" />
            <span className="text-gray-500 dark:text-gray-400">Bezet</span>
            <span className="ml-auto font-semibold text-gray-700 dark:text-gray-200">{bezet}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full shrink-0 bg-gray-200 dark:bg-neutral-600" />
            <span className="text-gray-500 dark:text-gray-400">Leeg</span>
            <span className="ml-auto font-semibold text-gray-700 dark:text-gray-200">{leeg}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
