'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { WiseDatePicker } from '@/components/ui/wise-date-picker'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  ADD_DIALOG_BODY_CLASS,
  ADD_DIALOG_CLOSE_BUTTON_CLASS,
  ADD_DIALOG_FOOTER_SPLIT_CLASS,
  ADD_DIALOG_HEADER_CLASS,
  ADD_DIALOG_TITLE_CLASS,
  addDialogContentClassName,
} from '@/components/ui/add-dialog-layout'
import {
  ClipboardCheck, Calendar, Ticket, Plus, Search,
  CheckCircle2, Clock, AlertTriangle, MapPin, Camera, ChevronRight,
} from 'lucide-react'
import { MetricCard } from '@/components/finance/MetricCard'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { mockProperties } from '@/lib/mock-data/vastgoed'
import { nl } from 'date-fns/locale'

const getMaintenanceNav = (basePath: string) => [
  { label: 'Tickets', href: `${basePath}/maintenance`, icon: Ticket },
  { label: 'Inspecties', href: `${basePath}/maintenance/inspecties`, icon: ClipboardCheck },
  { label: 'Planning', href: `${basePath}/maintenance/planning`, icon: Calendar },
]

type InspectionStatus = 'gepland' | 'afgerond' | 'uitgesteld'
type InspectionType = 'oplevering' | 'tussentijds' | 'einde_huur' | 'technisch' | 'brand'

interface Inspection {
  id: string
  address: string
  type: InspectionType
  status: InspectionStatus
  date: string
  inspector: string
  notes?: string
}

const TYPE_LABELS: Record<InspectionType, string> = {
  oplevering: 'Oplevering',
  tussentijds: 'Tussentijds',
  einde_huur: 'Einde huur',
  technisch: 'Technisch',
  brand: 'Brandveiligheid',
}

const mockInspecties: Inspection[] = [
  { id: '1', address: 'Keizersgracht 12-A', type: 'tussentijds', status: 'gepland', date: '2026-04-15', inspector: 'J. de Wit' },
  { id: '2', address: 'Herengracht 45-2', type: 'einde_huur', status: 'gepland', date: '2026-04-30', inspector: 'J. de Wit', notes: 'Huurder vertrekt 1 mei' },
  { id: '3', address: 'Singel 88', type: 'technisch', status: 'gepland', date: '2026-05-12', inspector: 'L. Bakker' },
  { id: '4', address: 'Prinsengracht 8-1', type: 'brand', status: 'uitgesteld', date: '2026-03-20', inspector: 'L. Bakker', notes: 'Huurder niet bereikbaar' },
  { id: '5', address: 'Rozengracht 14-1', type: 'oplevering', status: 'afgerond', date: '2026-02-28', inspector: 'J. de Wit', notes: 'Geen bijzonderheden' },
  { id: '6', address: 'Vondelstraat 22', type: 'tussentijds', status: 'afgerond', date: '2026-02-10', inspector: 'L. Bakker' },
]

function getStatusBadge(status: InspectionStatus) {
  switch (status) {
    case 'gepland': return <Badge className="bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400 border-0 gap-1"><Clock className="h-3 w-3" />Gepland</Badge>
    case 'afgerond': return <Badge className="bg-[#163300]/8 text-[#163300] dark:bg-[#9FE870]/10 dark:text-[#9FE870] border-0 gap-1"><CheckCircle2 className="h-3 w-3" />Afgerond</Badge>
    case 'uitgesteld': return <Badge className="bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-500 border-0 gap-1"><AlertTriangle className="h-3 w-3" />Uitgesteld</Badge>
  }
}

