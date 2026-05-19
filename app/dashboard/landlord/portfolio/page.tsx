'use client'

import { useState, useEffect, Fragment, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Plus,
  MapPin,
  Grid3x3,
  Table2,
  ChevronRight,
  ChevronDown,
  Filter,
  Landmark,
  Euro,
  Home,
  Briefcase,
  Layers,
  X,
  Search,
} from 'lucide-react'
import { useSortable, applySortedRows, SortableHeader } from '@/components/ui/sortable-table'
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableHeadCell, DataTableEmpty } from '@/components/ui/data-table'
import { getUser } from '@/lib/supabase/auth'
import { propertyQueries, portfolioQueries, legalEntityQueries } from '@/lib/supabase/queries'
import {
  dashboardCardClass,
  DASHBOARD_TABLE_ICON_WRAP_CLASS,
  DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS,
  DASHBOARD_FILTER_TRIGGER_BUTTON_CLASS,
  DASHBOARD_FILTER_MENU_CONTENT_CLASS,
  DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS,
} from '@/app/dashboard/landlord/dashboard-ui'

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
import { mockProperties, mockPortfolios, mockLegalEntities } from '@/lib/mock-data/vastgoed'
import { TabNav } from '@/components/ui/tab-nav'

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

function getPropertyStatus(prop: PropertyRow): string {
  if (prop.units.length === 0) return 'leegstand'
  const statuses = prop.units.map((u) => u.status ?? 'leegstand')
  if (statuses.some((s) => s === 'achterstand')) return 'achterstand'
  if (statuses.every((s) => s === 'verhuurd')) return 'verhuurd'
  if (statuses.every((s) => s === 'leegstand' || s === 'beëindigd')) return 'leegstand'
  return 'gemengd'
}


