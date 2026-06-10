'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { ArrowUpRight, X, Euro, Wrench, FileText, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  recentActivities as demoActivities,
  complianceAlerts as demoCompliance, upcomingTasks as demoTasks, monthlyFinancials as demoFin,
} from '@/lib/mock-data/domio-dashboard'
import { ActionListRow } from '@/components/ui/action-list'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import {
  ticketQueries, propertyQueries, tenantQueries,
  leaseQueries, paymentQueries, taskQueries, wwsQueries,
} from '@/lib/supabase/queries'

const DONUT_COLORS = ['#163300', '#5b8c3e', '#9FE870', '#cbd5e1', '#94a3b8']

function fmt(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days <= 0) return 'vandaag'
  if (days === 1) return 'gisteren'
  if (days < 7) return `${days} dagen geleden`
  if (days < 30) return `${Math.floor(days / 7)} wk geleden`
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
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
          <span className="h-2 w-2 rounded-full shrink-0 bg-[#163300]" />
          <span className="text-gray-500 dark:text-gray-400">Ontvangen</span>
          <span className="font-medium text-gray-800 dark:text-white ml-auto">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const SLA_HOURS: Record<string, number> = { urgent: 4, hoog: 24, normaal: 72, laag: 168 }

type LiveTicket = {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
  source?: string | null
  sla_deadline?: string | null
  category?: string | null
  tenant?: string | null
  property?: string | null
}

