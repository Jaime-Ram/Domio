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

const UNIT_STATUSES = [
  { value: 'leegstand', label: 'Leegstand' },
  { value: 'verhuurd', label: 'Verhuurd' },
  { value: 'onderhoud', label: 'Onderhoud' },
  { value: 'te_verhuren', label: 'Te verhuren' },
]

export default function EditUnitPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const unitId = params.unitId as string
  const { user } = useDashboardUser()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    unit_number: '',
    rooms: '',
    size_m2: '',
    monthly_rent: '',
    status: 'leegstand',
  })

  useEffect(() => {
    const loadUnit = async () => {
      try {
        const { data, error: err } = await supabase
          .from('units')
          .select('*')
          .eq('id', unitId)
          .single()
        if (err) throw err
        const unit = data as any
        if (unit) {
          setForm({
            unit_number: unit.unit_number || '',
            rooms: unit.rooms?.toString() || '',
            size_m2: unit.size_m2?.toString() || '',
            monthly_rent: unit.monthly_rent?.toString() || '',
            status: unit.status || 'leegstand',
          })
        }
      } catch (err) {
        setError('Kon unit niet laden')
      } finally {
        setFetching(false)
      }
    }
    loadUnit()
  }, [unitId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('units')
        .update({
          unit_number: form.unit_number,
          rooms: form.rooms ? parseInt(form.rooms) : null,
          size_m2: form.size_m2 ? parseFloat(form.size_m2) : null,
          monthly_rent: form.monthly_rent ? parseFloat(form.monthly_rent) : null,
          status: form.status,
        } as never)
        .eq('id', unitId)
      if (err) throw err
      router.push(`/dashboard/employer/portfolio/properties/${propertyId}?tab=units`)
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
        .from('units')
        .delete()
        .eq('id', unitId)
      if (err) throw err
      router.push(`/dashboard/employer/portfolio/properties/${propertyId}?tab=units`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      setDeleting(false)
    }
  }

  const backHref = `/dashboard/employer/portfolio/properties/${propertyId}?tab=units`

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
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#163300] dark:hover:text-[#9FE870] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar pand
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Unit bewerken</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Wijzig de gegevens van de unit.
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
              <Label htmlFor="unit_number">Unitnummer / naam *</Label>
              <Input
                id="unit_number"
                value={form.unit_number}
                onChange={(e) => setForm((f) => ({ ...f, unit_number: e.target.value }))}
                placeholder="Bijv. Suite A, 1e verdieping, Unit 101"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rooms">Kamers</Label>
                <Input
                  id="rooms"
                  type="number"
                  value={form.rooms}
                  onChange={(e) => setForm((f) => ({ ...f, rooms: e.target.value }))}
                  placeholder="Bijv. 3"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size_m2">Oppervlakte (m²)</Label>
                <Input
                  id="size_m2"
                  type="number"
                  value={form.size_m2}
                  onChange={(e) => setForm((f) => ({ ...f, size_m2: e.target.value }))}
                  placeholder="Bijv. 75"
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly_rent">Maandhuur (€)</Label>
                <Input
                  id="monthly_rent"
                  type="number"
                  value={form.monthly_rent}
                  onChange={(e) => setForm((f) => ({ ...f, monthly_rent: e.target.value }))}
                  placeholder="Bijv. 1200"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-[#163300] hover:bg-[#356258]">
                  {loading ? 'Bezig...' : 'Opslaan'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={backHref}>Annuleren</Link>
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
                    <AlertDialogTitle>Unit verwijderen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Weet je zeker dat je deze unit wilt verwijderen? Alle bijbehorende huurcontracten worden permanent verwijderd. Deze actie kan niet ongedaan worden gemaakt.
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
