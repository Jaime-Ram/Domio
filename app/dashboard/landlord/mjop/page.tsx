'use client'

import { useState } from 'react'
import {
  CalendarRange,
  Building2,
  MapPin,
  ChevronRight,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { CreateDialogShell } from '@/components/ui/add-dialog-layout'
import { DialogField } from '@/components/ui/dialog-field'
import { Input } from '@/components/ui/input'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { mjopQueries } from '@/lib/supabase/queries'
import type { Property } from '@/lib/supabase/types'
import Link from 'next/link'
import { useProperties, useMjopBuildings, useQueryClient, QK } from '@/lib/hooks/use-dashboard-queries'

interface MjopBuilding {
  id: string
  property_id: string | null
  name: string
  bouwjaar: number | null
  gebruiksoppervlak: number | null
  herbouwwaarde: number | null
}

export default function MjopPage() {
  const { user } = useDashboardUser()
  const queryClient = useQueryClient()
  const { data: properties = [], isLoading: propsLoading } = useProperties(user?.id)
  const { data: buildings = [], isLoading: buildingsLoading } = useMjopBuildings(user?.id)
  const loading = propsLoading || buildingsLoading

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [form, setForm] = useState({ gebruiksoppervlak: '', herbouwwaarde: '' })
  const [saving, setSaving] = useState(false)

  const openDialog = (property: Property) => {
    setSelectedProperty(property)
    setForm({
      gebruiksoppervlak: '',
      herbouwwaarde: '',
    })
    setDialogOpen(true)
  }

  const handleStart = async () => {
    if (!user || !selectedProperty) return
    setSaving(true)
    try {
      const payload = {
        owner_id: user.id,
        property_id: selectedProperty.id,
        name: selectedProperty.name,
        address: [selectedProperty.address, selectedProperty.city].filter(Boolean).join(', '),
        bouwjaar: selectedProperty.build_year ?? null,
        gebruiksoppervlak: form.gebruiksoppervlak ? parseFloat(form.gebruiksoppervlak) : null,
        herbouwwaarde: form.herbouwwaarde ? parseFloat(form.herbouwwaarde) : null,
        herbouwwaarde_jaar: new Date().getFullYear(),
      }
      const created = await mjopQueries.createBuilding(payload)
      queryClient.setQueryData(QK.mjopBuildings(user!.id), (old: MjopBuilding[] = []) => [created, ...old])
      setDialogOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const buildingByProperty = (propertyId: string) =>
    buildings.find(b => b.property_id === propertyId) ?? null

  return (
    <div className="flex flex-col min-h-0 h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-neutral-700 shrink-0">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">MJOP</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">
          Meerjarenonderhoudsplanning per pand — gebaseerd op NEN 2767 en NL-SfB
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-44 rounded-2xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-[#163300]/8 dark:bg-[#9FE870]/10 flex items-center justify-center mb-5">
              <CalendarRange className="h-8 w-8 text-[#163300] dark:text-[#9FE870]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Geen panden gevonden</h3>
            <p className="text-sm text-gray-500 dark:text-neutral-400 max-w-sm">
              Voeg eerst panden toe aan je portefeuille om een MJOP op te stellen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {properties.map(property => {
              const building = buildingByProperty(property.id)
              return (
                <PropertyCard
                  key={property.id}
                  property={property}
                  building={building}
                  onStart={() => openDialog(property)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Dialog: MJOP initialiseren */}
      <CreateDialogShell
        open={dialogOpen}
        onOpenChange={open => { if (!open) setDialogOpen(false) }}
        title="MJOP initialiseren"
        subtitle={selectedProperty?.name}
        primaryLabel="Initialiseren"
        onPrimary={handleStart}
        primaryDisabled={saving}
        primaryLoading={saving}
      >
        {selectedProperty?.build_year && (
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-600 dark:text-neutral-300">
            <CheckCircle2 className="h-4 w-4 text-[#163300] dark:text-[#9FE870] shrink-0" />
            Bouwjaar <span className="font-semibold">{selectedProperty.build_year}</span> overgenomen uit portefeuille
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <DialogField label="Gebruiksoppervlak (m²)" optional>
            <Input type="number" placeholder="bijv. 450" className="rounded-xl"
              value={form.gebruiksoppervlak} onChange={e => setForm(f => ({ ...f, gebruiksoppervlak: e.target.value }))} />
          </DialogField>
          <DialogField label="Herbouwwaarde (€)" optional>
            <Input type="number" placeholder="bijv. 850000" className="rounded-xl"
              value={form.herbouwwaarde} onChange={e => setForm(f => ({ ...f, herbouwwaarde: e.target.value }))} />
          </DialogField>
        </div>
        <p className="text-xs text-gray-400 dark:text-neutral-500">
          Herbouwwaarde nodig voor de 0,5%-toets (art. 5:126 BW). Kan later worden bijgewerkt.
        </p>
      </CreateDialogShell>
    </div>
  )
}

function PropertyCard({
  property,
  building,
  onStart,
}: {
  property: Property
  building: MjopBuilding | null
  onStart: () => void
}) {
  const hasActive = !!building

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#163300]/8 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug truncate">
            {property.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 truncate flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {[property.address, property.city].filter(Boolean).join(', ')}
          </p>
        </div>
        {hasActive && (
          <span className="shrink-0 rounded-full bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870] text-[10px] font-semibold px-2 py-0.5">
            Actief
          </span>
        )}
      </div>

      {/* Meta */}
      {property.build_year && (
        <div className="rounded-lg bg-gray-50 dark:bg-neutral-800 px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-neutral-500">Bouwjaar</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{property.build_year}</span>
        </div>
      )}

      {/* CTA */}
      {hasActive ? (
        <Link
          href={`/dashboard/landlord/mjop/${building!.id}`}
          className="flex items-center justify-between rounded-xl bg-[#163300] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#163300]/90 transition-colors"
        >
          <span>Bekijk MJOP</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={onStart}
          className="flex items-center justify-between rounded-xl border border-dashed border-[#163300]/30 dark:border-[#9FE870]/30 text-[#163300] dark:text-[#9FE870] px-4 py-2.5 text-sm font-medium hover:bg-[#163300]/5 dark:hover:bg-[#9FE870]/5 transition-colors"
        >
          <span>MJOP initialiseren</span>
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