export default function InspectiesPage() {
  const { basePath, isDemo } = useDashboardUser()
  const MAINTENANCE_NAV = getMaintenanceNav(basePath)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newPropertyId, setNewPropertyId] = useState('')
  const [newType, setNewType] = useState<InspectionType>('tussentijds')
  const [newDate, setNewDate] = useState('')
  const [newInspector, setNewInspector] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [inspecties, setInspecties] = useState<Inspection[]>(isDemo ? mockInspecties : [])

  const filtered = inspecties.filter((i) =>
    !search || i.address.toLowerCase().includes(search.toLowerCase()) || i.inspector.toLowerCase().includes(search.toLowerCase())
  )

  const geplandCount = inspecties.filter((i) => i.status === 'gepland').length
  const afgerondCount = inspecties.filter((i) => i.status === 'afgerond').length
  const uitgesteldCount = inspecties.filter((i) => i.status === 'uitgesteld').length

  const propertyOptions = isDemo ? mockProperties : []
  const selectedProperty = propertyOptions.find((p) => p.id === newPropertyId)

  const handleCreate = () => {
    if (!newPropertyId || !newDate) return
    const insp: Inspection = {
      id: `${Date.now()}`,
      address: selectedProperty ? `${selectedProperty.name} — ${selectedProperty.address}` : newPropertyId,
      type: newType,
      status: 'gepland',
      date: newDate,
      inspector: newInspector.trim() || 'Onbekend',
      notes: newNotes.trim() || undefined,
    }
    setInspecties((prev) => [insp, ...prev])
    setCreateOpen(false)
    setNewPropertyId(''); setNewType('tussentijds'); setNewDate(''); setNewInspector(''); setNewNotes('')
  }

  return (
    <>
      <SectionNavDashboard title="Onderhoud" items={MAINTENANCE_NAV} titleVariant="hero" />

      {/* Stats */}
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
        <MetricCard label="Gepland" value={String(geplandCount)} icon={<Clock />} />
        <MetricCard label="Afgerond" value={String(afgerondCount)} icon={<CheckCircle2 />} />
        <MetricCard label="Uitgesteld" value={String(uitgesteldCount)} icon={<AlertTriangle />} />
      </div>

      {/* Toolbar — no Card wrapper */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-[#163300] dark:text-[#9FE870]">Inspecties</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filtered.length} inspecties</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3 sm:w-[200px]">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <Input placeholder="Zoek adres..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="border-0 focus-visible:ring-0 h-8 px-2 text-sm bg-transparent" />
          </div>
          <Button onClick={() => setCreateOpen(true)}
            className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 h-9 text-sm font-medium shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe inspectie
          </Button>
        </div>
      </div>

      {/* List — ActionList style */}
      <div className="rounded-2xl overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 mx-1 px-3 pb-2 border-b border-gray-100 dark:border-neutral-800">
          <span className="text-sm font-medium text-gray-400 dark:text-gray-500">Adres</span>
          <span className="text-sm font-medium text-gray-400 dark:text-gray-500">Type</span>
          <span className="text-sm font-medium text-gray-400 dark:text-gray-500">Status</span>
          <span className="text-sm font-medium text-gray-400 dark:text-gray-500">Datum</span>
          <span className="text-sm font-medium text-gray-400 dark:text-gray-500">Inspecteur</span>
          <span className="text-sm font-medium text-gray-400 dark:text-gray-500">Notities</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">Geen inspecties gevonden.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-neutral-800">
            {filtered.map((insp) => (
              <div
                key={insp.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 mx-1 px-3 py-3.5 hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors rounded-xl"
              >
                {/* Adres with icon */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{insp.address}</p>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{TYPE_LABELS[insp.type]}</p>
                <div>{getStatusBadge(insp.status)}</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {format(new Date(insp.date), 'd MMM yyyy', { locale: nl })}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{insp.inspector}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 max-w-[200px] truncate">{insp.notes ?? '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          className={addDialogContentClassName()}
          closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
        >
          <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
            <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>Nieuwe inspectie plannen</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 pt-1">
              Voeg een inspectie toe voor een object.
            </DialogDescription>
          </DialogHeader>
          <div className={cn(ADD_DIALOG_BODY_CLASS, 'space-y-4')}>
            <div className="space-y-1.5">
              <Label>Pand</Label>
              {propertyOptions.length > 0 ? (
                <Select value={newPropertyId} onValueChange={setNewPropertyId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Kies een pand..." /></SelectTrigger>
                  <SelectContent>
                    {propertyOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="font-medium">{p.name}</span>
                        <span className="text-gray-400 ml-1.5 text-xs">{p.address}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 py-2">Geen panden beschikbaar. Voeg eerst panden toe.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Type inspectie</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as InspectionType)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(TYPE_LABELS) as [InspectionType, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Datum</Label>
              <WiseDatePicker
                value={newDate}
                onChange={setNewDate}
                placeholder="Kies datum"
                className="[&_button]:rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Inspecteur</Label>
              <Input placeholder="Naam inspecteur" value={newInspector} onChange={(e) => setNewInspector(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Notities <span className="text-gray-400 font-normal text-xs">optioneel</span></Label>
              <Textarea placeholder="Extra informatie..." value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={2} className="rounded-xl resize-none" />
            </div>
          </div>
          <DialogFooter className={ADD_DIALOG_FOOTER_SPLIT_CLASS}>
            <span />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setCreateOpen(false)} className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1">Annuleren</button>
              <Button
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] text-sm font-semibold px-4 py-2 disabled:opacity-50"
                disabled={!newPropertyId || !newDate}
                onClick={handleCreate}
              >
                <ClipboardCheck className="h-4 w-4 shrink-0" />
                Inspectie aanmaken
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
