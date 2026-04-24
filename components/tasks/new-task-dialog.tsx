'use client'

import { useState, useEffect } from 'react'
import {
  ADD_DIALOG_BODY_CLASS,
  CreateDialogShell,
} from '@/components/ui/add-dialog-layout'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Check, Tag, Zap, Calendar, Link2, Bell } from 'lucide-react'
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

const EMPTY = {
  title: '',
  category: 'overig',
  priority: 'normaal',
  due_date: '',
  notification_date: '',
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
          notification_date: form.notification_date || null,
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
        notification_date: form.notification_date || null,
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
    <CreateDialogShell
      open={open}
      onOpenChange={v => { if (!v) onClose() }}
      title="Nieuwe taak"
      subtitle="Vul de basisgegevens in. Details stel je na aanmaken in."
      primaryLabel="Aanmaken"
      onPrimary={handleCreate}
      primaryDisabled={saving || !form.title.trim()}
      primaryLoading={saving}
    >
      <div className={ADD_DIALOG_BODY_CLASS}>
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

        {/* Categorie + Herinnering */}
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
            <p className={label}><Bell className="inline h-3 w-3 mr-1" />Herinnering</p>
            <WiseDatePicker
              value={form.notification_date}
              onChange={v => set('notification_date', v)}
              placeholder="Optioneel"
              className="[&_button]:min-h-[2.25rem] [&_button]:text-sm"
            />
          </div>
        </div>

        {/* Einddatum + Prioriteit */}
        <div className="grid grid-cols-2 gap-3">
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
        </div>

        {/* Gekoppeld pand */}
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
    </CreateDialogShell>
  )
}
