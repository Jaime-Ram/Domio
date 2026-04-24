'use client'

import { useState, useEffect } from 'react'
import {
} from '@/components/ui/sheet'
import { DetailShell } from '@/components/ui/detail-shell'
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
    <DetailShell
      open={open}
      onClose={onClose}
      title={task ? (form.title || task.title) : 'Nieuwe taak'}
      subtitle="Taakdetails"
    />
  )
}
