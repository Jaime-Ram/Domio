'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  CheckCircle2, Circle, Clock, AlertCircle, Plus, Search,
  Calendar, Bell, RefreshCw, Building2, ChevronRight, ListTodo,
  Tag, Zap, Pencil, Filter, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { taskQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { TaskSheet } from '@/components/tasks/task-sheet'
import { NewTaskDialog } from '@/components/tasks/new-task-dialog'

// ── Config ──────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  administratief: { label: 'Administratief', color: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400' },
  onderhoud:      { label: 'Onderhoud',      color: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  financieel:     { label: 'Financieel',     color: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' },
  huurder:        { label: 'Huurder',        color: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' },
  juridisch:      { label: 'Juridisch',      color: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  overig:         { label: 'Overig',         color: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400' },
}

const PRIORITY_CONFIG: Record<string, { label: string; dot: string }> = {
  laag:    { label: 'Laag',    dot: 'bg-gray-400' },
  normaal: { label: 'Normaal', dot: 'bg-blue-400' },
  hoog:    { label: 'Hoog',    dot: 'bg-amber-400' },
  urgent:  { label: 'Urgent',  dot: 'bg-red-500' },
}

const RECURRING_LABEL: Record<string, string> = {
  geen: '', wekelijks: 'Wekelijks', maandelijks: 'Maandelijks', jaarlijks: 'Jaarlijks',
}

const DEMO_TASKS = [
  {
    id: 'd1', title: 'CV-ketel inspectie', description: 'Jaarlijkse inspectie door erkend installateur',
    status: 'open', priority: 'hoog', category: 'onderhoud',
    due_date: '2026-05-01', notification_date: '2026-04-22', recurring: 'jaarlijks',
    properties: { id: 'p1', name: 'Keizersgracht 100' }, tenants: null, property_id: 'p1', tenant_id: null,
  },
  {
    id: 'd2', title: 'Huurcontract verlengen – J. de Vries', description: null,
    status: 'open', priority: 'urgent', category: 'huurder',
    due_date: '2026-05-15', notification_date: '2026-04-20', recurring: 'geen',
    properties: { id: 'p1', name: 'Keizersgracht 100' }, tenants: null, property_id: 'p1', tenant_id: null,
  },
  {
    id: 'd3', title: 'Jaarlijkse huurindexatie doorvoeren', description: 'Indexeren o.b.v. CBS-cijfers',
    status: 'open', priority: 'normaal', category: 'financieel',
    due_date: '2026-07-01', notification_date: '2026-06-15', recurring: 'jaarlijks',
    properties: null, tenants: null, property_id: null, tenant_id: null,
  },
  {
    id: 'd4', title: 'Brandmeldinstallatie keuring', description: null,
    status: 'open', priority: 'hoog', category: 'onderhoud',
    due_date: '2026-03-01', notification_date: '2026-02-20', recurring: 'jaarlijks',
    properties: { id: 'p2', name: 'Herengracht 22' }, tenants: null, property_id: 'p2', tenant_id: null,
  },
  {
    id: 'd5', title: 'Belastingaangifte vastgoed 2025', description: null,
    status: 'open', priority: 'normaal', category: 'financieel',
    due_date: '2026-04-30', notification_date: '2026-04-15', recurring: 'jaarlijks',
    properties: null, tenants: null, property_id: null, tenant_id: null,
  },
  {
    id: 'd6', title: 'VvE vergadering voorbereiden', description: null,
    status: 'afgerond', priority: 'laag', category: 'administratief',
    due_date: '2026-04-01', notification_date: null, recurring: 'jaarlijks',
    properties: { id: 'p2', name: 'Herengracht 22' }, tenants: null, property_id: 'p2', tenant_id: null,
  },
  {
    id: 'd7', title: 'Plaatsbeschrijving nieuwe huurder', description: null,
    status: 'afgerond', priority: 'normaal', category: 'huurder',
    due_date: '2026-03-15', notification_date: null, recurring: 'geen',
    properties: { id: 'p1', name: 'Keizersgracht 100' }, tenants: null, property_id: 'p1', tenant_id: null,
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / 86400000)
}

function fmtDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isThisMonth(dateStr: string | null): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr), now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

// ── Page ─────────────────────────────────────────────────────────────────────

type FilterKey = 'alle' | 'open' | 'actie_nodig' | 'te_laat' | 'afgerond'

export default function TasksPage() {
  const { isDemo } = useDashboardUser()

  const [tasks, setTasks]         = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<FilterKey>('alle')
  const [search, setSearch]       = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen]   = useState(false)
  const [editing, setEditing]       = useState<any | null>(null)

  // Load
  useEffect(() => {
    if (isDemo) { setTasks(DEMO_TASKS); setLoading(false); return }
    getUser().then(({ user }) => {
      if (!user) { setLoading(false); return }
      taskQueries.getByOwner(user.id)
        .then(setTasks)
        .catch(() => setTasks([]))   // tabel nog niet aangemaakt → lege staat
        .finally(() => setLoading(false))
    })
  }, [isDemo])

  // KPI derived
  const overdue      = useMemo(() => tasks.filter(t => t.status !== 'afgerond' && t.due_date && daysUntil(t.due_date) < 0), [tasks])
  const actionNeeded = useMemo(() => tasks.filter(t => t.status !== 'afgerond' && t.due_date && daysUntil(t.due_date) >= 0 && daysUntil(t.due_date) <= 7), [tasks])
  const openTasks    = useMemo(() => tasks.filter(t => t.status !== 'afgerond' && t.status !== 'geannuleerd'), [tasks])
  const doneMonth    = useMemo(() => tasks.filter(t => t.status === 'afgerond' && isThisMonth(t.updated_at ?? t.due_date)), [tasks])

  // Filtered list
  const filtered = useMemo(() => {
    let list = tasks
    if (filter === 'open')        list = openTasks
    else if (filter === 'te_laat')     list = overdue
    else if (filter === 'actie_nodig') list = actionNeeded
    else if (filter === 'afgerond')    list = tasks.filter(t => t.status === 'afgerond')
    if (search) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [tasks, filter, search, overdue, actionNeeded, openTasks])

  const toggleDone = async (task: any) => {
    const newStatus = task.status === 'afgerond' ? 'open' : 'afgerond'
    if (isDemo) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
      return
    }
    try {
      const updated = await taskQueries.update(task.id, { status: newStatus })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...(updated as object) } : t))
    } catch {}
  }

  const onSaved = (saved: any) => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === saved.id)
      return idx >= 0 ? prev.map(t => t.id === saved.id ? saved : t) : [saved, ...prev]
    })
  }

  const onDeleted = (id: string) =>
    setTasks(prev => prev.filter(t => t.id !== id))

  const openNew  = () => setDialogOpen(true)
  const openEdit = (task: any) => { setEditing(task); setSheetOpen(true) }

  // ── KPI tiles ────────────────────────────────────────────────────────────

  const KPI_TILES = [
    {
      icon: AlertCircle, label: 'Verlopen',
      value: overdue.length,
      sub: overdue.length === 1 ? 'taak' : 'taken',
      accent: overdue.length > 0 ? 'text-red-600 dark:text-red-400' : undefined,
      bg: overdue.length > 0 ? 'bg-red-50 dark:bg-red-500/10' : undefined,
    },
    {
      icon: Clock, label: 'Actie nodig',
      value: actionNeeded.length,
      sub: 'binnen 7 dagen',
      accent: actionNeeded.length > 0 ? 'text-amber-600 dark:text-amber-400' : undefined,
      bg: actionNeeded.length > 0 ? 'bg-amber-50 dark:bg-amber-500/10' : undefined,
    },
    {
      icon: ListTodo, label: 'Open taken',
      value: openTasks.length,
      sub: 'totaal',
    },
    {
      icon: CheckCircle2, label: 'Afgerond',
      value: doneMonth.length,
      sub: 'deze maand',
      accent: 'text-[#163300] dark:text-[#9FE870]',
    },
  ]

  const FILTERS: { key: FilterKey; label: string; count?: number }[] = [
    { key: 'alle',        label: 'Alle',          count: tasks.length },
    { key: 'open',        label: 'Open',          count: openTasks.length },
    { key: 'actie_nodig', label: 'Actie nodig',   count: actionNeeded.length },
    { key: 'te_laat',     label: 'Te laat',       count: overdue.length },
    { key: 'afgerond',    label: 'Afgerond' },
  ]

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Taken</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Beheer en volg al je actiepunten op één plek</p>
        </div>
        <button type="button" onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] text-sm font-semibold px-4 py-2 transition-colors shrink-0">
          <Plus className="h-4 w-4" />Nieuwe taak
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {KPI_TILES.map(({ icon: Icon, label, value, sub, accent, bg }) => (
          <div key={label} className={cn('rounded-2xl px-4 py-4', bg ?? 'bg-gray-50 dark:bg-neutral-800/60')}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className={cn('h-4 w-4', accent ?? 'text-[#163300] dark:text-[#9FE870]')} />
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</span>
            </div>
            <p className={cn('text-2xl font-bold leading-none', accent ?? 'text-gray-900 dark:text-white')}>{value}</p>
            {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Toolbar: filters + search */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter pills */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full p-1">
          {FILTERS.map(f => (
            <button key={f.key} type="button" onClick={() => setFilter(f.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                filter === f.key
                  ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )}>
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span className={cn('text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                  filter === f.key
                    ? 'bg-[#9FE870]/30 text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]'
                    : 'bg-gray-200 dark:bg-neutral-600 text-gray-600 dark:text-gray-300'
                )}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-xs bg-gray-50 dark:bg-neutral-800/60 rounded-full px-3 py-2">
          <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Zoeken…"
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none border-0 p-0" />
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[0,1,2,3].map(i => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-neutral-800 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <ListTodo className="h-10 w-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {search ? 'Geen taken gevonden' : filter === 'afgerond' ? 'Nog niets afgerond' : 'Geen taken'}
          </p>
          {!search && filter === 'alle' && (
            <button type="button" onClick={openNew}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] text-xs font-semibold px-3 py-1.5 transition-colors">
              <Plus className="h-3.5 w-3.5" />Eerste taak aanmaken
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(task => {
            const done = task.status === 'afgerond'
            const days = task.due_date ? daysUntil(task.due_date) : null
            const isOverdue = days !== null && days < 0 && !done
            const isUrgent  = days !== null && days <= 7 && days >= 0 && !done
            const cat  = CATEGORY_CONFIG[task.category] ?? CATEGORY_CONFIG.overig
            const prio = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.normaal
            const rec  = RECURRING_LABEL[task.recurring] ?? ''

            return (
              <div key={task.id}
                className={cn(
                  'group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors',
                  done
                    ? 'bg-gray-50/50 dark:bg-neutral-800/30'
                    : 'bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 hover:border-gray-200 dark:hover:border-neutral-700'
                )}>

                {/* Checkbox */}
                <button type="button" onClick={() => toggleDone(task)}
                  className={cn(
                    'shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                    done
                      ? 'border-[#163300] bg-[#163300] dark:border-[#9FE870] dark:bg-[#9FE870]'
                      : isOverdue
                        ? 'border-red-400 hover:border-red-500'
                        : 'border-gray-300 dark:border-neutral-600 hover:border-[#163300] dark:hover:border-[#9FE870]'
                  )}>
                  {done && <Check className="h-2.5 w-2.5 text-white dark:text-[#163300]" />}
                </button>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-sm font-medium', done ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white')}>
                      {task.title}
                    </span>
                    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', cat.color)}>{cat.label}</span>
                    {task.priority !== 'normaal' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        <span className={cn('h-1.5 w-1.5 rounded-full', prio.dot)} />{prio.label}
                      </span>
                    )}
                    {rec && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                        <RefreshCw className="h-3 w-3" />{rec}
                      </span>
                    )}
                  </div>
                  {/* Sub-row: property link + description snippet */}
                  {(task.properties || task.description) && (
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      {task.properties && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />{task.properties.name}
                        </span>
                      )}
                      {task.description && !task.properties && (
                        <span className="truncate max-w-xs">{task.description}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: dates */}
                <div className="shrink-0 flex items-center gap-5 text-xs">
                  {task.notification_date && (
                    <span className="hidden sm:flex items-center gap-1 text-gray-400 dark:text-gray-500">
                      <Bell className="h-3 w-3" />{fmtDate(task.notification_date)}
                    </span>
                  )}
                  {task.due_date && (
                    <span className={cn('flex items-center gap-1 font-medium',
                      isOverdue ? 'text-red-600 dark:text-red-400' :
                      isUrgent  ? 'text-amber-600 dark:text-amber-400' :
                      done      ? 'text-gray-400 dark:text-gray-600' :
                                  'text-gray-600 dark:text-gray-300'
                    )}>
                      {isOverdue && <AlertCircle className="h-3 w-3" />}
                      <Calendar className="h-3 w-3" />
                      {fmtDate(task.due_date)}
                    </span>
                  )}
                  {/* Edit pencil */}
                  <button type="button" onClick={() => openEdit(task)}
                    className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 rounded-full bg-[#9FE870]/20 hover:bg-[#9FE870]/40 text-[#163300] dark:text-[#9FE870] px-2.5 py-1 text-[11px] font-medium transition-all">
                    <Pencil className="h-3 w-3" />Bewerken
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create dialog */}
      <NewTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={onSaved}
      />

      {/* Edit sheet */}
      <TaskSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditing(null) }}
        task={editing}
        onSaved={onSaved}
        onDeleted={onDeleted}
      />
    </div>
  )
}