function isSlaOver(t: LiveTicket) {
  if (t.status === 'afgerond' || t.status === 'geannuleerd') return false
  const created = new Date(t.created_at)
  const deadline = t.sla_deadline
    ? new Date(t.sla_deadline)
    : new Date(created.getTime() + (SLA_HOURS[t.priority] ?? 72) * 3600000)
  return deadline.getTime() < Date.now()
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

type Activity = { id: string; type: string; title: string; subtitle: string; amount: number | null; time: string }
type TaskRow = { id: string; title: string; date: string; subtitle?: string }
type ComplianceRow = { address: string; label: string }
type DonutRow = { name: string; value: number; color: string }

export default function EmployerDashboardPage() {
  const { user, isDemo } = useDashboardUser()
  const [dismissed, setDismissed] = useState<string[]>([])
  const [checkedTasks, setCheckedTasks] = useState<string[]>([])

  const [kpi, setKpi] = useState({ panden: 0, eenheden: 0, huurders: 0, bezetting: 0 })
  const [liveTickets, setLiveTickets] = useState<LiveTicket[]>([])
  const [verwacht, setVerwacht] = useState(0)
  const [ontvangenMaand, setOntvangenMaand] = useState(0)
  const [history, setHistory] = useState<{ month: string; income: number }[]>([])
  const [perPand, setPerPand] = useState<DonutRow[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [compliance, setCompliance] = useState<ComplianceRow[]>([])

  // ── Demo: showcase-data ──
  useEffect(() => {
    if (!isDemo) return
    setKpi({ panden: 12, eenheden: 24, huurders: 18, bezetting: 92 })
    setVerwacht(demoFin.huurinkomsten)
    setOntvangenMaand(demoFin.huurinkomsten - 1200)
    setHistory([
      { month: 'Okt', income: 26200 }, { month: 'Nov', income: 26800 }, { month: 'Dec', income: 27100 },
      { month: 'Jan', income: 27600 }, { month: 'Feb', income: 27900 }, { month: 'Mrt', income: 28400 },
    ])
    setPerPand([
      { name: 'Keizersgracht', value: 12400, color: DONUT_COLORS[0] },
      { name: 'Jordaan', value: 9800, color: DONUT_COLORS[1] },
      { name: 'De Pijp', value: 6200, color: DONUT_COLORS[2] },
    ])
    setActivities(demoActivities as any)
    setTasks(demoTasks.map((t) => ({ id: t.id, title: t.title, date: t.date, subtitle: t.subtitle })))
    setCompliance(demoCompliance.map((c) => ({ address: c.address, label: c.label })))
  }, [isDemo])

  // ── Echte accountdata ──
  useEffect(() => {
    if (isDemo || !user?.id) return
    const uid = user.id
    let cancelled = false

    Promise.all([
      propertyQueries.getByOwner(uid),
      tenantQueries.getByOwner(uid),
      leaseQueries.getByOwner(uid),
      paymentQueries.getByOwner(uid).catch(() => []),
      taskQueries.getByOwner(uid).catch(() => []),
      wwsQueries.getByOwner(uid).catch(() => []),
      ticketQueries.getByOwner(uid).catch(() => []),
    ]).then(([props, tenants, leases, payments, taskRows, wws, tickets]) => {
      if (cancelled) return
      const P = (props ?? []) as any[]
      const L = (leases ?? []) as any[]
      const PAY = (payments ?? []) as any[]

      // KPI
      const totalUnits = P.reduce((s, p) => s + (p.units?.length ?? 0), 0)
      const actieveHuurders = ((tenants ?? []) as any[]).filter((t) => !t.status || t.status === 'actief').length
      setKpi({
        panden: P.length,
        eenheden: totalUnits,
        huurders: actieveHuurders,
        bezetting: totalUnits > 0 ? Math.min(100, Math.round((actieveHuurders / totalUnits) * 100)) : 0,
      })

      // Huurinkomsten (verwacht) = som actieve leases
      const actieveLeases = L.filter((l) => l.status === 'actief')
      const verwachtTotaal = actieveLeases.reduce((s, l) => s + Number(l.monthly_rent ?? 0), 0)
      setVerwacht(verwachtTotaal)

      // Inkomsten per pand (donut)
      const perPandMap = new Map<string, number>()
      for (const l of actieveLeases) {
        const naam = l.units?.properties?.name || l.units?.properties?.address || 'Onbekend'
        perPandMap.set(naam, (perPandMap.get(naam) ?? 0) + Number(l.monthly_rent ?? 0))
      }
      const perPandSorted = [...perPandMap.entries()].sort((a, b) => b[1] - a[1])
      const top = perPandSorted.slice(0, 4)
      const rest = perPandSorted.slice(4).reduce((s, [, v]) => s + v, 0)
      const donut = top.map(([name, value], i) => ({ name, value, color: DONUT_COLORS[i] }))
      if (rest > 0) donut.push({ name: 'Overig', value: rest, color: DONUT_COLORS[4] })
      setPerPand(donut)

      // Inkomende betalingen (amount > 0)
      const incoming = PAY.filter((p) => Number(p.amount) > 0)
      const months = lastMonths(6)
      const bucket = new Map(months.map((m) => [m.key, 0]))
      for (const p of incoming) {
        const d = new Date(p.booking_date)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (bucket.has(key)) bucket.set(key, (bucket.get(key) ?? 0) + Number(p.amount))
      }
      const hist = months.map((m) => ({ month: m.label, income: Math.round(bucket.get(m.key) ?? 0) }))
      // Geen betalingsdata? Toon de verwachte maandhuur als vlakke lijn.
      const hasPayments = incoming.length > 0
      setHistory(hasPayments ? hist : months.map((m) => ({ month: m.label, income: Math.round(verwachtTotaal) })))

      // Ontvangen deze maand
      const now = new Date()
      const ontvangen = incoming
        .filter((p) => { const d = new Date(p.booking_date); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() })
        .reduce((s, p) => s + Number(p.amount), 0)
      setOntvangenMaand(Math.round(ontvangen))

      // Recente activiteit = laatste inkomende betalingen
      setActivities(
        incoming.slice(0, 5).map((p) => ({
          id: p.id,
          type: 'huur_ontvangen',
          title: p.counterparty_name || 'Huurbetaling ontvangen',
          subtitle: p.properties?.name || p.description || 'Betaling',
          amount: Number(p.amount),
          time: timeAgo(p.booking_date),
        }))
      )

      // Aankomende taken
      setTasks(
        ((taskRows ?? []) as any[])
          .filter((t) => t.status === 'open')
          .slice(0, 4)
          .map((t) => ({
            id: t.id,
            title: t.title,
            date: t.due_date ? new Date(t.due_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : 'Geen datum',
            subtitle: t.properties?.name || t.tenants?.full_name || undefined,
          }))
      )

      // Compliance = eenheden zonder puntentelling (WWS)
      const wwsUnitIds = new Set(((wws ?? []) as any[]).map((w) => w.unit_id))
      const missing: ComplianceRow[] = []
      for (const p of P) {
        for (const u of (p.units ?? [])) {
          if (!wwsUnitIds.has(u.id)) {
            missing.push({
              address: `${p.address ?? p.name ?? 'Pand'}${u.unit_number ? `, ${u.unit_number}` : ''}`,
              label: 'puntentelling ontbreekt',
            })
          }
        }
      }
      setCompliance(missing.slice(0, 4))

      // Tickets
      setLiveTickets(
        ((tickets ?? []) as any[]).map((t) => ({
          id: t.id, title: t.title, status: t.status, priority: t.priority, created_at: t.created_at,
          source: t.source ?? null, sla_deadline: t.sla_deadline ?? null, category: t.category ?? null,
          tenant: t.leases?.tenants?.full_name ?? null,
          property: t.properties?.name ?? t.leases?.units?.properties?.name ?? null,
        }))
      )
    }).catch(() => {})

    return () => { cancelled = true }
  }, [user?.id, isDemo])

  const dismiss = (id: string) => setDismissed(prev => [...prev, id])
  const toggleTask = (id: string) => setCheckedTasks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const lastIncome = history[history.length - 1]?.income ?? 0
  const prevIncome = history[history.length - 2]?.income ?? lastIncome
  const incomeTrendPct = prevIncome ? Math.round(((lastIncome - prevIncome) / prevIncome) * 100) : 0
  const totalPerPand = perPand.reduce((s, c) => s + c.value, 0)
  const openstaand = Math.max(0, verwacht - ontvangenMaand)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_288px] gap-x-10 gap-y-8 items-start">

      {/* ——— Links ——— */}
      <div className="flex flex-col gap-8 min-w-0">

      {/* KPI-kaart */}
      <div className="rounded-2xl bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 flex flex-col lg:flex-row">
          {/* Links: grafiek */}
          <div className="flex flex-col flex-1 min-w-0 p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <SectionLabel href="/dashboard/landlord/financial/betalingen">Huurinkomsten</SectionLabel>
              <div className="flex items-baseline gap-2 mt-1.5">
                <p className="text-[26px] font-bold text-[#163300] dark:text-[#9FE870] leading-none">
                  {fmt(verwacht)}
                </p>
                <TrendBadge value={incomeTrendPct} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2.5 shrink-0">
              <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-full bg-[#163300] dark:bg-[#9FE870] inline-block" />
                  Per maand
                </span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={history} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#163300" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#163300" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`}
                width={44}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income" name="income" stroke="#163300" strokeWidth={2.5} fill="url(#incomeGradient)" dot={false} activeDot={{ r: 4, fill: '#163300' }} />
            </AreaChart>
          </ResponsiveContainer>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-gray-100 dark:bg-neutral-700 my-5 shrink-0" />

          {/* Rechts: kerncijfers */}
          <div className="flex flex-row lg:flex-col justify-around gap-4 px-5 lg:px-6 py-4 lg:py-5 lg:w-48 shrink-0 border-t lg:border-t-0 border-gray-100 dark:border-neutral-700">
            <MetricItem label="Panden" value={kpi.panden} href="/dashboard/landlord/portfolio" />
            <MetricItem label="Eenheden" value={kpi.eenheden} href="/dashboard/landlord/portfolio" />
            <MetricItem label="Huurders" value={kpi.huurders} href="/dashboard/landlord/tenants" />
            <MetricItem label="Bezetting" value={`${kpi.bezetting}%`} />
          </div>
        </div>

        {/* Recente activiteit */}
        <div>
          <SectionLabel href="/dashboard/landlord/financial/betalingen">Recente activiteit</SectionLabel>
          <div className="border-b border-gray-100 dark:border-neutral-800 mt-2" />
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">Nog geen recente activiteit.</p>
          ) : activities.slice(0, 5).map((act) => {
            const Icon = act.type === 'huur_ontvangen' ? Euro
              : act.type === 'storingsmelding' ? Wrench
              : act.type === 'contract_verlengd' ? FileText
              : TrendingUp
            return (
              <ActionListRow
                key={act.id}
                slim
                icon={Icon}
                title={act.title}
                subtitle={act.subtitle}
                right={
                  <div className="text-right shrink-0">
                    {act.amount != null && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+{fmt(act.amount)}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500">{act.time}</p>
                  </div>
                }
              />
            )
          })}
        </div>

      </div>

      {/* ——— Rechts: paneel ——— */}
      <div className="flex flex-col gap-6">

        {/* Inkomsten per pand — donut */}
        {perPand.length > 0 && (
          <div className="rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Inkomsten per pand</p>
              <span className="text-sm font-bold text-[#163300] dark:text-[#9FE870]">{fmt(totalPerPand)}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-[96px] w-[96px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={perPand} dataKey="value" nameKey="name" innerRadius={30} outerRadius={46} paddingAngle={2} stroke="none">
                      {perPand.map((c) => <Cell key={c.name} fill={c.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-gray-400">per mnd</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                {perPand.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-[11px]">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-gray-500 dark:text-gray-400 truncate">{c.name}</span>
                    <span className="ml-auto font-medium text-gray-700 dark:text-gray-300">{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compliance — accent */}
        {!dismissed.includes('compliance') && compliance.length > 0 && (
          <div className="rounded-2xl bg-[#163300] px-4 py-4 relative">
            <button onClick={() => dismiss('compliance')} className="absolute right-3.5 top-3.5 h-6 w-6 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="text-xs font-medium text-[#9FE870]/60 mb-2">Compliance</p>
            <p className="text-xl font-bold text-white leading-tight">{compliance.length} woning{compliance.length === 1 ? '' : 'en'}<br />vereisen actie</p>
            <p className="text-sm text-white/50 mt-1 mb-3">Puntentelling en documenten.</p>
            <div className="space-y-1.5">
              {compliance.map((a) => (
                <div key={a.address} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9FE870]/50 shrink-0" />
                  <span className="text-xs text-white/60 truncate">{a.address} — {a.label}</span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/landlord/compliance/alerts" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9FE870] hover:text-[#9FE870]/80 transition-colors">
              Bekijk alerts <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* Aankomende taken */}
        {!dismissed.includes('taken') && tasks.length > 0 && (
          <div className="relative rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 px-4 py-4">
            <button onClick={() => dismiss('taken')} className="absolute right-3.5 top-3.5 h-6 w-6 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-200 dark:text-neutral-600 dark:hover:text-neutral-400 dark:hover:bg-neutral-700 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Aankomende taken</p>
            <div className="border-b border-gray-200 dark:border-neutral-700" />
            <div className="pt-3 space-y-3">
              {tasks.map((task) => {
                const checked = checkedTasks.includes(task.id)
                return (
                  <div key={task.id} className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={cn(
                        'h-4 w-4 rounded-full border-2 shrink-0 mt-0.5 transition-colors flex items-center justify-center',
                        checked
                          ? 'bg-[#163300] dark:bg-[#9FE870] border-[#163300] dark:border-[#9FE870]'
                          : 'border-gray-300 dark:border-neutral-600 hover:border-[#163300] dark:hover:border-[#9FE870]'
                      )}
                    >
                      {checked && <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-[#163300]" />}
                    </button>
                    <div className="min-w-0">
                      <p className={cn(
                        'text-sm truncate transition-colors',
                        checked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'
                      )}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{task.date}{task.subtitle ? ` · ${task.subtitle}` : ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <Link href="/dashboard/landlord/tasks" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#163300] dark:text-[#9FE870] hover:underline">
              Alle taken <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* Tickets widget */}
        {!dismissed.includes('tickets') && (() => {
          const source = liveTickets
          const openTickets = source.filter(t => t.status !== 'afgerond' && t.status !== 'geannuleerd')
          const urgentOpen = openTickets.filter(t => t.priority === 'urgent' || t.priority === 'hoog')
          const slaOver = openTickets.filter(isSlaOver)
          const tenantTickets = openTickets.filter(t => t.source === 'tenant')
          const ranked = [
            ...slaOver,
            ...urgentOpen.filter(t => !slaOver.some(s => s.id === t.id)),
            ...tenantTickets.filter(t => !slaOver.some(s => s.id === t.id) && !urgentOpen.some(u => u.id === t.id)),
            ...openTickets.filter(t => !slaOver.some(s => s.id === t.id) && !urgentOpen.some(u => u.id === t.id) && !tenantTickets.some(n => n.id === t.id)),
          ]
          const showTickets = ranked.slice(0, 3)
          if (openTickets.length === 0) return null
          return (
            <div className="relative rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 px-4 py-4">
              <button onClick={() => dismiss('tickets')} className="absolute right-3.5 top-3.5 h-6 w-6 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-200 dark:text-neutral-600 dark:hover:text-neutral-400 dark:hover:bg-neutral-700 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Open tickets</p>
                <div className="flex items-center gap-2">
                  {slaOver.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                      <Clock className="h-3 w-3" />
                      {slaOver.length} SLA over
                    </span>
                  )}
                  {urgentOpen.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 dark:text-orange-400">
                      <AlertTriangle className="h-3 w-3" />
                      {urgentOpen.length} spoed
                    </span>
                  )}
                </div>
              </div>
              <div className="border-b border-gray-200 dark:border-neutral-700 mb-3" />
              <div className="space-y-2.5">
                {showTickets.map((t) => {
                  const over = isSlaOver(t)
                  return (
                    <Link key={t.id} href={`/dashboard/landlord/maintenance?ticket=${t.id}`} className="flex items-start gap-2.5 group">
                      <div className={cn(
                        'h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                        over ? 'bg-red-100 dark:bg-red-900/30'
                          : t.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30'
                          : t.priority === 'hoog' ? 'bg-orange-100 dark:bg-orange-900/30'
                          : 'bg-gray-200 dark:bg-neutral-700',
                      )}>
                        {over || t.priority === 'urgent'
                          ? <AlertTriangle className="h-2.5 w-2.5 text-red-600 dark:text-red-400" />
                          : t.priority === 'hoog'
                          ? <AlertTriangle className="h-2.5 w-2.5 text-orange-500 dark:text-orange-400" />
                          : <Clock className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800 dark:text-gray-200 truncate group-hover:text-[#163300] dark:group-hover:text-[#9FE870] transition-colors">{t.title}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {over && <span className="text-[10px] font-semibold text-red-500 dark:text-red-400">SLA over</span>}
                          {t.source === 'tenant' && <span className="text-[10px] font-medium text-[#163300]/60 dark:text-[#9FE870]/60">huurder</span>}
                          {(t.property || t.tenant) && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{[t.property, t.tenant].filter(Boolean).join(' · ')}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
              {openTickets.length > 3 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">+{openTickets.length - 3} meer open tickets</p>
              )}
              <Link href="/dashboard/landlord/maintenance" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#163300] dark:text-[#9FE870] hover:underline">
                Alle tickets <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          )
        })()}

        {/* Financieel deze maand */}
        {!dismissed.includes('financieel') && verwacht > 0 && (
          <div className="relative rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 px-4 py-4">
            <button onClick={() => dismiss('financieel')} className="absolute right-3.5 top-3.5 h-6 w-6 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-200 dark:text-neutral-600 dark:hover:text-neutral-400 dark:hover:bg-neutral-700 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Financieel deze maand</p>
            <div className="border-b border-gray-200 dark:border-neutral-700 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(ontvangenMaand)}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">ontvangen van {fmt(verwacht)} verwacht</p>
            <div className="space-y-2.5">
              {[
                { label: 'Verwacht', value: verwacht, color: 'bg-[#163300] dark:bg-[#9FE870]' },
                { label: 'Ontvangen', value: ontvangenMaand, color: 'bg-[#15803D] dark:bg-[#4ADE80]' },
                { label: 'Openstaand', value: openstaand, color: 'bg-gray-300 dark:bg-neutral-600' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{label}</span>
                    <span>{fmt(value)}</span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', color)} style={{ width: `${verwacht > 0 ? Math.min(100, value / verwacht * 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/landlord/financial" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#163300] dark:text-[#9FE870] hover:underline">
              Naar financieel <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
