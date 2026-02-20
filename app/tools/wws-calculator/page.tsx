'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  berekenWWS,
  KEUKEN_OPTIES,
  SANITAIR_OPTIES,
  ENERGIELABELS,
  WONINGTYPEN,
  type WWInput,
} from '@/lib/wws-calculator'
import { ArrowRight, ArrowLeft, Download, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const SECTOR_LABELS = {
  sociaal: 'Sociaal (≤143 punten)',
  midden: 'Midden (144-186 punten)',
  vrij: 'Vrij (≥187 punten)',
}

const SECTOR_COLORS = {
  sociaal: '#64748B',
  midden: '#F59E0B',
  vrij: '#10B981',
}

const defaultInput: WWInput = {
  postcode: '',
  huisnummer: '',
  typeWoning: 'appartement',
  bouwjaar: new Date().getFullYear(),
  woonOpp: 0,
  overigeOpp: 0,
  buitenOpp: 0,
  aantalKamers: 0,
  keukenItems: [],
  sanitairItems: [],
  verwarming: 'individueel',
  energielabel: 'A',
  wozWaarde: 0,
}

export default function WWSCalculatorPage() {
  const [step, setStep] = useState(1)
  const [input, setInput] = useState<WWInput>(defaultInput)

  const result = step === 5 ? berekenWWS(input) : null

  const update = (patch: Partial<WWInput>) => setInput((prev) => ({ ...prev, ...patch }))

  const toggleKeuken = (id: string) => {
    setInput((prev) => ({
      ...prev,
      keukenItems: prev.keukenItems.includes(id)
        ? prev.keukenItems.filter((x) => x !== id)
        : [...prev.keukenItems, id],
    }))
  }

  const toggleSanitair = (id: string) => {
    setInput((prev) => ({
      ...prev,
      sanitairItems: prev.sanitairItems.includes(id)
        ? prev.sanitairItems.filter((x) => x !== id)
        : [...prev.sanitairItems, id],
    }))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur border-b border-gray-200 dark:border-neutral-800">
        <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/">
            <Logo width={100} height={28} />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#163300] flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
            Terug
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#163300] dark:text-[#9FE870]">
            WWS Puntentelling Calculator
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Bereken gratis uw woningwaarderingspunten. Indicatief — voor definitieve telling raadpleeg een
            erkend taxateur.
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                s <= step ? 'bg-[#163300]' : 'bg-gray-200 dark:bg-neutral-700'
              )}
            />
          ))}
        </div>

        {/* Step 1: Basisgegevens */}
        {step === 1 && (
          <Card className="rounded-2xl border shadow-lg">
            <CardHeader>
              <CardTitle>Stap 1: Basisgegevens</CardTitle>
              <p className="text-sm text-gray-500">Adres en type woning</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Postcode</Label>
                  <Input
                    placeholder="1234 AB"
                    value={input.postcode}
                    onChange={(e) => update({ postcode: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Huisnummer</Label>
                  <Input
                    placeholder="12"
                    value={input.huisnummer}
                    onChange={(e) => update({ huisnummer: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Type woning</Label>
                <Select
                  value={input.typeWoning}
                  onValueChange={(v: WWInput['typeWoning']) => update({ typeWoning: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WONINGTYPEN.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bouwjaar</Label>
                <Input
                  type="number"
                  placeholder="2020"
                  value={input.bouwjaar || ''}
                  onChange={(e) => update({ bouwjaar: Number(e.target.value) || 0 })}
                />
              </div>
              <Button onClick={() => setStep(2)} className="w-full mt-4 bg-[#163300] hover:bg-[#163300]/90">
                Volgende
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Oppervlakte */}
        {step === 2 && (
          <Card className="rounded-2xl border shadow-lg">
            <CardHeader>
              <CardTitle>Stap 2: Oppervlakte</CardTitle>
              <p className="text-sm text-gray-500">Meet de vloeroppervlakte van alle ruimtes</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Woonoppervlakte (m²)</Label>
                <Input
                  type="number"
                  placeholder="72"
                  value={input.woonOpp || ''}
                  onChange={(e) => update({ woonOpp: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Overige ruimtes (m²) — berging, zolder niet als woonruimte</Label>
                <Input
                  type="number"
                  placeholder="8"
                  value={input.overigeOpp || ''}
                  onChange={(e) => update({ overigeOpp: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Buitenruimte (m²) — balkon, tuin, dakterras</Label>
                <Input
                  type="number"
                  placeholder="12"
                  value={input.buitenOpp || ''}
                  onChange={(e) => update({ buitenOpp: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Aantal kamers (exclusief keuken en badkamer)</Label>
                <Input
                  type="number"
                  placeholder="3"
                  value={input.aantalKamers || ''}
                  onChange={(e) => update({ aantalKamers: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Terug
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 bg-[#163300] hover:bg-[#163300]/90">
                  Volgende
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Voorzieningen */}
        {step === 3 && (
          <Card className="rounded-2xl border shadow-lg">
            <CardHeader>
              <CardTitle>Stap 3: Voorzieningen</CardTitle>
              <p className="text-sm text-gray-500">Keuken, sanitair en verwarming</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">Keuken</Label>
                <div className="flex flex-wrap gap-4">
                  {KEUKEN_OPTIES.map((o) => (
                    <label key={o.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={input.keukenItems.includes(o.id)}
                        onCheckedChange={() => toggleKeuken(o.id)}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Sanitair</Label>
                <div className="flex flex-wrap gap-4">
                  {SANITAIR_OPTIES.map((o) => (
                    <label key={o.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={input.sanitairItems.includes(o.id)}
                        onCheckedChange={() => toggleSanitair(o.id)}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>Verwarming</Label>
                <Select
                  value={input.verwarming}
                  onValueChange={(v: WWInput['verwarming']) => update({ verwarming: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="centraal">Centraal</SelectItem>
                    <SelectItem value="individueel">Individueel</SelectItem>
                    <SelectItem value="geen">Geen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Terug
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1 bg-[#163300] hover:bg-[#163300]/90">
                  Volgende
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Energie & WOZ */}
        {step === 4 && (
          <Card className="rounded-2xl border shadow-lg">
            <CardHeader>
              <CardTitle>Stap 4: Energie & WOZ</CardTitle>
              <p className="text-sm text-gray-500">Energielabel en WOZ-waarde van de gemeente</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Energielabel</Label>
                <Select
                  value={input.energielabel}
                  onValueChange={(v) => update({ energielabel: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENERGIELABELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>WOZ-waarde (€)</Label>
                <Input
                  type="number"
                  placeholder="385000"
                  value={input.wozWaarde || ''}
                  onChange={(e) => update({ wozWaarde: Number(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Staat op je WOZ-beschikking van de gemeente
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Terug
                </Button>
                <Button onClick={() => setStep(5)} className="flex-1 bg-[#163300] hover:bg-[#163300]/90">
                  Bereken
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Resultaat */}
        {step === 5 && result && (
          <div className="space-y-6">
            <Card className="rounded-2xl border shadow-lg overflow-hidden">
              <div
                className="p-8 text-center"
                style={{ backgroundColor: SECTOR_COLORS[result.sector] + '20' }}
              >
                <p className="text-5xl font-bold text-gray-900 dark:text-white">
                  {result.punten} PUNTEN
                </p>
                <div className="mt-4 h-2 max-w-xs mx-auto bg-gray-200 dark:bg-neutral-700 rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((result.punten / 250) * 100, 100)}%`,
                      backgroundColor: SECTOR_COLORS[result.sector],
                    }}
                  />
                </div>
                <p
                  className="mt-4 font-semibold text-lg"
                  style={{ color: SECTOR_COLORS[result.sector] }}
                >
                  {result.sector === 'vrij' ? '🟢' : result.sector === 'midden' ? '🟠' : '🔵'}{' '}
                  {SECTOR_LABELS[result.sector]}
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Maximale huurprijs: €{result.maxHuur.toLocaleString('nl-NL')}/maand
                </p>
              </div>
            </Card>

            <Card className="rounded-2xl border shadow-lg">
              <CardHeader>
                <CardTitle>Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Categorie</th>
                        <th className="text-right py-2">Punten</th>
                        <th className="text-left py-2">Toelichting</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((r) => (
                        <tr key={r.category} className="border-b border-gray-100">
                          <td className="py-2">{r.category}</td>
                          <td className="text-right py-2">{r.punten}</td>
                          <td className="py-2 text-gray-500">{r.toelichting}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-lg bg-[#163300]/5 dark:bg-[#163300]/10 border-[#163300]/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">Optimalisatie suggesties</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {input.energielabel !== 'A++++' && (
                    <li>
                      Met label {input.energielabel === 'A' ? 'A+' : 'A'} i.p.v. {input.energielabel} stijgt uw score
                      met ca. 2 punten
                    </li>
                  )}
                  {input.sanitairItems.length < 4 && (
                    <li>Een extra toilet levert ca. 3 punten op</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download als PDF
              </Button>
              <Button variant="outline" onClick={() => setStep(4)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Opnieuw berekenen
              </Button>
            </div>

            {/* CTA banner */}
            <Card className="rounded-2xl border-2 border-[#163300] bg-[#163300]/5">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-xl mb-2">🏠 Beheer je hele portefeuille met Domio</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Automatische puntentellingen, compliance alerts, en PDF-generatie voor al je woningen.
                </p>
                <Button asChild className="bg-[#163300] hover:bg-[#163300]/90">
                  <Link href="/registreren">Start 30 dagen gratis</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
