'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  MapPin,
  CheckCircle2,
  Building2,
  Loader2,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ADD_DIALOG_BODY_SCROLL_CLASS,
  ADD_DIALOG_CLOSE_BUTTON_CLASS,
  ADD_DIALOG_FOOTER_SPLIT_CLASS,
  ADD_DIALOG_HEADER_CLASS,
  ADD_DIALOG_TITLE_CLASS,
  addDialogContentClassName,
} from '@/components/ui/add-dialog-layout'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PdokAdres {
  id: string
  weergavenaam: string
  straatnaam: string
  huis_nlt: string
  postcode: string
  woonplaatsnaam: string
  gemeentenaam: string
  provincienaam?: string
  nummeraanduiding_id?: string
  pandidentificatie?: string
}

export interface PropertyForm {
  name: string
  address: string
  postcode: string
  city: string
  municipality: string
  type: string
  build_year: string
  woz_value: string
  energy_label: string
  surface: string
  bag_pand_id: string
  ean_electricity: string
  ean_gas: string
  portfolio_id: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'eengezinswoning', label: 'Eengezinswoning' },
  { value: 'bovenwoning', label: 'Bovenwoning' },
  { value: 'benedenwoning', label: 'Benedenwoning' },
  { value: 'maisonnette', label: 'Maisonnette' },
  { value: 'studio', label: 'Studio' },
  { value: 'complex', label: 'Complex' },
]

const ENERGY_LABELS = ['A+++++', 'A++++', 'A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G']

const ENERGY_COLORS: Record<string, string> = {
  'A+++++': 'bg-green-100 text-green-800',
  'A++++': 'bg-green-100 text-green-800',
  'A+++': 'bg-green-100 text-green-800',
  'A++': 'bg-green-100 text-green-800',
  'A+': 'bg-emerald-100 text-emerald-800',
  'A': 'bg-emerald-100 text-emerald-800',
  'B': 'bg-lime-100 text-lime-800',
  'C': 'bg-yellow-100 text-yellow-800',
  'D': 'bg-orange-100 text-orange-800',
  'E': 'bg-orange-200 text-orange-900',
  'F': 'bg-red-100 text-red-700',
  'G': 'bg-red-200 text-red-800',
}

const EMPTY_FORM: PropertyForm = {
  name: '',
  address: '',
  postcode: '',
  city: '',
  municipality: '',
  type: 'appartement',
  build_year: '',
  woz_value: '',
  energy_label: '',
  surface: '',
  bag_pand_id: '',
  ean_electricity: '',
  ean_gas: '',
  portfolio_id: '',
}

// ─── PDOK Locatieserver ───────────────────────────────────────────────────────

async function searchPdok(query: string): Promise<PdokAdres[]> {
  const url = new URL('https://api.pdok.nl/bzk/locatieserver/search/v3_1/free')
  url.searchParams.set('q', query)
  url.searchParams.set('fq', 'type:adres')
  url.searchParams.set('rows', '8')
  url.searchParams.set('fl', 'id,weergavenaam,straatnaam,huis_nlt,postcode,woonplaatsnaam,gemeentenaam,provincienaam,nummeraanduiding_id,pandidentificatie')

  const res = await fetch(url.toString())
  if (!res.ok) return []
  const json = await res.json()
  return (json?.response?.docs ?? []) as PdokAdres[]
}

