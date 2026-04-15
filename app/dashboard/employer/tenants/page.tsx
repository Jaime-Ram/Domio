'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Home,
  Euro,
  CheckCircle2,
  AlertCircle,
  Building2,
  Filter,
  Grid3x3,
  Table2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronRight,
  Info,
} from 'lucide-react'
import { mockTenants } from '@/lib/mock-data/vastgoed'
import { cn } from '@/lib/utils'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { leaseQueries } from '@/lib/supabase/queries'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
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
import { TenantDetailSheet } from '@/components/tenants/tenant-detail-sheet'

type TenantRow = {
  id: string
  name: string
  email: string
  phone: string
  propertyName: string
  monthlyRent: number
  startDate: string | null
  endDate: string | null
  status: string
  balance?: number
}

const getPortfolioNav = (basePath: string) => [
  { label: 'Objecten', href: `${basePath}/portfolio`, icon: Building2 },
  { label: 'Huurders', href: `${basePath}/tenants`, icon: Users },
]

export default function TenantsPage() {
  const router = useRouter()
  const { user, isDemo, basePath } = useDashboardUser()

  const PORTFOLIO_NAV = getPortfolioNav(basePath)
  const [searchQuery, setSearchQuery] = useState('')
  const [tenants, setTenants] = useState<TenantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSegment, setActiveSegment] = useState<'upcoming' | 'current' | 'past'>('current')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  type SortColumn = 'name' | 'property' | 'rent' | 'status'
  const [sort, setSort] = useState<{ column: SortColumn | null; direction: 'asc' | 'desc' | null }>({
    column: null,
    direction: null,
  })

  const tabsContainerRef = useRef<HTMLDivElement | null>(null)
  const upcomingRef = useRef<HTMLButtonElement | null>(null)
  const currentRef = useRef<HTMLButtonElement | null>(null)
  const pastRef = useRef<HTMLButtonElement | null>(null)
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)
  const [balanceFilter, setBalanceFilter] = useState({
    opPeil: true,
    openstaand: true,
    teveelBetaald: true,
  })

  useEffect(() => {
    if (isDemo) {
      setTenants(mockTenants.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        phone: t.phone ?? '',
        propertyName: t.property?.name ?? '',
        monthlyRent: t.lease?.monthlyRent ?? 0,
        startDate: t.lease?.startDate ?? null,
        endDate: t.lease?.endDate ?? null,
        status: t.status ?? 'actief',
        balance: t.balance ?? 0,
      })))
      setLoading(false)
      return
    }
    if (!user?.id) {
      setLoading(false)
      return
    }
    leaseQueries.getByOwner(user.id).then((leases) => {
      const rows: TenantRow[] = (leases || [])
        .filter((l: any) => l.status === 'actief' && l.tenants)
        .map((l: any) => ({
          id: l.tenants?.id ?? l.id,
          name: l.tenants?.full_name ?? '',
          email: l.tenants?.email ?? '',
          phone: l.tenants?.phone ?? '',
          propertyName: l.units?.properties?.name ?? '',
          monthlyRent: l.monthly_rent ?? 0,
          startDate: l.start_date ?? null,
          endDate: l.end_date ?? null,
          status: l.status ?? 'actief',
        }))
      setTenants(rows)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user?.id, isDemo])

  const getBalanceCategory = (balance: number | undefined) => {
    const b = balance ?? 0
    if (b === 0) return 'opPeil' as const
    if (b < 0) return 'openstaand' as const
    return 'teveelBetaald' as const
  }

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.propertyName.toLowerCase().includes(searchQuery.toLowerCase())

    const cat = getBalanceCategory(tenant.balance)
    const matchesBalance = balanceFilter[cat]

    return matchesSearch && matchesBalance
  })

  const getTenantSegment = (tenant: TenantRow): 'upcoming' | 'current' | 'past' => {
    const now = new Date()
    const start = tenant.startDate ? new Date(tenant.startDate) : null
    const end = tenant.endDate ? new Date(tenant.endDate) : null

    if (start && start > now) return 'upcoming'
    if (end && end < now) return 'past'
    return 'current'
  }

  const segmentCounts = filteredTenants.reduce(
    (acc, t) => {
      const seg = getTenantSegment(t)
      acc[seg] += 1
      return acc
    },
    { upcoming: 0, current: 0, past: 0 }
  )

  const visibleTenants = filteredTenants.filter((t) => getTenantSegment(t) === activeSegment)
  // Update tab underline position to match active label width
  useEffect(() => {
    const container = tabsContainerRef.current
    if (!container) return

    const btn =
      activeSegment === 'upcoming'
        ? upcomingRef.current
        : activeSegment === 'current'
        ? currentRef.current
        : pastRef.current

    if (!btn) return

    const containerRect = container.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()

    setIndicator({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    })
  }, [activeSegment, filteredTenants.length])

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

  const sortedTenants = [...visibleTenants]
  if (sort.column && sort.direction) {
    sortedTenants.sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1
      const val = (field: keyof TenantRow) => a[field]
      const valB = (field: keyof TenantRow) => b[field]

      switch (sort.column) {
        case 'name': {
          return dir * String(val('name') ?? '').localeCompare(String(valB('name') ?? ''), 'nl')
        }
        case 'property': {
          return dir * String(val('propertyName') ?? '').localeCompare(String(valB('propertyName') ?? ''), 'nl')
        }
        case 'rent': {
          return dir * (((val('monthlyRent') as number) ?? 0) - ((valB('monthlyRent') as number) ?? 0))
        }
        case 'status': {
          return dir * String(val('status') ?? '').localeCompare(String(valB('status') ?? ''), 'nl')
        }
        default:
          return 0
      }
    })
  }

  const getBalanceBadge = (balance: number) => {
    if (balance === 0) {
      return (
        <Badge style={{ backgroundColor: '#2F5711', color: '#FFFFFF' }}>
          Op peil
        </Badge>
      )
    } else if (balance < 0) {
      return (
        <Badge style={{ backgroundColor: '#A8200D', color: '#FFFFFF' }}>
          Openstaand
        </Badge>
      )
    } else {
      return (
        <Badge style={{ backgroundColor: '#EDC843', color: '#2F5711' }}>
          Teveel betaald
        </Badge>
      )
    }
  }

  const balanceCounts = tenants.reduce(
    (acc, t) => {
      const cat = getBalanceCategory(t.balance)
      acc[cat] += 1
      return acc
    },
    { opPeil: 0, openstaand: 0, teveelBetaald: 0 }
  )

  if (loading) {
    return (
      <>
        <SectionNavDashboard title="Portefeuille" items={PORTFOLIO_NAV} titleVariant="hero" />
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Laden...</p>
        </div>
      </>
    )
  }

  const tenantsToolbar = (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  {/* Tabs: aankomend, huidig, oud (Wise-stijl met schuivende underline) */}
                  <div
                    ref={tabsContainerRef}
                    className="relative flex w-full sm:w-auto text-sm border-b border-gray-200 dark:border-neutral-700"
                  >
                    <button
                      type="button"
                      ref={upcomingRef}
                      onClick={() => setActiveSegment('upcoming')}
                      className={cn(
                        'flex-1 pb-2 mr-6 text-left sm:text-center whitespace-nowrap transition-colors duration-200 font-semibold',
                        activeSegment === 'upcoming'
                          ? 'text-[#163300] dark:text-[#9FE870]'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      <span>Aankomend</span>
                      <span
                        className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300]/25 text-[11px] font-medium text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]"
                      >
                        {segmentCounts.upcoming}
                      </span>
                    </button>
                    <button
                      type="button"
                      ref={currentRef}
                      onClick={() => setActiveSegment('current')}
                      className={cn(
                        'flex-1 pb-2 mr-6 text-left sm:text-center whitespace-nowrap transition-colors duration-200 font-semibold',
                        activeSegment === 'current'
                          ? 'text-[#163300] dark:text-[#9FE870]'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      <span>Huidig</span>
                      <span
                        className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300]/25 text-[11px] font-medium text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]"
                      >
                        {segmentCounts.current}
                      </span>
                    </button>
                    <button
                      type="button"
                      ref={pastRef}
                      onClick={() => setActiveSegment('past')}
                      className={cn(
                        'flex-1 pb-2 text-left sm:text-center whitespace-nowrap transition-colors duration-200 font-semibold',
                        activeSegment === 'past'
                          ? 'text-[#163300] dark:text-[#9FE870]'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      <span>Oud</span>
                      <span
                        className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300]/25 text-[11px] font-medium text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]"
                      >
                        {segmentCounts.past}
                      </span>
                    </button>
                    <div
                      className="absolute bottom-0 h-[2px] rounded-full bg-[#163300] dark:bg-[#9FE870] transition-all duration-200"
                      style={{ left: indicator.left, width: indicator.width }}
                    />
                  </div>
                  {/* Controls: zoeken, filter, aanmaken (zelfde layout als Portefeuille) */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end min-w-0">
                    {/* Zoekveld in pill-vorm */}
                    <div className="relative flex-1 sm:flex-initial sm:min-w-[140px] sm:max-w-[220px] flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3">
                      <Search className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
                      <Input
                        placeholder="Zoek huurders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-2 text-sm min-w-0 flex-1 bg-transparent py-0"
                      />
                    </div>
                    {/* Filter – Wise-style pill */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn('hidden md:inline-flex', DASHBOARD_FILTER_TRIGGER_BUTTON_CLASS)}
                        >
                          <Filter className="h-4 w-4 md:mr-1.5" />
                          <span className="hidden md:inline">Filter</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className={DASHBOARD_FILTER_MENU_CONTENT_CLASS}
                      >
                        <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                          Saldo
                        </DropdownMenuLabel>
                        <div className="space-y-1">
                          <DropdownMenuCheckboxItem
                            checked={balanceFilter.openstaand}
                            onCheckedChange={(v) =>
                              setBalanceFilter((f) => ({ ...f, openstaand: Boolean(v) }))
                            }
                            onSelect={(e) => e.preventDefault()}
                            className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: '#A8200D' }}
                              />
                              <span>Openstaand</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {balanceCounts.openstaand}
                            </span>
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={balanceFilter.opPeil}
                            onCheckedChange={(v) =>
                              setBalanceFilter((f) => ({ ...f, opPeil: Boolean(v) }))
                            }
                            onSelect={(e) => e.preventDefault()}
                            className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: '#2F5711' }}
                              />
                              <span>Op peil</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {balanceCounts.opPeil}
                            </span>
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={balanceFilter.teveelBetaald}
                            onCheckedChange={(v) =>
                              setBalanceFilter((f) => ({ ...f, teveelBetaald: Boolean(v) }))
                            }
                            onSelect={(e) => e.preventDefault()}
                            className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: '#EDC843' }}
                              />
                              <span>Teveel betaald</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {balanceCounts.teveelBetaald}
                            </span>
                          </DropdownMenuCheckboxItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* View toggle: enkel rond icoon dat wisselt tussen lijst en raster */}
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
                      {viewMode === 'table' ? (
                        <Grid3x3 className="h-4 w-4" />
                      ) : (
                        <Table2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => router.push(`${basePath}/tenants/new`)}
                      className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 sm:px-5 h-9 text-sm font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nieuwe Huurder
                    </Button>
                  </div>
                </div>
  )

  return (
    <>
            <SectionNavDashboard title="Portefeuille" items={PORTFOLIO_NAV} titleVariant="hero" />
            <Card className={cn(dashboardCardClass(undefined, isDemo), 'overflow-hidden')}>
              {viewMode === 'table' ? (
                <>
              <CardHeader
                className={cn('space-y-3', DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}
              >
                    {tenantsToolbar}
              </CardHeader>
              <CardContent className={cn('p-0 px-0 pb-0', DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS)}>
                    <DashboardTableBlock empty={sortedTenants.length === 0}>
                    <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1"
                            onClick={() => toggleSort('name')}
                          >
                            <span>Huurder</span>
                            {getSortIcon('name')}
                          </button>
                        </TableHead>
                        <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                          Telefoon
                        </TableHead>
                        <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1"
                            onClick={() => toggleSort('property')}
                          >
                            <span>Object</span>
                            {getSortIcon('property')}
                          </button>
                        </TableHead>
                        <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1"
                            onClick={() => toggleSort('rent')}
                          >
                            <span>Huurprijs</span>
                            {getSortIcon('rent')}
                          </button>
                        </TableHead>
                        <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1"
                            onClick={() => toggleSort('status')}
                          >
                            <span>Status</span>
                            {getSortIcon('status')}
                          </button>
                        </TableHead>
                        <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-px text-center')}>
                          <span
                            className="inline-flex items-center justify-center text-[#163300]/70 dark:text-[#9FE870]/70"
                            title="Details"
                          >
                            <Info className="h-4 w-4" />
                          </span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTenants.map((tenant) => (
                        <Fragment key={tenant.id}>
                        <TableRow className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={cn('h-10 w-10 rounded-full', DASHBOARD_TABLE_ICON_WRAP_CLASS)}>
                                <Users className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {tenant.name}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">{tenant.email}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{tenant.phone || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{tenant.propertyName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Euro className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                €{tenant.monthlyRent?.toLocaleString('nl-NL') || '0'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              style={{
                                backgroundColor: tenant.status === 'actief' ? '#2F5711' : '#A8200D',
                                color: '#FFFFFF',
                              }}
                            >
                              {tenant.status === 'actief' ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : (
                                <AlertCircle className="h-3 w-3 mr-1" />
                              )}
                              {tenant.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-px text-right pr-3">
                            <button
                              type="button"
                              onClick={() => setSelectedTenantId(tenant.id)}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-full text-[#163300] dark:text-[#9FE870] hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors"
                              aria-label="Details bekijken"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                        {expandedId === tenant.id && (
                          <TableRow className="bg-gray-50/60 dark:bg-neutral-900/60">
                            <TableCell colSpan={6} className="py-3 px-6 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex flex-wrap gap-4 justify-between">
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-gray-400">Periode</p>
                                  <p>
                                    {tenant.startDate
                                      ? new Date(tenant.startDate).toLocaleDateString('nl-NL')
                                      : 'Onbekend'}{' '}
                                    –{' '}
                                    {tenant.endDate
                                      ? new Date(tenant.endDate).toLocaleDateString('nl-NL')
                                      : 'Lopend'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-gray-400">Segment</p>
                                  <p>
                                    {getTenantSegment(tenant) === 'upcoming'
                                      ? 'Aankomend'
                                      : getTenantSegment(tenant) === 'past'
                                      ? 'Oud'
                                      : 'Huidig'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        </Fragment>
                      ))}
                    </TableBody>
                    </Table>
                    </DashboardTableBlock>
              </CardContent>
                </>
                ) : (
                  <>
              <CardHeader className="space-y-3">
                {tenantsToolbar}
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedTenants.map((tenant) => (
                      <Card
                        key={tenant.id}
                        className="rounded-block border-[0.5px] border-gray-200 dark:border-neutral-700 shadow-none hover:border-[#163300] dark:hover:border-[#9FE870] transition-colors"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <div className={cn('h-10 w-10 rounded-full', DASHBOARD_TABLE_ICON_WRAP_CLASS)}>
                              <Users className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base font-semibold text-[#163300] dark:text-[#9FE870] truncate">
                                {tenant.name}
                              </CardTitle>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {tenant.email}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Home className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{tenant.propertyName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-3 w-3" />
                            <span className="truncate">{tenant.phone || '-'}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1 text-sm">
                              <Euro className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                €{tenant.monthlyRent?.toLocaleString('nl-NL') || '0'}
                              </span>
                            </div>
                            <Badge
                              style={{
                                backgroundColor: tenant.status === 'actief' ? '#2F5711' : '#A8200D',
                                color: '#FFFFFF',
                              }}
                            >
                              {tenant.status === 'actief' ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : (
                                <AlertCircle className="h-3 w-3 mr-1" />
                              )}
                              {tenant.status}
                            </Badge>
                          </div>
                          <div className="flex justify-end gap-1 pt-1" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
              </CardContent>
                  </>
                )}
            </Card>

      <TenantDetailSheet
        tenantId={selectedTenantId}
        open={!!selectedTenantId}
        onClose={() => setSelectedTenantId(null)}
      />
    </>
  )
}

