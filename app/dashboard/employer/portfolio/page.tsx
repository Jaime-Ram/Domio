'use client'

import { useState, useEffect, Fragment, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  MapPin,
  Grid3x3,
  Table2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronRight,
  Info,
  Filter,
  Landmark,
  Euro,
  Home,
  Briefcase,
  Layers,
  X,
} from 'lucide-react'
import { getUser } from '@/lib/supabase/auth'
import { propertyQueries, portfolioQueries, legalEntityQueries } from '@/lib/supabase/queries'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NewPropertyDialog } from '@/components/portfolio/new-property-dialog'
import { PropertyDetailSheet } from '@/components/portfolio/property-detail-sheet'
import { NewPortfolioDialog } from '@/components/portfolio/new-portfolio-dialog'
import { AssignPropertiesDialog } from '@/components/portfolio/assign-properties-dialog'
import { mockProperties, mockPortfolios } from '@/lib/mock-data/vastgoed'

// ─── Types ────────────────────────────────────────────────────────────────────

type PropertyRow = {
  id: string
  name: string
  address: string
  postcode?: string | null
  city?: string | null
  type: string
  units: { id: string; monthly_rent: number | null; status?: string }[]
  portfolio_id?: string | null
  portfolioName?: string
}

type PortfolioRow = {
  id: string
  name: string
  owner?: string
  entityType?: string
  kvk?: string | null
  description?: string | null
  properties: PropertyRow[]
}

type LegalEntityRow = {
  id: string
  name: string
  entityType: string
  kvk: string | null
  propertyCount: number
}

type PortfolioSegment = 'portefeuilles' | 'objecten' | 'rechtspersonen'
type SortColumn = 'name' | 'type' | 'units' | 'income'
type LegalSortColumn = 'name' | 'entityType' | 'kvk' | 'propertyCount'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonthlyIncome(property: PropertyRow): number {
  return property.units.reduce((s, u) => s + (Number(u.monthly_rent) || 0), 0)
}

function getOccupancy(properties: PropertyRow[]): number {
  const total = properties.reduce((s, p) => s + p.units.length, 0)
  if (!total) return 0
  const occupied = properties.reduce(
    (s, p) => s + p.units.filter((u) => u.status === 'verhuurd').length,
    0
  )
  return Math.round((occupied / total) * 100)
}

function portfolioIncome(portfolio: PortfolioRow): number {
  return portfolio.properties.reduce((s, p) => s + getMonthlyIncome(p), 0)
}


