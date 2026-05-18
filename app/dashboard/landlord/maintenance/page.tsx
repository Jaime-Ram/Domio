'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ADD_DIALOG_BODY_CLASS,
  ADD_DIALOG_CLOSE_BUTTON_CLASS,
  ADD_DIALOG_FOOTER_SPLIT_CLASS,
  ADD_DIALOG_HEADER_CLASS,
  ADD_DIALOG_TITLE_CLASS,
  addDialogContentClassName,
} from '@/components/ui/add-dialog-layout'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MessageCircle,
  MoreHorizontal,
  Plus,
  Filter,
  Search,
  CheckSquare,
  Square,
  X,
  ChevronDown,
} from 'lucide-react'
import { mockMaintenanceRequests } from '@/lib/mock-data/vastgoed'
import { TicketDetailSheet } from '@/components/tickets/ticket-detail-sheet'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  dashboardCardClass,
  DASHBOARD_TABLE_ICON_WRAP_CLASS,
  DASHBOARD_FILTER_TRIGGER_BUTTON_CLASS,
  DASHBOARD_FILTER_MENU_CONTENT_CLASS,
  DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS,
} from '@/app/dashboard/landlord/dashboard-ui'

import { ticketQueries } from '@/lib/supabase/queries'
import { DatePicker } from '@/components/ui/date-picker'
import { useSortable, applySortedRows, SortableHeader } from '@/components/ui/sortable-table'
import { cn } from '@/lib/utils'


type TicketRow = {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
  due_date?: string | null
  sla_deadline?: string | null
  unitLabel?: string | null
  propertyName?: string | null
  category?: string | null
  ticket_number?: number | null
}

const SLA_HOURS: Record<string, number> = { urgent: 4, hoog: 24, normaal: 72, laag: 168 }

function getSlaVariant(t: TicketRow): 'over' | 'warning' | 'ok' | null {
  if (t.status === 'afgerond' || t.status === 'geannuleerd') return null
  const created = new Date(t.created_at)
  const deadline = t.sla_deadline
    ? new Date(t.sla_deadline)
    : new Date(created.getTime() + (SLA_HOURS[t.priority] ?? 72) * 3600000)
  const now = Date.now()
  const remaining = deadline.getTime() - now
  if (remaining <= 0) return 'over'
  const total = deadline.getTime() - created.getTime()
  if (remaining / total < 0.2) return 'warning'
  return 'ok'
}

const STATUS_KEYS = ['open', 'in_behandeling', 'gepland', 'afgerond', 'geannuleerd'] as const
const PRIORITY_KEYS = ['laag', 'normaal', 'hoog', 'urgent'] as const
const CATEGORY_LABELS: Record<string, string> = {
  onderhoud: 'Onderhoud', inspectie: 'Inspectie', klacht: 'Klacht',
  compliance: 'Compliance', huurgebeurtenis: 'Huurgebeurtenis',
}

type SortColumn = 'title' | 'status' | 'priority' | 'due_date'

const STATUS_LABEL: Record<string, string> = {
  open: 'Open', in_behandeling: 'In behandeling', gepland: 'Gepland',
  afgerond: 'Afgerond', geannuleerd: 'Geannuleerd',
}
const STATUS_PILL_CLS: Record<string, string> = {
  open:           'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_behandeling: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  gepland:        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  afgerond:       'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  geannuleerd:    'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-500',
}
const STATUS_DOT_CLS: Record<string, string> = {
  open: 'bg-yellow-500', in_behandeling: 'bg-blue-500', gepland: 'bg-purple-500',
  afgerond: 'bg-green-600', geannuleerd: 'bg-gray-400',
}
const PRIORITY_LABEL: Record<string, string> = {
  urgent: 'Spoed', hoog: 'Hoog', normaal: 'Normaal', laag: 'Laag',
}
const PRIORITY_PILL_CLS: Record<string, string> = {
  urgent: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  hoog:   'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  normaal:'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400',
  laag:   'bg-gray-50 text-gray-400 dark:bg-neutral-900/50 dark:text-gray-600',
}

