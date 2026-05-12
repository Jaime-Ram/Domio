'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/landlord/dashboard-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Calculator, AlertTriangle, BarChart3, CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import { mockWwsOptimalisatieAdviezen } from '@/lib/mock-data/wws-compliance'

const getComplianceNav = (basePath: string) => [
  { label: 'WWS Overzicht', href: `${basePath}/compliance`, icon: BarChart3 },
  { label: 'Puntentelling', href: `${basePath}/compliance/puntentelling`, icon: Calculator },
  { label: 'Alerts', href: `${basePath}/compliance/alerts`, icon: AlertTriangle },
]

type EnergyLabel = 'A+++' | 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

const ENERGY_PUNTEN: Record<EnergyLabel, number> = {
  'A+++': 52, 'A++': 50, 'A+': 48, 'A': 44, 'B': 36, 'C': 22, 'D': 10, 'E': 0, 'F': 0, 'G': 0,
}

function puntenToMaxHuur(punten: number): number {
  if (punten <= 143) return 879.66
  if (punten <= 150) return 928.00
  if (punten <= 160) return 985.00
  if (punten <= 170) return 1055.00
  if (punten <= 180) return 1150.00
  if (punten <= 186) return 1184.82
  if (punten <= 190) return 1250.07
  if (punten <= 200) return 1400.00
  if (punten <= 210) return 1550.00
  if (punten <= 220) return 1700.00
  return Math.round(punten * 8.2)
}

function getSector(punten: number) {
  if (punten <= 143) return 'sociaal'
  if (punten <= 186) return 'midden'
  return 'vrij'
}

const SECTOR_LABELS: Record<string, string> = {
  sociaal: 'Sociaal',
  midden: 'Middensegment',
  vrij: 'Vrije sector',
}

const SECTOR_COLORS: Record<string, string> = {
  sociaal: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20',
  midden: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  vrij: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
}

interface FormState {
  oppervlakte: string
  oppervlakteOverig: string
  energielabel: EnergyLabel | ''
  verwarming: 'individueel' | 'collectief' | 'blok' | 'geen'
  keuken: 'basis' | 'normaal' | 'compleet'
  sanitair: 'toilet' | 'douche_toilet' | 'bad_douche_toilet'
  buitenruimte: string
  woz: string
}

const INITIAL_FORM: FormState = {
  oppervlakte: '',
  oppervlakteOverig: '',
  energielabel: '',
  verwarming: 'individueel',
  keuken: 'normaal',
  sanitair: 'douche_toilet',
  buitenruimte: '',
  woz: '',
}

interface BreakdownItem { label: string; punten: number; toelichting: string }

