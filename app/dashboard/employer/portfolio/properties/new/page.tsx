'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'

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

type AutoField = 'address' | 'city' | 'build_year' | 'woz_value' | 'energy_label' | 'ean_electricity' | 'ean_gas'

const STEPS = ['Locatie', 'Pand', 'Energie']

export default function NewPropertyPage() {
  const router = useRouter()
  const { user, basePath, isDemo } = useDashboardUser()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoFilled, setAutoFilled] = useState<Set<AutoField>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [form, setForm] = useState({
    name: '',
    postcode: '',
    huisnummer: '',
    address: '',
    city: '',
    type: 'appartement',
    build_year: '',
    woz_value: '',
    energy_label: '',
    ean_electricity: '',
    ean_gas: '',
    bag_id: '',
  })

  const set = (field: string, value: string, auto = false) => {
    setForm(f => ({ ...f, [field]: value }))
    if (auto) setAutoFilled(prev => new Set([...prev, field as AutoField]))
    else setAutoFilled(prev => { const s = new Set(prev); s.delete(field as AutoField); return s })
  }

  useEffect(() => {
    const pc = form.postcode.replace(/\s/g, '')
    const hn = form.huisnummer.trim()
    if (pc.length !== 6 || !hn) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLookupLoading(true)
      try {
        const res = await fetch('/api/ean-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postcode: pc, huisnummer: hn }),
        })
        if (!res.ok) return
        const data = await res.json()
        if (data.address)         set('address',         data.address,         true)
        if (data.city)            set('city',            data.city,            true)
        if (data.build_year)      set('build_year',      String(data.build_year), true)
        if (data.woz_value)       set('woz_value',       String(data.woz_value),  true)
        if (data.energy_label)    set('energy_label',    data.energy_label,    true)
        if (data.ean_electricity) set('ean_electricity', data.ean_electricity, true)
        if (data.ean_gas)         set('ean_gas',         data.ean_gas,         true)
        if (data.bag_id)          set('bag_id',          data.bag_id,          true)
      } catch {}
      finally { setLookupLoading(false) }
    }, 600)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.postcode, form.huisnummer])

  const handleSubmit = async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase.from('properties').insert({
        owner_id: user.id,
        name: form.name || form.address || 'Nieuw pand',
        address: form.address,
        postcode: form.postcode || null,
        city: form.city || null,
        type: form.type,
        build_year: form.build_year ? parseInt(form.build_year) : null,
        woz_value: form.woz_value ? parseFloat(form.woz_value) : null,
        energy_label: form.energy_label || null,
        ean_electricity: form.ean_electricity || null,
        ean_gas: form.ean_gas || null,
        bag_id: form.bag_id || null,
      } as never)
      if (err) throw err
      router.push(`${basePath}/portfolio`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  function AutoBadge({ field }: { field: AutoField }) {
    if (!autoFilled.has(field)) return null
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#163300] dark:text-[#9FE870] bg-[#163300]/8 dark:bg-[#9FE870]/10 px-1.5 py-0.5 rounded-full ml-1.5">
        <Sparkles className="h-2.5 w-2.5" />
        auto
      </span>
    )
  }

  function autoInput(field: AutoField, props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <Input
        {...props}
        value={form[field as keyof typeof form]}
        onChange={(e) => set(field, e.target.value)}
        className={cn(props.className, autoFilled.has(field) && 'border-[#163300]/30 dark:border-[#9FE870]/30')}
      />
    )
  }

  return (
    <div className="max-w-md">
      <Card className={dashboardCardClass(undefined, isDemo)}>
        <CardHeader className="pb-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                  i === step
                    ? 'bg-[#163300] dark:bg-[#9FE870] text-white dark:text-[#163300]'
                    : i < step
                    ? 'bg-[#163300]/20 dark:bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-gray-500'
                )}>
                  {i + 1}
                </div>
                <span className={cn(
                  'text-xs font-medium',
                  i === step ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
                )}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={cn('h-px w-6 mx-1', i < step ? 'bg-[#163300]/30 dark:bg-[#9FE870]/30' : 'bg-gray-200 dark:bg-neutral-700')} />
                )}
              </div>
            ))}
          </div>
          <CardTitle className="text-base">
            {step === 0 && 'Locatie'}
            {step === 1 && 'Pandgegevens'}
            {step === 2 && 'Energie & EAN'}
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {step === 0 && 'Vul postcode en huisnummer in — de rest wordt automatisch opgehaald.'}
            {step === 1 && 'Controleer de pandgegevens en vul aan waar nodig.'}
            {step === 2 && 'Energie-aansluitingen worden automatisch opgehaald waar beschikbaar.'}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded-lg">
              {error}
            </p>
          )}

          {/* ── Stap 1: Locatie ── */}
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={form.postcode}
                    onChange={(e) => set('postcode', e.target.value)}
                    placeholder="1234 AB"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="huisnummer">Huisnummer *</Label>
                  <div className="relative">
                    <Input
                      id="huisnummer"
                      value={form.huisnummer}
                      onChange={(e) => set('huisnummer', e.target.value)}
                      placeholder="12A"
                    />
                    {lookupLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">
                  Adres <AutoBadge field="address" />
                </Label>
                {autoInput('address', { id: 'address', placeholder: 'Wordt automatisch ingevuld' })}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">
                  Plaats <AutoBadge field="city" />
                </Label>
                {autoInput('city', { id: 'city', placeholder: 'Wordt automatisch ingevuld' })}
              </div>
            </>
          )}

          {/* ── Stap 2: Pandgegevens ── */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Naam / omschrijving</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Bijv. Keizersgracht 12-A"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => set('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="build_year">
                    Bouwjaar <AutoBadge field="build_year" />
                  </Label>
                  {autoInput('build_year', { id: 'build_year', type: 'number', placeholder: '1990', min: '1500', max: '2100' })}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="woz_value">
                    WOZ-waarde (€) <AutoBadge field="woz_value" />
                  </Label>
                  {autoInput('woz_value', { id: 'woz_value', type: 'number', placeholder: '250000', min: '0' })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  Energielabel <AutoBadge field="energy_label" />
                </Label>
                <Select value={form.energy_label} onValueChange={(v) => set('energy_label', v)}>
                  <SelectTrigger className={cn(autoFilled.has('energy_label') && 'border-[#163300]/30 dark:border-[#9FE870]/30')}>
                    <SelectValue placeholder="Selecteer energielabel" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENERGY_LABELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* ── Stap 3: Energie ── */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ean_electricity">
                  EAN elektra <AutoBadge field="ean_electricity" />
                </Label>
                {autoInput('ean_electricity', { id: 'ean_electricity', placeholder: 'Wordt automatisch opgehaald' })}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ean_gas">
                  EAN gas <AutoBadge field="ean_gas" />
                </Label>
                {autoInput('ean_gas', { id: 'ean_gas', placeholder: 'Wordt automatisch opgehaald' })}
              </div>
            </>
          )}
        </CardContent>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-neutral-800">
          {/* Links: terug (stap) of terug naar portefeuille */}
          {step === 0 ? (
            <Link
              href={`${basePath}/portfolio`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => { setError(null); setStep(s => s - 1) }}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug
            </button>
          )}

          {/* Rechts: volgende of opslaan */}
          {step < 2 ? (
            <Button
              type="button"
              onClick={() => { setError(null); setStep(s => s + 1) }}
              disabled={step === 0 && (!form.postcode || !form.huisnummer)}
              className="bg-[#163300] hover:bg-[#356258] dark:bg-[#9FE870] dark:text-[#163300] dark:hover:bg-[#8fd960]"
            >
              Volgende
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#163300] hover:bg-[#356258] dark:bg-[#9FE870] dark:text-[#163300] dark:hover:bg-[#8fd960]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pand toevoegen'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