function StatusPill({ status, ticketId, onUpdate }: {
  status: string
  ticketId: string
  onUpdate: (id: string, updates: { status: string }) => void
}) {
  const [busy, setBusy] = useState(false)
  const handleChange = async (next: string) => {
    if (next === status || busy) return
    setBusy(true)
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      onUpdate(ticketId, { status: next })
    } finally { setBusy(false) }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={e => e.stopPropagation()}
          disabled={busy}
          suppressHydrationWarning
          className={cn(
            'flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-75 disabled:opacity-50 cursor-pointer select-none whitespace-nowrap',
            STATUS_PILL_CLS[status] ?? STATUS_PILL_CLS.open,
          )}
        >
          {STATUS_LABEL[status] ?? status}
          <ChevronDown className="h-3 w-3 opacity-40 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rounded-xl min-w-[168px] p-1" onClick={e => e.stopPropagation()}>
        {STATUS_KEYS.map(s => (
          <DropdownMenuItem
            key={s}
            onClick={() => handleChange(s)}
            className={cn('text-xs rounded-lg cursor-pointer flex items-center gap-2 px-2.5 py-1.5', s === status && 'font-semibold')}
          >
            <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_DOT_CLS[s])} />
            {STATUS_LABEL[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PriorityPill({ priority, ticketId, onUpdate }: {
  priority: string
  ticketId: string
  onUpdate: (id: string, updates: { priority: string }) => void
}) {
  const [busy, setBusy] = useState(false)
  const norm = priority === 'spoed' ? 'urgent' : priority
  const handleChange = async (next: string) => {
    if (next === norm || busy) return
    setBusy(true)
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: next }),
      })
      onUpdate(ticketId, { priority: next })
    } finally { setBusy(false) }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={e => e.stopPropagation()}
          disabled={busy}
          suppressHydrationWarning
          className={cn(
            'flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-75 disabled:opacity-50 cursor-pointer select-none whitespace-nowrap',
            PRIORITY_PILL_CLS[norm] ?? PRIORITY_PILL_CLS.normaal,
          )}
        >
          {PRIORITY_LABEL[norm] ?? priority}
          <ChevronDown className="h-3 w-3 opacity-40 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rounded-xl min-w-[120px] p-1" onClick={e => e.stopPropagation()}>
        {PRIORITY_KEYS.map(p => (
          <DropdownMenuItem
            key={p}
            onClick={() => handleChange(p)}
            className={cn('text-xs rounded-lg cursor-pointer px-2.5 py-1.5', p === norm && 'font-semibold')}
          >
            {PRIORITY_LABEL[p]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function MaintenancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isDemo, basePath } = useDashboardUser()
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(STATUS_KEYS.map((k) => [k, true]))
  )
  const [priorityFilter, setPriorityFilter] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PRIORITY_KEYS.map((k) => [k, true]))
  )
  const [categoryFilter, setCategoryFilter] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(Object.keys(CATEGORY_LABELS).map(k => [k, true]))
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [searchExpanded, setSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [propertyFilter, setPropertyFilter] = useState<Record<string, boolean>>({})
  const { sort: ticketSort, toggleSort } = useSortable<string>()

  // Bulk selection (Notion-style: checkbox on hover)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkBusy, setBulkBusy] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<'laag' | 'normaal' | 'hoog' | 'urgent'>('normaal')
  const [newScope, setNewScope] = useState<'pand' | 'persoon'>('persoon')
  const [newUnitId, setNewUnitId] = useState('')
  const [newPropertyId, setNewPropertyId] = useState('')
  const [newLeaseId, setNewLeaseId] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [newCategory, setNewCategory] = useState<string>('')
  const [propertyOptions, setPropertyOptions] = useState<{ id: string; label: string }[]>([])
  const [leaseOptions, setLeaseOptions] = useState<{ id: string; unitId: string | null; label: string }[]>([])
  const pendingLeaseId = useRef<string | null>(null)

  // Detail panel
  const [detailTicketId, setDetailTicketId] = useState<string | null>(null)

  useEffect(() => {
    const ticket = new URLSearchParams(window.location.search).get('ticket')
    if (ticket) setDetailTicketId(ticket)
    // Deep-link: ?create=1&leaseId=X&category=Y opent het aanmaakformulier pre-filled
    const create = searchParams.get('create')
    if (create === '1') {
      const leaseId = searchParams.get('leaseId')
      const category = searchParams.get('category')
      if (category) setNewCategory(category)
      if (leaseId) pendingLeaseId.current = leaseId
      setCreateOpen(true)
      // Verwijder de params uit de URL zonder reload
      const url = new URL(window.location.href)
      url.searchParams.delete('create')
      url.searchParams.delete('leaseId')
      url.searchParams.delete('category')
      window.history.replaceState({}, '', url.toString())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const openDetail = (id: string) => {
    setDetailTicketId(id)
    const url = new URL(window.location.href)
    url.searchParams.set('ticket', id)
    window.history.replaceState({}, '', url.toString())
  }

  const closeDetail = () => {
    setDetailTicketId(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('ticket')
    window.history.replaceState({}, '', url.toString())
  }

  const updateTicketField = (id: string, updates: Partial<TicketRow>) =>
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))

  const quickStatus = (id: string, status: string) => {
    fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    updateTicketField(id, { status })
  }

  const deleteTicket = (id: string) => {
    fetch(`/api/tickets/${id}`, { method: 'DELETE' })
    setTickets(prev => prev.filter(t => t.id !== id))
    setSelectedIds(prev => prev.filter(sid => sid !== id))
  }

  useEffect(() => {
    if (isDemo) {
      const demoDueDates = ['2026-06-01', null, '2026-07-15', null, null, '2026-05-30']
      const demoCats = ['onderhoud', 'klacht', 'inspectie', 'onderhoud']
      const demoRows: TicketRow[] = mockMaintenanceRequests.map((r, i) => ({
        id: r.id,
        title: r.title || r.description?.slice(0, 80) || 'Onderhoudsmelding',
        status: r.status ?? 'open',
        priority: r.priority === 'spoed' ? 'urgent' : (r.priority ?? 'normaal'),
        created_at: r.createdAt ?? new Date().toISOString(),
        due_date: demoDueDates[i % demoDueDates.length],
        category: demoCats[i % demoCats.length],
        ticket_number: 1041 + i,
        unitLabel: r.property?.name ?? null,
      }))
      setTickets(demoRows)
      setLoading(false)
      return
    }
    if (!user?.id) {
      setTickets([])
      setLoading(false)
      return
    }
    ticketQueries
      .getByOwner(user.id)
      .then((rows) => {
        setTickets(
          (rows || []).map((t: any) => {
            // Label: alleen huurder naam (persoon) of pandnaam (pand)
            const unitLabel: string | null =
              t.scope === 'persoon'
                ? (t.leases?.tenants?.full_name ?? null)
                : (t.properties?.name ?? t.leases?.units?.properties?.name ?? t.units?.properties?.name ?? null)
            const propName = t.properties?.name ?? t.leases?.units?.properties?.name ?? t.units?.properties?.name ?? null
            return {
              id: t.id,
              title: t.title || 'Ticket',
              status: t.status || 'open',
              priority: t.priority || 'normaal',
              created_at: t.created_at || new Date().toISOString(),
              due_date: (t as any).due_date ?? null,
              sla_deadline: (t as any).sla_deadline ?? null,
              category: (t as any).category ?? null,
              ticket_number: (t as any).ticket_number ?? null,
              unitLabel: unitLabel || null,
              propertyName: propName,
            }
          })
        )
      })
      .finally(() => setLoading(false))
  }, [user?.id, isDemo])

  useEffect(() => {
    if (isDemo || !user?.id) return
    fetch('/api/properties')
      .then(r => r.json())
      .then(({ properties }) => {
        setPropertyOptions(
          (properties ?? []).map((p: any) => ({ id: p.id, label: p.name || p.address || 'Pand' }))
        )
      })
      .catch(e => console.error('[properties]', e))
  }, [user?.id, isDemo])

  useEffect(() => {
    if (!user?.id || isDemo) return
    import('@/lib/supabase/queries').then(({ leaseQueries }) => {
      leaseQueries.getByOwner(user.id!).then((leases) => {
        const opts = (leases || [])
          .filter((l: any) => l.tenants && l.status === 'actief')
          .map((l: any) => ({
            id: l.id,
            unitId: (l.unit_id as string | null) ?? null,
            label: `${l.tenants?.full_name ?? 'Onbekend'} — ${l.units?.properties?.name ?? ''}${l.units?.unit_number ? ` nr. ${l.units.unit_number}` : ''}`.trim(),
          }))
        setLeaseOptions(opts)
      }).catch(() => {})
    })
  }, [user?.id, isDemo])

  const normalizePriority = (p: string) => (p === 'spoed' ? 'urgent' : p)

  // Unieke pandnamen voor filter (dynamisch op basis van geladen tickets)
  const uniquePropertyNames = useMemo(() => {
    const names = tickets.map(t => t.propertyName).filter(Boolean) as string[]
    return [...new Set(names)].sort()
  }, [tickets])

  const filteredTickets = useMemo(() => {
    const q = searchQuery.toLowerCase()
    const hasPropertyFilter = Object.values(propertyFilter).some(v => v === false)
    return tickets.filter((t) => {
      const matchesStatus = statusFilter[t.status] !== false
      const pr = normalizePriority(t.priority)
      const matchesPriority = priorityFilter[pr] !== false
      const matchesCategory = !t.category || categoryFilter[t.category] !== false
      const matchesProperty = !hasPropertyFilter || !t.propertyName || propertyFilter[t.propertyName] !== false
      const matchesSearch = !q ||
        t.title.toLowerCase().includes(q) ||
        (t.unitLabel ?? '').toLowerCase().includes(q) ||
        (t.ticket_number ? `#${t.ticket_number}`.includes(q) : false)
      return matchesStatus && matchesPriority && matchesCategory && matchesProperty && matchesSearch
    })
  }, [tickets, statusFilter, priorityFilter, categoryFilter, propertyFilter, searchQuery])

  const toggleSelectTicket = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const toggleSelectAll = () =>
    setSelectedIds(prev => prev.length === sortedTickets.length ? [] : sortedTickets.map(t => t.id))

  const exitSelectionMode = () => { setSelectedIds([]); setBulkStatus('') }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (!newStatus || selectedIds.length === 0) return
    setBulkBusy(true)
    try {
      await Promise.allSettled(selectedIds.map(id =>
        fetch(`/api/tickets/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      ))
      setTickets(prev => prev.map(t =>
        selectedIds.includes(t.id) ? { ...t, status: newStatus } : t
      ))
      exitSelectionMode()
    } finally {
      setBulkBusy(false)
    }
  }

  const sortedTickets = useMemo(() =>
    applySortedRows(filteredTickets, ticketSort, (t, k) => {
      if (k === 'title') return t.title
      if (k === 'status') return t.status
      if (k === 'priority') return normalizePriority(t.priority)
      if (k === 'due_date') return t.due_date ? new Date(t.due_date).getTime() : Infinity
      return null
    })
  , [filteredTickets, ticketSort])

  // Zodra leaseOptions geladen zijn en er een pending deep-link leaseId is: pre-fill
  useEffect(() => {
    if (pendingLeaseId.current && leaseOptions.length > 0) {
      handleLeaseSelect(pendingLeaseId.current)
      pendingLeaseId.current = null
    }
  }, [leaseOptions]) // eslint-disable-line react-hooks/exhaustive-deps

  const resetCreateForm = () => {
    setNewTitle('')
    setNewDescription('')
    setNewPriority('normaal')
    setNewScope('persoon')
    setNewUnitId('')
    setNewPropertyId('')
    setNewLeaseId('')
    setNewDeadline('')
    setNewCategory('')
  }

  const handleLeaseSelect = (leaseId: string) => {
    setNewLeaseId(leaseId)
    const lease = leaseOptions.find((l) => l.id === leaseId)
    setNewUnitId(lease?.unitId ?? '')
  }

  const handleCreateTicket = async () => {
    const title = newTitle.trim()
    if (!title) return
    setCreating(true)
    try {
      if (isDemo) {
        const selectedLease = leaseOptions.find((l) => l.id === newLeaseId)
        const row: TicketRow = {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `demo-${Date.now()}`,
          title,
          status: 'open',
          priority: newPriority,
          created_at: new Date().toISOString(),
          category: newCategory || null,
          ticket_number: Math.floor(1000 + Math.random() * 9000),
          unitLabel: newScope === 'pand'
            ? propertyOptions.find((p) => p.id === newPropertyId)?.label ?? null
            : selectedLease?.label ?? null,
        }
        setTickets((prev) => [row, ...prev])
      } else if (user?.id) {
        const SLA_HOURS: Record<string, number> = { urgent: 4, hoog: 24, normaal: 72, laag: 168 }
        const slaDeadline = new Date(Date.now() + (SLA_HOURS[newPriority] ?? 72) * 3600000).toISOString()
        const created = await ticketQueries.create({
          owner_id: user.id,
          title,
          description: newDescription.trim() || null,
          status: 'open',
          priority: newPriority,
          scope: newScope,
          unit_id: newScope === 'persoon' ? (newUnitId || null) : null,
          property_id: newScope === 'pand' ? newPropertyId : null,
          lease_id: newScope === 'persoon' ? (newLeaseId || null) : null,
          due_date: newDeadline || null,
          category: (newCategory as any) || null,
          source: 'landlord',
          sla_deadline: slaDeadline,
        })
        const selectedLease = leaseOptions.find((l) => l.id === newLeaseId)
        setTickets((prev) => [
          {
            id: created.id,
            title: created.title,
            status: created.status,
            priority: created.priority,
            created_at: created.created_at,
            category: (created as any).category ?? null,
            ticket_number: (created as any).ticket_number ?? null,
            unitLabel: newScope === 'pand'
              ? propertyOptions.find((p) => p.id === newPropertyId)?.label ?? null
              : selectedLease?.label ?? null,
          },
          ...prev,
        ])
      }
      setCreateOpen(false)
      resetCreateForm()
    } catch (e: any) {
      console.error('Ticket aanmaken mislukt:', e?.message ?? e)
    } finally {
      setCreating(false)
    }
  }

  return (
    <>

      {/* Toolbar — no Card wrapper */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-[#163300] dark:text-[#9FE870]">Tickets</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredTickets.length} van {tickets.length} ticket{tickets.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {/* Zoeken — icon, balk vouwt geanimeerd naar links uit */}
          <div className="flex flex-row-reverse items-center">
            <button
              type="button"
              onClick={() => { setSearchExpanded(true); setTimeout(() => searchInputRef.current?.focus(), 0) }}
              className={cn(
                'h-8 w-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors shrink-0',
                searchQuery && 'text-[#163300] dark:text-[#9FE870]',
              )}
            >
              <Search className="h-4 w-4" />
            </button>
            <div className={cn(
              'overflow-hidden transition-all duration-200 ease-out',
              searchExpanded ? 'max-w-[160px] opacity-100 mr-1' : 'max-w-0 opacity-0 pointer-events-none',
            )}>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setSearchExpanded(false) }}
                onKeyDown={e => { if (e.key === 'Escape') { setSearchQuery(''); setSearchExpanded(false) } }}
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
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className={cn(
                DASHBOARD_FILTER_MENU_CONTENT_CLASS,
                'max-h-[min(70vh,480px)] overflow-y-auto'
              )}
            >
              <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Status
              </DropdownMenuLabel>
              <div className="space-y-1 pb-2">
                {STATUS_KEYS.map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={statusFilter[key] !== false}
                    onCheckedChange={(v) => setStatusFilter((f) => ({ ...f, [key]: Boolean(v) }))}
                    onSelect={(e) => e.preventDefault()}
                    className={cn(DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS, 'capitalize')}
                  >
                    {key.replace(/_/g, ' ')}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
              <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Prioriteit
              </DropdownMenuLabel>
              <div className="space-y-1 pb-2">
                {PRIORITY_KEYS.map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={priorityFilter[key] !== false}
                    onCheckedChange={(v) => setPriorityFilter((f) => ({ ...f, [key]: Boolean(v) }))}
                    onSelect={(e) => e.preventDefault()}
                    className={cn(DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS, 'capitalize')}
                  >
                    {key === 'urgent' ? 'Spoed' : key}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
              <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Categorie
              </DropdownMenuLabel>
              <div className="space-y-1 pb-2">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
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
              {uniquePropertyNames.length > 0 && (
                <>
                  <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Pand
                  </DropdownMenuLabel>
                  <div className="space-y-1">
                    {uniquePropertyNames.map((name) => (
                      <DropdownMenuCheckboxItem
                        key={name}
                        checked={propertyFilter[name] !== false}
                        onCheckedChange={(v) => setPropertyFilter((f) => ({ ...f, [name]: Boolean(v) }))}
                        onSelect={(e) => e.preventDefault()}
                        className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
                      >
                        {name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            onClick={() => {
              resetCreateForm()
              setCreateOpen(true)
            }}
            className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 sm:px-5 h-9 text-sm font-medium shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nieuw ticket
          </Button>
        </div>
      </div>

      {/* List — ActionList style */}
      <div className="rounded-2xl overflow-hidden">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 bg-gray-200 dark:bg-neutral-700 rounded-block animate-pulse" />
            ))}
          </div>
        ) : sortedTickets.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">Geen tickets gevonden.</div>
        ) : (
          <>
            {/* Column headers */}
            <div className="grid grid-cols-[48px_minmax(0,1fr)_152px_90px_96px_32px] items-center gap-4 px-3 pb-2 border-b border-gray-100 dark:border-neutral-800">
              {/* Action zone header: # normally, select-all when items selected */}
              <div className="flex items-center">
                {selectedIds.length > 0 ? (
                  <button type="button" onClick={toggleSelectAll} className="ml-[26px] flex items-center justify-center">
                    {selectedIds.length === sortedTickets.length
                      ? <CheckSquare className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
                      : <Square className="h-3.5 w-3.5 text-gray-400" />}
                  </button>
                ) : (
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">#</span>
                )}
              </div>
              <SortableHeader label="Titel" sortKey="title" sort={ticketSort} onSort={toggleSort} className="text-xs" />
              <SortableHeader label="Status" sortKey="status" sort={ticketSort} onSort={toggleSort} className="text-xs pl-2.5" />
              <SortableHeader label="Prioriteit" sortKey="priority" sort={ticketSort} onSort={toggleSort} className="text-xs pl-2.5" />
              <SortableHeader label="Deadline" sortKey="due_date" sort={ticketSort} onSort={toggleSort} className="text-xs pl-2.5" />
              <span />
            </div>

            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {sortedTickets.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    'group grid grid-cols-[48px_minmax(0,1fr)_152px_90px_96px_32px] w-full items-center gap-4 px-3 py-3 transition-colors rounded-xl cursor-pointer',
                    selectedIds.includes(t.id)
                      ? 'bg-[#9FE870]/20 dark:bg-[#9FE870]/10'
                      : 'hover:bg-gray-50 dark:hover:bg-neutral-800/40',
                  )}
                  onClick={() => openDetail(t.id)}
                >
                  {/* Notion-style left action zone */}
                  <div className="relative flex items-center h-full" onClick={e => e.stopPropagation()}>
                    {/* Ticket number — hidden on hover or when selected */}
                    <span className={cn(
                      'text-xs font-mono text-gray-400 dark:text-gray-500 transition-opacity absolute pointer-events-none',
                      selectedIds.includes(t.id) ? 'opacity-0' : 'group-hover:opacity-0',
                    )}>
                      {t.ticket_number ? `#${t.ticket_number}` : '—'}
                    </span>
                    {/* ⋮ + checkbox — shown on hover or when selected */}
                    <div className={cn(
                      'flex items-center gap-1 transition-opacity',
                      selectedIds.includes(t.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    )}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button suppressHydrationWarning className="h-5 w-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="rounded-xl min-w-[180px] p-1">
                          <DropdownMenuItem onClick={() => openDetail(t.id)} className="text-xs rounded-lg cursor-pointer px-2.5 py-1.5">
                            Openen
                          </DropdownMenuItem>
                          {t.ticket_number && (
                            <DropdownMenuItem
                              onClick={() => navigator.clipboard?.writeText(`#${t.ticket_number}`)}
                              className="text-xs rounded-lg cursor-pointer px-2.5 py-1.5"
                            >
                              Kopieer #{t.ticket_number}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {t.status === 'open' && (
                            <DropdownMenuItem
                              onClick={() => quickStatus(t.id, 'in_behandeling')}
                              className="text-xs rounded-lg cursor-pointer px-2.5 py-1.5"
                            >
                              In behandeling nemen
                            </DropdownMenuItem>
                          )}
                          {t.status !== 'afgerond' && (
                            <DropdownMenuItem
                              onClick={() => quickStatus(t.id, 'afgerond')}
                              className="text-xs rounded-lg cursor-pointer px-2.5 py-1.5"
                            >
                              Markeer als afgerond
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              fetch(`/api/tickets/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignee_id: user?.id }) })
                            }}
                            className="text-xs rounded-lg cursor-pointer px-2.5 py-1.5"
                          >
                            Aan mij toewijzen
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`${basePath}/messages?ticket=${t.id}`)}
                            className="text-xs rounded-lg cursor-pointer px-2.5 py-1.5"
                          >
                            Huurder berichtje sturen
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {t.status !== 'geannuleerd' && (
                            <DropdownMenuItem
                              onClick={() => quickStatus(t.id, 'geannuleerd')}
                              className="text-xs rounded-lg cursor-pointer px-2.5 py-1.5 text-red-600 dark:text-red-400"
                            >
                              Annuleren
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => deleteTicket(t.id)}
                            className="text-xs rounded-lg cursor-pointer px-2.5 py-1.5 text-red-600 dark:text-red-400"
                          >
                            Verwijderen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <button
                        onClick={() => toggleSelectTicket(t.id)}
                        className="h-5 w-5 flex items-center justify-center"
                      >
                        {selectedIds.includes(t.id)
                          ? <CheckSquare className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
                          : <Square className="h-3.5 w-3.5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                    {t.unitLabel && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{t.unitLabel}</p>
                    )}
                  </div>
                  <div className="flex items-center" onClick={e => e.stopPropagation()}>
                    <StatusPill status={t.status} ticketId={t.id} onUpdate={updateTicketField} />
                  </div>
                  <div className="flex items-center" onClick={e => e.stopPropagation()}>
                    <PriorityPill priority={t.priority} ticketId={t.id} onUpdate={updateTicketField} />
                  </div>
                  <div className="pl-2.5 flex flex-col gap-0.5 justify-center">
                    <span className={cn('text-xs whitespace-nowrap', t.due_date
                      ? (new Date(t.due_date) < new Date() ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-300')
                      : 'text-gray-300 dark:text-neutral-600')}>
                      {t.due_date ? format(new Date(t.due_date), 'd MMM yy', { locale: nl }) : '—'}
                    </span>
                    {(() => {
                      const sla = getSlaVariant(t)
                      if (!sla || sla === 'ok') return null
                      return (
                        <span className={cn('text-[10px] font-medium leading-none', sla === 'over' ? 'text-red-500 dark:text-red-400' : 'text-orange-500 dark:text-orange-400')}>
                          {sla === 'over' ? 'SLA over' : 'SLA bijna'}
                        </span>
                      )
                    })()}
                  </div>
                  <div className="flex justify-end" onClick={e => e.stopPropagation()}>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-[#163300] dark:hover:text-[#9FE870]"
                      onClick={e => { e.stopPropagation(); router.push(`${basePath}/messages?ticket=${t.id}`) }}
                      aria-label="Open chat"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating bulk action bar */}
            {selectedIds.length > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-gray-200/80 dark:border-neutral-700">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                    {selectedIds.length} geselecteerd
                  </span>
                  <div className="w-px h-4 bg-gray-200 dark:bg-neutral-600" />
                  <Select value={bulkStatus} onValueChange={v => { setBulkStatus(v); handleBulkStatusChange(v) }} disabled={bulkBusy}>
                    <SelectTrigger className="h-8 rounded-full border-gray-200 dark:border-neutral-600 text-xs px-3 w-auto min-w-[140px]">
                      <SelectValue placeholder="Markeer als…" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_behandeling">In behandeling</SelectItem>
                      <SelectItem value="gepland">Gepland</SelectItem>
                      <SelectItem value="afgerond">Afgerond</SelectItem>
                      <SelectItem value="geannuleerd">Geannuleerd</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={exitSelectionMode}
                    className="text-sm text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) resetCreateForm()
        }}
      >
        <DialogContent
          className={addDialogContentClassName()}
          closeButtonClassName={ADD_DIALOG_CLOSE_BUTTON_CLASS}
        >
          <DialogHeader className={ADD_DIALOG_HEADER_CLASS}>
            <DialogTitle className={ADD_DIALOG_TITLE_CLASS}>Nieuw ticket</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 pt-1">
              Beschrijf kort het probleem. Je kunt later vanuit het ticket chatten en details toevoegen.
            </DialogDescription>
          </DialogHeader>
          <div className={cn(ADD_DIALOG_BODY_CLASS, 'space-y-4')}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ticket-title">Titel</Label>
                <Input
                  id="ticket-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Bijv. Lekkende kraan"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Koppelen aan</Label>
                <Select value={newScope} onValueChange={(v) => { setNewScope(v as typeof newScope); setNewUnitId(''); setNewPropertyId(''); setNewLeaseId('') }}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="persoon">Persoon</SelectItem>
                    <SelectItem value="pand">Pand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newScope === 'persoon' && (
              <div className="space-y-2">
                <Label>Huurder *</Label>
                {leaseOptions.length === 0
                  ? <p className="text-sm text-amber-600 dark:text-amber-400">Geen actieve huurders gevonden.</p>
                  : <>
                      <Select value={newLeaseId} onValueChange={handleLeaseSelect}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Kies een huurder" /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {leaseOptions.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {newLeaseId && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Automatisch gekoppeld aan de eenheid van deze huurder.
                        </p>
                      )}
                    </>
                }
              </div>
            )}

            {newScope === 'pand' && (
              <div className="space-y-2">
                <Label>Pand *</Label>
                {propertyOptions.length === 0
                  ? <p className="text-sm text-amber-600 dark:text-amber-400">Voeg eerst een pand toe via Portfolio.</p>
                  : <Select value={newPropertyId} onValueChange={setNewPropertyId}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Kies een pand" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {propertyOptions.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                }
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ticket-desc">Omschrijving (optioneel)</Label>
              <Textarea
                id="ticket-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Meer context..."
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Categorie (optioneel)</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Geen" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="onderhoud">Onderhoud</SelectItem>
                    <SelectItem value="inspectie">Inspectie</SelectItem>
                    <SelectItem value="klacht">Klacht</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="huurgebeurtenis">Huurgebeurtenis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioriteit</Label>
                <Select value={newPriority} onValueChange={(v) => setNewPriority(v as typeof newPriority)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="laag">Laag</SelectItem>
                    <SelectItem value="normaal">Normaal</SelectItem>
                    <SelectItem value="hoog">Hoog</SelectItem>
                    <SelectItem value="urgent">Spoed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deadline (optioneel)</Label>
              <DatePicker
                value={newDeadline}
                onChange={setNewDeadline}
                min={new Date().toISOString().slice(0, 10)}
              />
              </div>
          </div>
          <DialogFooter className={ADD_DIALOG_FOOTER_SPLIT_CLASS}>
            <span />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setCreateOpen(false)} className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1">Annuleren</button>
              <Button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] text-sm font-semibold px-4 py-2 disabled:opacity-50"
                disabled={!newTitle.trim() || creating || (!isDemo && (!user?.id ||
                  (newScope === 'persoon' && !newLeaseId) ||
                  (newScope === 'pand' && !newPropertyId)
                ))}
                onClick={handleCreateTicket}
              >
                {creating ? 'Aanmaken…' : 'Ticket aanmaken'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket detail panel */}
      <TicketDetailSheet
        ticketId={detailTicketId}
        onClose={closeDetail}
        isDemo={isDemo}
        userId={user?.id ?? null}
        onTicketUpdate={(ticketId, updates) => {
          setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updates } : t))
        }}
      />
    </>
  )
}
