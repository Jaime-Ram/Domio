'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Clock, Plus, Search,
  Calendar, Bell, RefreshCw, Building2, ListTodo,
  Pencil, Check, Filter, ChevronRight,
} from 'lucide-react'
import { AlertCircle, ClockCheck, CheckDone01 } from '@untitledui/icons'
import { cn } from '@/lib/utils'
import { TabNav } from '@/components/ui/tab-nav'
import { useSortable, applySortedRows } from '@/components/ui/sortable-table'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table-grid'
import { taskQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { TaskSheet } from '@/components/tasks/task-sheet'
import { NewTaskDialog } from '@/components/tasks/new-task-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MetricCard } from '@/components/finance/MetricCard'
import { AddTaskTile } from '@/components/tasks/add-task-tile'
import {
  DASHBOARD_FILTER_MENU_CONTENT_CLASS,
  DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS,
} from '@/app/dashboard/landlord/dashboard-ui'

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

// ── Page ─────────────────────────────────────────────────────────────────────

type FilterKey = 'alle' | 'open' | 'afgerond'

export default function TasksPage() {
  const { isDemo } = useDashboardUser()

  const [tasks, setTasks]         = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<FilterKey>('alle')
  const [search, setSearch]       = useState('')
  const [searchExpanded, setSearchExpanded] = useState(false)
  const taskSearchRef = useRef<HTMLInputElement>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen]   = useState(false)
  const [editing, setEditing]       = useState<any | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(Object.keys(CATEGORY_CONFIG).map((k) => [k, true]))
  )
  const { sort: taskSort, toggleSort } = useSortable<string>()

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
  const afgerondCount = useMemo(() => tasks.filter(t => t.status === 'afgerond').length, [tasks])

  // Filtered list
  const filtered = useMemo(() => {
    let list = tasks
    if (filter === 'open') list = openTasks
    else if (filter === 'afgerond') list = tasks.filter((t) => t.status === 'afgerond')
    list = list.filter((t) => {
      const cat = t.category && t.category in categoryFilter ? t.category : 'overig'
      return categoryFilter[cat] !== false
    })
    if (search) list = list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    return applySortedRows(list, taskSort, (t, k) => {
      if (k === 'title') return t.title ?? ''
      if (k === 'property') return t.properties?.name ?? ''
      if (k === 'due_date') return t.due_date ?? ''
      if (k === 'priority') return ['laag','normaal','hoog','urgent'].indexOf(t.priority ?? 'normaal')
      if (k === 'notification_date') return t.notification_date ?? ''
      return null
    })
  }, [tasks, filter, search, openTasks, categoryFilter, taskSort])

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

  const FILTERS: { key: FilterKey; label: string; count?: number }[] = [
    { key: 'alle', label: 'Alle', count: tasks.length },
    { key: 'open', label: 'Open', count: openTasks.length },
    { key: 'afgerond', label: 'Afgerond', count: afgerondCount },
  ]

  // Tabbalk vol-breed onder de titel — zelfde plek/stijl als de andere pagina's
  const tasksTabs = (
    <TabNav
      tabs={FILTERS.map((f) => ({ id: f.key, label: f.label, count: f.count }))}
      activeTab={filter}
      onChange={(k) => setFilter(k as FilterKey)}
      variant="underline"
      className="w-full"
    />
  )

  // Zoek/filter/actie-knoppen op een eigen rij boven de tabel
  const tasksControls = (
    <div className="flex items-center justify-end gap-1">
        {/* Search — icon, expands left */}
        <div className="flex flex-row-reverse items-center">
          <button
            type="button"
            onClick={() => { setSearchExpanded(true); setTimeout(() => taskSearchRef.current?.focus(), 0) }}
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors shrink-0',
              search && 'text-[#163300] dark:text-[#9FE870]',
            )}
          >
            <Search className="h-4 w-4" />
          </button>
          <div className={cn(
            'overflow-hidden transition-all duration-200 ease-out',
            searchExpanded ? 'max-w-[160px] opacity-100 mr-1' : 'max-w-0 opacity-0 pointer-events-none',
          )}>
            <input
              ref={taskSearchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onBlur={() => { if (!search) setSearchExpanded(false) }}
              onKeyDown={e => { if (e.key === 'Escape') { setSearch(''); setSearchExpanded(false) } }}
              placeholder="Zoeken…"
              className="pl-3 pr-3 h-8 w-40 rounded-full text-xs bg-gray-100 dark:bg-neutral-800 border-0 focus:outline-none focus:ring-2 focus:ring-[#9FE870]/40 text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
            />
          </div>
        </div>
        {/* Filter — icon only */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              suppressHydrationWarning
              className="h-8 w-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Filter className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className={cn(DASHBOARD_FILTER_MENU_CONTENT_CLASS, 'max-h-[min(70vh,480px)] overflow-y-auto')}>
            <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              Categorie
            </DropdownMenuLabel>
            <div className="space-y-1">
              {(Object.entries(CATEGORY_CONFIG) as [string, { label: string }][]).map(([key, { label }]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={categoryFilter[key] !== false}
                  onCheckedChange={(v) => setCategoryFilter((f) => ({ ...f, [key]: Boolean(v) }))}
                  onSelect={(e) => e.preventDefault()}
                  className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Add button */}
        <Button
          type="button"
          onClick={openNew}
          className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 sm:px-5 h-9 text-sm font-medium ml-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe taak
        </Button>
    </div>
  )

  const taskColumns: DataTableColumn<any>[] = [
    {
      key: 'done', header: '', width: '2rem', className: 'flex justify-center',
      render: (task) => {
        const done = task.status === 'afgerond'
        return (
          <button
            type="button"
            onClick={() => toggleDone(task)}
            aria-label={done ? 'Taak heropenen' : 'Taak afronden'}
            className={cn(
              'shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
              done ? 'border-gray-400 bg-gray-400 dark:border-neutral-500 dark:bg-neutral-500' : 'border-gray-300 dark:border-neutral-600 hover:border-gray-500 dark:hover:border-neutral-400',
            )}
          >
            {done && <Check className="h-2.5 w-2.5 text-white" />}
          </button>
        )
      },
    },
    {
      key: 'title', header: 'Taak', sortable: true,
      render: (task) => {
        const done = task.status === 'afgerond'
        const cat = CATEGORY_CONFIG[task.category] ?? CATEGORY_CONFIG.overig
        const rec = RECURRING_LABEL[task.recurring] ?? ''
        return (
          <div className="min-w-0">
            <span className={cn('text-sm font-semibold truncate block', done ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white')}>{task.title}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2 mt-0.5">
              {cat.label}
              {rec && (<><span>·</span><span className="inline-flex items-center gap-1"><RefreshCw className="h-3 w-3 shrink-0" />{rec}</span></>)}
            </span>
          </div>
        )
      },
    },
    {
      key: 'property', header: 'Pand', sortable: true,
      render: (task) => task.properties ? (
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate block">{task.properties.name}</span>
      ) : <span className="text-sm text-gray-300 dark:text-neutral-600">—</span>,
    },
    {
      key: 'due_date', header: 'Einddatum', sortable: true,
      render: (task) => {
        const done = task.status === 'afgerond'
        const days = task.due_date ? daysUntil(task.due_date) : null
        const isOverdue = days !== null && days < 0 && !done
        return task.due_date ? (
          <span className={cn('text-sm', isOverdue ? 'text-red-500 dark:text-red-400 font-medium' : done ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400')}>{fmtDate(task.due_date)}</span>
        ) : <span className="text-sm text-gray-300 dark:text-neutral-600">—</span>
      },
    },
    {
      key: 'priority', header: 'Prioriteit', sortable: true, className: 'hidden md:block', headerClassName: 'hidden md:inline-flex',
      render: (task) => task.priority && task.priority !== 'normaal' ? (
        <span className="text-sm text-gray-500 dark:text-gray-400">{(PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.normaal).label}</span>
      ) : <span className="text-sm text-gray-300 dark:text-neutral-600">—</span>,
    },
    {
      key: 'notification_date', header: 'Herinnering', sortable: true, className: 'hidden md:block', headerClassName: 'hidden md:inline-flex',
      render: (task) => task.notification_date ? (
        <span className="text-sm text-gray-500 dark:text-gray-400">{fmtDate(task.notification_date)}</span>
      ) : <span className="text-sm text-gray-300 dark:text-neutral-600">—</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Tabbalk vol-breed onder de titel, zoals de andere pagina's */}
      {tasksTabs}

      <div className="flex flex-col gap-3">
        {/* Zoek/filter/acties boven de tabel */}
        {tasksControls}

      <DataTable
        rows={filtered}
        columns={taskColumns}
        getRowId={(t) => t.id}
        sort={taskSort}
        onSort={toggleSort}
        loading={loading}
        rowActions={(task) => [
          { label: 'Bewerken', icon: Pencil, onClick: () => openEdit(task) },
          { label: task.status === 'afgerond' ? 'Heropenen' : 'Markeer als afgerond', icon: Check, onClick: () => toggleDone(task) },
        ]}
        empty={
          <div className="px-4">
            <ListTodo className="h-10 w-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{search ? 'Geen taken gevonden' : filter === 'afgerond' ? 'Nog niets afgerond' : 'Geen taken'}</p>
            {!search && filter === 'alle' && (
              <button type="button" onClick={openNew} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] text-xs font-semibold px-3 py-1.5 transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Eerste taak aanmaken
              </button>
            )}
          </div>
        }
      />
      </div>

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
