'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Calculator,
  TrendingUp,
  ChevronRight,
  Lightbulb,
  History,
  Download,
  ArrowUpRight,
  BarChart3,
  Zap,
  Home,
  Flame,
  Droplets,
  Sun,
  Euro,
  Maximize2,
  Trees,
  AlertTriangle,
} from 'lucide-react'
import {
  berekenWWS,
  KEUKEN_OPTIES,
  SANITAIR_OPTIES,
  ENERGIELABELS,
  WONINGTYPEN,
  type WWInput,
  type WWResult,
} from '@/lib/wws-calculator'
import { mockWwsObjects, mockWwsOptimalisatieAdviezen } from '@/lib/mock-data/wws-compliance'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { downloadWWSPDF } from '@/lib/pdf/generate-wws-pdf'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'

const COMPLIANCE_NAV = [
  { label: 'WWS Overzicht', href: '/dashboard/employer/compliance', icon: BarChart3 },
  { label: 'Puntentelling', href: '/dashboard/employer/compliance/puntentelling', icon: Calculator },
  { label: 'Alerts', href: '/dashboard/employer/compliance/alerts', icon: AlertTriangle },
]

interface PropertyWWSInput extends WWInput {
  propertyId: string
  propertyLabel: string
}

const mockPropertyInputs: PropertyWWSInput[] = [
  {
    propertyId: '1', propertyLabel: 'Keizersgracht 12-A',
    postcode: '1015CN', huisnummer: '12A', typeWoning: 'appartement', bouwjaar: 1920,
    woonOpp: 82, overigeOpp: 10, buitenOpp: 14, aantalKamers: 3,
    keukenItems: ['aanrecht', 'spoelbak', 'kooktoestel', 'afzuigkap'],
    sanitairItems: ['douche', 'wastafel', 'tweede_toilet'],
    verwarming: 'centraal', energielabel: 'A', wozWaarde: 485000,
  },
  {
    propertyId: '2', propertyLabel: 'Keizersgracht 12-B',
    postcode: '1015CN', huisnummer: '12B', typeWoning: 'appartement', bouwjaar: 1920,
    woonOpp: 68, overigeOpp: 8, buitenOpp: 6, aantalKamers: 2,
    keukenItems: ['aanrecht', 'spoelbak', 'kooktoestel'],
    sanitairItems: ['douche', 'wastafel'],
    verwarming: 'individueel', energielabel: 'B', wozWaarde: 395000,
  },
  {
    propertyId: '3', propertyLabel: 'Prinsengracht 8-1',
    postcode: '1015DV', huisnummer: '8-1', typeWoning: 'bovenwoning', bouwjaar: 1890,
    woonOpp: 72, overigeOpp: 8, buitenOpp: 12, aantalKamers: 3,
    keukenItems: ['aanrecht', 'spoelbak', 'kooktoestel', 'afzuigkap'],
    sanitairItems: ['douche', 'wastafel', 'tweede_toilet'],
    verwarming: 'individueel', energielabel: 'A', wozWaarde: 385000,
  },
  {
    propertyId: '5', propertyLabel: 'Herengracht 45-2',
    postcode: '1015BA', huisnummer: '45-2', typeWoning: 'appartement', bouwjaar: 1905,
    woonOpp: 78, overigeOpp: 12, buitenOpp: 18, aantalKamers: 3,
    keukenItems: ['aanrecht', 'spoelbak', 'kooktoestel', 'afzuigkap'],
    sanitairItems: ['douche', 'bad', 'wastafel', 'tweede_toilet'],
    verwarming: 'centraal', energielabel: 'A+', wozWaarde: 520000,
  },
  {
    propertyId: '11', propertyLabel: 'Oudezijds Achterburgwal 5',
    postcode: '1012DA', huisnummer: '5', typeWoning: 'benedenwoning', bouwjaar: 1880,
    woonOpp: 48, overigeOpp: 5, buitenOpp: 0, aantalKamers: 2,
    keukenItems: ['aanrecht', 'spoelbak'],
    sanitairItems: ['douche', 'wastafel'],
    verwarming: 'individueel', energielabel: 'D', wozWaarde: 280000,
  },
]

