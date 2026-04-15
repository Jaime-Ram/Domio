'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Eye,
  Wrench,
  Clock,
  CheckCircle2,
  ClipboardCheck,
  Calendar,
  Ticket,
  Plus,
  Search,
  Filter,
  Grid3x3,
  Table2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MapPin,
  Ban,
  ChevronRight,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { mockMaintenanceRequests } from '@/lib/mock-data/vastgoed'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  dashboardCardClass,
  DASHBOARD_TABLE_HEAD_SHADCN_CLASS,
  DASHBOARD_TABLE_ICON_WRAP_CLASS,
  DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS,
  DASHBOARD_FILTER_TRIGGER_BUTTON_CLASS,
  DASHBOARD_FILTER_MENU_CONTENT_CLASS,
  DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS,
} from '@/app/dashboard/employer/dashboard-ui'
import { DashboardTableBlock } from '@/components/dashboard/dashboard-table-block'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { ticketQueries } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'

const getMaintenanceNav = (basePath: string) => [
  { label: 'Tickets', href: `${basePath}/maintenance`, icon: Ticket },
  { label: 'Inspecties', href: `${basePath}/maintenance/inspecties`, icon: ClipboardCheck },
  { label: 'Planning', href: `${basePath}/maintenance/planning`, icon: Calendar },
]

type TicketRow = {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
  unitLabel?: string | null
}

const STATUS_KEYS = ['open', 'in_behandeling', 'gepland', 'afgerond', 'geannuleerd'] as const
const PRIORITY_KEYS = ['laag', 'normaal', 'hoog', 'urgent'] as const

type SortColumn = 'title' | 'status' | 'priority' | 'created_at'

