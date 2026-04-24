'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
import { DetailShell } from '@/components/ui/detail-shell'
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
  Search,
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
        ...(data.address     && { address:         data.address }),
        ...(data.city        && { city:             data.city }),
        ...(data.postcode    && { postcode:         data.postcode }),
        ...(data.woz_value   != null && { woz_value:      String(data.woz_value) }),
        ...(data.energy_label && { energy_label:    data.energy_label }),
        ...(data.build_year  && { build_year:       String(data.build_year) }),
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
      title={property?.name ?? 'Object'}
      subtitle={property?.address ?? undefined}
    />
  )
}