interface HistoryEntry {
  date: string
  year: number
  punten: number
  sector: string
  maxHuur: number
}

const mockHistory: Record<string, HistoryEntry[]> = {
  '1': [
    { date: '2026-01-15', year: 2026, punten: 194, sector: 'vrij', maxHuur: 1612 },
    { date: '2025-01-10', year: 2025, punten: 189, sector: 'vrij', maxHuur: 1565 },
    { date: '2024-06-20', year: 2024, punten: 185, sector: 'vrij', maxHuur: 1532 },
  ],
  '2': [
    { date: '2025-01-14', year: 2025, punten: 168, sector: 'midden', maxHuur: 1085 },
    { date: '2024-01-12', year: 2024, punten: 162, sector: 'midden', maxHuur: 1038 },
  ],
  '3': [
    { date: '2025-12-10', year: 2025, punten: 172, sector: 'midden', maxHuur: 1135 },
    { date: '2024-12-05', year: 2024, punten: 168, sector: 'midden', maxHuur: 1085 },
  ],
}

function getOptimisationAdvice(result: WWResult, input: WWInput) {
  const advice: { titel: string; huidig: string; na: string; extraPunten: number; extraHuur: number; investering: number; terugverdientijd: number; icon: React.ReactNode; priority: number }[] = []

  const labelIndex = ENERGIELABELS.indexOf(input.energielabel)
  if (labelIndex > 2) {
    const targetLabel = ENERGIELABELS[Math.max(0, labelIndex - 3)]
    const currentPts = result.breakdown.find(b => b.category === 'Energielabel')?.punten ?? 0
    const targetPts = { 'A++++': 54, 'A+++': 50, 'A++': 48, 'A+': 46, A: 44, B: 36, C: 22, D: 14, E: 8, F: 4, G: 0 }[targetLabel] ?? 0
    const extra = targetPts - currentPts
    if (extra > 0) {
      advice.push({
        titel: `Energielabel verbeteren naar ${targetLabel}`,
        huidig: `Label ${input.energielabel} (${currentPts} pt)`,
        na: `Label ${targetLabel} (${targetPts} pt)`,
        extraPunten: extra,
        extraHuur: Math.round(extra * 6.8),
        investering: extra * 600,
        terugverdientijd: Math.round((extra * 600) / (extra * 6.8) / 12),
        icon: <Sun className="h-5 w-5" />,
        priority: 1,
      })
    }
  }

  if (input.buitenOpp < 30) {
    const currentBuitenPts = result.breakdown.find(b => b.category === 'Buitenruimte')?.punten ?? 0
    const potentialOpp = Math.min(input.buitenOpp + 20, 43)
    const potentialPts = Math.min(Math.round(potentialOpp * 0.35), 15)
    const extra = potentialPts - currentBuitenPts
    if (extra > 0) {
      advice.push({
        titel: 'Buitenruimte vergroten of toevoegen',
        huidig: `${input.buitenOpp} m² (${currentBuitenPts} pt)`,
        na: `${potentialOpp} m² (${potentialPts} pt)`,
        extraPunten: extra,
        extraHuur: Math.round(extra * 6.8),
        investering: extra * 1200,
        terugverdientijd: Math.round((extra * 1200) / (extra * 6.8) / 12),
        icon: <Trees className="h-5 w-5" />,
        priority: 3,
      })
    }
  }

  if (input.keukenItems.length < 4) {
    const missing = KEUKEN_OPTIES.filter(k => !input.keukenItems.includes(k.id))
    const extra = Math.min(missing.length * 2, 8 - Math.min(input.keukenItems.length * 2, 8))
    if (extra > 0) {
      advice.push({
        titel: `Keuken completeren (${missing.map(m => m.label).join(', ')})`,
        huidig: `${input.keukenItems.length}/4 voorzieningen`,
        na: `4/4 voorzieningen`,
        extraPunten: extra,
        extraHuur: Math.round(extra * 6.8),
        investering: missing.length * 350,
        terugverdientijd: Math.round((missing.length * 350) / (extra * 6.8) / 12),
        icon: <Flame className="h-5 w-5" />,
        priority: 2,
      })
    }
  }

  if (input.sanitairItems.length < 4) {
    const missing = SANITAIR_OPTIES.filter(s => !input.sanitairItems.includes(s.id))
    const extra = Math.min(missing.length * 3, 12 - Math.min(input.sanitairItems.length * 3, 12))
    if (extra > 0) {
      advice.push({
        titel: `Sanitair uitbreiden (${missing.map(m => m.label).join(', ')})`,
        huidig: `${input.sanitairItems.length}/4 voorzieningen`,
        na: `4/4 voorzieningen`,
        extraPunten: extra,
        extraHuur: Math.round(extra * 6.8),
        investering: missing.length * 800,
        terugverdientijd: Math.round((missing.length * 800) / (extra * 6.8) / 12),
        icon: <Droplets className="h-5 w-5" />,
        priority: 2,
      })
    }
  }

  if (input.verwarming === 'geen') {
    advice.push({
      titel: 'Verwarmingssysteem installeren',
      huidig: 'Geen verwarming',
      na: 'Centraal of individueel',
      extraPunten: 2,
      extraHuur: Math.round(2 * 6.8),
      investering: 3500,
      terugverdientijd: Math.round(3500 / (2 * 6.8) / 12),
      icon: <Flame className="h-5 w-5" />,
      priority: 4,
    })
  }

  return advice.sort((a, b) => {
    const roiA = a.extraHuur * 12 / a.investering
    const roiB = b.extraHuur * 12 / b.investering
    return roiB - roiA
  })
}

