'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ArrowUpRight, X, Euro, Wrench, FileText, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  maintenanceTickets, recentActivities,
  complianceAlerts, upcomingTasks, monthlyFinancials,
} from '@/lib/mock-data/domio-dashboard'
import { ActionListRow } from '@/components/ui/action-list'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { ticketQueries, propertyQueries, tenantQueries } from '@/lib/supabase/queries'

const incomeHistory = [
  { month: 'Okt', income: 26200, costs: 4800 },
  { month: 'Nov', income: 26800, costs: 5100 },
  { month: 'Dec', income: 27100, costs: 4600 },
  { month: 'Jan', income: 27600, costs: 5200 },
  { month: 'Feb', income: 27900, costs: 4900 },
  { month: 'Mrt', income: 28400, costs: 5000 },
]


function fmt(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
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
          <span className="text-gray-500 dark:text-gray-400">{p.name === 'income' ? 'Inkomsten' : 'Kosten'}</span>
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

export default function EmployerDashboardPage() {
  const { user, isDemo } = useDashboardUser()
  const [dismissed, setDismissed] = useState<string[]>([])
  const [checkedTasks, setCheckedTasks] = useState<string[]>([])
  const [liveTickets, setLiveTickets] = useState<LiveTicket[] | null>(null)
  const [kpi, setKpi] = useState({ panden: 0, eenheden: 0, huurders: 0, bezetting: 0 })

  useEffect(() => {
    if (isDemo) { setKpi({ panden: 12, eenheden: 24, huurders: 18, bezetting: 92 }); return }
    if (!user?.id) return
    Promise.all([
      propertyQueries.getByOwner(user.id),
      tenantQueries.getByOwner(user.id),
    ]).then(([props, tenants]) => {
      const totalUnits = (props ?? []).reduce((s: number, p: any) => s + (p.units?.length ?? 0), 0)
      const actieveHuurders = (tenants ?? []).filter((t: any) => !t.status || t.status === 'actief').length
      setKpi({
        panden: (props ?? []).length,
        eenheden: totalUnits,
        huurders: actieveHuurders,
        bezetting: totalUnits > 0 ? Math.min(100, Math.round((actieveHuurders / totalUnits) * 100)) : 0,
      })
    }).catch(() => {})
  }, [user?.id, isDemo])

  useEffect(() => {
    if (isDemo || !user?.id) return
    ticketQueries.getByOwner(user.id).then((rows) => {
      setLiveTickets((rows ?? []).map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        created_at: t.created_at,
        source: t.source ?? null,
        sla_deadline: t.sla_deadline ?? null,
        category: t.category ?? null,
        tenant: t.leases?.tenants?.full_name ?? null,
        property: t.properties?.name ?? t.leases?.units?.properties?.name ?? null,
      })))
    }).catch(() => {})
  }, [user?.id, isDemo])

  const dismiss = (id: string) => setDismissed(prev => [...prev, id])
  const toggleTask = (id: string) => setCheckedTasks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const chartData = incomeHistory
  const incomeDelta = monthlyFinancials.huurinkomsten - 27900
  const lastIncome = chartData[chartData.length - 1]?.income ?? 0
  const prevIncome = chartData[chartData.length - 2]?.income ?? lastIncome
  const incomeTrendPct = prevIncome ? Math.round(((lastIncome - prevIncome) / prevIncome) * 100) : 0

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
                <p className="text-[32px] font-bold text-[#163300] dark:text-[#9FE870] leading-none">
                  {fmt(monthlyFinancials.huurinkomsten)}
                </p>
                <TrendBadge value={incomeTrendPct} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2.5 shrink-0">
              <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-full bg-[#163300] dark:bg-[#9FE870] inline-block" />
                  Inkomsten
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-px w-3 border-t-2 border-dashed border-gray-300 dark:border-neutral-600 inline-block" />
                  Kosten
                </span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#163300" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#163300" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="costsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.10} />
                  <stop offset="100%" stopColor="#9ca3af" stopOpacity={0} />
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
              <Area type="monotone" dataKey="costs" name="costs" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#costsGradient)" dot={false} activeDot={{ r: 3, fill: '#9ca3af' }} />
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
          {recentActivities.slice(0, 5).map((act) => {
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

        {/* Compliance — accent */}
        {!dismissed.includes('compliance') && (
          <div className="rounded-2xl bg-[#163300] px-4 py-4 relative">
            <button onClick={() => dismiss('compliance')} className="absolute right-3.5 top-3.5 h-6 w-6 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="text-xs font-medium text-[#9FE870]/60 mb-2">Compliance</p>
            <p className="text-xl font-bold text-white leading-tight">{complianceAlerts.length} woningen<br />vereisen actie</p>
            <p className="text-sm text-white/50 mt-1 mb-3">Huur, puntentelling en documenten.</p>
            <div className="space-y-1.5">
              {complianceAlerts.map((a) => (
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
        {!dismissed.includes('taken') && (
          <div className="relative rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 px-4 py-4">
            <button onClick={() => dismiss('taken')} className="absolute right-3.5 top-3.5 h-6 w-6 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-200 dark:text-neutral-600 dark:hover:text-neutral-400 dark:hover:bg-neutral-700 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Aankomende taken</p>
            <div className="border-b border-gray-200 dark:border-neutral-700" />
            <div className="pt-3 space-y-3">
              {upcomingTasks.map((task) => {
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
          const source = liveTickets ?? maintenanceTickets.map(t => ({
            id: t.id, title: t.title, status: t.status,
            priority: t.priority,
            created_at: t.createdAt ?? new Date().toISOString(),
            source: 'tenant', sla_deadline: null, category: null,
            tenant: t.tenantName ?? null, property: t.address ?? null,
          }))
          const openTickets = source.filter(t => t.status !== 'afgerond' && t.status !== 'geannuleerd')
          const urgentOpen = openTickets.filter(t => t.priority === 'urgent' || t.priority === 'hoog')
          const slaOver = openTickets.filter(isSlaOver)
          const tenantTickets = openTickets.filter(t => t.source === 'tenant')
          // Show: SLA-over first, then urgent/hoog, then tenant-submitted, then rest
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

        {/* Financieel */}
        {!dismissed.includes('financieel') && (
          <div className="relative rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 px-4 py-4">
            <button onClick={() => dismiss('financieel')} className="absolute right-3.5 top-3.5 h-6 w-6 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-200 dark:text-neutral-600 dark:hover:text-neutral-400 dark:hover:bg-neutral-700 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Financieel deze maand</p>
            <div className="border-b border-gray-200 dark:border-neutral-700 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(monthlyFinancials.netto)}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">netto</p>
            <div className="space-y-2.5">
              {[
                { label: 'Huurinkomsten', value: monthlyFinancials.huurinkomsten, color: 'bg-[#163300] dark:bg-[#9FE870]' },
                { label: 'Onderhoud', value: monthlyFinancials.onderhoud, color: 'bg-[#15803D] dark:bg-[#4ADE80]' },
                { label: 'Beheerkosten', value: monthlyFinancials.beheerkosten, color: 'bg-gray-200 dark:bg-neutral-700' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{label}</span>
                    <span>{fmt(value)}</span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', color)} style={{ width: `${value / monthlyFinancials.huurinkomsten * 100}%` }} />
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
