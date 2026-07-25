'use client'

import { useState, useEffect } from 'react'
import {
  Building2,
  MapPin,
  ChevronRight,
  Plus,
  CheckCircle2,
  Sparkles,
  CalendarRange,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GrayBlock } from '@/components/ui/gray-block'
import { GeometricShapes } from '@/components/decorative/geometric-shapes'
import { CreateDialogShell } from '@/components/ui/add-dialog-layout'
import { DialogField } from '@/components/ui/dialog-field'
import { Input } from '@/components/ui/input'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { mjopQueries } from '@/lib/supabase/queries'
import type { Property } from '@/lib/supabase/types'
import { useSearchParams } from 'next/navigation'
import { MjopBuildingSheet } from '@/components/mjop/mjop-building-sheet'
import { useProperties, useMjopBuildings, useQueryClient, QK } from '@/lib/hooks/use-dashboard-queries'

interface MjopBuilding {
  id: string
  property_id: string | null
  name: string
  address?: string | null
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


  // Building detail sheet
  const searchParams = useSearchParams()
  const [openBuildingId, setOpenBuildingId] = useState<string | null>(null)

  // Open the sheet from a ?building= deep link
  useEffect(() => {
    const id = searchParams.get('building')
    if (id) setOpenBuildingId(id)
  }, [searchParams])

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [form, setForm] = useState({ gebruiksoppervlak: '', herbouwwaarde: '' })
  const [saving, setSaving] = useState(false)

  const openDialog = (property: Property) => {
    setSelectedProperty(property)
    setForm({ gebruiksoppervlak: '', herbouwwaarde: '' })
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
    <>
      <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-10">
            {/* Intro / coming soon block */}
            <div className="rounded-2xl bg-[#161f13] px-8 py-8 relative overflow-hidden">
              <GeometricShapes variant="trapezoid" className="right-0 bottom-0 w-40 h-40" color="#94f477" opacity={0.15} layers={2} />
              <div className="relative z-10 flex flex-col gap-3 max-w-xl">
                <h2 className="text-[26px] font-bold text-white leading-tight">
                  Meerjarenonderhoudsplan
                </h2>
                <p className="text-sm text-white/80 leading-relaxed">
                  Stel per pand een MJOP op volgens NEN 2767 en NL-SfB. Automatische conditiemeting, kostenraming en een meerjarenbegroting komen eraan. Initialiseer alvast je panden hieronder.
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <Button
                    disabled
                    className="rounded-full bg-[#94f477] text-[#161f13] font-semibold text-sm px-4 h-9 gap-1.5 hover:bg-[#94f477]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="h-4 w-4" />
                    MJOP automatisch genereren
                  </Button>
                  <span className="text-xs text-white/50">Binnenkort beschikbaar</span>
                </div>
              </div>
            </div>

            {/* Panden-grid */}
            <section>
              <h3 className="text-xs font-semibold text-[#97978f] dark:text-neutral-500 uppercase tracking-wider mb-3">
                Jouw panden
              </h3>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-36 rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 animate-pulse" />
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-[#161f13]/8 dark:bg-[#94f477]/10 flex items-center justify-center mb-5">
                    <CalendarRange className="h-8 w-8 text-[#161f13] dark:text-[#94f477]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1a1c18] dark:text-white mb-2">Geen panden gevonden</h3>
                  <p className="text-sm text-[#97978f] dark:text-neutral-400 max-w-sm">
                    Voeg eerst panden toe aan je portefeuille om een MJOP op te stellen.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {properties.map(property => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      building={buildingByProperty(property.id)}
                      onStart={() => openDialog(property)}
                      onOpen={() => setOpenBuildingId(buildingByProperty(property.id)!.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
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
          <div className="flex items-center gap-2 rounded-xl bg-[#f4f4f1] dark:bg-neutral-800 px-3 py-2.5 text-sm text-[#55554e] dark:text-neutral-300">
            <CheckCircle2 className="h-4 w-4 text-[#161f13] dark:text-[#94f477] shrink-0" />
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
        <p className="text-xs text-[#97978f] dark:text-neutral-500">
          Herbouwwaarde nodig voor de 0,5%-toets (art. 5:126 BW). Kan later worden bijgewerkt.
        </p>
      </CreateDialogShell>

      {/* Building detail (uitschuif-paneel) */}
      <MjopBuildingSheet
        open={!!openBuildingId}
        buildingId={openBuildingId}
        onClose={() => setOpenBuildingId(null)}
      />
    </>
  )
}

/* ─── Actieve MJOP-kaart ─── */

function BuildingCard({ building, onOpen }: { building: MjopBuilding; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full text-left flex flex-col gap-3 p-4 rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 hover:brightness-95 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <Building2 className="h-[22px] w-[22px] text-[#161f13] dark:text-[#94f477]" strokeWidth={2} />
        </div>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full whitespace-nowrap">
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          Actief
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-[#1a1c18] dark:text-white truncate">{building.name}</p>
        {building.address && (
          <p className="text-xs text-[#97978f] dark:text-[#97978f] mt-0.5 flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            {building.address}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between text-[11px] text-[#97978f] dark:text-neutral-500">
        <span className="flex items-center gap-1.5">
          <CalendarRange className="h-3 w-3 shrink-0" />
          {building.bouwjaar ? `Bouwjaar ${building.bouwjaar}` : 'Bouwjaar onbekend'}
        </span>
        <span className="flex items-center gap-0.5 text-[#161f13] dark:text-[#94f477] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Bekijk
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  )
}

/* ─── Pand-kaart (initialiseren) ─── */

function PropertyCard({
  property,
  building,
  onStart,
  onOpen,
}: {
  property: Property
  building: MjopBuilding | null
  onStart: () => void
  onOpen: () => void
}) {
  const hasActive = !!building

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <Building2 className="h-[22px] w-[22px] text-[#161f13] dark:text-[#94f477]" strokeWidth={2} />
        </div>
        {hasActive ? (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full whitespace-nowrap">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            Actief
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#161f13] dark:text-[#94f477] bg-[#161f13]/8 dark:bg-[#94f477]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
            <Plus className="h-3 w-3 shrink-0" />
            Initialiseren
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#1a1c18] dark:text-white truncate">{property.name}</p>
        <p className="text-xs text-[#97978f] dark:text-[#97978f] mt-0.5 flex items-center gap-1 truncate">
          <MapPin className="h-3 w-3 shrink-0" />
          {[property.address, property.city].filter(Boolean).join(', ') || 'Geen adres'}
        </p>
      </div>
      <div className="flex items-center justify-between text-[11px] text-[#97978f] dark:text-neutral-500">
        <span className="flex items-center gap-1.5">
          <CalendarRange className="h-3 w-3 shrink-0" />
          {property.build_year ? `Bouwjaar ${property.build_year}` : 'Bouwjaar onbekend'}
        </span>
        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-neutral-600" />
      </div>
    </>
  )

  const cardClass = 'group w-full text-left flex flex-col gap-3 p-4 rounded-2xl bg-[#f4f4f4] dark:bg-neutral-800 hover:brightness-95 transition-all'

  return (
    <button type="button" onClick={hasActive ? onOpen : onStart} className={cardClass}>
      {inner}
    </button>
  )
}
