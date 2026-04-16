'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { X, Check, Tag, Zap, Calendar, Link2 } from 'lucide-react'
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

const EMPTY = {
  title: '',
  category: 'overig',
  priority: 'normaal',
  due_date: '',
  property_id: '',
}

interface NewTaskDialogProps {
  open: boolean
  onClose: () => void
  onSaved: (task: any) => void
}

export function NewTaskDialog({ open, onClose, onSaved }: NewTaskDialogProps) {
  const { isDemo } = useDashboardUser()
  const [form, setForm]     = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY })
    setError(null)
    getUser().then(({ user }) => {
      if (!user) return
      propertyQueries.getByOwner(user.id)
        .then(data => setProperties((data ?? []).map((p: any) => ({ id: p.id, name: p.name }))))
        .catch(() => setProperties([]))
    })
  }, [open])

  const set = (key: keyof typeof EMPTY, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setSaving(true); setError(null)
    try {
      if (isDemo) {
        const demoTask = {
          id: `demo-${Date.now()}`,
          ...form,
          title: form.title.trim(),
          description: null,
          status: 'open',
          recurring: 'geen',
          notification_date: null,
          tenant_id: null,
          property_id: form.property_id || null,
          properties: form.property_id
            ? properties.find(p => p.id === form.property_id) ?? null
            : null,
          tenants: null,
        }
        onSaved(demoTask)
        onClose()
        return
      }
      const { user } = await getUser()
      if (!user) throw new Error('Niet ingelogd')
      const created = await taskQueries.create({
        title:       form.title.trim(),
        category:    form.category,
        priority:    form.priority,
        due_date:    form.due_date || null,
        property_id: form.property_id || null,
        description: null,
        notification_date: null,
        recurring:   'geen',
        tenant_id:   null,
        owner_id:    user.id,
        status:      'open',
      })
      onSaved(created)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aanmaken mislukt')
    } finally { setSaving(false) }
  }

  const tile  = 'bg-gray-50 dark:bg-neutral-800/60 rounded-2xl px-4 py-3'
  const label = 'text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5'
  const inputCls = 'w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-neutral-600 outline-none border-0 p-0'
  const selectTrigger = 'h-auto p-0 text-sm font-medium text-gray-900 dark:text-white bg-transparent border-0 shadow-none focus:ring-0 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-gray-400'

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">

        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center justify-between gap-4 pr-6">
            <DialogTitle className="text-xl font-bold text-[#163300] dark:text-[#9FE870]">
              Nieuwe taak
            </DialogTitle>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1.5 transition-colors">
                <X className="h-3.5 w-3.5" />Annuleren
              </button>
              <button type="button" onClick={handleCreate} disabled={saving || !form.title.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] disabled:opacity-50 text-[#163300] text-xs font-semibold px-3 py-1.5 transition-colors">
                <Check className="h-3.5 w-3.5" />{saving ? 'Aanmaken…' : 'Aanmaken'}
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-xl">{error}</p>
          )}

          {/* Title */}
          <div className={tile}>
            <p className={label}>Titel *</p>
            <input
              autoFocus
              value={form.title}
              onChange={e => set('title', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Bijv. CV-ketel inspecteren"
              className={inputCls}
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className={tile}>
              <p className={label}><Tag className="inline h-3 w-3 mr-1" />Categorie</p>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger className={selectTrigger}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
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
          </div>

          {/* Due date + Property */}
          <div className="grid grid-cols-2 gap-3">
            <div className={tile}>
              <p className={label}><Calendar className="inline h-3 w-3 mr-1" />Einddatum</p>
              <input
                type="date"
                value={form.due_date}
                onChange={e => set('due_date', e.target.value)}
                className={cn(inputCls, 'dark:[color-scheme:dark]')}
              />
            </div>
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

          <p className="text-[11px] text-gray-400 dark:text-gray-500 pb-1">
            Details zoals beschrijving, herhaling en herinneringen kun je na aanmaken instellen.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