export default function MaintenancePage() {
  const router = useRouter()
  const { user, isDemo, basePath } = useDashboardUser()
  const MAINTENANCE_NAV = getMaintenanceNav(basePath)
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [statusFilter, setStatusFilter] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(STATUS_KEYS.map((k) => [k, true]))
  )
  const [priorityFilter, setPriorityFilter] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PRIORITY_KEYS.map((k) => [k, true]))
  )
  const [sort, setSort] = useState<{ column: SortColumn | null; direction: 'asc' | 'desc' | null }>({
    column: null,
    direction: null,
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<'laag' | 'normaal' | 'hoog' | 'urgent'>('normaal')

  // Detail panel
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const [detailTicketId, setDetailTicketId] = useState<string | null>(() => searchParams?.get('ticket') ?? null)
  const detailTicket = tickets.find(t => t.id === detailTicketId) ?? null
  const [updatingStatus, setUpdatingStatus] = useState(false)

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

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      if (!isDemo && user?.id) {
        await ticketQueries.updateStatus(ticketId, newStatus)
      }
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
    } finally {
      setUpdatingStatus(false)
    }
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
      const demoRows: TicketRow[] = mockMaintenanceRequests.map((r) => ({
        id: r.id,
        title: r.title || r.description?.slice(0, 80) || 'Onderhoudsmelding',
        status: r.status ?? 'open',
        priority: r.priority === 'spoed' ? 'urgent' : (r.priority ?? 'normaal'),
        created_at: r.createdAt ?? new Date().toISOString(),
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
          (rows || []).map((t: any) => ({
            id: t.id,
            title: t.title || 'Ticket',
            status: t.status || 'open',
            priority: t.priority || 'normaal',
            created_at: t.created_at || new Date().toISOString(),
            unitLabel: t.units?.unit_number ? `Eenheid ${t.units.unit_number}` : null,
          }))
        )
      })
      .finally(() => setLoading(false))
  }, [user?.id, isDemo])

  const normalizePriority = (p: string) => (p === 'spoed' ? 'urgent' : p)

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return tickets.filter((t) => {
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.unitLabel && t.unitLabel.toLowerCase().includes(q)) ||
        t.status.toLowerCase().includes(q) ||
        normalizePriority(t.priority).includes(q)

      const st = t.status === 'gepland' ? 'gepland' : t.status
      const matchesStatus = statusFilter[st] !== false

      const pr = normalizePriority(t.priority)
      const matchesPriority = priorityFilter[pr] !== false

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tickets, searchQuery, statusFilter, priorityFilter])

  const toggleSort = (column: SortColumn) => {
    setSort((prev) => {
      if (prev.column !== column || prev.direction === null) {
        return { column, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { column, direction: 'desc' }
      }
      return { column: null, direction: null }
    })
  }

  const getSortIcon = (column: SortColumn) => {
    if (sort.column !== column || !sort.direction) {
      return <ChevronsUpDown className="h-3 w-3 text-gray-400" />
    }
    if (sort.direction === 'asc') {
      return <ChevronUp className="h-3 w-3 text-[#163300] dark:text-[#9FE870]" />
    }
    return <ChevronDown className="h-3 w-3 text-[#163300] dark:text-[#9FE870]" />
  }

  const sortedTickets = useMemo(() => {
    const list = [...filteredTickets]
    if (!sort.column || !sort.direction) return list
    const dir = sort.direction === 'asc' ? 1 : -1
    list.sort((a, b) => {
      switch (sort.column) {
        case 'title':
          return dir * a.title.localeCompare(b.title, 'nl')
        case 'status':
          return dir * a.status.localeCompare(b.status, 'nl')
        case 'priority':
          return dir * normalizePriority(a.priority).localeCompare(normalizePriority(b.priority), 'nl')
        case 'created_at':
          return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        default:
          return 0
      }
    })
    return list
  }, [filteredTickets, sort])

  const resetCreateForm = () => {
    setNewTitle('')
    setNewDescription('')
    setNewPriority('normaal')
  }

  const handleCreateTicket = async () => {
    const title = newTitle.trim()
    if (!title) return
    setCreating(true)
    try {
      if (isDemo) {
        const row: TicketRow = {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `demo-${Date.now()}`,
          title,
          status: 'open',
          priority: newPriority,
          created_at: new Date().toISOString(),
          unitLabel: null,
        }
        setTickets((prev) => [row, ...prev])
      } else if (user?.id) {
        const created = await ticketQueries.create({
          owner_id: user.id,
          title,
          description: newDescription.trim() || null,
          status: 'open',
          priority: newPriority,
          unit_id: null,
        })
        setTickets((prev) => [
          {
            id: created.id,
            title: created.title,
            status: created.status,
            priority: created.priority,
            created_at: created.created_at,
            unitLabel: null,
          },
          ...prev,
        ])
      }
      setCreateOpen(false)
      resetCreateForm()
    } catch (e) {
      console.error('Ticket aanmaken mislukt:', e)
    } finally {
      setCreating(false)
    }
  }

  const renderActions = (t: TicketRow, layout: 'inline' | 'stack' = 'inline') => (
    <div
      className={cn(
        'flex gap-2',
        layout === 'stack' ? 'flex-col w-full mt-3' : 'justify-end flex-wrap'
      )}
    >
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn('rounded-full', layout === 'stack' && 'w-full justify-center')}
        onClick={(e) => {
          e.stopPropagation()
          openDetail(t.id)
        }}
      >
        <Eye className="h-4 w-4 mr-1" />
        Bekijken
      </Button>
      <Button
        type="button"
        size="sm"
        className={cn(
          'rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F]',
          layout === 'stack' && 'w-full justify-center'
        )}
        onClick={(e) => {
          e.stopPropagation()
          router.push(`${basePath}/messages?ticket=${t.id}`)
        }}
      >
        <MessageCircle className="h-4 w-4 mr-1" />
        Open chat
      </Button>
    </div>
  )

  const tableBleedTickets = !loading && viewMode === 'table'

  return (
    <>
      <SectionNavDashboard title="Onderhoud" items={MAINTENANCE_NAV} titleVariant="hero" />

      <Card className={cn(dashboardCardClass(undefined, isDemo), 'overflow-hidden')}>
        <CardHeader
          className={cn(
            'space-y-3',
            tableBleedTickets && DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-lg text-[#163300] dark:text-[#9FE870]">Tickets</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredTickets.length} van {tickets.length} ticket{tickets.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto min-w-0">
              <div className="relative flex-1 sm:flex-initial sm:min-w-[160px] sm:max-w-[240px] flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3">
                <Search className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
                <Input
                  placeholder="Zoek tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-2 text-sm min-w-0 flex-1 bg-transparent py-0"
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
                    'max-h-[min(70vh,420px)] overflow-y-auto'
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
                  <div className="space-y-1">
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
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  'hidden md:inline-flex h-9 w-9 rounded-full border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200',
                  'hover:bg-[#f4f4f4] dark:hover:bg-neutral-800'
                )}
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                aria-label={viewMode === 'table' ? 'Toon als raster' : 'Toon als lijst'}
              >
                {viewMode === 'table' ? <Grid3x3 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
              </Button>
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
        </CardHeader>
        <CardContent
          className={cn(
            tableBleedTickets && 'p-0 px-0 pb-0',
            tableBleedTickets && DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS
          )}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-36 bg-gray-200 dark:bg-neutral-700 rounded-block animate-pulse" />
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            sortedTickets.length === 0 ? null : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTickets.map((t) => (
                <Card
                  key={t.id}
                  className={cn(
                    dashboardCardClass('transition-colors cursor-pointer', isDemo),
                    'rounded-block border-[0.5px] border-gray-200 dark:border-neutral-700 hover:border-[#163300] dark:hover:border-[#9FE870]'
                  )}
                  onClick={() => openDetail(t.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn('h-10 w-10 rounded-lg shrink-0', DASHBOARD_TABLE_ICON_WRAP_CLASS)}>
                        <Ticket className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-semibold text-[#163300] dark:text-[#9FE870] line-clamp-2">
                          {t.title}
                        </CardTitle>
                        {t.unitLabel ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{t.unitLabel}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">{getStatusBadge(t.status)}</div>
                    <div className="mt-2 flex flex-wrap gap-2">{getPriorityBadge(t.priority)}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      {format(new Date(t.created_at), 'd MMM yyyy', { locale: nl })}
                    </p>
                    {renderActions(t, 'stack')}
                  </CardContent>
                </Card>
              ))}
            </div>
            )
          ) : (
            <DashboardTableBlock empty={sortedTickets.length === 0}>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('title')}>
                        <span>Titel</span>
                        {getSortIcon('title')}
                      </button>
                    </TableHead>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('status')}>
                        <span>Status</span>
                        {getSortIcon('status')}
                      </button>
                    </TableHead>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('priority')}>
                        <span>Prioriteit</span>
                        {getSortIcon('priority')}
                      </button>
                    </TableHead>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                        onClick={() => toggleSort('created_at')}
                      >
                        <span>Aangemaakt</span>
                        {getSortIcon('created_at')}
                      </button>
                    </TableHead>
                    <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'text-right')}>
                      Acties
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTickets.map((t) => (
                      <TableRow
                        key={t.id}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                        onClick={() => openDetail(t.id)}
                      >
                        <TableCell className="py-4 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                'relative h-10 w-10 rounded-lg overflow-hidden',
                                DASHBOARD_TABLE_ICON_WRAP_CLASS
                              )}
                            >
                              <Ticket className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white line-clamp-2">{t.title}</div>
                              {t.unitLabel ? (
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{t.unitLabel}</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 align-middle">{getStatusBadge(t.status)}</TableCell>
                        <TableCell className="py-4 px-4 align-middle">{getPriorityBadge(t.priority)}</TableCell>
                        <TableCell className="py-4 px-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {format(new Date(t.created_at), 'd MMM yyyy', { locale: nl })}
                        </TableCell>
                        <TableCell className="py-4 px-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                          {renderActions(t, 'inline')}
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DashboardTableBlock>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) resetCreateForm()
        }}
      >
        <DialogContent className="border border-gray-200 dark:border-neutral-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#163300] dark:text-[#9FE870]">Nieuw ticket</DialogTitle>
            <DialogDescription>Beschrijf kort het probleem. Je kunt later vanuit het ticket chatten en details toevoegen.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="ticket-desc">Omschrijving (optioneel)</Label>
              <Textarea
                id="ticket-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Meer context voor het team..."
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Prioriteit</Label>
              <Select value={newPriority} onValueChange={(v) => setNewPriority(v as typeof newPriority)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="laag">Laag</SelectItem>
                  <SelectItem value="normaal">Normaal</SelectItem>
                  <SelectItem value="hoog">Hoog</SelectItem>
                  <SelectItem value="urgent">Spoed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setCreateOpen(false)}>
              Annuleren
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F]"
              disabled={!newTitle.trim() || creating || (!isDemo && !user?.id)}
              onClick={handleCreateTicket}
            >
              {creating ? 'Aanmaken…' : 'Ticket aanmaken'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket detail panel */}
      <Sheet open={!!detailTicket} onOpenChange={(open) => { if (!open) closeDetail() }}>
        <SheetContent side="right" className="flex flex-col w-full max-w-lg overflow-y-auto">
          {detailTicket && (
            <>
              <SheetHeader className="border-b border-gray-100 dark:border-neutral-800 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-9 w-9 rounded-lg bg-[#163300]/8 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
                    <Ticket className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                  </div>
                  <SheetTitle className="text-base">{detailTicket.title}</SheetTitle>
                </div>
                {detailTicket.unitLabel && (
                  <SheetDescription className="flex items-center gap-1 text-xs mt-1">
                    <MapPin className="h-3 w-3" />{detailTicket.unitLabel}
                  </SheetDescription>
                )}
              </SheetHeader>

              <div className="flex-1 px-6 py-5 space-y-6">
                {/* Status & prioriteit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
                    <Select
                      value={detailTicket.status}
                      onValueChange={(v) => handleStatusChange(detailTicket.id, v)}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger className="rounded-xl h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_behandeling">In behandeling</SelectItem>
                        <SelectItem value="gepland">Gepland</SelectItem>
                        <SelectItem value="afgerond">Afgerond</SelectItem>
                        <SelectItem value="geannuleerd">Geannuleerd</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Prioriteit</p>
                    <div className="mt-1">{getPriorityBadge(detailTicket.priority)}</div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Details</p>
                  <div className="rounded-xl border border-gray-100 dark:border-neutral-800 divide-y divide-gray-50 dark:divide-neutral-800">
                    {[
                      { label: 'Aangemaakt', value: format(new Date(detailTicket.created_at), 'd MMMM yyyy', { locale: nl }) },
                      { label: 'Ticket ID', value: `#${detailTicket.id.slice(0, 8)}` },
                      ...(detailTicket.unitLabel ? [{ label: 'Eenheid', value: detailTicket.unitLabel }] : []),
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{row.label}</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acties */}
                <div className="space-y-2 pt-2">
                  <Button
                    type="button"
                    className="w-full rounded-xl bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] gap-2"
                    onClick={() => {
                      closeDetail()
                      router.push(`${basePath}/messages?ticket=${detailTicket.id}`)
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Open chat over dit ticket
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                  {detailTicket.status !== 'afgerond' && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-xl gap-2"
                      disabled={updatingStatus}
                      onClick={() => handleStatusChange(detailTicket.id, 'afgerond')}
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Markeer als afgerond
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