// ─── Component ───────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const router = useRouter()
  const { basePath, isDemo } = useDashboardUser()

  const [activeSegment, setActiveSegment] = useState<PortfolioSegment>('portefeuilles')

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
  const { sort: propSort, toggleSort } = useSortable<string>()
  const { sort: legalSortState, toggleSort: toggleLegalSort } = useSortable<string>()

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

  // ── Search ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [searchExpanded, setSearchExpanded] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)


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
          const demoEntities: LegalEntityRow[] = mockLegalEntities.map((le) => ({
            id: le.id,
            name: le.name,
            entityType: le.type,
            kvk: le.kvk,
            propertyCount: mockPortfolios
              .filter((pf) => pf.legalEntityId === le.id)
              .reduce((sum, pf) => sum + pf.propertyIds.length, 0),
          }))
          setPortfolios(pfs)
          setUnassigned(unassignedProps)
          setAllProperties(all)
          setLegalEntities(demoEntities)
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

  // ── Filtered + sorted properties (Alle objecten tab) ──────────────────────
  const filteredProperties = allProperties.filter((p) => {
    const key = (p.type === 'appartement' || p.type === 'huis' ? p.type : 'overig') as string
    if (typeFilter[key] === false) return false
    if (search) {
      const q = search.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !p.address.toLowerCase().includes(q)) return false
    }
    return true
  })

  const filteredPortfolios = portfolios.filter((pf) =>
    !search || pf.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredLegalEntities = useMemo(() =>
    legalEntities.filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()))
  , [legalEntities, search])

  const sortedProperties = applySortedRows(filteredProperties, propSort, (p, k) => {
    if (k === 'name') return p.name
    if (k === 'type') return p.type
    if (k === 'units') return p.units.length
    if (k === 'income') return getMonthlyIncome(p)
    return null
  })

  const sortedLegalEntities = useMemo(() =>
    applySortedRows(filteredLegalEntities, legalSortState, (e, k) => {
      if (k === 'name') return e.name
      if (k === 'entityType') return e.entityType
      if (k === 'kvk') return e.kvk ?? ''
      if (k === 'propertyCount') return e.propertyCount
      return null
    })
  , [filteredLegalEntities, legalSortState])

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


  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>

      {/* ── KPI strip ─────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { Icon: Briefcase, label: 'Portefeuilles', value: portfolios.length },
            { Icon: Building2, label: 'Objecten', value: totalObjects },
            { Icon: Euro, label: 'Maandhuur', value: `€${totalMonthlyRent.toLocaleString('nl-NL')}` },
            { Icon: Home, label: 'Bezetting', value: `${occupancyRate}%` },
          ].map(({ Icon, label, value }) => (
            <div
              key={label}
              className="bg-[#f4f4f4] dark:bg-neutral-800 rounded-2xl px-4 pt-3 pb-4 flex flex-col justify-between min-h-[110px]"
            >
              <div className="flex justify-end">
                <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-[#163300] dark:text-[#9FE870] leading-tight">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className={cn(dashboardCardClass(undefined, isDemo), 'overflow-hidden')}>
        <CardHeader className={cn('space-y-3', DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {/* Tabs */}
            <TabNav
              tabs={[
                { id: 'portefeuilles',  label: 'Portefeuilles',  count: portfolios.length },
                { id: 'objecten',       label: 'Alle objecten',  count: allProperties.length },
                { id: 'rechtspersonen', label: 'Rechtspersonen', count: legalEntities.length },
              ]}
              activeTab={activeSegment}
              onChange={(id) => { setActiveSegment(id as PortfolioSegment); setSelectedIds(new Set()) }}
              className="w-full sm:w-auto"
            />

            {/* Controls per tab */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Search — collapsible, universal across tabs */}
              <div className="flex flex-row-reverse items-center">
                <button
                  type="button"
                  onClick={() => { setSearchExpanded(true); setTimeout(() => searchRef.current?.focus(), 0) }}
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
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onBlur={() => { if (!search) setSearchExpanded(false) }}
                    onKeyDown={(e) => { if (e.key === 'Escape') { setSearch(''); setSearchExpanded(false) } }}
                    placeholder="Zoeken…"
                    className="pl-3 pr-3 h-8 w-40 rounded-full text-xs bg-gray-100 dark:bg-neutral-800 border-0 focus:outline-none focus:ring-2 focus:ring-[#9FE870]/40 text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {activeSegment === 'portefeuilles' && (
                <Button
                  onClick={() => setNewPortfolioOpen(true)}
                  className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 sm:px-5 h-9 text-sm font-medium ml-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe portefeuille
                </Button>
              )}
              {activeSegment === 'objecten' && (
                <>
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
                    onClick={() => setNewPropertyOpen(true)}
                    disabled={creating}
                    className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 sm:px-5 h-9 text-sm font-medium ml-1"
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
          {activeSegment === 'portefeuilles' && (() => {
            const PF_COLS = 'grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_2rem]'
            if (loading) return (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            )
            if (portfolios.length === 0 && unassigned.length === 0) return (
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
            )
            return (
              <DataTable>
                <DataTableHeader cols={PF_COLS}>
                  <DataTableHeadCell>Portefeuille</DataTableHeadCell>
                  <DataTableHeadCell>Objecten</DataTableHeadCell>
                  <DataTableHeadCell>Maandhuur</DataTableHeadCell>
                  <DataTableHeadCell>Bezetting</DataTableHeadCell>
                  <span />
                </DataTableHeader>
                <DataTableBody>
                  {filteredPortfolios.length === 0 && unassigned.length === 0 ? (
                    <DataTableEmpty>Geen portefeuilles gevonden.</DataTableEmpty>
                  ) : (
                    <>
                      {filteredPortfolios.map((pf) => {
                        const income = portfolioIncome(pf)
                        const occ = getOccupancy(pf.properties)
                        const isExpanded = expandedPortfolioId === pf.id
                        return (
                          <div key={pf.id}>
                            <DataTableRow cols={PF_COLS} onClick={() => setExpandedPortfolioId(isExpanded ? null : pf.id)}>
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-8 w-8 rounded-xl shrink-0 bg-[#163300]/8 dark:bg-[#9FE870]/10 flex items-center justify-center">
                                  <Briefcase className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{pf.name}</span>
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
                              </div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{pf.properties.length}</p>
                              <p className="text-sm font-semibold text-[#163300] dark:text-[#9FE870]">€{income.toLocaleString('nl-NL')}</p>
                              <div className="flex items-center gap-2">
                                <div className="w-14 h-1.5 rounded-full bg-gray-100 dark:bg-neutral-700 overflow-hidden">
                                  <div className="h-full rounded-full bg-[#163300] dark:bg-[#9FE870] transition-all" style={{ width: `${occ}%` }} />
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{occ}%</p>
                              </div>
                              <ChevronDown className={cn('h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 justify-self-end', isExpanded && 'rotate-180')} />
                            </DataTableRow>

                            {isExpanded && (
                              <div className="bg-gray-50/60 dark:bg-neutral-900/40">
                                {pf.properties.length === 0 ? (
                                  <div className="px-12 py-5 text-sm text-gray-400 dark:text-gray-500 flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Geen panden in deze portefeuille
                                  </div>
                                ) : pf.properties.map((prop, idx) => {
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
                                          <MapPin className="h-3 w-3" />{prop.address}
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
                                })}
                                <div className="px-12 py-3 border-t border-gray-100 dark:border-neutral-800 flex items-center gap-4 flex-wrap">
                                  {unassigned.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => { setAssignPickerPortfolioId(pf.id); setAssignPickerOpen(true) }}
                                      className="text-xs text-[#163300] dark:text-[#9FE870] font-medium hover:underline flex items-center gap-1"
                                    >
                                      <Layers className="h-3.5 w-3.5" />
                                      Bestaand pand indelen
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => { setNewPropertyPortfolioId(pf.id); setNewPropertyOpen(true) }}
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

                      {unassigned.length > 0 && (
                        <div>
                          <DataTableRow cols={PF_COLS} onClick={() => setExpandedPortfolioId(expandedPortfolioId === '__unassigned' ? null : '__unassigned')}>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-8 w-8 rounded-xl shrink-0 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                                <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-gray-500 dark:text-gray-400 text-sm">Niet ingedeeld</span>
                                <p className="text-xs text-gray-400 mt-0.5">Objecten zonder portefeuille</p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{unassigned.length}</p>
                            <span />
                            <span />
                            <ChevronDown className={cn('h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 justify-self-end', expandedPortfolioId === '__unassigned' && 'rotate-180')} />
                          </DataTableRow>
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
                    </>
                  )}
                </DataTableBody>
              </DataTable>
            )
          })()}

          {/* ════════════════════════════════════════
              TAB: ALLE OBJECTEN
              ════════════════════════════════════════ */}
          {activeSegment === 'objecten' && (
            loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {[0, 1, 2].map((i) => <div key={i} className="h-40 bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <DataTable>
                <DataTableHeader cols="grid-cols-[1.5rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_2rem]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-[#163300] dark:accent-[#9FE870] cursor-pointer"
                    checked={sortedProperties.length > 0 && sortedProperties.every((p) => selectedIds.has(p.id))}
                    onChange={(e) => setSelectedIds(e.target.checked ? new Set(sortedProperties.map((p) => p.id)) : new Set())}
                  />
                  <SortableHeader label="Object" sortKey="name" sort={propSort} onSort={toggleSort} />
                  <SortableHeader label="Type" sortKey="type" sort={propSort} onSort={toggleSort} />
                  <DataTableHeadCell>Portefeuille</DataTableHeadCell>
                  <DataTableHeadCell>Status</DataTableHeadCell>
                  <SortableHeader label="Maandhuur" sortKey="income" sort={propSort} onSort={toggleSort} />
                  <span />
                </DataTableHeader>
                <DataTableBody>
                  {sortedProperties.length === 0 ? (
                    <DataTableEmpty>Geen objecten gevonden.</DataTableEmpty>
                  ) : sortedProperties.map((prop) => {
                    const status = getPropertyStatus(prop)
                    const income = getMonthlyIncome(prop)
                    return (
                      <DataTableRow
                        key={prop.id}
                        cols="grid-cols-[1.5rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_2rem]"
                        onClick={() => setSelectedPropertyId(prop.id)}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded accent-[#163300] dark:accent-[#9FE870] cursor-pointer"
                          checked={selectedIds.has(prop.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setSelectedIds((prev) => {
                              const next = new Set(prev)
                              if (e.target.checked) next.add(prop.id)
                              else next.delete(prop.id)
                              return next
                            })
                          }
                        />
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{prop.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />{prop.address}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 capitalize truncate">{prop.type}</p>
                        <div>
                          {prop.portfolioName ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#163300]/8 dark:bg-[#9FE870]/10 text-[#163300] dark:text-[#9FE870]">
                              {prop.portfolioName}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                        <div>
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                            status === 'verhuurd' && 'bg-[#163300]/10 text-[#163300] dark:bg-[#9FE870]/20 dark:text-[#9FE870]',
                            status === 'leegstand' && 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400',
                            status === 'achterstand' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                            status === 'gemengd' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                          )}>
                            {status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#163300] dark:text-[#9FE870]">
                          {income > 0 ? `€${income.toLocaleString('nl-NL')}` : <span className="text-gray-400">—</span>}
                        </p>
                        <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 justify-self-end" />
                      </DataTableRow>
                    )
                  })}
                </DataTableBody>
              </DataTable>
            )
          )}

          {/* ════════════════════════════════════════
              TAB: RECHTSPERSONEN
              ════════════════════════════════════════ */}
          {activeSegment === 'rechtspersonen' && (
            sortedLegalEntities.length === 0 ? (
              <div className="py-20 text-center">
                <Landmark className="h-10 w-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nog geen rechtspersonen</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Rechtspersonen worden beheerd via Instellingen</p>
              </div>
            ) : (
              <DataTable>
                <DataTableHeader cols="grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_2rem]">
                  <SortableHeader label="Rechtspersoon" sortKey="name" sort={legalSortState} onSort={toggleLegalSort} />
                  <SortableHeader label="Type" sortKey="entityType" sort={legalSortState} onSort={toggleLegalSort} />
                  <SortableHeader label="KvK" sortKey="kvk" sort={legalSortState} onSort={toggleLegalSort} />
                  <SortableHeader label="Objecten" sortKey="propertyCount" sort={legalSortState} onSort={toggleLegalSort} />
                  <span />
                </DataTableHeader>
                <DataTableBody>
                  {sortedLegalEntities.map((entity) => (
                    <DataTableRow key={entity.id} cols="grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_2rem]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                          <Landmark className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{entity.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{entity.entityType}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono tabular-nums">{entity.kvk ?? '—'}</p>
                      <p className="text-sm text-gray-900 dark:text-white tabular-nums">{entity.propertyCount}</p>
                      <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 justify-self-end" />
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            )
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