// ─── Component ───────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const router = useRouter()
  const { basePath, isDemo } = useDashboardUser()

  const [activeSegment, setActiveSegment] = useState<PortfolioSegment>('portefeuilles')
  const tabsContainerRef = useRef<HTMLDivElement | null>(null)
  const pfRef = useRef<HTMLButtonElement | null>(null)
  const objRef = useRef<HTMLButtonElement | null>(null)
  const rpRef = useRef<HTMLButtonElement | null>(null)
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 })

  const [portfolios, setPortfolios] = useState<PortfolioRow[]>([])
  const [unassigned, setUnassigned] = useState<PropertyRow[]>([])
  const [allProperties, setAllProperties] = useState<PropertyRow[]>([])
  const [legalEntities, setLegalEntities] = useState<LegalEntityRow[]>([])
  const [loading, setLoading] = useState(true)

  const [expandedPortfolioId, setExpandedPortfolioId] = useState<string | null>(null)
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)

  const [typeFilter, setTypeFilter] = useState<Record<string, boolean>>({
    appartement: true, huis: true, overig: true,
  })
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [sort, setSort] = useState<{ column: SortColumn | null; direction: 'asc' | 'desc' | null }>({
    column: null, direction: null,
  })
  const [legalSort, setLegalSort] = useState<{ column: LegalSortColumn | null; direction: 'asc' | 'desc' | null }>({
    column: null, direction: null,
  })

  const [newPropertyOpen, setNewPropertyOpen] = useState(false)
  const [newPortfolioOpen, setNewPortfolioOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // ── Multi-select state (Alle objecten tab) ─────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkTargetPfId, setBulkTargetPfId] = useState<string>('')
  const [bulkAssigning, setBulkAssigning] = useState(false)

  // ── Assign-from-accordion state (Invoerpunt 3) ─────────────────────────────
  const [assignPickerOpen, setAssignPickerOpen] = useState(false)
  const [assignPickerPortfolioId, setAssignPickerPortfolioId] = useState<string | null>(null)

  // ── Pre-selected portfolio for new property dialog ─────────────────────────
  const [newPropertyPortfolioId, setNewPropertyPortfolioId] = useState<string | undefined>()

  // ── Tab indicator ──────────────────────────────────────────────────────────
  useEffect(() => {
    const container = tabsContainerRef.current
    if (!container) return
    const btn =
      activeSegment === 'portefeuilles' ? pfRef.current
      : activeSegment === 'objecten' ? objRef.current
      : rpRef.current
    if (!btn) return
    const cr = container.getBoundingClientRect()
    const br = btn.getBoundingClientRect()
    setTabIndicator({ left: br.left - cr.left, width: br.width })
  }, [activeSegment, portfolios.length])

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (isDemo) {
          // Build portfolios from mock data
          const pfs: PortfolioRow[] = mockPortfolios.map((mp) => ({
            id: mp.id,
            name: mp.name,
            owner: mp.owner,
            entityType: mp.entityType,
            kvk: mp.kvk,
            description: mp.description,
            properties: mockProperties
              .filter((p) => mp.propertyIds.includes(p.id))
              .map((p) => ({
                id: p.id,
                name: p.name,
                address: p.address,
                type: p.type,
                units: [{ id: `u-${p.id}`, monthly_rent: p.monthlyRent, status: p.status }],
                portfolio_id: mp.id,
              })),
          }))
          const unassignedProps = mockProperties
            .filter((p) => !p.portfolioId)
            .map((p) => ({
              id: p.id,
              name: p.name,
              address: p.address,
              type: p.type,
              units: [{ id: `u-${p.id}`, monthly_rent: p.monthlyRent, status: p.status }],
              portfolio_id: null,
            }))
          const all = mockProperties.map((p) => ({
            id: p.id,
            name: p.name,
            address: p.address,
            type: p.type,
            units: [{ id: `u-${p.id}`, monthly_rent: p.monthlyRent, status: p.status }],
            portfolio_id: (p as any).portfolioId ?? null,
            portfolioName: mockPortfolios.find((pf) => pf.id === (p as any).portfolioId)?.name,
          }))
          setPortfolios(pfs)
          setUnassigned(unassignedProps)
          setAllProperties(all)
          setLoading(false)
          return
        }

        const { user } = await getUser()
        if (!user) { router.push('/login'); return }

        const [pfsData, propsData, entitiesData] = await Promise.all([
          portfolioQueries.getByOwner(user.id),
          propertyQueries.getByOwner(user.id),
          legalEntityQueries.getByUser(user.id),
        ])

        const pfIds = new Set<string>()
        const pfs: PortfolioRow[] = (pfsData || []).map((pf: any) => {
          const pfProps: PropertyRow[] = (pf.properties || []).map((p: any) => {
            pfIds.add(p.id)
            return {
              id: p.id, name: p.name, address: p.address,
              postcode: p.postcode, city: p.city, type: p.type,
              units: p.units || [], portfolio_id: pf.id,
            }
          })
          return {
            id: pf.id, name: pf.name,
            owner: pf.legal_entities?.name,
            entityType: pf.description ?? undefined,
            kvk: pf.legal_entities?.kvk_number ?? undefined,
            description: pf.description, properties: pfProps,
          }
        })

        const unassignedProps = (propsData || [])
          .filter((p: any) => !pfIds.has(p.id))
          .map((p: any) => ({
            id: p.id, name: p.name, address: p.address,
            postcode: p.postcode, city: p.city, type: p.type,
            units: p.units || [], portfolio_id: null,
          }))

        const all = (propsData || []).map((p: any) => {
          const pf = pfs.find((portfolio) => portfolio.properties.some((pr) => pr.id === p.id))
          return {
            id: p.id, name: p.name, address: p.address,
            postcode: p.postcode, city: p.city, type: p.type,
            units: p.units || [],
            portfolio_id: pf?.id ?? null,
            portfolioName: pf?.name,
          }
        })

        // Rechtspersonen: tel objecten per entiteit
        const entitiesWithCount: LegalEntityRow[] = (entitiesData ?? []).map((e: any) => ({
          id: e.id,
          name: e.name,
          entityType: e.notes ?? '—',
          kvk: e.kvk_number ?? null,
          propertyCount: (propsData ?? []).filter((p: any) => p.legal_entity_id === e.id).length,
        }))

        setPortfolios(pfs)
        setUnassigned(unassignedProps)
        setAllProperties(all)
        setLegalEntities(entitiesWithCount)
      } catch (err) {
        console.error('Laden mislukt:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router, isDemo])

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const totalObjects = allProperties.length
  const totalMonthlyRent = allProperties.reduce((s, p) => s + getMonthlyIncome(p), 0)
  const totalUnits = allProperties.reduce((s, p) => s + p.units.length, 0)
  const totalOccupied = allProperties.reduce(
    (s, p) => s + p.units.filter((u) => u.status === 'verhuurd').length, 0
  )
  const occupancyRate = totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0

  // ── Sorting helpers ───────────────────────────────────────────────────────
  const toggleSort = (column: SortColumn) => {
    setSort((prev) => {
      if (prev.column !== column || prev.direction === null) return { column, direction: 'asc' }
      if (prev.direction === 'asc') return { column, direction: 'desc' }
      return { column: null, direction: null }
    })
  }
  const getSortIcon = (column: SortColumn) => {
    if (sort.column !== column || !sort.direction) return <ChevronsUpDown className="h-3 w-3 text-gray-400" />
    return sort.direction === 'asc'
      ? <ChevronUp className="h-3 w-3 text-[#163300] dark:text-[#9FE870]" />
      : <ChevronDown className="h-3 w-3 text-[#163300] dark:text-[#9FE870]" />
  }

  const toggleLegalSort = (column: LegalSortColumn) => {
    setLegalSort((prev) => {
      if (prev.column !== column || prev.direction === null) return { column, direction: 'asc' }
      if (prev.direction === 'asc') return { column, direction: 'desc' }
      return { column: null, direction: null }
    })
  }
  const getLegalSortIcon = (column: LegalSortColumn) => {
    if (legalSort.column !== column || !legalSort.direction) return <ChevronsUpDown className="h-3 w-3 text-gray-400" />
    return legalSort.direction === 'asc'
      ? <ChevronUp className="h-3 w-3 text-[#163300] dark:text-[#9FE870]" />
      : <ChevronDown className="h-3 w-3 text-[#163300] dark:text-[#9FE870]" />
  }

  // ── Filtered + sorted properties (Alle objecten tab) ──────────────────────
  const filteredProperties = allProperties.filter((p) => {
    const key = (p.type === 'appartement' || p.type === 'huis' ? p.type : 'overig') as string
    return typeFilter[key] !== false
  })

  const sortedProperties = [...filteredProperties]
  if (sort.column && sort.direction) {
    const dir = sort.direction === 'asc' ? 1 : -1
    sortedProperties.sort((a, b) => {
      switch (sort.column) {
        case 'name': return dir * a.name.localeCompare(b.name, 'nl')
        case 'type': return dir * a.type.localeCompare(b.type, 'nl')
        case 'units': return dir * (a.units.length - b.units.length)
        case 'income': return dir * (getMonthlyIncome(a) - getMonthlyIncome(b))
        default: return 0
      }
    })
  }

  const sortedLegalEntities = useMemo(() => {
    const list = [...legalEntities]
    if (!legalSort.column || !legalSort.direction) return list
    const dir = legalSort.direction === 'asc' ? 1 : -1
    list.sort((a, b) => {
      switch (legalSort.column) {
        case 'name': return dir * a.name.localeCompare(b.name, 'nl')
        case 'entityType': return dir * a.entityType.localeCompare(b.entityType, 'nl')
        case 'kvk': return dir * (a.kvk ?? '').localeCompare(b.kvk ?? '', 'nl')
        case 'propertyCount': return dir * (a.propertyCount - b.propertyCount)
        default: return 0
      }
    })
    return list
  }, [legalEntities, legalSort])

  // ── Bulk assign handler (Invoerpunt 2) ───────────────────────────────────
  const handleBulkAssign = async () => {
    if (!bulkTargetPfId || selectedIds.size === 0) return
    setBulkAssigning(true)
    try {
      const ids = [...selectedIds]
      if (!isDemo) await portfolioQueries.assignProperties(bulkTargetPfId, ids)
      const targetPf = portfolios.find((p) => p.id === bulkTargetPfId)
      const movingProps = allProperties.filter((p) => ids.includes(p.id))
      setAllProperties((prev) =>
        prev.map((p) =>
          ids.includes(p.id) ? { ...p, portfolio_id: bulkTargetPfId, portfolioName: targetPf?.name } : p
        )
      )
      setUnassigned((prev) => prev.filter((p) => !ids.includes(p.id)))
      setPortfolios((prev) =>
        prev.map((pf) => {
          if (pf.id !== bulkTargetPfId) return pf
          const newProps = movingProps.map((p) => ({ ...p, portfolio_id: bulkTargetPfId }))
          return { ...pf, properties: [...pf.properties, ...newProps] }
        })
      )
      setSelectedIds(new Set())
      setBulkTargetPfId('')
    } catch (err) {
      console.error('Bulk toewijzen mislukt:', err)
    } finally {
      setBulkAssigning(false)
    }
  }

  // ── Assign from accordion handler (Invoerpunt 3) ─────────────────────────
  const handleAssignFromAccordion = async (portfolioId: string, propertyIds: string[]) => {
    if (!isDemo) await portfolioQueries.assignProperties(portfolioId, propertyIds)
    const targetPf = portfolios.find((p) => p.id === portfolioId)
    const movingProps = unassigned.filter((p) => propertyIds.includes(p.id))
    setUnassigned((prev) => prev.filter((p) => !propertyIds.includes(p.id)))
    setAllProperties((prev) =>
      prev.map((p) =>
        propertyIds.includes(p.id) ? { ...p, portfolio_id: portfolioId, portfolioName: targetPf?.name } : p
      )
    )
    setPortfolios((prev) =>
      prev.map((pf) => {
        if (pf.id !== portfolioId) return pf
        const newProps = movingProps.map((p) => ({ ...p, portfolio_id: portfolioId }))
        return { ...pf, properties: [...pf.properties, ...newProps] }
      })
    )
  }

  const tabClass = (seg: PortfolioSegment) =>
    cn(
      'pb-2 mr-6 last:mr-0 text-left sm:text-center font-semibold transition-colors duration-200 whitespace-nowrap',
      activeSegment === seg
        ? 'text-[#163300] dark:text-[#9FE870]'
        : 'text-gray-500 dark:text-gray-400'
    )

  const countBadge = (n: number) => (
    <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#163300]/25 text-[11px] font-medium text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]">
      {n}
    </span>
  )

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <SectionNavDashboard title="Portefeuille" items={[]} titleVariant="hero" />

      {/* ── KPI strip ─────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            {
              icon: Briefcase,
              label: 'Portefeuilles',
              value: portfolios.length,
              sub: null,
            },
            {
              icon: Building2,
              label: 'Objecten',
              value: totalObjects,
              sub: unassigned.length > 0 ? `${unassigned.length} niet ingedeeld` : null,
            },
            {
              icon: Euro,
              label: 'Maandhuur',
              value: `€${totalMonthlyRent.toLocaleString('nl-NL')}`,
              sub: null,
            },
            {
              icon: Home,
              label: 'Bezetting',
              value: `${occupancyRate}%`,
              sub: `${totalOccupied}/${totalUnits} eenheden`,
            },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl px-4 py-3"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" />
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
              {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>
      )}

      <Card className={cn(dashboardCardClass(undefined, isDemo), 'overflow-hidden')}>
        <CardHeader className={cn('space-y-3', DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {/* Tabs */}
            <div
              ref={tabsContainerRef}
              className="relative flex w-full sm:w-auto text-sm border-b border-gray-200 dark:border-neutral-700"
            >
              <button type="button" ref={pfRef} onClick={() => { setActiveSegment('portefeuilles'); setSelectedIds(new Set()) }} className={tabClass('portefeuilles')}>
                <span>Portefeuilles</span>{countBadge(portfolios.length)}
              </button>
              <button type="button" ref={objRef} onClick={() => { setActiveSegment('objecten'); setSelectedIds(new Set()) }} className={tabClass('objecten')}>
                <span>Alle objecten</span>{countBadge(allProperties.length)}
              </button>
              <button type="button" ref={rpRef} onClick={() => { setActiveSegment('rechtspersonen'); setSelectedIds(new Set()) }} className={tabClass('rechtspersonen')}>
                <span>Rechtspersonen</span>{countBadge(legalEntities.length)}
              </button>
              <div
                className="absolute bottom-0 h-[2px] rounded-full bg-[#163300] dark:bg-[#9FE870] transition-all duration-200"
                style={{ left: tabIndicator.left, width: tabIndicator.width }}
              />
            </div>

            {/* Controls per tab */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end min-w-0">
              {activeSegment === 'portefeuilles' && (
                <Button
                  onClick={() => setNewPortfolioOpen(true)}
                  className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 sm:px-5 h-9 text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe portefeuille
                </Button>
              )}
              {activeSegment === 'objecten' && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" className={cn('inline-flex', DASHBOARD_FILTER_TRIGGER_BUTTON_CLASS)}>
                        <Filter className="h-4 w-4 md:mr-1.5" />
                        <span className="hidden md:inline">Filter</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={8} className={DASHBOARD_FILTER_MENU_CONTENT_CLASS}>
                      <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Type</DropdownMenuLabel>
                      <div className="space-y-1">
                        {['appartement', 'huis', 'overig'].map((t) => (
                          <DropdownMenuCheckboxItem
                            key={t}
                            checked={typeFilter[t] !== false}
                            onCheckedChange={(v) => setTypeFilter((f) => ({ ...f, [t]: Boolean(v) }))}
                            onSelect={(e) => e.preventDefault()}
                            className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
                          >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="hidden md:inline-flex h-9 w-9 rounded-full border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800"
                    onClick={() => { setViewMode(viewMode === 'table' ? 'grid' : 'table'); setSelectedIds(new Set()) }}
                    aria-label={viewMode === 'table' ? 'Toon als raster' : 'Toon als lijst'}
                  >
                    {viewMode === 'table' ? <Grid3x3 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => setNewPropertyOpen(true)}
                    disabled={creating}
                    className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 sm:px-5 h-9 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuw pand
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn('p-0 px-0 pb-0', DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS)}>

          {/* ════════════════════════════════════════
              TAB: PORTEFEUILLES
              ════════════════════════════════════════ */}
          {activeSegment === 'portefeuilles' && (
            loading ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : portfolios.length === 0 && unassigned.length === 0 ? (
              <div className="py-20 text-center">
                <Briefcase className="h-10 w-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nog geen portefeuilles</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Maak een portefeuille aan om panden te groeperen</p>
                <button
                  type="button"
                  onClick={() => setNewPortfolioOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] text-sm font-semibold px-4 py-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Eerste portefeuille aanmaken
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                {portfolios.map((pf) => {
                  const income = portfolioIncome(pf)
                  const occ = getOccupancy(pf.properties)
                  const isExpanded = expandedPortfolioId === pf.id

                  return (
                    <div key={pf.id}>
                      {/* Portfolio header row */}
                      <div
                        className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedPortfolioId(isExpanded ? null : pf.id)}
                      >
                        {/* Icon */}
                        <div className="h-8 w-8 rounded-xl shrink-0 bg-[#163300]/8 dark:bg-[#9FE870]/10 flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                        </div>

                        {/* Name + meta */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              {pf.name}
                            </span>
                            {pf.entityType && (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400">
                                {pf.entityType}
                              </span>
                            )}
                          </div>
                          {(pf.owner || pf.kvk) && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {[pf.owner, pf.kvk ? `KvK ${pf.kvk}` : null].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="hidden sm:flex items-center gap-6 shrink-0">
                          <div className="text-right">
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">Objecten</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {pf.properties.length}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">Maandhuur</p>
                            <p className="text-sm font-semibold text-[#163300] dark:text-[#9FE870]">
                              €{income.toLocaleString('nl-NL')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">Bezetting</p>
                            <div className="flex items-center gap-1.5 justify-end">
                              <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-neutral-700 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#163300] dark:bg-[#9FE870] transition-all"
                                  style={{ width: `${occ}%` }}
                                />
                              </div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{occ}%</p>
                            </div>
                          </div>
                        </div>

                        {/* Expand chevron */}
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </div>

                      {/* Expanded: property list */}
                      {isExpanded && (
                        <div className="bg-gray-50/60 dark:bg-neutral-900/40">
                          {pf.properties.length === 0 ? (
                            <div className="px-12 py-5 text-sm text-gray-400 dark:text-gray-500 flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              Geen panden in deze portefeuille
                            </div>
                          ) : (
                            pf.properties.map((prop, idx) => {
                              const propIncome = getMonthlyIncome(prop)
                              const isLast = idx === pf.properties.length - 1
                              return (
                                <div
                                  key={prop.id}
                                  className={cn(
                                    'flex items-center gap-3 pl-12 pr-5 py-3 hover:bg-gray-100/60 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer',
                                    !isLast && 'border-b border-gray-100 dark:border-neutral-800'
                                  )}
                                  onClick={() => setSelectedPropertyId(prop.id)}
                                >
                                  {/* Line connector */}
                                  <div className="flex-shrink-0 w-4 flex flex-col items-center">
                                    <div className="h-4 border-l-2 border-gray-200 dark:border-neutral-700 mb-0.5" />
                                    <div className="h-0 w-2 border-b-2 border-gray-200 dark:border-neutral-700" />
                                  </div>

                                  <div className={cn('h-8 w-8 rounded-lg shrink-0', DASHBOARD_TABLE_ICON_WRAP_CLASS)}>
                                    <Building2 className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{prop.name}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {prop.address}
                                    </p>
                                  </div>

                                  <div className="hidden sm:flex items-center gap-5 shrink-0 text-right">
                                    <div>
                                      <p className="text-[11px] text-gray-400">Eenheden</p>
                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{prop.units.length}</p>
                                    </div>
                                    <div>
                                      <p className="text-[11px] text-gray-400">Huur</p>
                                      <p className="text-xs font-medium text-[#163300] dark:text-[#9FE870]">
                                        {propIncome > 0 ? `€${propIncome.toLocaleString('nl-NL')}` : <span className="text-gray-400">Leeg</span>}
                                      </p>
                                    </div>
                                  </div>

                                  <ChevronRight className="h-4 w-4 text-gray-300 dark:text-neutral-600 shrink-0" />
                                </div>
                              )
                            })
                          )}

                          {/* Add property to this portfolio */}
                          <div className="px-12 py-3 border-t border-gray-100 dark:border-neutral-800 flex items-center gap-4 flex-wrap">
                            {unassigned.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAssignPickerPortfolioId(pf.id)
                                  setAssignPickerOpen(true)
                                }}
                                className="text-xs text-[#163300] dark:text-[#9FE870] font-medium hover:underline flex items-center gap-1"
                              >
                                <Layers className="h-3.5 w-3.5" />
                                Bestaand pand indelen
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setNewPropertyPortfolioId(pf.id)
                                setNewPropertyOpen(true)
                              }}
                              className="text-xs text-[#163300] dark:text-[#9FE870] font-medium hover:underline flex items-center gap-1"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Nieuw pand aanmaken
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Unassigned properties */}
                {unassigned.length > 0 && (
                  <div>
                    <div
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedPortfolioId(expandedPortfolioId === '__unassigned' ? null : '__unassigned')}
                    >
                      <div className="h-8 w-8 rounded-xl shrink-0 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-gray-500 dark:text-gray-400 text-sm">Niet ingedeeld</span>
                        <p className="text-xs text-gray-400 mt-0.5">Objecten zonder portefeuille</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <p className="text-[11px] text-gray-400">Objecten</p>
                          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{unassigned.length}</p>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200',
                          expandedPortfolioId === '__unassigned' && 'rotate-180'
                        )}
                      />
                    </div>
                    {expandedPortfolioId === '__unassigned' && (
                      <div className="bg-gray-50/60 dark:bg-neutral-900/40">
                        {unassigned.map((prop, idx) => (
                          <div
                            key={prop.id}
                            className={cn(
                              'flex items-center gap-3 pl-12 pr-5 py-3 hover:bg-gray-100/60 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer',
                              idx < unassigned.length - 1 && 'border-b border-gray-100 dark:border-neutral-800'
                            )}
                            onClick={() => setSelectedPropertyId(prop.id)}
                          >
                            <div className={cn('h-8 w-8 rounded-lg shrink-0', DASHBOARD_TABLE_ICON_WRAP_CLASS)}>
                              <Building2 className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{prop.name}</p>
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />{prop.address}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 dark:text-neutral-600 shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          )}

          {/* ════════════════════════════════════════
              TAB: ALLE OBJECTEN
              ════════════════════════════════════════ */}
          {activeSegment === 'objecten' && (
            loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {[0, 1, 2].map((i) => <div key={i} className="h-40 bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse" />)}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {sortedProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 hover:border-[#163300] dark:hover:border-[#9FE870] transition-colors cursor-pointer"
                    onClick={() => setSelectedPropertyId(prop.id)}
                  >
                    {prop.portfolioName && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />{prop.portfolioName}
                      </p>
                    )}
                    <div className="flex items-start gap-3">
                      <div className={cn('h-9 w-9 rounded-xl shrink-0', DASHBOARD_TABLE_ICON_WRAP_CLASS)}>
                        <Building2 className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">{prop.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{prop.type}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
                      <div>
                        <p className="text-[11px] text-gray-400">Eenheden</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{prop.units.length}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">Maandhuur</p>
                        <p className="text-sm font-semibold text-[#163300] dark:text-[#9FE870]">
                          €{getMonthlyIncome(prop).toLocaleString('nl-NL')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />{prop.address}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <DashboardTableBlock empty={sortedProperties.length === 0}>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-px px-4')}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded accent-[#163300] dark:accent-[#9FE870] cursor-pointer"
                          checked={sortedProperties.length > 0 && sortedProperties.every((p) => selectedIds.has(p.id))}
                          onChange={(e) => setSelectedIds(e.target.checked ? new Set(sortedProperties.map((p) => p.id)) : new Set())}
                        />
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('name')}>
                          <span>Object</span>{getSortIcon('name')}
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('type')}>
                          <span>Type</span>{getSortIcon('type')}
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>Portefeuille</TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('units')}>
                          <span>Eenheden</span>{getSortIcon('units')}
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('income')}>
                          <span>Maandhuur</span>{getSortIcon('income')}
                        </button>
                      </TableHead>
                      <TableHead className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-px text-center')}>
                        <span className="inline-flex items-center justify-center text-[#163300]/70 dark:text-[#9FE870]/70" title="Details">
                          <Info className="h-4 w-4" />
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProperties.map((prop) => (
                      <Fragment key={prop.id}>
                        <TableRow
                          className="hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                          onClick={() => setSelectedPropertyId(prop.id)}
                        >
                          <TableCell className="w-px px-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded accent-[#163300] dark:accent-[#9FE870] cursor-pointer"
                              checked={selectedIds.has(prop.id)}
                              onChange={(e) =>
                                setSelectedIds((prev) => {
                                  const next = new Set(prev)
                                  if (e.target.checked) next.add(prop.id)
                                  else next.delete(prop.id)
                                  return next
                                })
                              }
                            />
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className={cn('h-10 w-10 rounded-lg', DASHBOARD_TABLE_ICON_WRAP_CLASS)}>
                                <Building2 className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{prop.name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />{prop.address}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-sm text-gray-900 dark:text-white capitalize">{prop.type}</TableCell>
                          <TableCell className="py-4 px-4">
                            {prop.portfolioName ? (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#163300]/8 dark:bg-[#9FE870]/10 text-[#163300] dark:text-[#9FE870]">
                                {prop.portfolioName}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-4 text-sm text-gray-900 dark:text-white">{prop.units.length}</TableCell>
                          <TableCell className="py-4 px-4 text-sm font-medium text-[#163300] dark:text-[#9FE870]">
                            €{getMonthlyIncome(prop).toLocaleString('nl-NL')}
                          </TableCell>
                          <TableCell className="w-px text-right pr-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedPropertyId(expandedPropertyId === prop.id ? null : prop.id)
                              }}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-full text-[#163300] dark:text-[#9FE870] hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors"
                            >
                              <ChevronRight
                                className={cn('h-4 w-4 transition-transform duration-200', expandedPropertyId === prop.id && 'rotate-90')}
                              />
                            </button>
                          </TableCell>
                        </TableRow>
                        {expandedPropertyId === prop.id && (
                          <TableRow className="bg-gray-50/60 dark:bg-neutral-900/60">
                            <TableCell colSpan={7} className="py-3 px-6 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex flex-wrap gap-4 justify-between">
                                {prop.city && <div><p className="text-xs uppercase tracking-wide text-gray-400">Plaats</p><p>{prop.city}</p></div>}
                                {prop.portfolioName && <div><p className="text-xs uppercase tracking-wide text-gray-400">Portefeuille</p><p>{prop.portfolioName}</p></div>}
                                <div><p className="text-xs uppercase tracking-wide text-gray-400">Eenheden</p><p>{prop.units.length}</p></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </DashboardTableBlock>
            )
          )}

          {/* ════════════════════════════════════════
              TAB: RECHTSPERSONEN
              ════════════════════════════════════════ */}
          {activeSegment === 'rechtspersonen' && (
            <DashboardTableBlock empty={sortedLegalEntities.length === 0}>
              {sortedLegalEntities.length === 0 ? (
                <div className="py-20 text-center">
                  <Landmark className="h-10 w-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nog geen rechtspersonen</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Rechtspersonen worden beheerd via Instellingen</p>
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleLegalSort('name')}>
                          <span>Rechtspersoon</span>{getLegalSortIcon('name')}
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleLegalSort('entityType')}>
                          <span>Type</span>{getLegalSortIcon('entityType')}
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleLegalSort('kvk')}>
                          <span>KVK</span>{getLegalSortIcon('kvk')}
                        </button>
                      </TableHead>
                      <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleLegalSort('propertyCount')}>
                          <span>Objecten</span>{getLegalSortIcon('propertyCount')}
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLegalEntities.map((entity) => (
                      <TableRow key={entity.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                        <TableCell className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={cn('h-10 w-10 rounded-lg', DASHBOARD_TABLE_ICON_WRAP_CLASS)}>
                              <Landmark className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{entity.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-sm text-gray-900 dark:text-white">{entity.entityType}</TableCell>
                        <TableCell className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono tabular-nums">{entity.kvk ?? '—'}</TableCell>
                        <TableCell className="py-4 px-4 text-sm text-gray-900 dark:text-white tabular-nums">{entity.propertyCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </DashboardTableBlock>
          )}

        </CardContent>
      </Card>

      {/* ── Floating bulk-assign bar (Invoerpunt 2) ───────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-40 pointer-events-none">
          <div className="pointer-events-auto bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-lg w-full mx-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 shrink-0">
              {selectedIds.size} geselecteerd
            </span>
            <div className="flex-1 min-w-0">
              <Select value={bulkTargetPfId} onValueChange={setBulkTargetPfId}>
                <SelectTrigger className="h-9 rounded-xl text-sm border-gray-200 dark:border-neutral-700">
                  <SelectValue placeholder="Kies portefeuille…" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((pf) => (
                    <SelectItem key={pf.id} value={pf.id}>{pf.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button
              type="button"
              onClick={handleBulkAssign}
              disabled={!bulkTargetPfId || bulkAssigning}
              className="text-sm font-semibold bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-3 py-1.5 disabled:opacity-40 shrink-0 transition-colors"
            >
              {bulkAssigning ? 'Bezig…' : 'Indelen'}
            </button>
            <button
              type="button"
              onClick={() => { setSelectedIds(new Set()); setBulkTargetPfId('') }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <NewPortfolioDialog
        open={newPortfolioOpen}
        onClose={() => setNewPortfolioOpen(false)}
        onCreated={(pf) => {
          setPortfolios((prev) => [
            ...prev,
            { id: pf.id, name: pf.name, owner: pf.owner, entityType: pf.entityType, kvk: undefined, description: null, properties: [] },
          ])
          setNewPortfolioOpen(false)
          setExpandedPortfolioId(pf.id)
        }}
      />

      <NewPropertyDialog
        open={newPropertyOpen}
        onOpenChange={(v) => { setNewPropertyOpen(v); if (!v) setNewPropertyPortfolioId(undefined) }}
        portfolios={portfolios.map((p) => ({ id: p.id, name: p.name }))}
        defaultPortfolioId={newPropertyPortfolioId}
        onCreated={async (formData) => {
          if (isDemo) {
            setNewPropertyOpen(false)
            setNewPropertyPortfolioId(undefined)
            router.push(`${basePath}/portfolio/properties/new`)
            return
          }
          setCreating(true)
          try {
            const { user } = await getUser()
            if (!user) { router.push('/login'); return }
            const newProp = await propertyQueries.create({
              owner_id: user.id,
              name: formData.name || formData.address || 'Nieuw pand',
              address: formData.address,
              postcode: formData.postcode || null,
              city: formData.city || null,
              type: formData.type,
              build_year: formData.build_year ? parseInt(formData.build_year) : null,
              woz_value: formData.woz_value ? parseFloat(formData.woz_value) : null,
              energy_label: formData.energy_label || null,
              ean_electricity: formData.ean_electricity?.trim() || null,
              ean_gas: formData.ean_gas?.trim() || null,
              portfolio_id: formData.portfolio_id || null,
            } as never)

            // Update local state immediately
            const pfId = formData.portfolio_id || null
            const pf = pfId ? portfolios.find((p) => p.id === pfId) : null
            const newRow: PropertyRow = {
              id: newProp.id,
              name: (newProp as any).name || formData.name || formData.address,
              address: (newProp as any).address || formData.address,
              type: (newProp as any).type || formData.type,
              units: [],
              portfolio_id: pfId,
              portfolioName: pf?.name,
            }
            setAllProperties((prev) => [newRow, ...prev])
            if (pfId) {
              setPortfolios((prev) =>
                prev.map((p) => p.id === pfId ? { ...p, properties: [newRow, ...p.properties] } : p)
              )
            } else {
              setUnassigned((prev) => [newRow, ...prev])
            }

            setNewPropertyOpen(false)
            setNewPropertyPortfolioId(undefined)
            setSelectedPropertyId(newProp.id)
          } catch (err) {
            console.error('Pand aanmaken mislukt:', err)
          } finally {
            setCreating(false)
          }
        }}
      />

      <PropertyDetailSheet
        propertyId={selectedPropertyId}
        open={!!selectedPropertyId}
        onClose={() => setSelectedPropertyId(null)}
        onDeleted={() => {
          setSelectedPropertyId(null)
          getUser().then(({ user }) => {
            if (!user) return
            propertyQueries.getByOwner(user.id).then((props) => {
              const all = props.map((p: any) => ({
                id: p.id, name: p.name, address: p.address,
                postcode: p.postcode, city: p.city, type: p.type,
                units: p.units || [], portfolio_id: null,
              }))
              setAllProperties(all)
            }).catch(console.error)
          })
        }}
      />

      {/* Assign existing properties to a portfolio (Invoerpunt 3) */}
      <AssignPropertiesDialog
        open={assignPickerOpen}
        onOpenChange={setAssignPickerOpen}
        portfolioName={portfolios.find((p) => p.id === assignPickerPortfolioId)?.name ?? ''}
        properties={unassigned.map((p) => ({ id: p.id, name: p.name, address: p.address }))}
        onAssign={async (ids) => {
          if (assignPickerPortfolioId) {
            await handleAssignFromAccordion(assignPickerPortfolioId, ids)
          }
        }}
      />
    </>
  )
}