async function fetchBagData(pandId: string): Promise<{ bouwjaar?: number; oppervlakte?: number } | null> {
  try {
    const res = await fetch(`/api/bag?pandId=${encodeURIComponent(pandId)}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/** WOZ, energielabel, EAN (EDSN), bouwjaar (als BAG-key); PDOK-adres in body. Oppervlakte alleen via /api/bag. */
async function fetchAddressEnrichment(postcode: string, huisnummer: string): Promise<{
  address?: string
  postcode?: string
  city?: string
  woz_value?: number | null
  energy_label?: string | null
  build_year?: number | null
  ean_electricity?: string | null
  ean_gas?: string | null
} | null> {
  try {
    const res = await fetch('/api/ean-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postcode: postcode.replace(/\s/g, '').toUpperCase(),
        huisnummer: huisnummer.trim(),
      }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NewPropertyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (data: PropertyForm) => Promise<void>
  portfolios?: { id: string; name: string }[]
  defaultPortfolioId?: string
}

export function NewPropertyDialog({ open, onOpenChange, onCreated, portfolios, defaultPortfolioId }: NewPropertyDialogProps) {
  const [step, setStep] = useState<'search' | 'confirm'>('search')
  const [postcode, setPostcode] = useState('')
  const [huisnummer, setHuisnummer] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<PdokAdres[]>([])
  const [searchError, setSearchError] = useState('')
  const [selectedAdres, setSelectedAdres] = useState<PdokAdres | null>(null)
  const [enrichmentLoading, setEnrichmentLoading] = useState(false)
  const [form, setForm] = useState<PropertyForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Set portfolio pre-selection when dialog opens
  useEffect(() => {
    if (open) setForm((f) => ({ ...f, portfolio_id: defaultPortfolioId || '' }))
  }, [open, defaultPortfolioId])

  const resetDialog = () => {
    setStep('search')
    setPostcode('')
    setHuisnummer('')
    setResults([])
    setSearchError('')
    setSelectedAdres(null)
    setForm(EMPTY_FORM)
    setSaving(false)
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) resetDialog()
    onOpenChange(val)
  }

  // Normalize postcode to "1234 AB" format
  const normalizePostcode = (v: string) =>
    v.replace(/\s/g, '').toUpperCase().replace(/^(\d{4})([A-Z]{2})$/, '$1 $2')

  const handleSearch = useCallback(async () => {
    const pc = normalizePostcode(postcode)
    if (!pc.match(/^\d{4}\s?[A-Z]{2}$/)) {
      setSearchError('Voer een geldige postcode in (bijv. 1234 AB)')
      return
    }
    setSearchError('')
    setSearching(true)
    setResults([])
    try {
      const query = huisnummer.trim() ? `${pc} ${huisnummer.trim()}` : pc
      const docs = await searchPdok(query)
      if (docs.length === 0) {
        setSearchError('Geen adressen gevonden. Controleer de postcode en huisnummer.')
      }
      setResults(docs)
    } catch {
      setSearchError('Zoeken mislukt. Controleer je internetverbinding.')
    } finally {
      setSearching(false)
    }
  }, [postcode, huisnummer])

  const handlePostcodeChange = (v: string) => {
    setPostcode(v)
    setSearchError('')
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    const pc = normalizePostcode(v)
    if (pc.match(/^\d{4}\s[A-Z]{2}$/) && huisnummer.trim()) {
      searchTimeout.current = setTimeout(handleSearch, 600)
    }
  }

  const handleHuisnummerChange = (v: string) => {
    setHuisnummer(v)
    setSearchError('')
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    const pc = normalizePostcode(postcode)
    if (pc.match(/^\d{4}\s[A-Z]{2}$/) && v.trim()) {
      searchTimeout.current = setTimeout(() => {
        const query = `${pc} ${v.trim()}`
        setSearching(true)
        searchPdok(query).then(docs => {
          setResults(docs)
          if (docs.length === 0) setSearchError('Geen adressen gevonden.')
        }).catch(() => setSearchError('Zoeken mislukt.')).finally(() => setSearching(false))
      }, 600)
    }
  }

  const handleSelectAdres = async (adres: PdokAdres) => {
    setSelectedAdres(adres)
    const baseForm: PropertyForm = {
      ...EMPTY_FORM,
      address: `${adres.straatnaam} ${adres.huis_nlt}`.trim(),
      postcode: adres.postcode,
      city: adres.woonplaatsnaam,
      municipality: adres.gemeentenaam,
      name: `${adres.straatnaam} ${adres.huis_nlt}`.trim(),
      bag_pand_id: adres.pandidentificatie ?? '',
      type: 'appartement',
    }
    setForm(baseForm)
    setStep('confirm')

    const pc = adres.postcode.replace(/\s/g, '').toUpperCase()
    const hn = adres.huis_nlt?.trim() || huisnummer.trim()
    setEnrichmentLoading(true)

    const enriched = await fetchAddressEnrichment(pc, hn)
    if (enriched) {
      setForm((prev) => ({
        ...prev,
        address: enriched.address?.trim() || prev.address,
        postcode: enriched.postcode || prev.postcode,
        city: enriched.city || prev.city,
        woz_value: enriched.woz_value != null ? String(enriched.woz_value) : prev.woz_value,
        energy_label: enriched.energy_label || prev.energy_label,
        build_year:
          enriched.build_year != null ? String(enriched.build_year) : prev.build_year,
        ean_electricity: enriched.ean_electricity || prev.ean_electricity,
        ean_gas: enriched.ean_gas || prev.ean_gas,
      }))
    }

    if (adres.pandidentificatie) {
      const bagData = await fetchBagData(adres.pandidentificatie)
      if (bagData) {
        setForm((prev) => ({
          ...prev,
          build_year: bagData.bouwjaar ? String(bagData.bouwjaar) : prev.build_year,
          surface: bagData.oppervlakte ? String(bagData.oppervlakte) : prev.surface,
        }))
      }
    }

    setEnrichmentLoading(false)
  }

  const handleSave = async () => {
    if (!form.address) return
    setSaving(true)
    try {
      await onCreated(form)
      handleOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={addDialogContentClassName()}
        closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
      >

        <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
          <div className="min-w-0 w-full">
            <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>
              {step === 'search' ? 'Pand toevoegen' : 'Bevestig gegevens'}
            </DialogTitle>
            {step !== 'search' && (
              <DialogDescription className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Controleer de gegevens. EAN, WOZ en energielabel worden automatisch ingevuld waar beschikbaar.
              </DialogDescription>
            )}
          </div>

          {/* Stap-indicator: volle breedte, tekst eronder */}
          <div className="w-full mt-3 space-y-2">
            <div className="flex gap-2 sm:gap-3 w-full">
              <div
                className={cn(
                  'h-1.5 min-h-[6px] rounded-full flex-1 transition-colors duration-300',
                  step === 'search'
                    ? 'bg-[#163300] dark:bg-[#9FE870]'
                    : 'bg-[#163300]/35 dark:bg-[#9FE870]/35'
                )}
              />
              <div
                className={cn(
                  'h-1.5 min-h-[6px] rounded-full flex-1 transition-colors duration-300',
                  step === 'confirm'
                    ? 'bg-[#163300] dark:bg-[#9FE870]'
                    : 'bg-gray-200 dark:bg-neutral-700'
                )}
              />
            </div>
            <p className="text-xs text-left text-gray-400 dark:text-gray-500">
              Stap {step === 'search' ? '1' : '2'} van 2
            </p>
          </div>
        </DialogHeader>

        <div className={cn(ADD_DIALOG_BODY_SCROLL_CLASS, 'space-y-5')}>

          {/* ── Stap 1: Adres zoeken ── */}
          {step === 'search' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Postcode</Label>
                  <Input
                    value={postcode}
                    onChange={e => handlePostcodeChange(e.target.value)}
                    placeholder="1234 AB"
                    className="rounded-xl uppercase"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Huisnummer</Label>
                  <div className="flex gap-2">
                    <Input
                      value={huisnummer}
                      onChange={e => handleHuisnummerChange(e.target.value)}
                      placeholder="12A"
                      className="rounded-xl flex-1"
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={handleSearch}
                      disabled={searching}
                      className="rounded-xl h-10 w-10 bg-[#163300] hover:bg-[#163300]/90 text-white dark:bg-[#9FE870] dark:text-[#163300] shrink-0"
                    >
                      {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {searchError && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2.5 rounded-xl">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {searchError}
                </div>
              )}

              {/* Resultaten */}
              {results.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-[#163300] dark:text-[#9FE870]" />
                    {results.length} adres{results.length !== 1 ? 'sen' : ''} gevonden (PDOK)
                  </p>
                  <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 divide-y divide-gray-50 dark:divide-neutral-800 overflow-hidden">
                    {results.map((adres) => (
                      <button
                        key={adres.id}
                        type="button"
                        onClick={() => handleSelectAdres(adres)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-[#163300]/6 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
                            <MapPin className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {adres.straatnaam} {adres.huis_nlt}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {adres.postcode} · {adres.woonplaatsnaam}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#163300] dark:group-hover:text-[#9FE870] shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Handmatig invullen */}
              {results.length === 0 && !searching && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...EMPTY_FORM, postcode: normalizePostcode(postcode) })
                    setStep('confirm')
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-dashed border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 transition-colors text-sm text-gray-500 dark:text-gray-400"
                >
                  <span>Handmatig invullen</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </>
          )}

          {/* ── Stap 2: Bevestig gegevens ── */}
          {step === 'confirm' && (
            <>
              {/* Geselecteerd adres card */}
              {selectedAdres && (
                <div className="flex items-start gap-3 bg-[#163300]/5 dark:bg-[#9FE870]/8 rounded-2xl px-4 py-3.5">
                  <div className="h-9 w-9 rounded-xl bg-[#163300] dark:bg-[#9FE870] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-white dark:text-[#163300]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedAdres.straatnaam} {selectedAdres.huis_nlt}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {selectedAdres.postcode} {selectedAdres.woonplaatsnaam} · {selectedAdres.gemeentenaam}
                    </p>
                    {enrichmentLoading && (
                      <p className="text-xs text-[#163300] dark:text-[#9FE870] mt-1 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Gegevens ophalen (EAN, WOZ, energielabel)…
                      </p>
                    )}
                    {!enrichmentLoading &&
                      (form.ean_electricity ||
                        form.ean_gas ||
                        form.woz_value ||
                        form.energy_label ||
                        form.build_year) && (
                      <p className="text-xs text-[#163300] dark:text-[#9FE870] mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Beschikbare gegevens automatisch ingevuld
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Naam */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Naam / label <span className="text-gray-400">(optioneel)</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={form.address || 'Bijv. Keizersgracht 12-A'}
                  className="rounded-xl"
                />
              </div>

              {/* Adres (handmatig als geen BAG) */}
              {!selectedAdres && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Adres *</Label>
                    <Input
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="Straatnaam 123"
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Postcode</Label>
                      <Input value={form.postcode} onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))} placeholder="1234 AB" className="rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Plaats</Label>
                      <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Amsterdam" className="rounded-xl" />
                    </div>
                  </div>
                </div>
              )}

              {/* Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Type pand</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {PROPERTY_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Portefeuille */}
              {(portfolios?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Portefeuille</Label>
                  <Select
                    value={form.portfolio_id || '__geen'}
                    onValueChange={(v) => setForm((f) => ({ ...f, portfolio_id: v === '__geen' ? '' : v }))}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Geen (niet ingedeeld)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="__geen">Geen (niet ingedeeld)</SelectItem>
                      {portfolios?.map((pf) => (
                        <SelectItem key={pf.id} value={pf.id}>{pf.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Bouwjaar + Oppervlak */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    Bouwjaar
                    {form.build_year && !enrichmentLoading && (
                      <Badge className="text-[10px] h-4 bg-[#163300]/8 text-[#163300] dark:bg-[#9FE870]/10 dark:text-[#9FE870] border-0 font-medium px-1.5 py-0">BAG</Badge>
                    )}
                  </Label>
                  <Input
                    type="number"
                    value={form.build_year}
                    onChange={e => setForm(f => ({ ...f, build_year: e.target.value }))}
                    placeholder={enrichmentLoading ? 'Laden…' : '1990'}
                    className="rounded-xl"
                    min="1500"
                    max="2100"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    Oppervlak (m²)
                    {form.surface && !enrichmentLoading && (
                      <Badge className="text-[10px] h-4 bg-[#163300]/8 text-[#163300] dark:bg-[#9FE870]/10 dark:text-[#9FE870] border-0 font-medium px-1.5 py-0">BAG</Badge>
                    )}
                  </Label>
                  <Input
                    type="number"
                    value={form.surface}
                    onChange={e => setForm(f => ({ ...f, surface: e.target.value }))}
                    placeholder={enrichmentLoading ? 'Laden…' : '85'}
                    className="rounded-xl"
                    min="1"
                  />
                </div>
              </div>

              {/* Energielabel + WOZ */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Energielabel</Label>
                  <Select value={form.energy_label} onValueChange={v => setForm(f => ({ ...f, energy_label: v }))}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecteer…">
                        {form.energy_label && (
                          <span className={cn('px-2 py-0.5 rounded text-xs font-bold', ENERGY_COLORS[form.energy_label])}>
                            {form.energy_label}
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {ENERGY_LABELS.map(l => (
                        <SelectItem key={l} value={l}>
                          <span className={cn('px-2 py-0.5 rounded text-xs font-bold mr-2', ENERGY_COLORS[l])}>{l}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">WOZ-waarde (€)</Label>
                  <Input
                    type="number"
                    value={form.woz_value}
                    onChange={e => setForm(f => ({ ...f, woz_value: e.target.value }))}
                    placeholder="250.000"
                    className="rounded-xl"
                    min="0"
                  />
                </div>
              </div>

              {/* EAN (automatisch uit EDSN / koppelregister waar mogelijk) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    EAN elektriciteit
                    {form.ean_electricity && !enrichmentLoading && (
                      <Badge className="text-[10px] h-4 bg-[#163300]/8 text-[#163300] dark:bg-[#9FE870]/10 dark:text-[#9FE870] border-0 font-medium px-1.5 py-0">
                        auto
                      </Badge>
                    )}
                  </Label>
                  <Input
                    value={form.ean_electricity}
                    onChange={e => setForm(f => ({ ...f, ean_electricity: e.target.value }))}
                    placeholder={enrichmentLoading ? 'Laden…' : '8716861…'}
                    className="rounded-xl font-mono text-sm"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    EAN gas
                    {form.ean_gas && !enrichmentLoading && (
                      <Badge className="text-[10px] h-4 bg-[#163300]/8 text-[#163300] dark:bg-[#9FE870]/10 dark:text-[#9FE870] border-0 font-medium px-1.5 py-0">
                        auto
                      </Badge>
                    )}
                  </Label>
                  <Input
                    value={form.ean_gas}
                    onChange={e => setForm(f => ({ ...f, ean_gas: e.target.value }))}
                    placeholder={enrichmentLoading ? 'Laden…' : '8716861…'}
                    className="rounded-xl font-mono text-sm"
                    autoComplete="off"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <footer className={ADD_DIALOG_FOOTER_SPLIT_CLASS}>
          {step === 'confirm' ? (
            <button
              type="button"
              onClick={() => setStep('search')}
              className={ADD_DIALOG_CLOSE_BUTTON_CLASS}
              aria-label="Vorige stap"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1"
            >
              Annuleren
            </button>
            {step === 'search' ? (
              <Button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] disabled:opacity-50 text-[#163300] text-sm font-semibold px-4 py-2 shrink-0"
                onClick={handleSearch}
                disabled={searching || !postcode.trim()}
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Search className="h-4 w-4 shrink-0" />}
                Zoeken
              </Button>
            ) : (
              <Button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] disabled:opacity-50 text-[#163300] text-sm font-semibold px-4 py-2 shrink-0"
                onClick={handleSave}
                disabled={saving || (!form.address && !selectedAdres)}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Building2 className="h-4 w-4 shrink-0" />}
                {saving ? 'Aanmaken…' : 'Pand aanmaken'}
              </Button>
            )}
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  )
}
