'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { vveData, vveMjop } from '@/lib/mock-data/domio-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import {
  Home, Users, Euro, Calendar, ClipboardList,
  CheckCircle2, Clock, FileText, Plus, Building2,
  TrendingUp, Download,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const mockLeden = [
  { id: '1', naam: 'T. van Dijk', appartement: 'App. 1 (BG links)', aandeel: '1/6', bijdrage: 185, betaaldTot: 'mrt 2026', rol: 'Voorzitter' },
  { id: '2', naam: 'M. Jansen', appartement: 'App. 2 (BG rechts)', aandeel: '1/6', bijdrage: 185, betaaldTot: 'mrt 2026', rol: 'Secretaris' },
  { id: '3', naam: 'K. Meijer', appartement: 'App. 3 (1e verdieping links)', aandeel: '1/6', bijdrage: 185, betaaldTot: 'mrt 2026', rol: 'Lid' },
  { id: '4', naam: 'S. de Boer', appartement: 'App. 4 (1e verdieping rechts)', aandeel: '1/6', bijdrage: 185, betaaldTot: 'feb 2026', rol: 'Lid' },
  { id: '5', naam: 'R. Hendriks', appartement: 'App. 5 (2e verdieping links)', aandeel: '1/6', bijdrage: 185, betaaldTot: 'mrt 2026', rol: 'Penningmeester' },
  { id: '6', naam: 'E. de Groot', appartement: 'App. 6 (2e verdieping rechts)', aandeel: '1/6', bijdrage: 185, betaaldTot: 'jan 2026', rol: 'Lid' },
]

const mockVergaderingen = [
  { id: '1', titel: 'Jaarvergadering 2025', datum: '15 mrt 2025', status: 'afgerond', aanwezig: 5, notulen: true },
  { id: '2', titel: 'Spoedbesluit dakonderhoud', datum: '28 jun 2025', status: 'afgerond', aanwezig: 4, notulen: true },
  { id: '3', titel: 'Jaarvergadering 2026', datum: '20 mrt 2026', status: 'gepland', aanwezig: null, notulen: false },
  { id: '4', titel: 'Informatieavond nieuw beheer', datum: '10 mei 2026', status: 'gepland', aanwezig: null, notulen: false },
]

const mockFinancieel = [
  { maand: 'Okt', inkomsten: 1110, uitgaven: 200 },
  { maand: 'Nov', inkomsten: 1110, uitgaven: 450 },
  { maand: 'Dec', inkomsten: 1110, uitgaven: 1200 },
  { maand: 'Jan', inkomsten: 1110, uitgaven: 180 },
  { maand: 'Feb', inkomsten: 1110, uitgaven: 320 },
  { maand: 'Mrt', inkomsten: 1110, uitgaven: 95 },
]

export default function VvEPage() {
  const { isDemo } = useDashboardUser()
  const data = isDemo ? vveData : {
    id: '0', name: 'Geen VvE', address: '—', units: 0,
    reserveFund: 0, targetReserve: 0, monthlyContributionPerUnit: 0,
  }
  const mjop = isDemo ? vveMjop : []
  const reservePercent = data.targetReserve > 0 ? Math.min(100, (data.reserveFund / data.targetReserve) * 100) : 0
  const leden = isDemo ? mockLeden : []
  const vergaderingen = isDemo ? mockVergaderingen : []
  const financieel = isDemo ? mockFinancieel : []

  const totalMjopBudget = mjop.reduce((s, i) => s + i.amount, 0)
  const bijdragePerMaand = data.units * data.monthlyContributionPerUnit

  return (
    <div className="space-y-content-blocks">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#163300] dark:text-[#9FE870]">{data.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{data.address}</p>
        </div>
        {isDemo && (
          <Button variant="outline" className="rounded-full gap-2 h-9 px-4 text-sm">
            <Download className="h-4 w-4" />
            Exporteer
          </Button>
        )}
      </div>

      <Tabs defaultValue="overzicht" className="space-y-content-blocks">
        <TabsList className="flex w-fit gap-1 bg-gray-100 dark:bg-neutral-800 rounded-full p-1">
          {[
            { value: 'overzicht', label: 'Overzicht', icon: Home },
            { value: 'leden', label: 'Leden', icon: Users },
            { value: 'financieel', label: 'Financieel', icon: Euro },
            { value: 'vergaderingen', label: 'Vergaderingen', icon: Calendar },
            { value: 'mjop', label: 'MJOP', icon: ClipboardList },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:text-[#163300] dark:data-[state=active]:text-[#9FE870] data-[state=active]:shadow-sm">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* OVERZICHT */}
        <TabsContent value="overzicht" className="space-y-content-blocks">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-content-blocks">
            {[
              { label: 'Eenheden', value: String(data.units), icon: Building2, color: 'text-[#163300] dark:text-[#9FE870]', bg: 'bg-[#163300]/5 dark:bg-[#9FE870]/10' },
              { label: 'Reservefonds', value: `€${data.reserveFund.toLocaleString('nl-NL')}`, icon: Euro, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { label: 'Bijdrage/mnd', value: `€${bijdragePerMaand.toLocaleString('nl-NL')}`, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { label: 'MJOP budget', value: `€${totalMjopBudget.toLocaleString('nl-NL')}`, icon: ClipboardList, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
            ].map((m) => {
              const Icon = m.icon
              return (
                <Card key={m.label} className={dashboardCardClass()}>
                  <CardContent className="p-5">
                    <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center mb-3', m.bg)}>
                      <Icon className={cn('h-5 w-5', m.color)} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{m.value}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{m.label}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-content-blocks">
            <Card className={dashboardCardClass()}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Gebouwinfo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Adres', value: data.address },
                  { label: 'Aantal eenheden', value: String(data.units) },
                  { label: 'Bijdrage per eenheid', value: `€${data.monthlyContributionPerUnit}/mnd` },
                  { label: 'Totaal maandelijks', value: `€${bijdragePerMaand.toLocaleString('nl-NL')}/mnd` },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-neutral-800 last:border-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{r.label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{r.value}</span>
                  </div>
                ))}
                <div className="pt-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Reservefonds</span>
                    <span>{Math.round(reservePercent)}% van streefbedrag</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full rounded-full bg-[#163300] dark:bg-[#9FE870] transition-all"
                      style={{ width: `${reservePercent}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                    <span>€{data.reserveFund.toLocaleString('nl-NL')}</span>
                    <span>Doel: €{data.targetReserve.toLocaleString('nl-NL')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={dashboardCardClass()}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Bestuur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { rol: 'Voorzitter', naam: 'T. van Dijk' },
                  { rol: 'Secretaris', naam: 'M. Jansen' },
                  { rol: 'Penningmeester', naam: 'R. Hendriks' },
                ].map((b) => (
                  <div key={b.rol} className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-neutral-800 last:border-0">
                    <div className="h-8 w-8 rounded-full bg-[#163300]/10 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0 text-xs font-bold text-[#163300] dark:text-[#9FE870]">
                      {b.naam.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{b.naam}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{b.rol}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LEDEN */}
        <TabsContent value="leden">
          <Card className={dashboardCardClass()}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Leden ({leden.length})</CardTitle>
              <Button size="sm" className="rounded-full h-8 px-3 bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Lid toevoegen
              </Button>
            </CardHeader>
            <CardContent className="p-0 pb-1">
              <div className="divide-y divide-gray-50 dark:divide-neutral-800/80">
                {leden.map((lid) => (
                  <div key={lid.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-[#163300]/10 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0 text-xs font-bold text-[#163300] dark:text-[#9FE870]">
                      {lid.naam.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{lid.naam}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{lid.appartement} · Aandeel {lid.aandeel}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">€{lid.bijdrage}/mnd</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">betaald t/m {lid.betaaldTot}</p>
                    </div>
                    {lid.rol !== 'Lid' && (
                      <Badge className="bg-[#163300]/5 dark:bg-[#9FE870]/10 text-[#163300] dark:text-[#9FE870] border-0 shrink-0 text-xs">
                        {lid.rol}
                      </Badge>
                    )}
                  </div>
                ))}
                {leden.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">Nog geen leden.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FINANCIEEL */}
        <TabsContent value="financieel" className="space-y-content-blocks">
          <Card className={dashboardCardClass()}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Inkomsten vs uitgaven (6 mnd)</CardTitle>
            </CardHeader>
            <CardContent>
              {isDemo ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={financieel} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="maand" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `€${v}`} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={55} />
                    <Tooltip formatter={(v: number, name: string) => [`€${v.toLocaleString('nl-NL')}`, name === 'inkomsten' ? 'Bijdragen' : 'Uitgaven']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 13 }} />
                    <Bar dataKey="inkomsten" name="inkomsten" fill="#9FE870" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="uitgaven" name="uitgaven" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Geen data</div>
              )}
            </CardContent>
          </Card>
          <Card className={dashboardCardClass()}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Reservefonds overzicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Huidig saldo', value: `€${data.reserveFund.toLocaleString('nl-NL')}`, highlight: true },
                { label: 'Streefbedrag', value: `€${data.targetReserve.toLocaleString('nl-NL')}` },
                { label: 'Jaarlijkse aangroei', value: `€${(bijdragePerMaand * 12 * 0.6).toLocaleString('nl-NL', { maximumFractionDigits: 0 })}` },
                { label: 'Verwachte aanvuldatum', value: '2028' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-neutral-800 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{r.label}</span>
                  <span className={cn('text-sm font-medium', r.highlight ? 'text-[#163300] dark:text-[#9FE870]' : 'text-gray-900 dark:text-white')}>
                    {r.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* VERGADERINGEN */}
        <TabsContent value="vergaderingen">
          <Card className={dashboardCardClass()}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Vergaderingen</CardTitle>
              <Button size="sm" className="rounded-full h-8 px-3 bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Plannen
              </Button>
            </CardHeader>
            <CardContent className="p-0 pb-1">
              <div className="divide-y divide-gray-50 dark:divide-neutral-800/80">
                {vergaderingen.map((v) => (
                  <div key={v.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <div className={cn('h-9 w-9 rounded-full flex items-center justify-center shrink-0',
                      v.status === 'afgerond' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-blue-50 dark:bg-blue-500/10')}>
                      {v.status === 'afgerond'
                        ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                        : <Clock className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{v.titel}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {v.datum}
                        {v.aanwezig != null ? ` · ${v.aanwezig}/${leden.length} aanwezig` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {v.notulen && (
                        <Button size="sm" variant="outline" className="rounded-full h-7 px-2.5 text-xs gap-1">
                          <FileText className="h-3 w-3" />
                          Notulen
                        </Button>
                      )}
                      <Badge className={cn('border-0 text-xs',
                        v.status === 'afgerond'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400')}>
                        {v.status === 'afgerond' ? 'Afgerond' : 'Gepland'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {vergaderingen.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">Geen vergaderingen gepland.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MJOP */}
        <TabsContent value="mjop" className="space-y-content-blocks">
          <Card className={dashboardCardClass()}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Meerjarenonderhoudsplan</CardTitle>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Totaal: €{totalMjopBudget.toLocaleString('nl-NL')}</p>
              </div>
              <Button size="sm" className="rounded-full h-8 px-3 bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Toevoegen
              </Button>
            </CardHeader>
            <CardContent className="p-0 pb-1">
              <div className="divide-y divide-gray-50 dark:divide-neutral-800/80">
                {mjop.map((item) => (
                  <div key={item.year} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-[#163300]/5 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
                        <ClipboardList className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Gepland {item.year}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">€{item.amount.toLocaleString('nl-NL')}</span>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {item.amount <= data.reserveFund ? '✓ Gedekt' : '⚠ Extra funding nodig'}
                      </p>
                    </div>
                  </div>
                ))}
                {mjop.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">Nog geen MJOP-items.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