const SECTOR_COLORS = {
  sociaal: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-600' },
  midden: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-600' },
  vrij: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-600' },
}

export default function PuntentellingPage() {
  const { isDemo } = useDashboardUser()
  const propertyInputs = isDemo ? mockPropertyInputs : []
  const wwsObjects = isDemo ? mockWwsObjects : []
  const optimalisatieAdviezen = isDemo ? mockWwsOptimalisatieAdviezen : []
  const historyData = isDemo ? mockHistory : {} as Record<string, HistoryEntry[]>
  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyInputs[0]?.propertyId ?? '')
  const [formData, setFormData] = useState<Record<string, WWInput>>(() => {
    const map: Record<string, WWInput> = {}
    propertyInputs.forEach((p: PropertyWWSInput) => {
      const { propertyId, propertyLabel, ...input } = p
      map[propertyId] = input
    })
    return map
  })
  const [activeTab, setActiveTab] = useState<'berekening' | 'optimalisatie' | 'historie'>('berekening')

  const input = formData[selectedPropertyId]
  const result = useMemo(() => (input ? berekenWWS(input) : null), [input])
  const propertyLabel = propertyInputs.find(p => p.propertyId === selectedPropertyId)?.propertyLabel ?? ''
  const wwsObj = wwsObjects.find((o: { id: string }) => o.id === selectedPropertyId)
  const history = historyData[selectedPropertyId] ?? []
  const optimisationAdvice = useMemo(() => (result && input ? getOptimisationAdvice(result, input) : []), [result, input])

  const updateField = <K extends keyof WWInput>(field: K, value: WWInput[K]) => {
    setFormData((prev) => ({
      ...prev,
      [selectedPropertyId]: { ...prev[selectedPropertyId], [field]: value },
    }))
  }

  const toggleListItem = (field: 'keukenItems' | 'sanitairItems', itemId: string) => {
    const current = input[field]
    const next = current.includes(itemId) ? current.filter(i => i !== itemId) : [...current, itemId]
    updateField(field, next)
  }

  if (!isDemo && propertyInputs.length === 0) {
    return (
      <>
        <SectionNavDashboard title="Compliance" items={COMPLIANCE_NAV} />
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Puntentelling</h1>
            <p className="text-gray-600 dark:text-gray-400">Bereken WWS-punten voor je panden</p>
          </div>
          <Card className={dashboardCardClass()}>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Nog geen objecten voor puntentelling.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Voeg eerst panden toe aan je portefeuille.</p>
              <Button className="mt-4" onClick={() => window.location.href = '/dashboard/employer/portfolio/properties/new'}>
                Pand toevoegen
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }
  if (!input || !result) return null

  const sectorStyle = SECTOR_COLORS[result.sector]
  const currentRent = wwsObj?.huidigeHuur ?? 0
  const rentDiff = result.maxHuur - currentRent

  const totalOptExtra = optimisationAdvice.reduce((s, a) => s + a.extraPunten, 0)
  const potentialPunten = result.punten + totalOptExtra
  const potentialResult = berekenWWS({
    ...input,
    keukenItems: [...KEUKEN_OPTIES.map(k => k.id)],
    sanitairItems: [...SANITAIR_OPTIES.map(s => s.id)],
    energielabel: ENERGIELABELS[Math.max(0, ENERGIELABELS.indexOf(input.energielabel) - 3)],
    buitenOpp: Math.min(input.buitenOpp + 20, 43),
    verwarming: 'centraal',
  })

  return (
    <div className="space-y-6">
      <SectionNavDashboard title="Compliance" items={COMPLIANCE_NAV} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Puntentelling</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            WWS-punten berekenen per pand, jaarlijks herberekenen en optimaliseren
          </p>
        </div>
        <Button
          className="bg-[#163300] hover:bg-[#356258] text-white gap-2"
          onClick={() => {
            if (result && input) {
              downloadWWSPDF({
                propertyAddress: propertyLabel,
                result,
                input,
                currentRent: wwsObj?.huidigeHuur,
              })
            }
          }}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Property selector */}
      <Card className={dashboardCardClass()}>
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1 space-y-1.5">
              <Label>Selecteer pand</Label>
              <Select value={selectedPropertyId} onValueChange={(v) => { setSelectedPropertyId(v); setActiveTab('berekening') }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyInputs.map((p: PropertyWWSInput) => {
                    const obj = wwsObjects.find((o: { id: string }) => o.id === p.propertyId)
                    return (
                      <SelectItem key={p.propertyId} value={p.propertyId}>
                        <span className="flex items-center gap-2">
                          {p.propertyLabel}
                          {obj && (
                            <Badge variant="outline" className="text-xs ml-1">
                              {obj.punten} pt
                            </Badge>
                          )}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={dashboardCardClass()}>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-[#163300] flex items-center justify-center mb-3">
              <span className="text-3xl font-bold text-white">{result.punten}</span>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">WWS-punten</p>
            <Badge className={`mt-2 ${sectorStyle.bg} ${sectorStyle.text} border ${sectorStyle.border}`}>
              {result.sector === 'sociaal' ? 'Sociaal (≤143)' : result.sector === 'midden' ? 'Midden (144-186)' : 'Vrij (≥187)'}
            </Badge>
          </CardContent>
        </Card>

        <Card className={dashboardCardClass()}>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Euro className="h-8 w-8 text-[#163300] dark:text-[#9FE870] mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">€{result.maxHuur.toLocaleString('nl-NL')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Maximale huurprijs</p>
            {currentRent > 0 && (
              <p className={`text-sm mt-2 font-medium ${rentDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {rentDiff >= 0 ? `€${rentDiff} onder max` : `€${Math.abs(rentDiff)} boven max!`}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={dashboardCardClass()}>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <TrendingUp className="h-8 w-8 text-[#163300] dark:text-[#9FE870] mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">+{totalOptExtra}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Potentieel extra punten</p>
            <p className="text-xs text-gray-400 mt-1">
              {result.punten} → {potentialPunten} punten mogelijk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-neutral-800 rounded-xl p-1">
        {([
          { id: 'berekening' as const, label: 'Berekening', icon: Calculator },
          { id: 'optimalisatie' as const, label: 'Optimalisatie', icon: Lightbulb },
          { id: 'historie' as const, label: 'Historie', icon: History },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Berekening */}
      {activeTab === 'berekening' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <Card className={dashboardCardClass()}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Home className="h-5 w-5" />
                  Woninggegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Type woning</Label>
                    <Select value={input.typeWoning} onValueChange={(v) => updateField('typeWoning', v as WWInput['typeWoning'])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {WONINGTYPEN.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Bouwjaar</Label>
                    <Input type="number" value={input.bouwjaar} onChange={(e) => updateField('bouwjaar', Number(e.target.value))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Postcode</Label>
                    <Input value={input.postcode} onChange={(e) => updateField('postcode', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Huisnummer</Label>
                    <Input value={input.huisnummer} onChange={(e) => updateField('huisnummer', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={dashboardCardClass()}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Maximize2 className="h-5 w-5" />
                  Oppervlakte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Woonoppervlakte (m²)</Label>
                    <Input type="number" value={input.woonOpp} onChange={(e) => updateField('woonOpp', Number(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Overige ruimtes (m²)</Label>
                    <Input type="number" value={input.overigeOpp} onChange={(e) => updateField('overigeOpp', Number(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Buitenruimte (m²)</Label>
                    <Input type="number" value={input.buitenOpp} onChange={(e) => updateField('buitenOpp', Number(e.target.value))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Aantal kamers</Label>
                  <Input type="number" value={input.aantalKamers} onChange={(e) => updateField('aantalKamers', Number(e.target.value))} />
                </div>
              </CardContent>
            </Card>

            <Card className={dashboardCardClass()}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sun className="h-5 w-5" />
                  Energie &amp; WOZ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Energielabel</Label>
                    <Select value={input.energielabel} onValueChange={(v) => updateField('energielabel', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ENERGIELABELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>WOZ-waarde (€)</Label>
                    <Input type="number" value={input.wozWaarde} onChange={(e) => updateField('wozWaarde', Number(e.target.value))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Verwarming</Label>
                  <Select value={input.verwarming} onValueChange={(v) => updateField('verwarming', v as WWInput['verwarming'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="centraal">Centraal</SelectItem>
                      <SelectItem value="individueel">Individueel</SelectItem>
                      <SelectItem value="geen">Geen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className={dashboardCardClass()}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flame className="h-5 w-5" />
                  Keuken &amp; Sanitair
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Keukenvoorzieningen</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {KEUKEN_OPTIES.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={input.keukenItems.includes(item.id)}
                          onCheckedChange={() => toggleListItem('keukenItems', item.id)}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Sanitairvoorzieningen</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SANITAIR_OPTIES.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={input.sanitairItems.includes(item.id)}
                          onCheckedChange={() => toggleListItem('sanitairItems', item.id)}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className={dashboardCardClass('sticky top-20')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Puntenbreakdown
                </CardTitle>
                <CardDescription>{propertyLabel}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.breakdown.map((item) => {
                  const maxForCategory: Record<string, number> = {
                    'Oppervlakte woonruimte': 120,
                    'Oppervlakte overige ruimtes': 30,
                    'Buitenruimte': 15,
                    'Energielabel': 54,
                    'WOZ-waarde component': 60,
                    'Keuken': 8,
                    'Sanitair': 12,
                    'Verwarming': 2,
                  }
                  const max = maxForCategory[item.category] ?? item.punten
                  const pct = max > 0 ? Math.min(100, (item.punten / max) * 100) : 0
                  return (
                    <div key={item.category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{item.category}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{item.punten} pt</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2">
                        <div className="h-full bg-[#163300] dark:bg-[#9FE870] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{item.toelichting}</p>
                    </div>
                  )
                })}

                <div className="pt-3 border-t border-gray-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Totaal</span>
                    <span className="text-2xl font-bold text-[#163300] dark:text-[#9FE870]">{result.punten} punten</span>
                  </div>
                </div>

                <div className={`mt-4 p-4 rounded-xl border ${sectorStyle.border} ${sectorStyle.bg}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${sectorStyle.text}`}>
                        Sector: {result.sector.charAt(0).toUpperCase() + result.sector.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {result.sector === 'sociaal' && '≤ 143 punten'}
                        {result.sector === 'midden' && '144 – 186 punten'}
                        {result.sector === 'vrij' && '≥ 187 punten'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">€{result.maxHuur.toLocaleString('nl-NL')}</p>
                      <p className="text-xs text-gray-500">max. huurprijs</p>
                    </div>
                  </div>
                </div>

                {result.sector === 'midden' && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      <strong>Tip:</strong> Nog {187 - result.punten} punten nodig voor vrije sector.
                      Bekijk het optimalisatie-tab voor suggesties.
                    </p>
                  </div>
                )}
                {result.sector === 'sociaal' && (
                  <div className="bg-slate-50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Tip:</strong> Nog {144 - result.punten} punten nodig voor middensector.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Optimalisatie */}
      {activeTab === 'optimalisatie' && (
        <div className="space-y-4">
          <Card className={dashboardCardClass()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Optimalisatie — {propertyLabel}
              </CardTitle>
              <CardDescription>
                Hoe je met verbeteringen meer punten (en dus een hogere maximale huur) kunt bereiken. Gesorteerd op ROI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {optimisationAdvice.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">
                  Dit pand is al volledig geoptimaliseerd — alle voorzieningen zijn aanwezig en het energielabel is hoog.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">+{totalOptExtra}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">extra punten mogelijk</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        €{optimisationAdvice.reduce((s, a) => s + a.extraHuur, 0).toLocaleString('nl-NL')}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">extra huur/maand mogelijk</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {potentialResult.sector.charAt(0).toUpperCase() + potentialResult.sector.slice(1)}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">sector na optimalisatie</p>
                    </div>
                  </div>

                  {/* Advice cards */}
                  {optimisationAdvice.map((advice, i) => {
                    const roi = ((advice.extraHuur * 12) / advice.investering * 100).toFixed(0)
                    return (
                      <div
                        key={i}
                        className="border border-gray-200 dark:border-neutral-700 rounded-xl p-4 hover:border-[#163300] dark:hover:border-[#9FE870] transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-full bg-[#163300]/10 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0 text-[#163300] dark:text-[#9FE870]">
                            {advice.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{advice.titel}</h4>
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 shrink-0">
                                +{advice.extraPunten} pt
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <span>{advice.huidig}</span>
                              <ChevronRight className="h-3 w-3" />
                              <span className="text-[#163300] dark:text-[#9FE870] font-medium">{advice.na}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                              <div>
                                <p className="text-gray-400 text-xs">Investering</p>
                                <p className="font-medium text-gray-900 dark:text-white">€{advice.investering.toLocaleString('nl-NL')}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">Extra huur/mnd</p>
                                <p className="font-medium text-emerald-600">+€{advice.extraHuur}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">ROI</p>
                                <p className="font-medium text-blue-600">{roi}%/jaar</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Historie */}
      {activeTab === 'historie' && (
        <Card className={dashboardCardClass()}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Berekeningshistorie — {propertyLabel}
            </CardTitle>
            <CardDescription>Jaarlijkse herberekeningen en trend</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm py-6 text-center">
                Nog geen eerdere berekeningen voor dit pand. De huidige berekening is de eerste.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Trend */}
                {history.length >= 2 && (
                  <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 flex items-center gap-4">
                    <TrendingUp className="h-6 w-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Trend: {history[0].punten - history[history.length - 1].punten > 0 ? '+' : ''}
                        {history[0].punten - history[history.length - 1].punten} punten over {history.length} berekeningen
                      </p>
                      <p className="text-xs text-gray-500">
                        Van {history[history.length - 1].punten} punten ({history[history.length - 1].year}) naar {history[0].punten} punten ({history[0].year})
                      </p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="relative">
                  {history.map((entry, i) => {
                    const prevEntry = history[i + 1]
                    const diff = prevEntry ? entry.punten - prevEntry.punten : 0
                    const sectorColors = SECTOR_COLORS[entry.sector as keyof typeof SECTOR_COLORS]
                    return (
                      <div key={entry.date} className="flex gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-[#163300] dark:bg-[#9FE870] ring-4 ring-white dark:ring-neutral-900" />
                          {i < history.length - 1 && <div className="flex-1 w-0.5 bg-gray-200 dark:bg-neutral-700 mt-1" />}
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 -mt-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{entry.year}</p>
                              <p className="text-xs text-gray-500">{entry.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900 dark:text-white">{entry.punten} pt</p>
                              {diff !== 0 && (
                                <p className={`text-xs font-medium ${diff > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {diff > 0 ? '+' : ''}{diff} t.o.v. vorig
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`${sectorColors?.bg} ${sectorColors?.text} border ${sectorColors?.border} text-xs`}>
                              {entry.sector.charAt(0).toUpperCase() + entry.sector.slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-500">Max. €{entry.maxHuur.toLocaleString('nl-NL')}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
