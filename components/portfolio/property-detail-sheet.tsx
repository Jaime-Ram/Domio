'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { DetailShell } from '@/components/ui/detail-shell'
import { TabNav } from '@/components/ui/tab-nav'
import {
  MapPin,
  DoorOpen,
  FileText,
  Eye,
  Pencil,
  Trash2,
  Check,
  X,
  Zap,
  Home,
  Calendar,
  Ruler,
  Euro,
  Building2,
  Search,
  Loader2,
  Workflow,
  Plus,
  Users,
  TrendingUp,
  CreditCard,
  TicketPlus,
  Wrench,
  ClipboardList,
  MessageSquare,
  FileUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { propertyQueries, unitQueries, leaseQueries, documentQueries, paymentQueries } from '@/lib/supabase/queries'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { ActionListRow, ActionListSection } from '@/components/ui/action-list'

const UNIT_STATUSES = [
  { value: 'leegstand', label: 'Leegstand' },
  { value: 'verhuurd', label: 'Verhuurd' },
  { value: 'onderhoud', label: 'Onderhoud' },
  { value: 'te_verhuren', label: 'Te verhuren' },
]

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

const ENERGY_LABEL_COLORS: Record<string, string> = {
  'A+++++': 'bg-emerald-600 text-white',
  'A++++': 'bg-emerald-500 text-white',
  'A+++': 'bg-emerald-500 text-white',
  'A++': 'bg-green-500 text-white',
  'A+': 'bg-green-400 text-white',
  'A': 'bg-lime-400 text-gray-900',
  'B': 'bg-yellow-300 text-gray-900',
  'C': 'bg-amber-400 text-gray-900',
  'D': 'bg-orange-400 text-white',
  'E': 'bg-orange-500 text-white',
  'F': 'bg-red-500 text-white',
  'G': 'bg-red-600 text-white',
}

const UNIT_STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  verhuurd:    { label: 'Verhuurd',    dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20' },
  leegstand:   { label: 'Leegstand',   dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
  onderhoud:   { label: 'Onderhoud',   dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
  te_verhuren: { label: 'Te verhuren', dot: 'bg-purple-400', badge: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' },
}

const TABS = [
  { id: 'info',       label: 'Info' },
  { id: 'activiteit', label: 'Activiteit' },
  { id: 'acties',     label: 'Acties' },
  { id: 'betalingen', label: 'Betalingen' },
  { id: 'documenten', label: 'Documenten' },
  { id: 'flows',      label: 'Flows' },
] as const

type TabId = typeof TABS[number]['id']

const FIELD_CLS = 'w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-gray-900 dark:text-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#9FE870] transition-shadow'

interface PropertyDetailSheetProps {
  propertyId: string | null
  open: boolean
  onClose: () => void
  onDeleted?: () => void
}

export function PropertyDetailSheet({ propertyId, open, onClose, onDeleted }: PropertyDetailSheetProps) {
  const { basePath } = useDashboardUser()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabId>('info')
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [unitLeases, setUnitLeases] = useState<Record<string, any[]>>({})
  const [propertyDocuments, setPropertyDocuments] = useState<any[]>([])
  const [propertyPayments, setPropertyPayments] = useState<any[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '', address: '', postcode: '', city: '',
    type: 'appartement', build_year: '', woz_value: '', energy_label: '',
    ean_electricity: '', ean_gas: '',
  })

  // EAN lookup state
  const [lookupHuisnummer, setLookupHuisnummer] = useState('')
  const [lookingUp, setLookingUp] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)

  // Unit edit state
  const [editingUnits, setEditingUnits] = useState<Set<string>>(new Set())
  const [unitForms, setUnitForms] = useState<Record<string, { unit_number: string; rooms: string; size_m2: string; monthly_rent: string; status: string }>>({})
  const [savingUnits, setSavingUnits] = useState<Set<string>>(new Set())
  const [deletingUnits, setDeletingUnits] = useState<Set<string>>(new Set())
  const [unitErrors, setUnitErrors] = useState<Record<string, string>>({})
  const [newUnitOpen, setNewUnitOpen] = useState(false)
  const [newUnitForm, setNewUnitForm] = useState({ unit_number: '', rooms: '', size_m2: '', monthly_rent: '', status: 'leegstand' })
  const [savingNewUnit, setSavingNewUnit] = useState(false)
  const [newUnitError, setNewUnitError] = useState<string | null>(null)

  const initEditForm = (p: any) => {
    setEditForm({
      name: p.name || '', address: p.address || '', postcode: p.postcode || '',
      city: p.city || '', type: p.type || 'appartement',
      build_year: p.build_year ? String(p.build_year) : '',
      woz_value: p.woz_value ? String(p.woz_value) : '',
      energy_label: p.energy_label || '',
      ean_electricity: p.ean_electricity || '',
      ean_gas: p.ean_gas || '',
    })
    setLookupHuisnummer('')
    setLookupError(null)
  }

  const initUnitForm = (u: any) => ({
    unit_number: u.unit_number || '', rooms: u.rooms ? String(u.rooms) : '',
    size_m2: u.size_m2 ? String(u.size_m2) : '',
    monthly_rent: u.monthly_rent ? String(u.monthly_rent) : '',
    status: u.status || 'leegstand',
  })

  useEffect(() => {
    if (!propertyId || !open) return
    setLoading(true)
    setProperty(null)
    setIsEditing(false)
    setActiveTab('info')
    setEditError(null)
    setNewUnitOpen(false)
    setEditingUnits(new Set())
    setUnitForms({})
    setUnitLeases({})
    setPropertyDocuments([])
    setPropertyPayments([])

    propertyQueries.getWithUnits(propertyId)
      .then((data) => { setProperty(data); initEditForm(data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [propertyId, open])

  useEffect(() => {
    if (!propertyId || !open) return
    documentQueries.getByProperty(propertyId).then(setPropertyDocuments).catch(() => setPropertyDocuments([]))
  }, [propertyId, open])

  useEffect(() => {
    if (!propertyId || !open) return
    setPaymentsLoading(true)
    paymentQueries.getByPropertyAssignments(propertyId)
      .then(setPropertyPayments)
      .catch(() => setPropertyPayments([]))
      .finally(() => setPaymentsLoading(false))
  }, [propertyId, open])

  useEffect(() => {
    if (!property?.units?.length) return
    const load = async () => {
      const result: Record<string, any[]> = {}
      for (const unit of property.units) {
        result[unit.id] = await leaseQueries.getUnitHistory(unit.id).catch(() => []) || []
      }
      setUnitLeases(result)
    }
    load()
  }, [property?.units])

  const totalRent = property?.units?.reduce((s: number, u: any) => s + (u.monthly_rent || 0), 0) || 0
  const occupiedUnits = property?.units?.filter((u: any) => u.status === 'verhuurd').length || 0
  const totalUnits = property?.units?.length || 0
  const occupancyPct = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

  const handleSave = async () => {
    setSaving(true); setEditError(null)
    try {
      const updated = await propertyQueries.update(propertyId!, {
        name: editForm.name, address: editForm.address,
        postcode: editForm.postcode || null, city: editForm.city || null,
        type: editForm.type,
        build_year: editForm.build_year ? parseInt(editForm.build_year) : null,
        woz_value: editForm.woz_value ? parseFloat(editForm.woz_value) : null,
        energy_label: editForm.energy_label || null,
        ean_electricity: editForm.ean_electricity || null,
        ean_gas: editForm.ean_gas || null,
      } as never)
      setProperty((p: any) => ({ ...p, ...updated }))
      setIsEditing(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await propertyQueries.delete(propertyId!)
      onDeleted?.(); onClose()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      setDeleting(false)
    }
  }

  const handleSaveUnit = async (unitId: string) => {
    const form = unitForms[unitId]
    if (!form?.unit_number) return
    setSavingUnits(p => new Set(p).add(unitId))
    setUnitErrors(p => { const n = { ...p }; delete n[unitId]; return n })
    try {
      const updated = await unitQueries.update(unitId, {
        unit_number: form.unit_number,
        rooms: form.rooms ? parseInt(form.rooms) : null,
        size_m2: form.size_m2 ? parseFloat(form.size_m2) : null,
        monthly_rent: form.monthly_rent ? parseFloat(form.monthly_rent) : null,
        status: form.status as never,
      })
      setProperty((p: any) => ({ ...p, units: p.units.map((u: any) => u.id === unitId ? { ...u, ...updated } : u) }))
      setEditingUnits(p => { const n = new Set(p); n.delete(unitId); return n })
      setUnitForms(p => { const n = { ...p }; delete n[unitId]; return n })
    } catch (err) {
      setUnitErrors(p => ({ ...p, [unitId]: err instanceof Error ? err.message : 'Er is een fout opgetreden' }))
    } finally {
      setSavingUnits(p => { const n = new Set(p); n.delete(unitId); return n })
    }
  }

  const handleDeleteUnit = async (unitId: string) => {
    setDeletingUnits(p => new Set(p).add(unitId))
    try {
      await unitQueries.delete(unitId)
      setProperty((p: any) => ({ ...p, units: p.units.filter((u: any) => u.id !== unitId) }))
      setEditingUnits(p => { const n = new Set(p); n.delete(unitId); return n })
    } catch (err) {
      setUnitErrors(p => ({ ...p, [unitId]: err instanceof Error ? err.message : 'Er is een fout opgetreden' }))
      setDeletingUnits(p => { const n = new Set(p); n.delete(unitId); return n })
    }
  }

  const handleSaveNewUnit = async () => {
    if (!newUnitForm.unit_number) return
    setSavingNewUnit(true); setNewUnitError(null)
    try {
      const created = await unitQueries.create({
        property_id: propertyId,
        unit_number: newUnitForm.unit_number,
        rooms: newUnitForm.rooms ? parseInt(newUnitForm.rooms) : null,
        size_m2: newUnitForm.size_m2 ? parseFloat(newUnitForm.size_m2) : null,
        monthly_rent: newUnitForm.monthly_rent ? parseFloat(newUnitForm.monthly_rent) : null,
        status: newUnitForm.status,
      } as never)
      setProperty((p: any) => ({ ...p, units: [...(p.units || []), created] }))
      setNewUnitOpen(false)
      setNewUnitForm({ unit_number: '', rooms: '', size_m2: '', monthly_rent: '', status: 'leegstand' })
    } catch (err) {
      setNewUnitError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally { setSavingNewUnit(false) }
  }

  const handleLookup = async () => {
    if (!editForm.postcode || !lookupHuisnummer) return
    setLookingUp(true); setLookupError(null)
    try {
      const res = await fetch('/api/ean-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode: editForm.postcode, huisnummer: lookupHuisnummer }),
      })
      const data = await res.json()
      if (!res.ok) { setLookupError(data.error || 'Adres niet gevonden'); return }
      setEditForm(f => ({
        ...f,
        ...(data.address       && { address:         data.address }),
        ...(data.city          && { city:             data.city }),
        ...(data.postcode      && { postcode:         data.postcode }),
        ...(data.woz_value     != null && { woz_value: String(data.woz_value) }),
        ...(data.energy_label  && { energy_label:    data.energy_label }),
        ...(data.build_year    && { build_year:      String(data.build_year) }),
        ...(data.ean_electricity && { ean_electricity: data.ean_electricity }),
        ...(data.ean_gas         && { ean_gas:         data.ean_gas }),
      }))
    } catch {
      setLookupError('Verbinding mislukt')
    } finally { setLookingUp(false) }
  }

  return (
    <DetailShell
      open={open}
      onClose={onClose}
      title={loading ? '…' : (property?.name ?? 'Object')}
      subtitle={property?.address ?? undefined}
      headerLeft={
        <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
          <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </div>
      }
      footer={
        <div className="border-t border-gray-100 dark:border-neutral-800 p-4 flex items-center justify-end gap-3 shrink-0">
          {editError && <p className="text-xs text-red-500 flex-1">{editError}</p>}
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => { setIsEditing(false); if (property) initEditForm(property) }}
                className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] disabled:opacity-40 text-[#163300] text-sm font-semibold px-5 py-2 transition-colors"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Opslaan
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1"
            >
              Sluiten
            </button>
          )}
        </div>
      }
    >
      {/* Tab navigation */}
      <div className="px-6 pt-4 shrink-0 border-b border-gray-100 dark:border-neutral-800">
        <TabNav
          tabs={TABS as unknown as { id: TabId; label: string }[]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />
      </div>

      {/* Tab content */}
      <div className="px-6 py-6 space-y-6">

        {/* ── Info ──────────────────────────────────────────────────────── */}
        {activeTab === 'info' && (
          <>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !property ? (
              <p className="text-sm text-gray-400">Geen gegevens gevonden.</p>
            ) : (
              <>
                {/* KPI strip */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-[#163300] dark:text-[#9FE870]">{totalUnits}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Eenheden</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-[#163300] dark:text-[#9FE870]">{occupancyPct}%</p>
                    <p className="text-xs text-gray-500 mt-0.5">Bezetting</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-[#163300] dark:text-[#9FE870]">
                      {totalRent > 0 ? `€${totalRent.toLocaleString('nl-NL')}` : '—'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Maandhuur</p>
                  </div>
                </div>

                {/* Property details */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">Objectgegevens</p>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-xs font-medium text-[#163300] dark:text-[#9FE870] hover:underline"
                      >
                        Bewerken
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <EditRow icon={Building2} label="Naam">
                        <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={FIELD_CLS} placeholder="Naam van het object" />
                      </EditRow>
                      <EditRow icon={MapPin} label="Adres">
                        <input value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} className={FIELD_CLS} placeholder="Straat + huisnummer" />
                      </EditRow>
                      <div className="grid grid-cols-2 gap-3 pl-11">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Postcode</p>
                          <input value={editForm.postcode} onChange={e => setEditForm(f => ({ ...f, postcode: e.target.value }))} className={FIELD_CLS} placeholder="1234 AB" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Stad</p>
                          <input value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} className={FIELD_CLS} placeholder="Stad" />
                        </div>
                      </div>
                      <EditRow icon={Home} label="Type">
                        <Select value={editForm.type} onValueChange={v => setEditForm(f => ({ ...f, type: v }))}>
                          <SelectTrigger className={cn(FIELD_CLS, 'h-auto')}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROPERTY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </EditRow>
                      <EditRow icon={Calendar} label="Bouwjaar">
                        <input type="number" value={editForm.build_year} onChange={e => setEditForm(f => ({ ...f, build_year: e.target.value }))} className={FIELD_CLS} placeholder="2000" />
                      </EditRow>
                      <EditRow icon={Euro} label="WOZ-waarde">
                        <input type="number" value={editForm.woz_value} onChange={e => setEditForm(f => ({ ...f, woz_value: e.target.value }))} className={FIELD_CLS} placeholder="250000" />
                      </EditRow>
                      <EditRow icon={Zap} label="Energielabel">
                        <Select value={editForm.energy_label || ''} onValueChange={v => setEditForm(f => ({ ...f, energy_label: v }))}>
                          <SelectTrigger className={cn(FIELD_CLS, 'h-auto')}>
                            <SelectValue placeholder="Kies label" />
                          </SelectTrigger>
                          <SelectContent>
                            {ENERGY_LABELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </EditRow>

                      {/* EAN lookup */}
                      <div className="border-t border-gray-100 dark:border-neutral-800 pt-3 mt-1">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">EAN-nummers opzoeken</p>
                        <div className="flex gap-2">
                          <input
                            value={lookupHuisnummer}
                            onChange={e => setLookupHuisnummer(e.target.value)}
                            className={cn(FIELD_CLS, 'flex-1')}
                            placeholder="Huisnummer"
                          />
                          <button
                            type="button"
                            onClick={handleLookup}
                            disabled={lookingUp || !editForm.postcode || !lookupHuisnummer}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors shrink-0"
                          >
                            {lookingUp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                            Opzoeken
                          </button>
                        </div>
                        {lookupError && <p className="text-xs text-red-500 mt-1">{lookupError}</p>}
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">EAN elektriciteit</p>
                            <input value={editForm.ean_electricity} onChange={e => setEditForm(f => ({ ...f, ean_electricity: e.target.value }))} className={FIELD_CLS} placeholder="18 cijfers" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">EAN gas</p>
                            <input value={editForm.ean_gas} onChange={e => setEditForm(f => ({ ...f, ean_gas: e.target.value }))} className={FIELD_CLS} placeholder="18 cijfers" />
                          </div>
                        </div>
                      </div>

                      {/* Delete */}
                      <div className="pt-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button type="button" className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium flex items-center gap-1.5 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                              Pand verwijderen
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Pand verwijderen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Dit verwijdert het pand en alle bijbehorende eenheden permanent. Deze actie kan niet ongedaan worden gemaakt.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuleren</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                {deleting ? 'Bezig…' : 'Verwijderen'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <InfoRow icon={MapPin} label="Adres" value={[property.address, property.postcode, property.city].filter(Boolean).join(', ')} />
                      <InfoRow icon={Home} label="Type" value={PROPERTY_TYPES.find(t => t.value === property.type)?.label ?? property.type} />
                      <InfoRow icon={Calendar} label="Bouwjaar" value={property.build_year ? String(property.build_year) : null} />
                      <InfoRow icon={Euro} label="WOZ-waarde" value={property.woz_value ? `€ ${Number(property.woz_value).toLocaleString('nl-NL')}` : null} />
                      {property.energy_label && (
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            <Zap className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 dark:text-gray-500">Energielabel</p>
                            <span className={cn('inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full', ENERGY_LABEL_COLORS[property.energy_label] ?? 'bg-gray-100 text-gray-700')}>
                              {property.energy_label}
                            </span>
                          </div>
                        </div>
                      )}
                      {property.ean_electricity && (
                        <InfoRow icon={Zap} label="EAN elektriciteit" value={property.ean_electricity} />
                      )}
                      {property.ean_gas && (
                        <InfoRow icon={Zap} label="EAN gas" value={property.ean_gas} />
                      )}
                    </div>
                  )}
                </div>

                {/* Units */}
                <div className="border-t border-gray-100 dark:border-neutral-800 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                      Eenheden {totalUnits > 0 && `(${totalUnits})`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setNewUnitOpen(true)}
                      className="text-xs font-medium text-[#163300] dark:text-[#9FE870] hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Toevoegen
                    </button>
                  </div>

                  {/* New unit form */}
                  {newUnitOpen && (
                    <div className="mb-3 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/40 p-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Nieuwe eenheid</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Eenheidnummer *</p>
                          <input value={newUnitForm.unit_number} onChange={e => setNewUnitForm(f => ({ ...f, unit_number: e.target.value }))} className={FIELD_CLS} placeholder="Bijv. A01" autoFocus />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Status</p>
                          <Select value={newUnitForm.status} onValueChange={v => setNewUnitForm(f => ({ ...f, status: v }))}>
                            <SelectTrigger className={cn(FIELD_CLS, 'h-auto')}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {UNIT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Kamers</p>
                          <input type="number" value={newUnitForm.rooms} onChange={e => setNewUnitForm(f => ({ ...f, rooms: e.target.value }))} className={FIELD_CLS} placeholder="3" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Oppervlak (m²)</p>
                          <input type="number" value={newUnitForm.size_m2} onChange={e => setNewUnitForm(f => ({ ...f, size_m2: e.target.value }))} className={FIELD_CLS} placeholder="75" />
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400 mb-1">Maandhuur (€)</p>
                          <input type="number" value={newUnitForm.monthly_rent} onChange={e => setNewUnitForm(f => ({ ...f, monthly_rent: e.target.value }))} className={FIELD_CLS} placeholder="1250" />
                        </div>
                      </div>
                      {newUnitError && <p className="text-xs text-red-500">{newUnitError}</p>}
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setNewUnitOpen(false)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                          Annuleren
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNewUnit}
                          disabled={savingNewUnit || !newUnitForm.unit_number}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#163300] text-white px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors hover:bg-[#1f4a00]"
                        >
                          {savingNewUnit && <Loader2 className="h-3 w-3 animate-spin" />}
                          Opslaan
                        </button>
                      </div>
                    </div>
                  )}

                  {property.units?.length === 0 && !newUnitOpen && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Nog geen eenheden toegevoegd</p>
                  )}

                  <div className="space-y-2">
                    {(property.units || []).map((unit: any) => {
                      const cfg = UNIT_STATUS_CONFIG[unit.status] ?? UNIT_STATUS_CONFIG.leegstand
                      const isEditingUnit = editingUnits.has(unit.id)
                      const form = unitForms[unit.id]
                      const isSaving = savingUnits.has(unit.id)
                      const isDeleting = deletingUnits.has(unit.id)
                      const historyLeases = unitLeases[unit.id] ?? []

                      return (
                        <div key={unit.id} className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
                          {isEditingUnit && form ? (
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Eenheidnummer *</p>
                                  <input value={form.unit_number} onChange={e => setUnitForms(f => ({ ...f, [unit.id]: { ...f[unit.id], unit_number: e.target.value } }))} className={FIELD_CLS} autoFocus />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Status</p>
                                  <Select value={form.status} onValueChange={v => setUnitForms(f => ({ ...f, [unit.id]: { ...f[unit.id], status: v } }))}>
                                    <SelectTrigger className={cn(FIELD_CLS, 'h-auto')}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      {UNIT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Kamers</p>
                                  <input type="number" value={form.rooms} onChange={e => setUnitForms(f => ({ ...f, [unit.id]: { ...f[unit.id], rooms: e.target.value } }))} className={FIELD_CLS} placeholder="3" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Oppervlak (m²)</p>
                                  <input type="number" value={form.size_m2} onChange={e => setUnitForms(f => ({ ...f, [unit.id]: { ...f[unit.id], size_m2: e.target.value } }))} className={FIELD_CLS} placeholder="75" />
                                </div>
                                <div className="col-span-2">
                                  <p className="text-xs text-gray-400 mb-1">Maandhuur (€)</p>
                                  <input type="number" value={form.monthly_rent} onChange={e => setUnitForms(f => ({ ...f, [unit.id]: { ...f[unit.id], monthly_rent: e.target.value } }))} className={FIELD_CLS} placeholder="1250" />
                                </div>
                              </div>
                              {unitErrors[unit.id] && <p className="text-xs text-red-500">{unitErrors[unit.id]}</p>}
                              <div className="flex items-center justify-between pt-1">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button type="button" disabled={isDeleting} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 disabled:opacity-40">
                                      <Trash2 className="h-3 w-3" />
                                      {isDeleting ? 'Bezig…' : 'Verwijderen'}
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Eenheid verwijderen?</AlertDialogTitle>
                                      <AlertDialogDescription>Eenheid {unit.unit_number} wordt permanent verwijderd.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUnit(unit.id)} className="bg-red-600 hover:bg-red-700 text-white">Verwijderen</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingUnits(p => { const n = new Set(p); n.delete(unit.id); return n })
                                      setUnitForms(p => { const n = { ...p }; delete n[unit.id]; return n })
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                                  >
                                    Annuleren
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveUnit(unit.id)}
                                    disabled={isSaving || !form.unit_number}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#163300] text-white px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-[#1f4a00] transition-colors"
                                  >
                                    {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                                    Opslaan
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 px-4 py-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{unit.unit_number}</p>
                                  <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border', cfg.badge)}>
                                    <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
                                    {cfg.label}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-2">
                                  {unit.rooms && <span>{unit.rooms} kamers</span>}
                                  {unit.size_m2 && <span>{unit.size_m2} m²</span>}
                                  {unit.monthly_rent && <span className="font-medium text-[#163300] dark:text-[#9FE870]">€{Number(unit.monthly_rent).toLocaleString('nl-NL')}/mnd</span>}
                                </p>
                                {historyLeases.length > 0 && (
                                  <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-0.5">
                                    {historyLeases.length} {historyLeases.length === 1 ? 'huurcontract' : 'huurcontracten'}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUnits(p => new Set(p).add(unit.id))
                                  setUnitForms(p => ({ ...p, [unit.id]: initUnitForm(unit) }))
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Activiteit ────────────────────────────────────────────────── */}
        {activeTab === 'activiteit' && (
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-5">Recente activiteit</p>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nog geen activiteit</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Activiteiten verschijnen hier zodra ze worden geregistreerd</p>
            </div>
          </div>
        )}

        {/* ── Acties ────────────────────────────────────────────────────── */}
        {activeTab === 'acties' && (
          <div className="space-y-6">
            <ActionListSection title="Beheer">
              <ActionListRow
                icon={TicketPlus}
                title="Ticket aanmaken"
                subtitle="Opent ticketbeheer met dit object pre-ingevuld"
                onClick={() => {
                  router.push(`${basePath}/maintenance?create=1&propertyId=${propertyId}`)
                  onClose()
                }}
                slim
              />
              <ActionListRow
                icon={Wrench}
                title="Inspectie inplannen"
                subtitle="Opent ticketbeheer met categorie inspectie"
                onClick={() => {
                  router.push(`${basePath}/maintenance?create=1&category=inspectie&propertyId=${propertyId}`)
                  onClose()
                }}
                slim
              />
              <ActionListRow icon={ClipboardList} title="Plaatsbeschrijving aanmaken" subtitle="Intrede/uittrede staat van het object" slim right={<span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Binnenkort</span>} />
            </ActionListSection>

            <ActionListSection title="Communicatie">
              <ActionListRow icon={MessageSquare} title="Bericht sturen naar huurder" subtitle="Directe chat met de actieve huurder" slim right={<span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Binnenkort</span>} />
              <ActionListRow icon={FileUp} title="Document versturen" subtitle="Stuur een PDF of brief naar de huurder" slim right={<span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Binnenkort</span>} />
            </ActionListSection>
          </div>
        )}

        {/* ── Betalingen ────────────────────────────────────────────────── */}
        {activeTab === 'betalingen' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">Betalingen</p>
              <button
                type="button"
                onClick={() => { router.push(`${basePath}/financial/betalingen`); onClose() }}
                className="text-xs font-medium text-[#163300] dark:text-[#9FE870] hover:underline"
              >
                Alle betalingen →
              </button>
            </div>
            {paymentsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : propertyPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                  <CreditCard className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Geen betalingen</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Betalingen verschijnen hier zodra transacties aan dit object zijn gekoppeld</p>
              </div>
            ) : (
              <div className="space-y-0">
                {propertyPayments.map((a: any) => {
                  const p = a.payment
                  const date = p?.booking_date
                    ? new Date(p.booking_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'
                  const label = p?.counterparty_name || p?.description || '—'
                  const amount = Number(p?.amount ?? a.amount_assigned)
                  return (
                    <div key={a.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                          <CreditCard className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{label}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{date}{a.category ? ` · ${a.category}` : ''}</p>
                        </div>
                      </div>
                      <p className={cn('text-sm font-semibold shrink-0 ml-3', amount >= 0 ? 'text-[#163300] dark:text-[#9FE870]' : 'text-red-600 dark:text-red-400')}>
                        {amount >= 0 ? '+' : ''}€ {amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Documenten ────────────────────────────────────────────────── */}
        {activeTab === 'documenten' && (
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-5">Documenten</p>
            {propertyDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Geen documenten</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Documenten die aan dit pand zijn gekoppeld verschijnen hier</p>
              </div>
            ) : (
              <div className="space-y-2">
                {propertyDocuments.map((doc: any) => (
                  <div key={doc.id} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                    <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name ?? doc.file_name}</p>
                      {doc.created_at && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString('nl-NL')}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        router.push(`${basePath}/documents?preview=${doc.id}`)
                        onClose()
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:border-[#163300] hover:text-[#163300] dark:hover:border-[#9FE870] dark:hover:text-[#9FE870] transition-colors shrink-0"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Bekijken
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Flows ─────────────────────────────────────────────────────── */}
        {activeTab === 'flows' && (
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-5">Flows</p>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <Workflow className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Binnenkort beschikbaar</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Automatiseer processen rondom dit object</p>
            </div>
          </div>
        )}

      </div>
    </DetailShell>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-neutral-800 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

function EditRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-6">
        <Icon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
        {children}
      </div>
    </div>
  )
}
