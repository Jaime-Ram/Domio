'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionHeroHeader } from '@/components/dashboard/section-hero-header'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Building2, Users, Euro,
  Download, BarChart3, PieChart as PieIcon, Activity,
} from 'lucide-react'
import { portfolioTotals, portfolioObjects } from '@/lib/mock-data/domio-dashboard'

type Period = '3M' | '6M' | '1J' | 'ALL'

const PERIODS: { key: Period; label: string }[] = [
  { key: '3M', label: '3M' },
  { key: '6M', label: '6M' },
  { key: '1J', label: '1J' },
  { key: 'ALL', label: 'Alles' },
]

// Mock monthly data (12 months)
const MAANDEN = ['Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec', 'Jan', 'Feb', 'Mrt']
const mockMonthlyData = MAANDEN.map((m, i) => ({
  maand: m,
  huurinkomsten: 26400 + Math.round(Math.sin(i * 0.5) * 600) + i * 180,
  onderhoud: 2800 + Math.round(Math.cos(i * 0.8) * 400),
  beheer: 1600 + Math.round(i * 15),
  netto: 0,
  bezetting: 91 + Math.round(Math.sin(i * 0.3) * 3),
})).map((d) => ({ ...d, netto: d.huurinkomsten - d.onderhoud - d.beheer }))

const sectorData = [
  { name: 'Vrij', value: 14, color: '#10B981' },
  { name: 'Midden', value: 9, color: '#F59E0B' },
  { name: 'Sociaal', value: 1, color: '#64748B' },
]

function formatEur(n: number) {
  return `€${n.toLocaleString('nl-NL')}`
}

function MetricTile({ label, value, sub, trend, icon: Icon, color, bg }: {
  label: string; value: string; sub?: string
  trend?: { value: number; positive: boolean }
  icon: React.ComponentType<{ className?: string }>
  color: string; bg: string
}) {
  return (
    <Card className={dashboardCardClass()}>
      <CardContent className="p-5">
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center mb-3', bg)}>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{value}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        {trend && (
          <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium',
            trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
            {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.positive ? '+' : ''}{trend.value}% t.o.v. vorige periode
          </div>
        )}
        {sub && !trend && <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</div>}
      </CardContent>
    </Card>
  )
}

export default function ReportsPage() {
  const { isDemo } = useDashboardUser()
  const [period, setPeriod] = useState<Period>('1J')

  const filtered = useMemo(() => {
    if (period === '3M') return mockMonthlyData.slice(-3)
    if (period === '6M') return mockMonthlyData.slice(-6)
    return mockMonthlyData
  }, [period])

  const totaalHuur = filtered.reduce((s, d) => s + d.huurinkomsten, 0)
  const totaalNetto = filtered.reduce((s, d) => s + d.netto, 0)
  const totaalOnderhoud = filtered.reduce((s, d) => s + d.onderhoud, 0)
  const gemBezetting = Math.round(filtered.reduce((s, d) => s + d.bezetting, 0) / filtered.length)

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-lg p-3 text-sm">
        <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.fill ?? p.color }} />
            <span className="text-gray-500 dark:text-gray-400">{p.name}:</span>
            <span className="font-medium text-gray-900 dark:text-white">€{p.value.toLocaleString('nl-NL')}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-content-blocks">
      <div className="flex items-center justify-between">
        <SectionHeroHeader title="Rapportages" />
        <Button variant="outline" className="rounded-full gap-2 h-9 px-4 text-sm">
          <Download className="h-4 w-4" />
          Exporteer PDF
        </Button>
      </div>

      {/* Period picker */}
      <div className="flex gap-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full p-1 w-fit">
        {PERIODS.map((p) => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              period === p.key
                ? 'bg-white dark:bg-neutral-900 text-[#163300] dark:text-[#9FE870] shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')}>
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-content-blocks">
        <MetricTile label="Totale huurinkomsten" value={isDemo ? formatEur(totaalHuur) : '—'}
          trend={isDemo ? { value: 4.2, positive: true } : undefined}
          icon={Euro} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-500/10" />
        <MetricTile label="Netto resultaat" value={isDemo ? formatEur(totaalNetto) : '—'}
          trend={isDemo ? { value: 6.1, positive: true } : undefined}
          icon={TrendingUp} color="text-[#163300] dark:text-[#9FE870]" bg="bg-[#163300]/5 dark:bg-[#9FE870]/10" />
        <MetricTile label="Onderhoud & kosten" value={isDemo ? formatEur(totaalOnderhoud) : '—'}
          trend={isDemo ? { value: 2.3, positive: false } : undefined}
          icon={TrendingDown} color="text-orange-500 dark:text-orange-400" bg="bg-orange-50 dark:bg-orange-500/10" />
        <MetricTile label="Gem. bezettingsgraad" value={isDemo ? `${gemBezetting}%` : '—'}
          sub={isDemo ? `${portfolioTotals.totalObjects} objecten` : undefined}
          icon={Building2} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-500/10" />
      </div>

      {/* Income chart */}
      <Card className={dashboardCardClass()}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Huurinkomsten & kosten</CardTitle>
        </CardHeader>
        <CardContent>
          {isDemo ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={filtered} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[stroke:#262626]" vertical={false} />
                <XAxis dataKey="maand" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="huurinkomsten" name="Huurinkomsten" fill="#9FE870" radius={[4, 4, 0, 0]} />
                <Bar dataKey="onderhoud" name="Onderhoud" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="beheer" name="Beheer" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              Voeg objecten toe om je inkomsten te zien.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Netto + bezetting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-content-blocks">
        {/* Netto resultaat lijn */}
        <Card className={dashboardCardClass()}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Netto resultaat</CardTitle>
          </CardHeader>
          <CardContent>
            {isDemo ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={filtered} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[stroke:#262626]" vertical={false} />
                  <XAxis dataKey="maand" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip content={customTooltip} />
                  <Line type="monotone" dataKey="netto" name="Netto" stroke="#163300" strokeWidth={2.5}
                    dot={{ fill: '#163300', r: 3 }} activeDot={{ r: 5, fill: '#9FE870' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-36 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">Geen data</div>
            )}
          </CardContent>
        </Card>

        {/* Sectorverdeling */}
        <Card className={dashboardCardClass()}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Sectorverdeling portefeuille</CardTitle>
          </CardHeader>
          <CardContent>
            {isDemo ? (
              <div className="flex items-center gap-6 pt-2">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={sectorData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {sectorData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {sectorData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{d.name}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white ml-auto">{d.value} obj.</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-100 dark:border-neutral-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Totaal</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{sectorData.reduce((s, d) => s + d.value, 0)} objecten</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-36 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">Geen data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bezettingsgraad */}
      <Card className={dashboardCardClass()}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Bezettingsgraad per maand</CardTitle>
            {isDemo && (
              <span className="text-sm text-gray-400 dark:text-gray-500">gem. {gemBezetting}%</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isDemo ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={filtered} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[stroke:#262626]" vertical={false} />
                <XAxis dataKey="maand" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={42} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Bezetting']} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 13 }} />
                <Bar dataKey="bezetting" name="Bezettingsgraad" fill="#163300" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-36 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">Geen data</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
