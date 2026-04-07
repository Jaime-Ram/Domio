'use client'

import { useState, useEffect, Fragment, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Building2,
  Plus,
  Search,
  MapPin,
  Users,
  Grid3x3,
  Table2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronRight,
  Info,
  Filter,
  Landmark,
} from 'lucide-react'
import { getUser } from '@/lib/supabase/auth'
import { propertyQueries } from '@/lib/supabase/queries'
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
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

export default function PortfolioPage() {
  const router = useRouter()
  const { basePath, isDemo } = useDashboardUser()

  const PORTFOLIO_NAV = [
    { label: 'Objecten', href: `${basePath}/portfolio`, icon: Building2 },
    { label: 'Huurders', href: `${basePath}/tenants`, icon: Users },
  ]
  type PortfolioSegment = 'objecten' | 'rechtspersonen'
  const [activeSegment, setActiveSegment] = useState<PortfolioSegment>('objecten')
  const tabsContainerRef = useRef<HTMLDivElement | null>(null)
  const objectenRef = useRef<HTMLButtonElement | null>(null)
  const rechtspersonenRef = useRef<HTMLButtonElement | null>(null)
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 })

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<Record<string, boolean>>({ appartement: true, huis: true, overig: true })
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  type SortColumn = 'name' | 'type' | 'units' | 'income'
  const [sort, setSort] = useState<{ column: SortColumn | null; direction: 'asc' | 'desc' | null }>({
    column: null,
    direction: null,
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  /** Later uit DB (profile_legal_entities / legal_entities). */
  type LegalEntityRow = {
    id: string
    name: string
    entityType: string
    kvk: string | null
    propertyCount: number
  }
  const [legalEntities] = useState<LegalEntityRow[]>([])

  type LegalSortColumn = 'name' | 'entityType' | 'kvk' | 'propertyCount'
  const [legalSort, setLegalSort] = useState<{
    column: LegalSortColumn | null
    direction: 'asc' | 'desc' | null
  }>({ column: null, direction: null })

  useEffect(() => {
    const container = tabsContainerRef.current
    if (!container) return
    const btn = activeSegment === 'objecten' ? objectenRef.current : rechtspersonenRef.current
    if (!btn) return
    const containerRect = container.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setTabIndicator({ left: btnRect.left - containerRect.left, width: btnRect.width })
  }, [activeSegment])

  useEffect(() => {
    const loadProperties = async () => {
      if (isDemo) {
        setProperties([])
        setLoading(false)
        return
      }
      try {
        const { user } = await getUser()
        if (!user) {
          router.push('/login')
          return
        }
        const userProperties = await propertyQueries.getByOwner(user.id)
        setProperties(userProperties)
      } catch (error) {
        console.error('Failed to load properties:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProperties()
  }, [router, isDemo])

  const filteredProperties = properties.filter(property => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (property.type || '').toLowerCase().includes(searchQuery.toLowerCase())
    const typeKey = (property.type === 'appartement' || property.type === 'huis' ? property.type : 'overig') as string
    const matchesType = typeFilter[typeKey] !== false
    return matchesSearch && matchesType
  })

  const rechtspersonenCount = legalEntities.length

  const filteredLegalEntities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return legalEntities
    return legalEntities.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.entityType.toLowerCase().includes(q) ||
        (e.kvk && e.kvk.replace(/\s/g, '').includes(q.replace(/\s/g, '')))
    )
  }, [legalEntities, searchQuery])

  const sortedLegalEntities = useMemo(() => {
    const list = [...filteredLegalEntities]
    if (!legalSort.column || !legalSort.direction) return list
    const dir = legalSort.direction === 'asc' ? 1 : -1
    list.sort((a, b) => {
      switch (legalSort.column) {
        case 'name':
          return dir * String(a.name).localeCompare(String(b.name), 'nl')
        case 'entityType':
          return dir * String(a.entityType).localeCompare(String(b.entityType), 'nl')
        case 'kvk':
          return dir * String(a.kvk ?? '').localeCompare(String(b.kvk ?? ''), 'nl')
        case 'propertyCount':
          return dir * (a.propertyCount - b.propertyCount)
        default:
          return 0
      }
    })
    return list
  }, [filteredLegalEntities, legalSort])

  const getMonthlyIncome = (property: any) => {
    return (property.units || []).reduce((sum: number, u: any) => sum + (u.monthly_rent || 0), 0)
  }

  type PropertyGroup = {
    property: any
    properties: any[]
    totalIncome: number
    totalProperties: number
  }
  
  const groupedByOwner: Record<string, PropertyGroup> = filteredProperties.reduce((acc, property) => {
    const key = property.id
    if (!acc[key]) {
      acc[key] = {
        property,
        properties: [property],
        totalIncome: 0,
        totalProperties: 1,
      }
    }
    acc[key].totalIncome += getMonthlyIncome(property)
    return acc
  }, {} as Record<string, PropertyGroup>)
  const ownerGroups: PropertyGroup[] = Object.values(groupedByOwner)

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

  const toggleLegalSort = (column: LegalSortColumn) => {
    setLegalSort((prev) => {
      if (prev.column !== column || prev.direction === null) {
        return { column, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { column, direction: 'desc' }
      }
      return { column: null, direction: null }
    })
  }

  const getLegalSortIcon = (column: LegalSortColumn) => {
    if (legalSort.column !== column || !legalSort.direction) {
      return <ChevronsUpDown className="h-3 w-3 text-gray-400" />
    }
    if (legalSort.direction === 'asc') {
      return <ChevronUp className="h-3 w-3 text-[#163300] dark:text-[#9FE870]" />
    }
    return <ChevronDown className="h-3 w-3 text-[#163300] dark:text-[#9FE870]" />
  }

  const sortedGroups = [...ownerGroups]
  if (sort.column && sort.direction) {
    sortedGroups.sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1
      switch (sort.column) {
        case 'name':
          return dir * String(a.property.name ?? '').localeCompare(String(b.property.name ?? ''), 'nl')
        case 'type':
          return dir * String(a.property.type ?? '').localeCompare(String(b.property.type ?? ''), 'nl')
        case 'units':
          return dir * (((a.property.units?.length as number) ?? 0) - ((b.property.units?.length as number) ?? 0))
        case 'income':
          return dir * (a.totalIncome - b.totalIncome)
        default:
          return 0
      }
    })
  }

  const tableBleedPortfolio =
    activeSegment === 'rechtspersonen' || (!loading && viewMode === 'table')

  return (
    <>
      <SectionNavDashboard title="Portefeuille" items={PORTFOLIO_NAV} titleVariant="hero" />
      <Card className={cn(dashboardCardClass(undefined, isDemo), 'overflow-hidden')}>
        <CardHeader
          className={cn(
            'space-y-3',
            tableBleedPortfolio && DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {/* Tabs: Objecten | Rechtspersonen (zelfde stijl als Huurders) */}
            <div
              ref={tabsContainerRef}
              className="relative flex w-full sm:w-auto text-sm border-b border-gray-200 dark:border-neutral-700"
            >
              <button
                type="button"
                ref={objectenRef}
                onClick={() => setActiveSegment('objecten')}
                className={cn(
                  'flex-1 pb-2 mr-6 text-left sm:text-center font-semibold transition-colors duration-200 whitespace-nowrap',
                  activeSegment === 'objecten'
                    ? 'text-[#163300] dark:text-[#9FE870]'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <span>Objecten</span>
                <span
                  className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300]/25 text-[11px] font-medium text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]"
                >
                  {filteredProperties.length}
                </span>
              </button>
              <button
                type="button"
                ref={rechtspersonenRef}
                onClick={() => setActiveSegment('rechtspersonen')}
                className={cn(
                  'flex-1 pb-2 text-left sm:text-center font-semibold transition-colors duration-200 whitespace-nowrap',
                  activeSegment === 'rechtspersonen'
                    ? 'text-[#163300] dark:text-[#9FE870]'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <span>Rechtspersonen</span>
                <span
                  className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300]/25 text-[11px] font-medium text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]"
                >
                  {rechtspersonenCount}
                </span>
              </button>
              <div
                className="absolute bottom-0 h-[2px] rounded-full bg-[#163300] dark:bg-[#9FE870] transition-all duration-200"
                style={{ left: tabIndicator.left, width: tabIndicator.width }}
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end min-w-0">
              <div className="relative flex-1 sm:flex-initial sm:min-w-[140px] sm:max-w-[220px] flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3">
                <Search className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
                <Input
                  placeholder={
                    activeSegment === 'rechtspersonen' ? 'Zoek rechtspersonen...' : 'Zoek objecten...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-2 text-sm min-w-0 flex-1 bg-transparent py-0"
                />
              </div>
              {activeSegment === 'objecten' ? (
                <>
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
                      className={DASHBOARD_FILTER_MENU_CONTENT_CLASS}
                    >
                      <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </DropdownMenuLabel>
                      <div className="space-y-1">
                        <DropdownMenuCheckboxItem
                          checked={typeFilter.appartement !== false}
                          onCheckedChange={(v) => setTypeFilter((f) => ({ ...f, appartement: Boolean(v) }))}
                          onSelect={(e) => e.preventDefault()}
                          className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
                        >
                          Appartement
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={typeFilter.huis !== false}
                          onCheckedChange={(v) => setTypeFilter((f) => ({ ...f, huis: Boolean(v) }))}
                          onSelect={(e) => e.preventDefault()}
                          className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
                        >
                          Huis
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={typeFilter.overig !== false}
                          onCheckedChange={(v) => setTypeFilter((f) => ({ ...f, overig: Boolean(v) }))}
                          onSelect={(e) => e.preventDefault()}
                          className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
                        >
                          Overig
                        </DropdownMenuCheckboxItem>
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
                    {viewMode === 'table' ? (
                      <Grid3x3 className="h-4 w-4" />
                    ) : (
                      <Table2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={async () => {
                      if (isDemo) {
                        router.push(`${basePath}/portfolio/properties/new`)
                        return
                      }
                      setCreating(true)
                      try {
                        const { user } = await getUser()
                        if (!user) {
                          router.push('/login')
                          return
                        }
                        const newProperty = await propertyQueries.create({
                          owner_id: user.id,
                          name: 'Nieuw pand',
                          address: '',
                          type: 'appartement',
                        })
                        router.push(`${basePath}/portfolio/properties/${newProperty.id}?edit=true&new=true`)
                      } catch (error) {
                        console.error('Failed to create property:', error)
                        setCreating(false)
                      }
                    }}
                    disabled={creating}
                    className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 sm:px-5 h-9 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {creating ? 'Aanmaken...' : 'Nieuw Pand'}
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent
          className={cn(
            tableBleedPortfolio && 'p-0 px-0 pb-0',
            tableBleedPortfolio && DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS
          )}
        >
            {activeSegment === 'rechtspersonen' ? (
              <DashboardTableBlock empty={sortedLegalEntities.length === 0}>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={() => toggleLegalSort('name')}
                        >
                          <span>Rechtspersoon</span>
                          {getLegalSortIcon('name')}
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={() => toggleLegalSort('entityType')}
                        >
                          <span>Type</span>
                          {getLegalSortIcon('entityType')}
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={() => toggleLegalSort('kvk')}
                        >
                          <span>KVK</span>
                          {getLegalSortIcon('kvk')}
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={() => toggleLegalSort('propertyCount')}
                        >
                          <span>Objecten</span>
                          {getLegalSortIcon('propertyCount')}
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
                    {sortedLegalEntities.map((entity) => (
                      <TableRow
                        key={entity.id}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-800"
                      >
                        <TableCell className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'relative h-10 w-10 shrink-0 rounded-lg',
                                DASHBOARD_TABLE_ICON_WRAP_CLASS
                              )}
                            >
                              <Landmark className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{entity.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                          {entity.entityType}
                        </TableCell>
                        <TableCell className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono tabular-nums">
                          {entity.kvk ?? '—'}
                        </TableCell>
                        <TableCell className="py-4 px-4 text-sm text-gray-900 dark:text-white tabular-nums">
                          {entity.propertyCount}
                        </TableCell>
                        <TableCell className="w-px py-4 pr-3" aria-hidden />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DashboardTableBlock>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              ownerGroups.length === 0 ? null : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedGroups.map((group, index) => (
                  <Card
                    key={index}
                    className={cn(
                      dashboardCardClass('transition-colors cursor-pointer', isDemo),
                      'rounded-block border-[0.5px] border-gray-200 dark:border-neutral-700 hover:border-[#163300] dark:hover:border-[#9FE870]'
                    )}
                    onClick={() => router.push(`${basePath}/portfolio/properties/${group.property.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-[#163300] dark:text-[#9FE870] mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold text-[#163300] dark:text-[#9FE870] mb-1 truncate">
                            {group.property.name}
                          </CardTitle>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-2">
                            {group.property.type}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Objecten</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {group.property.units?.length || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Maandhuur</p>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            €{group.totalIncome.toLocaleString('nl-NL')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{group.property.address}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              )
            ) : (
              <DashboardTableBlock empty={ownerGroups.length === 0}>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={() => toggleSort('name')}
                        >
                          <span>Object</span>
                          {getSortIcon('name')}
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={() => toggleSort('type')}
                        >
                          <span>Type</span>
                          {getSortIcon('type')}
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={() => toggleSort('units')}
                        >
                          <span>Eenheden</span>
                          {getSortIcon('units')}
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={() => toggleSort('income')}
                        >
                          <span>Maandhuur</span>
                          {getSortIcon('income')}
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
                    {sortedGroups.map((group) => (
                      <Fragment key={group.property.id}>
                        <TableRow
                          className="hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                          onClick={() => router.push(`${basePath}/portfolio/properties/${group.property.id}`)}
                        >
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'relative h-10 w-10 rounded-lg overflow-hidden',
                                  DASHBOARD_TABLE_ICON_WRAP_CLASS
                                )}
                              >
                                <Building2 className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{group.property.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {group.property.address}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-sm text-gray-900 dark:text-white capitalize">
                            {group.property.type}
                          </TableCell>
                          <TableCell className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                            {group.property.units?.length || 0}
                          </TableCell>
                          <TableCell className="py-4 px-4 text-sm font-medium text-[#163300] dark:text-[#9FE870]">
                            €{group.totalIncome.toLocaleString('nl-NL')}
                          </TableCell>
                          <TableCell className="w-px text-right pr-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedId(expandedId === group.property.id ? null : group.property.id)
                              }}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-full text-[#163300] dark:text-[#9FE870] hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors"
                              aria-label={expandedId === group.property.id ? 'Details verbergen' : 'Details tonen'}
                            >
                              <ChevronRight
                                className={cn(
                                  'h-4 w-4 transition-transform duration-200',
                                  expandedId === group.property.id ? 'rotate-90' : 'rotate-0'
                                )}
                              />
                            </button>
                          </TableCell>
                        </TableRow>
                        {expandedId === group.property.id && (
                          <TableRow className="bg-gray-50/60 dark:bg-neutral-900/60">
                            <TableCell colSpan={5} className="py-3 px-6 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex flex-wrap gap-4 justify-between">
                                {group.property.postcode || group.property.city ? (
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-400">Plaats</p>
                                    <p>
                                      {[group.property.postcode, group.property.city].filter(Boolean).join(' ')}
                                    </p>
                                  </div>
                                ) : null}
                                {group.property.build_year != null && (
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-400">Bouwjaar</p>
                                    <p>{group.property.build_year}</p>
                                  </div>
                                )}
                                {group.property.woz_value != null && (
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-400">WOZ-waarde</p>
                                    <p>€{Number(group.property.woz_value).toLocaleString('nl-NL')}</p>
                                  </div>
                                )}
                                {group.property.energy_label && (
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-400">Energielabel</p>
                                    <p>{group.property.energy_label}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-gray-400">Eenheden</p>
                                  <p>{group.property.units?.length ?? 0} eenheden</p>
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
            )}
        </CardContent>
      </Card>
    </>
  )
}

