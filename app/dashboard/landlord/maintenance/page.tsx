'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenuLabel,
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
  Wrench,
  Clock,
  CheckCircle2,
  Calendar,
  Ticket,
  Plus,
  Filter,
  MapPin,
  Ban,
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

import { ticketQueries, propertyQueries } from '@/lib/supabase/queries'
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
  unitLabel?: string | null
  propertyName?: string | null
  category?: string | null
  ticket_number?: number | null
}

const STATUS_KEYS = ['open', 'in_behandeling', 'gepland', 'afgerond', 'geannuleerd'] as const
const PRIORITY_KEYS = ['laag', 'normaal', 'hoog', 'urgent'] as const
const CATEGORY_LABELS: Record<string, string> = {
  onderhoud: 'Onderhoud', inspectie: 'Inspectie', klacht: 'Klacht',
  compliance: 'Compliance', huurgebeurtenis: 'Huurgebeurtenis',
}

type SortColumn = 'title' | 'status' | 'priority' | 'due_date'

export default function MaintenancePage() {
  const router = useRouter()
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
  const [propertyFilter, setPropertyFilter] = useState<Record<string, boolean>>({})
  const { sort: ticketSort, toggleSort } = useSortable<string>()

  // Bulk selection
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkBusy, setBulkBusy] = useState(false)
  const contentRef = useRef<HTMLDivElement | null>(null)

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

  // Detail panel
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const [detailTicketId, setDetailTicketId] = useState<string | null>(() => searchParams?.get('ticket') ?? null)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Open
          </Badge>
        )
      case 'in_behandeling':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500">
            <Wrench className="h-3 w-3 mr-1" />
            In behandeling
          </Badge>
        )
      case 'gepland':
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-500">
            <Clock className="h-3 w-3 mr-1" />
            Gepland
          </Badge>
        )
      case 'afgerond':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Afgerond
          </Badge>
        )
      case 'geannuleerd':
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400">
            <Ban className="h-3 w-3 mr-1" />
            Geannuleerd
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (value: string) => {
    const v = value === 'spoed' ? 'urgent' : value
    switch (v) {
      case 'urgent':
        return <Badge variant="destructive">Spoed</Badge>
      case 'hoog':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-500">Hoog</Badge>
      case 'normaal':
        return <Badge variant="outline">Normaal</Badge>
      case 'laag':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-500">Laag</Badge>
      default:
        return <Badge>{value}</Badge>
    }
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
            let unitLabel: string | null = null
            if (t.scope === 'persoon' && t.leases) {
              const tenantName = t.leases.tenants?.full_name ?? null
              const propName = t.leases.units?.properties?.name ?? null
              const unitNum = t.leases.units?.unit_number ?? null
              unitLabel = [tenantName, propName, unitNum ? `nr. ${unitNum}` : null].filter(Boolean).join(' — ')
            } else if (t.scope === 'pand' && t.properties) {
              unitLabel = t.properties.name ?? null
            } else if (t.units) {
              const propName = t.units.properties?.name ?? null
              const unitNum = t.units.unit_number ?? null
              unitLabel = [propName, unitNum ? `nr. ${unitNum}` : null].filter(Boolean).join(' ')
            }
            const propName = t.leases?.units?.properties?.name ?? t.properties?.name ?? t.units?.properties?.name ?? null
            return {
              id: t.id,
              title: t.title || 'Ticket',
              status: t.status || 'open',
              priority: t.priority || 'normaal',
              created_at: t.created_at || new Date().toISOString(),
              due_date: (t as any).due_date ?? null,
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
    if (!user?.id || isDemo) return
    propertyQueries.getByOwner(user.id).then((props) => {
      setPropertyOptions(
        (props ?? []).map((p: any) => ({ id: p.id, label: p.name || p.address }))
      )
    }).catch(() => {})
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

  const exitSelectionMode = () => { setSelectionMode(false); setSelectedIds([]); setBulkStatus('') }

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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto min-w-0">
          {/* Selectie-modus knop */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setSelectionMode(v => !v); setSelectedIds([]) }}
            className={cn('h-9 rounded-full px-3', selectionMode && 'bg-[#163300]/5 border-[#163300] dark:bg-[#9FE870]/10 dark:border-[#9FE870]')}
          >
            <CheckSquare className="h-4 w-4" />
          </Button>

          {/* Zoekbalk */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Zoeken…"
              className="pl-8 h-9 w-full sm:w-44 rounded-full text-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn('inline-flex', DASHBOARD_FILTER_TRIGGER_BUTTON_CLASS)}
              >
                <Filter className="h-4 w-4 md:mr-1.5" />
                <span className="hidden md:inline">Filter</span>
              </Button>
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
      <div className="rounded-2xl overflow-hidden" ref={contentRef}>
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
            <div className={cn(
              'items-center gap-5 mx-1 px-3 pb-2 border-b border-gray-100 dark:border-neutral-800',
              selectionMode
                ? 'grid grid-cols-[32px_56px_1fr_110px_110px_140px_48px]'
                : 'grid grid-cols-[56px_1fr_110px_110px_140px_48px]'
            )}>
              {selectionMode && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {selectedIds.length === sortedTickets.length && sortedTickets.length > 0
                    ? <CheckSquare className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                    : <Square className="h-4 w-4" />}
                </button>
              )}
              <span className="text-sm font-medium text-gray-400 dark:text-gray-500">#</span>
              <SortableHeader label="Titel" sortKey="title" sort={ticketSort} onSort={toggleSort} />
              <SortableHeader label="Status" sortKey="status" sort={ticketSort} onSort={toggleSort} />
              <SortableHeader label="Prioriteit" sortKey="priority" sort={ticketSort} onSort={toggleSort} />
              <SortableHeader label="Deadline" sortKey="due_date" sort={ticketSort} onSort={toggleSort} />
              <span className="text-sm font-medium text-gray-400 dark:text-gray-500 text-right">Chat</span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {sortedTickets.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    'w-full items-center gap-5 mx-1 px-3 py-3.5 hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors rounded-xl cursor-pointer',
                    selectionMode
                      ? 'grid grid-cols-[32px_56px_1fr_110px_110px_140px_48px]'
                      : 'grid grid-cols-[56px_1fr_110px_110px_140px_48px]',
                    selectionMode && selectedIds.includes(t.id) && 'bg-[#9FE870]/5 dark:bg-[#9FE870]/5',
                  )}
                  onClick={() => selectionMode ? toggleSelectTicket(t.id) : openDetail(t.id)}
                >
                  {selectionMode && (
                    <div className="flex items-center justify-center" onClick={e => { e.stopPropagation(); toggleSelectTicket(t.id) }}>
                      {selectedIds.includes(t.id)
                        ? <CheckSquare className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                        : <Square className="h-4 w-4 text-gray-300 dark:text-neutral-600" />}
                    </div>
                  )}
                  {/* Ticket number */}
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500 truncate">
                    {t.ticket_number ? `#${t.ticket_number}` : '—'}
                  </span>
                  {/* Title + category + location */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <Ticket className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {t.category && (
                          <span className="text-xs text-[#163300] dark:text-[#9FE870] bg-[#9FE870]/20 dark:bg-[#9FE870]/10 rounded px-1.5 py-0.5 font-medium capitalize">
                            {CATEGORY_LABELS[t.category] ?? t.category}
                          </span>
                        )}
                        {t.unitLabel ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />{t.unitLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div>{getStatusBadge(t.status)}</div>
                  <div>{getPriorityBadge(t.priority)}</div>
                  <p className="text-sm whitespace-nowrap">
                    {t.due_date
                      ? <span className={new Date(t.due_date) < new Date() ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                          {format(new Date(t.due_date), 'd MMM yyyy', { locale: nl })}
                        </span>
                      : <span className="text-gray-300 dark:text-neutral-600">—</span>}
                  </p>
                  <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 hover:text-[#163300] dark:hover:text-[#9FE870]"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`${basePath}/messages?ticket=${t.id}`)
                      }}
                      aria-label="Open chat"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating bulk action bar */}
            {selectionMode && selectedIds.length > 0 && (
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
