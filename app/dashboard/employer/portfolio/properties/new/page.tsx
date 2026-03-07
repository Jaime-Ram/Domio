'use client'

import { useState } from 'react'
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
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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

export default function NewPropertyPage() {
  const router = useRouter()
  const { user, basePath, isDemo } = useDashboardUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    address: '',
    postcode: '',
    city: '',
    type: 'appartement',
    build_year: '',
    woz_value: '',
    energy_label: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      } as never)
      if (err) throw err
      router.push(`${basePath}/portfolio`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <Link
        href={`${basePath}/portfolio`}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#163300] dark:hover:text-[#9FE870] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar portefeuille
      </Link>
      <Card className={dashboardCardClass(undefined, isDemo)}>
        <CardHeader>
          <CardTitle>Nieuw pand toevoegen</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vul de gegevens van je pand in.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded-lg">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="address">Adres *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Straatnaam 123"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={form.postcode}
                  onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
                  placeholder="1234 AB"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Plaats</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Amsterdam"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Naam/omschrijving (optioneel)</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Bijv. Keizersgracht 12-A"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="build_year">Bouwjaar</Label>
                <Input
                  id="build_year"
                  type="number"
                  value={form.build_year}
                  onChange={(e) => setForm((f) => ({ ...f, build_year: e.target.value }))}
                  placeholder="Bijv. 1990"
                  min="1500"
                  max="2100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="woz_value">WOZ-waarde (€)</Label>
                <Input
                  id="woz_value"
                  type="number"
                  value={form.woz_value}
                  onChange={(e) => setForm((f) => ({ ...f, woz_value: e.target.value }))}
                  placeholder="Bijv. 250000"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Energielabel</Label>
              <Select value={form.energy_label} onValueChange={(v) => setForm((f) => ({ ...f, energy_label: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer energielabel" />
                </SelectTrigger>
                <SelectContent>
                  {ENERGY_LABELS.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-[#163300] hover:bg-[#356258]">
                {loading ? 'Bezig...' : 'Pand toevoegen'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`${basePath}/portfolio`}>Annuleren</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
