'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  MapPin,
  DoorOpen,
  FileText,
  Download,
  Pencil,
  Trash2,
  Upload,
  Check,
  X,
  TrendingUp,
  Zap,
  Home,
  ChevronRight,
  User,
  Calendar,
  Ruler,
  Euro,
  Building2,
  CircleDot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { propertyQueries, unitQueries, leaseQueries, documentQueries } from '@/lib/supabase/queries'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

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
  verhuurd:   { label: 'Verhuurd',    dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20' },
  leegstand:  { label: 'Leegstand',   dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
  onderhoud:  { label: 'Onderhoud',   dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
  te_verhuren:{ label: 'Te verhuren', dot: 'bg-purple-400', badge: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' },
}

interface PropertyDetailSheetProps {
  propertyId: string | null
  open: boolean
  onClose: () => void
  onDeleted?: () => void
}

export function PropertyDetailSheet({ propertyId, open, onClose, onDeleted }: PropertyDetailSheetProps) {
  const { basePath } = useDashboardUser()

  const [activeTab, setActiveTab] = useState('info')
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [unitLeases, setUnitLeases] = useState<Record<string, any[]>>({})
  const [propertyDocuments, setPropertyDocuments] = useState<any[]>([])

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '', address: '', postcode: '', city: '',
    type: 'appartement', build_year: '', woz_value: '', energy_label: '',
  })

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

  const initEditForm = (p: any) => setEditForm({
    name: p.name || '', address: p.address || '', postcode: p.postcode || '',
    city: p.city || '', type: p.type || 'appartement',
    build_year: p.build_year ? String(p.build_year) : '',
    woz_value: p.woz_value ? String(p.woz_value) : '',
    energy_label: p.energy_label || '',
  })

  const initUnitForm = (u: any) => ({
    unit_number: u.unit_number || '', rooms: u.rooms ? String(u.rooms) : '',
    size_m2: u.size_m2 ? String(u.size_m2) : '',
    monthly_rent: u.monthly_rent ? String(u.monthly_rent) : '',
    status: u.status || 'leegstand',
  })

  // Load on open
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

  // Derived stats
  const totalRent = property?.units?.reduce((s: number, u: any) => s + (u.monthly_rent || 0), 0) || 0
  const occupiedUnits = property?.units?.filter((u: any) => u.status === 'verhuurd').length || 0
  const totalUnits = property?.units?.length || 0
  const occupancyPct = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

  // Handlers
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

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-full max-w-2xl flex flex-col p-0 overflow-hidden">

        {/* ── Sticky header ── always shows title + KPI strip ── */}
        <SheetHeader className="shrink-0 px-6 pt-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
          {loading ? (
            <>
              <SheetTitle className="sr-only">Laden…</SheetTitle>
              <div className="space-y-2 animate-pulse">
                <div className="h-6 w-40 bg-gray-200 dark:bg-neutral-700 rounded" />
                <div className="h-4 w-56 bg-gray-100 dark:bg-neutral-800 rounded" />
              </div>
            </>
          ) : !property ? (
            <SheetTitle className="text-base text-gray-500">Object niet gevonden</SheetTitle>
          ) : isEditing ? (
            /* ── Edit header — same title/address/KPI structure ── */
            <div>
              <div className="flex items-center justify-between gap-4 pr-10">
                <SheetTitle className="text-xl font-bold text-[#163300] dark:text-[#9FE870] leading-tight truncate">
                  {editForm.name || property.name}
                </SheetTitle>
                {/* Edit mode action pills */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { initEditForm(property); setIsEditing(false); setEditError(null) }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1.5 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />Annuleren
                  </button>
                  <button
                    type="button"
                    disabled={saving || !editForm.name || !editForm.address}
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#163300] hover:bg-[#244d00] disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />{saving ? 'Opslaan…' : 'Opslaan'}
                  </button>
                </div>
              </div>
              {/* KPI strip stays visible in edit mode too */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { icon: DoorOpen, label: 'Units', value: String(totalUnits), sub: null },
                  { icon: Euro, label: 'Maandhuur', value: `€${totalRent.toLocaleString('nl-NL')}`, sub: null },
                  { icon: TrendingUp, label: 'Bezetting', value: `${occupancyPct}%`, sub: `${occupiedUnits}/${totalUnits}` },
                  { icon: Home, label: 'WOZ-waarde', value: editForm.woz_value ? `€${Math.round(parseFloat(editForm.woz_value) / 1000)}k` : '—', sub: null },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-3 py-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{label}</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
                    {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── View header ── */
            <div>
              {/* Top row: title + Bewerken — aligned with the X close button */}
              <div className="flex items-center justify-between gap-4 pr-10">
                <SheetTitle className="text-xl font-bold text-[#163300] dark:text-[#9FE870] leading-tight truncate">
                  {property.name}
                </SheetTitle>
                <button
                  type="button"
                  onClick={() => { initEditForm(property); setIsEditing(true); setActiveTab('info') }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1.5 transition-colors shrink-0"
                >
                  <Pencil className="h-3.5 w-3.5" />Bewerken
                </button>
              </div>

              {/* Address + pills row */}
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {property.address}{property.postcode ? `, ${property.postcode}` : ''}{property.city ? ` ${property.city}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 capitalize">
                    <Building2 className="h-3 w-3" />{property.type}
                  </span>
                  {property.energy_label && (
                    <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full', ENERGY_LABEL_COLORS[property.energy_label] ?? 'bg-gray-200 text-gray-700')}>
                      <Zap className="h-3 w-3" />{property.energy_label}
                    </span>
                  )}
                  {property.build_year && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />{property.build_year}
                    </span>
                  )}
                </div>
              </div>

              {/* KPI strip */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { icon: DoorOpen, label: 'Units', value: String(totalUnits), sub: null },
                  { icon: Euro, label: 'Maandhuur', value: `€${totalRent.toLocaleString('nl-NL')}`, sub: null },
                  { icon: TrendingUp, label: 'Bezetting', value: `${occupancyPct}%`, sub: `${occupiedUnits}/${totalUnits}` },
                  { icon: Home, label: 'WOZ-waarde', value: property.woz_value ? `€${Math.round(property.woz_value / 1000)}k` : '—', sub: null },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-3 py-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{label}</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
                    {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetHeader>

        {/* ── Tabs — visible in both view AND edit mode ── */}
        {!loading && property && (
          <Tabs value={activeTab} onValueChange={v => { if (!isEditing) setActiveTab(v) }} className="flex flex-col flex-1 min-h-0">
            <div className="shrink-0 px-6 pt-4 border-b border-gray-100 dark:border-neutral-800">
              <TabsList className="h-9 bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl">
                <TabsTrigger value="info" className="text-sm rounded-lg px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm">Info</TabsTrigger>
                <TabsTrigger value="units" disabled={isEditing} className="text-sm rounded-lg px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm disabled:opacity-40">
                  Units
                  {totalUnits > 0 && (
                    <span className="ml-1.5 text-[11px] font-semibold bg-[#163300]/10 dark:bg-[#9FE870]/10 text-[#163300] dark:text-[#9FE870] px-1.5 py-0.5 rounded-full">
                      {totalUnits}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="documents" disabled={isEditing} className="text-sm rounded-lg px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm disabled:opacity-40">Documenten</TabsTrigger>
              </TabsList>
            </div>

            {/* ── INFO TAB — view mode ── */}
            <TabsContent value="info" className="flex-1 overflow-y-auto px-6 py-5 mt-0">
              {isEditing ? (
                /* ── EDIT FORM in tab content ── */
                <div className="space-y-5">
                  {editError && (
                    <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">
                      {editError}
                    </p>
                  )}

                  {/* Field tiles — same gray-50 rounded-xl style as KPI widgets */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Locatie</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { label: 'Naam *', key: 'name' as const, placeholder: 'Herenhuis Centrum', span: 2 },
                        { label: 'Adres *', key: 'address' as const, placeholder: 'Keizersgracht 100', span: 2 },
                        { label: 'Postcode', key: 'postcode' as const, placeholder: '1015 AA', span: 1 },
                        { label: 'Stad', key: 'city' as const, placeholder: 'Amsterdam', span: 1 },
                      ].map(({ label, key, placeholder, span }) => (
                        <div key={key} className={cn('bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3', span === 2 && 'col-span-2')}>
                          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">{label}</p>
                          <input
                            value={editForm[key]}
                            onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Kenmerken</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Type select tile */}
                      <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">Type</p>
                        <Select value={editForm.type} onValueChange={v => setEditForm(f => ({ ...f, type: v }))}>
                          <SelectTrigger className="h-auto p-0 text-sm font-medium text-gray-900 dark:text-white bg-transparent border-0 shadow-none focus:ring-0 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-gray-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      {/* Bouwjaar tile */}
                      <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">Bouwjaar</p>
                        <input
                          type="number"
                          value={editForm.build_year}
                          onChange={e => setEditForm(f => ({ ...f, build_year: e.target.value }))}
                          placeholder="1920"
                          className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0"
                        />
                      </div>
                      {/* Energielabel select tile */}
                      <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">Energielabel</p>
                        <Select value={editForm.energy_label || 'none'} onValueChange={v => setEditForm(f => ({ ...f, energy_label: v === 'none' ? '' : v }))}>
                          <SelectTrigger className="h-auto p-0 text-sm font-medium text-gray-900 dark:text-white bg-transparent border-0 shadow-none focus:ring-0 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-gray-400">
                            <SelectValue placeholder="Geen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Geen</SelectItem>
                            {ENERGY_LABELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* WOZ tile */}
                      <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">WOZ-waarde (€)</p>
                        <input
                          type="number"
                          value={editForm.woz_value}
                          onChange={e => setEditForm(f => ({ ...f, woz_value: e.target.value }))}
                          placeholder="350000"
                          className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delete danger zone */}
                  <div className="pt-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button type="button" disabled={deleting} className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 px-2 py-1.5 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                          {deleting ? 'Verwijderen…' : 'Pand verwijderen'}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Pand verwijderen?</AlertDialogTitle>
                          <AlertDialogDescription>Alle bijbehorende units, huurcontracten en documenten worden ook verwijderd. Dit kan niet ongedaan worden gemaakt.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuleren</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Ja, verwijderen</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                /* ── VIEW MODE ── */
                <div className="space-y-6">
                  {/* Location block */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Locatie</h3>
                    <div className="rounded-xl bg-gray-50 dark:bg-neutral-800/60 divide-y divide-gray-100 dark:divide-neutral-700/60">
                      {[
                        { label: 'Adres', value: property.address },
                        { label: 'Postcode', value: property.postcode || '—' },
                        { label: 'Stad', value: property.city || '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between px-4 py-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Financial block */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Financieel</h3>
                    <div className="rounded-xl bg-gray-50 dark:bg-neutral-800/60 divide-y divide-gray-100 dark:divide-neutral-700/60">
                      {[
                        { label: 'WOZ-waarde', value: property.woz_value ? `€${property.woz_value.toLocaleString('nl-NL')}` : '—' },
                        { label: 'Totale maandhuur', value: `€${totalRent.toLocaleString('nl-NL')}` },
                        { label: 'Jaarhuur', value: `€${(totalRent * 12).toLocaleString('nl-NL')}` },
                        { label: 'Bruto rendement', value: property.woz_value && totalRent > 0 ? `${((totalRent * 12 / property.woz_value) * 100).toFixed(1)}%` : '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between px-4 py-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Bezetting bar */}
                  {totalUnits > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Bezetting</h3>
                      <div className="rounded-xl bg-gray-50 dark:bg-neutral-800/60 px-4 py-4">
                        <div className="flex rounded-full overflow-hidden h-2.5 mb-3 gap-px">
                          {property.units.map((u: any) => {
                            const cfg = UNIT_STATUS_CONFIG[u.status] ?? UNIT_STATUS_CONFIG.leegstand
                            return <div key={u.id} className={cn('flex-1 rounded-sm', cfg.dot)} />
                          })}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          {Object.entries(
                            property.units.reduce((acc: Record<string, number>, u: any) => {
                              acc[u.status] = (acc[u.status] || 0) + 1; return acc
                            }, {})
                          ).map(([status, count]) => {
                            const cfg = UNIT_STATUS_CONFIG[status] ?? UNIT_STATUS_CONFIG.leegstand
                            return (
                              <div key={status} className="flex items-center gap-1.5">
                                <span className={cn('inline-block h-2 w-2 rounded-full', cfg.dot)} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">{cfg.label}</span>
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">{count as number}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>
              )}
                </div>
              )}
            </TabsContent>

            {/* ── UNITS TAB ── */}
            <TabsContent value="units" className="flex-1 overflow-y-auto mt-0 flex flex-col min-h-0">
              {/* Units toolbar */}
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {totalUnits} {totalUnits === 1 ? 'unit' : 'units'} · {occupiedUnits} verhuurd
                </p>
                <button
                  type="button"
                  onClick={() => { setNewUnitOpen(true); setNewUnitForm({ unit_number: '', rooms: '', size_m2: '', monthly_rent: '', status: 'leegstand' }); setNewUnitError(null) }}
                  disabled={newUnitOpen}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#163300] hover:bg-[#244d00] disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 transition-colors"
                >
                  <DoorOpen className="h-3.5 w-3.5" />Unit toevoegen
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {/* New unit form — tile style */}
                {newUnitOpen && (
                  <div className="rounded-xl bg-gray-50 dark:bg-neutral-800/60 p-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Nieuwe unit</p>
                    {newUnitError && (
                      <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">{newUnitError}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { label: 'Naam / Nummer *', key: 'unit_number' as const, type: 'text', placeholder: 'Suite A', span: 2 },
                        { label: 'Kamers', key: 'rooms' as const, type: 'number', placeholder: '0', span: 1 },
                        { label: 'Oppervlakte (m²)', key: 'size_m2' as const, type: 'number', placeholder: '0', span: 1 },
                        { label: 'Huurprijs (€/mnd)', key: 'monthly_rent' as const, type: 'number', placeholder: '0', span: 2 },
                      ].map(({ label, key, type, placeholder, span }) => (
                        <div key={key} className={cn('bg-white dark:bg-neutral-900 rounded-xl px-4 py-3', span === 2 && 'col-span-2')}>
                          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">{label}</p>
                          <input
                            type={type}
                            value={newUnitForm[key]}
                            onChange={e => setNewUnitForm(f => ({ ...f, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0"
                          />
                        </div>
                      ))}
                      <div className="col-span-2 bg-white dark:bg-neutral-900 rounded-xl px-4 py-3">
                        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">Status</p>
                        <Select value={newUnitForm.status} onValueChange={v => setNewUnitForm(f => ({ ...f, status: v }))}>
                          <SelectTrigger className="h-auto p-0 text-sm font-medium text-gray-900 dark:text-white bg-transparent border-0 shadow-none focus:ring-0 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-gray-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>{UNIT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button type="button" onClick={() => setNewUnitOpen(false)} disabled={savingNewUnit} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1.5 transition-colors">
                        Annuleren
                      </button>
                      <button type="button" onClick={handleSaveNewUnit} disabled={savingNewUnit || !newUnitForm.unit_number} className="inline-flex items-center gap-1.5 rounded-full bg-[#163300] hover:bg-[#244d00] disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 transition-colors">
                        <Check className="h-3.5 w-3.5" />{savingNewUnit ? 'Opslaan…' : 'Toevoegen'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Unit list */}
                {property.units && property.units.length > 0 ? property.units.map((unit: any) => {
                  const isUnitEditing = editingUnits.has(unit.id)
                  const unitForm = unitForms[unit.id]
                  const leases = unitLeases[unit.id] || []
                  const tenantMap = new Map<string, { id: string; full_name: string }>()
                  for (const lease of leases) {
                    if (lease?.tenants?.id) tenantMap.set(lease.tenants.id, { id: lease.tenants.id, full_name: lease.tenants.full_name })
                  }
                  const tenants = Array.from(tenantMap.values())
                  const cfg = UNIT_STATUS_CONFIG[unit.status] ?? UNIT_STATUS_CONFIG.leegstand

                  return (
                    <div key={unit.id} className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
                      {isUnitEditing && unitForm ? (
                        /* Unit edit form — tile style */
                        <div className="p-4 space-y-3 bg-gray-50 dark:bg-neutral-800/40">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Bewerken</p>
                            {unitErrors[unit.id] && <p className="text-xs text-red-500">{unitErrors[unit.id]}</p>}
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            {[
                              { label: 'Naam / Nummer *', key: 'unit_number' as const, type: 'text', span: 2 },
                              { label: 'Kamers', key: 'rooms' as const, type: 'number', span: 1 },
                              { label: 'Oppervlakte (m²)', key: 'size_m2' as const, type: 'number', span: 1 },
                              { label: 'Huurprijs (€/mnd)', key: 'monthly_rent' as const, type: 'number', span: 2 },
                            ].map(({ label, key, type, span }) => (
                              <div key={key} className={cn('bg-white dark:bg-neutral-900 rounded-xl px-4 py-3', span === 2 && 'col-span-2')}>
                                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">{label}</p>
                                <input
                                  type={type}
                                  value={unitForm[key]}
                                  onChange={e => setUnitForms(p => ({ ...p, [unit.id]: { ...p[unit.id], [key]: e.target.value } }))}
                                  className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none border-0 p-0"
                                />
                              </div>
                            ))}
                            <div className="col-span-2 bg-white dark:bg-neutral-900 rounded-xl px-4 py-3">
                              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">Status</p>
                              <Select value={unitForm.status} onValueChange={v => setUnitForms(p => ({ ...p, [unit.id]: { ...p[unit.id], status: v } }))}>
                                <SelectTrigger className="h-auto p-0 text-sm font-medium text-gray-900 dark:text-white bg-transparent border-0 shadow-none focus:ring-0 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-gray-400">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>{UNIT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button type="button" disabled={deletingUnits.has(unit.id)} className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 px-2 py-1.5 transition-colors">
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {deletingUnits.has(unit.id) ? 'Verwijderen…' : 'Verwijderen'}
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Unit verwijderen?</AlertDialogTitle>
                                  <AlertDialogDescription>Weet je zeker dat je &apos;{unit.unit_number}&apos; wilt verwijderen? Dit kan niet ongedaan worden gemaakt.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUnit(unit.id)} className="bg-red-600 hover:bg-red-700 text-white">Ja, verwijderen</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => { setEditingUnits(p => { const n = new Set(p); n.delete(unit.id); return n }); setUnitForms(p => { const n = { ...p }; delete n[unit.id]; return n }) }} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1.5 transition-colors">
                                Annuleren
                              </button>
                              <button type="button" onClick={() => handleSaveUnit(unit.id)} disabled={savingUnits.has(unit.id) || !unitForm.unit_number} className="inline-flex items-center gap-1.5 rounded-full bg-[#163300] hover:bg-[#244d00] disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 transition-colors">
                                <Check className="h-3.5 w-3.5" />{savingUnits.has(unit.id) ? 'Opslaan…' : 'Opslaan'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Unit view row */
                        <div className="flex items-center gap-4 px-4 py-3.5">
                          <div className="shrink-0">
                            <span className={cn('inline-block h-2.5 w-2.5 rounded-full mt-0.5', cfg.dot)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{unit.unit_number}</p>
                              <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full border', cfg.badge)}>{cfg.label}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                              {unit.rooms && <span className="flex items-center gap-1"><CircleDot className="h-3 w-3" />{unit.rooms} kamers</span>}
                              {unit.size_m2 && <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{unit.size_m2} m²</span>}
                              {tenants.length > 0 && (
                                <span className="flex items-center gap-1 text-[#163300] dark:text-[#9FE870] font-medium">
                                  <User className="h-3 w-3" />{tenants[0].full_name}
                                  {tenants.length > 1 && ` +${tenants.length - 1}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-3">
                            {unit.monthly_rent && (
                              <p className="text-sm font-bold text-gray-900 dark:text-white">€{unit.monthly_rent.toLocaleString('nl-NL')}</p>
                            )}
                            <button
                              type="button"
                              onClick={() => { setEditingUnits(p => new Set(p).add(unit.id)); setUnitForms(p => ({ ...p, [unit.id]: initUnitForm(unit) })) }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Tenant links (view mode, multiple tenants) */}
                      {!isUnitEditing && tenants.length > 1 && (
                        <div className="border-t border-gray-100 dark:border-neutral-800 px-4 py-2 flex flex-wrap gap-2">
                          {tenants.map(tenant => (
                            <Link key={tenant.id} href={`${basePath}/tenants/${tenant.id}`} className="inline-flex items-center gap-1.5 text-xs text-[#163300] dark:text-[#9FE870] hover:underline">
                              <User className="h-3 w-3" />{tenant.full_name}<ChevronRight className="h-3 w-3" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }) : !newUnitOpen ? (
                  <div className="py-16 text-center">
                    <DoorOpen className="h-10 w-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nog geen units</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Voeg de eerste unit toe aan dit pand</p>
                  </div>
                ) : null}
              </div>
            </TabsContent>

            {/* ── DOCUMENTS TAB ── */}
            <TabsContent value="documents" className="flex-1 overflow-y-auto mt-0 flex flex-col min-h-0">
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">{propertyDocuments.length} document{propertyDocuments.length !== 1 ? 'en' : ''}</p>
                <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-[#163300] hover:bg-[#244d00] text-white text-xs font-medium px-3 py-1.5 transition-colors">
                  <Upload className="h-3.5 w-3.5" />Uploaden
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {propertyDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {propertyDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-gray-300 dark:hover:border-neutral-600 transition-colors">
                        <FileText className="h-5 w-5 text-[#163300] dark:text-[#9FE870] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400">{doc.type}</span>
                            {doc.size && <span className="text-xs text-gray-400">· {doc.size}</span>}
                            {doc.uploadDate && <span className="text-xs text-gray-400">· {new Date(doc.uploadDate).toLocaleDateString('nl-NL')}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                            <Download className="h-4 w-4" />
                          </button>
                          <button type="button" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <FileText className="h-10 w-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nog geen documenten</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload huurcontracten, inspectierapporten of andere bestanden</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="flex-1 px-6 py-6 space-y-4 animate-pulse">
            <div className="grid grid-cols-4 gap-3">
              {[0,1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-neutral-800 rounded-xl" />)}
            </div>
            <div className="h-4 w-24 bg-gray-100 dark:bg-neutral-800 rounded" />
            <div className="h-32 bg-gray-100 dark:bg-neutral-800 rounded-xl" />
            <div className="h-4 w-24 bg-gray-100 dark:bg-neutral-800 rounded" />
            <div className="h-24 bg-gray-100 dark:bg-neutral-800 rounded-xl" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
