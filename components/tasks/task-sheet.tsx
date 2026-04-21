'use client'

import { useState, useEffect } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Check, X, Trash2, RefreshCw, Bell, Calendar, Tag, Zap, Link2 } from 'lucide-react'
import { WiseDatePicker } from '@/components/ui/wise-date-picker'
import { cn } from '@/lib/utils'
import { taskQueries, propertyQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { useDashboardUser } from '@/providers/dashboard-user-provider'

const CATEGORIES = [
  { value: 'administratief', label: 'Administratief' },
  { value: 'onderhoud',      label: 'Onderhoud' },
  { value: 'financieel',     label: 'Financieel' },
  { value: 'huurder',        label: 'Huurder' },
  { value: 'juridisch',      label: 'Juridisch' },
  { value: 'overig',         label: 'Overig' },
]

const PRIORITIES = [
  { value: 'laag',    label: 'Laag',    dot: 'bg-gray-400' },
  { value: 'normaal', label: 'Normaal', dot: 'bg-blue-400' },
  { value: 'hoog',    label: 'Hoog',    dot: 'bg-amber-400' },
  { value: 'urgent',  label: 'Urgent',  dot: 'bg-red-500' },
]

const RECURRING = [
  { value: 'geen',       label: 'Eenmalig' },
  { value: 'wekelijks',  label: 'Wekelijks' },
  { value: 'maandelijks',label: 'Maandelijks' },
  { value: 'jaarlijks',  label: 'Jaarlijks' },
]

const EMPTY_FORM = {
  title: '', description: '',
  category: 'overig', priority: 'normaal',
  due_date: '', notification_date: '', recurring: 'geen',
  property_id: '', tenant_id: '',
}

interface TaskSheetProps {
  open: boolean
  onClose: () => void
  task?: any | null           // null = new task
  onSaved: (task: any) => void
  onDeleted?: (taskId: string) => void
}

export function TaskSheet({ open, onClose, task, onSaved, onDeleted }: TaskSheetProps) {
  const { isDemo } = useDashboardUser()
  const [form, setForm]     = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])

  // Load properties for linking
  useEffect(() => {
    if (!open) return
    getUser().then(({ user }) => {
      if (!user) return
      propertyQueries.getByOwner(user.id)
        .then(data => setProperties((data ?? []).map((p: any) => ({ id: p.id, name: p.name }))))
        .catch(() => setProperties([]))
    })
  }, [open])

  // Populate form from existing task
  useEffect(() => {
    if (!open) return
    if (task) {
      setForm({
        title:             task.title ?? '',
        description:       task.description ?? '',
        category:          task.category ?? 'overig',
        priority:          task.priority ?? 'normaal',
        due_date:          task.due_date ?? '',
        notification_date: task.notification_date ?? '',
        recurring:         task.recurring ?? 'geen',
        property_id:       task.property_id ?? '',
        tenant_id:         task.tenant_id ?? '',
      })
    } else {
      setForm({ ...EMPTY_FORM })
    }
    setError(null)
  }, [open, task])

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true); setError(null)
    try {
      const payload = {
        title:             form.title.trim(),
        description:       form.description.trim() || null,
        category:          form.category,
        priority:          form.priority,
        due_date:          form.due_date || null,
        notification_date: form.notification_date || null,
        recurring:         form.recurring,
        property_id:       form.property_id || null,
        tenant_id:         form.tenant_id || null,
      }
      if (task) {
        const updated = await taskQueries.update(task.id, payload)
        onSaved(updated)
      } else {
        const { user } = await getUser()
        if (!user) throw new Error('Niet ingelogd')
        const created = await taskQueries.create({ ...payload, owner_id: user.id, status: 'open' })
        onSaved(created)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!task) return
    setDeleting(true)
    try {
      await taskQueries.delete(task.id)
      onDeleted?.(task.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verwijderen mislukt')
      setDeleting(false)
    }
  }

  const set = (key: keyof typeof EMPTY_FORM, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const tile = 'bg-gray-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3'
  const label = 'text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5'
  const inputCls = 'w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0'
  const selectTrigger = 'h-auto p-0 text-sm font-medium text-gray-900 dark:text-white bg-transparent border-0 shadow-none focus:ring-0 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-gray-400'

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-full max-w-lg flex flex-col p-0 overflow-hidden">

        {/* Header */}
        <SheetHeader className="shrink-0 px-6 pt-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center justify-between gap-4 pr-10">
            <SheetTitle className="text-xl font-bold text-[#163300] dark:text-[#9FE870] leading-tight truncate">
              {task ? (form.title || task.title) : 'Nieuwe taak'}
            </SheetTitle>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1.5 transition-colors">
                <X className="h-3.5 w-3.5" />Annuleren
              </button>
              <button type="button" onClick={handleSave} disabled={saving || !form.title.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#163300] hover:bg-[#244d00] disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 transition-colors">
                <Check className="h-3.5 w-3.5" />{saving ? 'Opslaan…' : 'Opslaan'}
              </button>
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">{error}</p>
          )}

          {/* Taak */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Taak</p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className={cn(tile, 'col-span-2')}>
                <p className={label}>Titel *</p>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="Bijv. CV-ketel inspecteren" className={inputCls} />
              </div>
              <div className={cn(tile, 'col-span-2')}>
                <p className={label}>Beschrijving</p>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Optionele toelichting…" rows={3}
                  className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0 resize-none" />
              </div>
            </div>
          </div>

          {/* Indeling */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Indeling</p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className={tile}>
                <p className={label}><Tag className="inline h-3 w-3 mr-1" />Categorie</p>
                <Select value={form.category} onValueChange={v => set('category', v)}>
                  <SelectTrigger className={selectTrigger}><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className={tile}>
                <p className={label}><Bell className="inline h-3 w-3 mr-1" />Herinnering</p>
                <WiseDatePicker
                  value={form.notification_date}
                  onChange={v => set('notification_date', v)}
                  placeholder="Optioneel"
                  className="[&_button]:min-h-[2.25rem] [&_button]:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Planning */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Planning</p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className={tile}>
                <p className={label}><Calendar className="inline h-3 w-3 mr-1" />Einddatum</p>
                <WiseDatePicker
                  value={form.due_date}
                  onChange={v => set('due_date', v)}
                  placeholder="Kies datum"
                  className="[&_button]:min-h-[2.25rem] [&_button]:text-sm"
                />
              </div>
              <div className={tile}>
                <p className={label}><Zap className="inline h-3 w-3 mr-1" />Prioriteit</p>
                <Select value={form.priority} onValueChange={v => set('priority', v)}>
                  <SelectTrigger className={selectTrigger}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        <span className="flex items-center gap-2">
                          <span className={cn('h-2 w-2 rounded-full shrink-0', p.dot)} />{p.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={cn(tile, 'col-span-2')}>
                <p className={label}><RefreshCw className="inline h-3 w-3 mr-1" />Herhaling</p>
                <Select value={form.recurring} onValueChange={v => set('recurring', v)}>
                  <SelectTrigger className={selectTrigger}><SelectValue /></SelectTrigger>
                  <SelectContent>{RECURRING.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Koppeling */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Koppeling</p>
            <div className="grid grid-cols-1 gap-2.5">
              <div className={tile}>
                <p className={label}><Link2 className="inline h-3 w-3 mr-1" />Gekoppeld pand</p>
                <Select value={form.property_id || 'geen'} onValueChange={v => set('property_id', v === 'geen' ? '' : v)}>
                  <SelectTrigger className={selectTrigger}><SelectValue placeholder="Geen koppeling" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geen">Geen koppeling</SelectItem>
                    {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Delete */}
          {task && (
            <div className="pt-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button type="button" disabled={deleting}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 px-2 py-1.5 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />{deleting ? 'Verwijderen…' : 'Taak verwijderen'}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Taak verwijderen?</AlertDialogTitle>
                    <AlertDialogDescription>Dit kan niet ongedaan worden gemaakt.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Ja, verwijderen</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