export default function PuntentellingPage() {
  const { basePath } = useDashboardUser()
  const COMPLIANCE_NAV = getComplianceNav(basePath)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [currentHuur, setCurrentHuur] = useState('')

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const breakdown = useMemo((): BreakdownItem[] => {
    const opp = parseFloat(form.oppervlakte) || 0
    const oppOverig = parseFloat(form.oppervlakteOverig) || 0
    const buitenM2 = parseFloat(form.buitenruimte) || 0
    const wozVal = parseFloat(form.woz.replace(/\./g, '')) || 0
    const items: BreakdownItem[] = []

    if (opp > 0) items.push({ label: 'Oppervlakte woonruimte', punten: Math.round(opp), toelichting: `${opp} m² × 1 punt` })
    if (oppOverig > 0) items.push({ label: 'Overige ruimtes', punten: Math.round(oppOverig * 0.75), toelichting: `${oppOverig} m² × 0,75 punt` })
    if (form.energielabel) {
      const ep = ENERGY_PUNTEN[form.energielabel]
      if (ep > 0) items.push({ label: 'Energielabel', punten: ep, toelichting: `Label ${form.energielabel}` })
    }
    const verwPunten = { individueel: 2, collectief: 4, blok: 1, geen: 0 }[form.verwarming] ?? 0
    if (verwPunten > 0) {
      const labels = { individueel: 'Individueel CV', collectief: 'Collectief', blok: 'Blokverwarming', geen: 'Geen' }
      items.push({ label: 'Verwarming', punten: verwPunten, toelichting: labels[form.verwarming] })
    }
    const keukenPunten = { basis: 2, normaal: 4, compleet: 7 }[form.keuken]
    const keukenLabels = { basis: 'Basis', normaal: 'Normaal', compleet: 'Compleet (alle voorzieningen)' }
    items.push({ label: 'Keuken', punten: keukenPunten, toelichting: keukenLabels[form.keuken] })
    const sanPunten = { toilet: 3, douche_toilet: 7, bad_douche_toilet: 10 }[form.sanitair]
    const sanLabels = { toilet: 'Alleen toilet', douche_toilet: 'Douche + toilet', bad_douche_toilet: 'Bad + douche + toilet' }
    items.push({ label: 'Sanitair', punten: sanPunten, toelichting: sanLabels[form.sanitair] })
    if (buitenM2 > 0) {
      const bp = buitenM2 <= 25 ? Math.round(buitenM2 * 0.4) : 10 + Math.round((buitenM2 - 25) * 0.2)
      items.push({ label: 'Buitenruimte', punten: bp, toelichting: `${buitenM2} m²` })
    }
    if (wozVal > 0 && opp > 0) {
      const wozPerM2 = wozVal / opp
      const wozPunten = Math.min(Math.round(wozPerM2 / 100), 55)
      items.push({ label: 'WOZ-waarde component', punten: wozPunten, toelichting: `WOZ €${wozVal.toLocaleString('nl-NL')} / ${opp}m²` })
    }
    return items
  }, [form])

  const totaalPunten = breakdown.reduce((s, i) => s + i.punten, 0)
  const sector = getSector(totaalPunten)
  const maxHuur = puntenToMaxHuur(totaalPunten)
  const huidigeHuurNum = parseFloat(currentHuur) || 0
  const marge = maxHuur - huidigeHuurNum
  const canCalculate = (parseFloat(form.oppervlakte) || 0) > 0

  return (
    <>
      <SectionNavDashboard title="Compliance" items={COMPLIANCE_NAV} titleVariant="hero" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-content-blocks items-start">
        {/* Form */}
        <Card className={cn(dashboardCardClass(), 'lg:col-span-2')}>
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Puntentelling invoer</CardTitle>
            <CardDescription>Vul de gegevens van het object in om de WWS-score te berekenen.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="opp">Woonoppervlakte (m²)</Label>
                <Input id="opp" type="number" min={0} placeholder="bijv. 72"
                  value={form.oppervlakte} onChange={(e) => update('oppervlakte', e.target.value)}
                  className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="opp-overig">Overige ruimtes (m²)</Label>
                <Input id="opp-overig" type="number" min={0} placeholder="bijv. 8"
                  value={form.oppervlakteOverig} onChange={(e) => update('oppervlakteOverig', e.target.value)}
                  className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Energielabel</Label>
              <Select value={form.energielabel} onValueChange={(v) => update('energielabel', v as EnergyLabel)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Kies label" /></SelectTrigger>
                <SelectContent>
                  {(['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] as EnergyLabel[]).map((l) => (
                    <SelectItem key={l} value={l}>{l} ({ENERGY_PUNTEN[l]} punten)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Verwarming</Label>
              <Select value={form.verwarming} onValueChange={(v) => update('verwarming', v as FormState['verwarming'])}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individueel">Individueel CV (2 punten)</SelectItem>
                  <SelectItem value="collectief">Collectief (4 punten)</SelectItem>
                  <SelectItem value="blok">Blokverwarming (1 punt)</SelectItem>
                  <SelectItem value="geen">Geen (0 punten)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Keuken</Label>
              <Select value={form.keuken} onValueChange={(v) => update('keuken', v as FormState['keuken'])}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basis">Basis (2 punten)</SelectItem>
                  <SelectItem value="normaal">Normaal (4 punten)</SelectItem>
                  <SelectItem value="compleet">Compleet (7 punten)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Sanitair</Label>
              <Select value={form.sanitair} onValueChange={(v) => update('sanitair', v as FormState['sanitair'])}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="toilet">Alleen toilet (3 punten)</SelectItem>
                  <SelectItem value="douche_toilet">Douche + toilet (7 punten)</SelectItem>
                  <SelectItem value="bad_douche_toilet">Bad + douche + toilet (10 punten)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="buiten">Buitenruimte (m²)</Label>
                <Input id="buiten" type="number" min={0} placeholder="bijv. 12"
                  value={form.buitenruimte} onChange={(e) => update('buitenruimte', e.target.value)}
                  className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="woz">WOZ-waarde (€)</Label>
                <Input id="woz" type="text" placeholder="bijv. 385000"
                  value={form.woz} onChange={(e) => update('woz', e.target.value)}
                  className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="huur">
                Huidige huurprijs (€/mnd)
                <span className="text-gray-400 font-normal text-xs ml-1">optioneel</span>
              </Label>
              <Input id="huur" type="number" min={0} placeholder="bijv. 1200"
                value={currentHuur} onChange={(e) => setCurrentHuur(e.target.value)}
                className="rounded-xl" />
            </div>

            <Button variant="outline" size="sm" className="rounded-full text-gray-500 w-full"
              onClick={() => { setForm(INITIAL_FORM); setCurrentHuur('') }}>
              <RotateCcw className="h-3.5 w-3.5 mr-2" />
              Reset formulier
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-content-blocks">
          <Card className={dashboardCardClass()}>
            <CardContent className="p-6">
              {!canCalculate ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <Calculator className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Vul de woonoppervlakte in om te beginnen</p>
                  <p className="text-xs mt-1 opacity-60">Het resultaat wordt automatisch berekend</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-5xl font-bold text-[#163300] dark:text-[#9FE870] mb-1">{totaalPunten}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">WWS-punten</div>
                    </div>
                    <div className="text-right">
                      <Badge className={cn('text-sm px-3 py-1 border rounded-full', SECTOR_COLORS[sector])}>
                        {SECTOR_LABELS[sector]}
                      </Badge>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        €{maxHuur.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">max. huurprijs/mnd</div>
                    </div>
                  </div>

                  {huidigeHuurNum > 0 && (
                    <div className={cn('rounded-xl p-4 flex items-start gap-3',
                      marge >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10')}>
                      {marge >= 0
                        ? <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        : <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                      <div>
                        <p className={cn('text-sm font-medium',
                          marge >= 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-700 dark:text-red-400')}>
                          {marge >= 0
                            ? `Huur €${marge.toFixed(0)} onder maximum — compliant`
                            : `Huur €${Math.abs(marge).toFixed(0)} boven maximum — niet toegestaan`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Huidige huur €{huidigeHuurNum.toLocaleString('nl-NL')} / max €{maxHuur.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                      <span>0</span>
                      <span className="text-slate-500">143 Sociaal</span>
                      <span className="text-amber-500">186 Midden</span>
                      <span className="text-emerald-500">Vrij →</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (totaalPunten / 250) * 100)}%`,
                          background: sector === 'vrij' ? '#10B981' : sector === 'midden' ? '#F59E0B' : '#64748B',
                        }} />
                      <div className="absolute top-0 bottom-0 w-px bg-slate-300/60" style={{ left: `${(143 / 250) * 100}%` }} />
                      <div className="absolute top-0 bottom-0 w-px bg-amber-300/60" style={{ left: `${(186 / 250) * 100}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {canCalculate && breakdown.length > 0 && (
            <Card className={dashboardCardClass()}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Puntenoverzicht</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-1">
                <div className="divide-y divide-gray-50 dark:divide-neutral-800/80">
                  {breakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.toelichting}</p>
                      </div>
                      <span className="text-sm font-bold text-[#163300] dark:text-[#9FE870] ml-4 shrink-0">+{item.punten}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-5 py-3.5 bg-[#163300]/5 dark:bg-[#9FE870]/5">
                    <span className="text-sm font-bold text-[#163300] dark:text-[#9FE870]">Totaal</span>
                    <span className="text-lg font-bold text-[#163300] dark:text-[#9FE870]">{totaalPunten} punten</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {canCalculate && (
            <Card className={dashboardCardClass()}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">Optimalisatie-adviezen</CardTitle>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Verbeteringen die extra punten en hogere maximale huur opleveren</p>
              </CardHeader>
              <CardContent className="space-y-3 pb-5">
                {mockWwsOptimalisatieAdviezen.map((a) => (
                  <div key={a.id} className="rounded-xl border border-gray-100 dark:border-neutral-800 p-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.titel}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{a.huidig} → {a.na}</p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-xs text-[#163300] dark:text-[#9FE870] font-medium">+{a.extraPunten} punten</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+€{a.extraHuur}/mnd</span>
                      <span className="text-xs text-gray-400">Investering €{a.investering.toLocaleString('nl-NL')}</span>
                      <span className="text-xs text-gray-400">~{a.terugverdientijd} jr terugverdien</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
