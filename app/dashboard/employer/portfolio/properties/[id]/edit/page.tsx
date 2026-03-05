'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { supabase } from '@/lib/supabase/client'
import { propertyQueries } from '@/lib/supabase/queries'

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

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const { user } = useDashboardUser()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [fetching, setFetching] = useState(true)
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

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const data = await propertyQueries.getWithUnits(propertyId) as any
        if (data) {
          setForm({
            name: data.name || '',
            address: data.address || '',
            postcode: data.postcode || '',
            city: data.city || '',
            type: data.type || 'appartement',
            build_year: data.build_year?.toString() || '',
            woz_value: data.woz_value?.toString() || '',
            energy_label: data.energy_label || '',
          })
        }
      } catch (err) {
        setError('Kon pand niet laden')
      } finally {
        setFetching(false)
      }
    }
    loadProperty()
  }, [propertyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('properties')
        .update({
          name: form.name || form.address || 'Nieuw pand',
          address: form.address,
          postcode: form.postcode || null,
          city: form.city || null,
          type: form.type,
          build_year: form.build_year ? parseInt(form.build_year) : null,
          woz_value: form.woz_value ? parseFloat(form.woz_value) : null,
          energy_label: form.energy_label || null,
        } as never)
        .eq('id', propertyId)
      if (err) throw err
      router.push(`/dashboard/employer/portfolio/properties/${propertyId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user?.id) return
    setDeleting(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
      if (err) throw err
      router.push('/dashboard/employer/portfolio')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      setDeleting(false)
    }
  }

  if (fetching) {
    return (
      <div className="max-w-xl space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-1/3" />
        <div className="h-96 bg-gray-200 dark:bg-neutral-700 rounded" />
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <Link
        href={`/dashboard/employer/portfolio/properties/${propertyId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#163300] dark:hover:text-[#9FE870] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar pand
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Pand bewerken</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Wijzig de gegevens van je pand.
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
            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-[#163300] hover:bg-[#356258]">
                  {loading ? 'Bezig...' : 'Opslaan'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/dashboard/employer/portfolio/properties/${propertyId}`}>Annuleren</Link>
                </Button>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Verwijderen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Pand verwijderen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Weet je zeker dat je dit pand wilt verwijderen? Alle bijbehorende units, huurcontracten en documenten worden permanent verwijderd. Deze actie kan niet ongedaan worden gemaakt.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                    >
                      {deleting ? 'Bezig...' : 'Definitief verwijderen'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
