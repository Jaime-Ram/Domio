'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass, DASHBOARD_TABLE_HEAD_SHADCN_CLASS, DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS, DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS } from '@/app/dashboard/employer/dashboard-ui'
import { DashboardTableBlock } from '@/components/dashboard/dashboard-table-block'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  ClipboardCheck, Calendar, Ticket, Plus, Search,
  CheckCircle2, Clock, AlertTriangle, MapPin, Camera,
} from 'lucide-react'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
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
    case 'gepland': return <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-0 gap-1"><Clock className="h-3 w-3" />Gepland</Badge>
    case 'afgerond': return <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-0 gap-1"><CheckCircle2 className="h-3 w-3" />Afgerond</Badge>
    case 'uitgesteld': return <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-0 gap-1"><AlertTriangle className="h-3 w-3" />Uitgesteld</Badge>
  }
}

export default function InspectiesPage() {
  const { basePath, isDemo } = useDashboardUser()
  const MAINTENANCE_NAV = getMaintenanceNav(basePath)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newAddress, setNewAddress] = useState('')
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

  const handleCreate = () => {
    if (!newAddress.trim() || !newDate) return
    const insp: Inspection = {
      id: `${Date.now()}`,
      address: newAddress.trim(),
      type: newType,
      status: 'gepland',
      date: newDate,
      inspector: newInspector.trim() || 'Onbekend',
      notes: newNotes.trim() || undefined,
    }
    setInspecties((prev) => [insp, ...prev])
    setCreateOpen(false)
    setNewAddress(''); setNewType('tussentijds'); setNewDate(''); setNewInspector(''); setNewNotes('')
  }

  const tableBleed = filtered.length > 0

  return (
    <>
      <SectionNavDashboard title="Onderhoud" items={MAINTENANCE_NAV} titleVariant="hero" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-content-blocks">
        {[
          { label: 'Gepland', value: geplandCount, icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Afgerond', value: afgerondCount, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Uitgesteld', value: uitgesteldCount, icon: AlertTriangle, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        ].map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.label} className={dashboardCardClass()}>
              <CardContent className="p-5">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center mb-3', m.bg)}>
                  <Icon className={cn('h-5 w-5', m.color)} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{m.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{m.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Table */}
      <Card className={cn(dashboardCardClass(), 'overflow-hidden')}>
        <CardHeader className={cn('space-y-3', tableBleed && DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-lg text-[#163300] dark:text-[#9FE870]">Inspecties</CardTitle>
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
        </CardHeader>
        <CardContent className={cn('p-0', tableBleed && DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS)}>
          <DashboardTableBlock empty={filtered.length === 0}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Adres</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Type</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Status</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Datum</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Inspecteur</TableHead>
                  <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Notities</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((insp) => (
                  <TableRow key={insp.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
                    <TableCell className="py-3.5 px-3.5 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                        {insp.address}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-700 dark:text-gray-200">
                      {TYPE_LABELS[insp.type]}
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5">{getStatusBadge(insp.status)}</TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {format(new Date(insp.date), 'd MMM yyyy', { locale: nl })}
                    </TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-700 dark:text-gray-200">{insp.inspector}</TableCell>
                    <TableCell className="py-3.5 px-3.5 text-sm text-gray-400 dark:text-gray-500 max-w-[200px] truncate">
                      {insp.notes ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardTableBlock>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md border border-gray-200 dark:border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-[#163300] dark:text-[#9FE870]">Nieuwe inspectie plannen</DialogTitle>
            <DialogDescription>Voeg een inspectie toe voor een object.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Adres</Label>
              <Input placeholder="bijv. Keizersgracht 12-A" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="rounded-xl" />
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
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="rounded-xl" />
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
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setCreateOpen(false)}>Annuleren</Button>
            <Button className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F]"
              disabled={!newAddress.trim() || !newDate} onClick={handleCreate}>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Inspectie aanmaken
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
