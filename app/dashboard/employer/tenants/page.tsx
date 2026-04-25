'use client'

import { useState, useEffect, useMemo, Fragment, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronRight,
} from 'lucide-react'
import { mockTenants } from '@/lib/mock-data/vastgoed'
import { cn } from '@/lib/utils'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { leaseQueries } from '@/lib/supabase/queries'
import {
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS } from '@/app/dashboard/employer/dashboard-ui'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { TableToolbar } from '@/components/dashboard/table-toolbar'
import { TenantDetailSheet } from '@/components/tenants/tenant-detail-sheet'
import { NewTenantDialog, type CreatedTenantPayload } from '@/components/tenants/new-tenant-dialog'
import { HuurovereenkomstDialog } from '@/components/tenants/huurovereenkomst-dialog'

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

function TenantsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isDemo, basePath } = useDashboardUser()
  const [tenants, setTenants] = useState<TenantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  type SortColumn = 'name' | 'property' | 'rent' | 'status' | 'object'
  const [sort, setSort] = useState<{ column: SortColumn | null; direction: 'asc' | 'desc' | null }>({
    column: null,
    direction: null,
  })

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [balanceFilter, setBalanceFilter] = useState({
    opPeil: true,
    openstaand: true,
    teveelBetaald: true,
  })
  const [propertyFilter, setPropertyFilter] = useState<Record<string, boolean>>({})
  const [newTenantOpen, setNewTenantOpen] = useState(false)
  const [leaseDialogOpen, setLeaseDialogOpen] = useState(false)
  const [leaseDialogTenant, setLeaseDialogTenant] = useState<{ id: string; name: string; email?: string; phone?: string } | null>(null)
  const [pendingTenantNav, setPendingTenantNav] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('nieuw') === '1') {
      setNewTenantOpen(true)
      router.replace(`${basePath}/tenants`, { scroll: false })
    }
  }, [searchParams, router, basePath])

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

  const onTenantCreated = (t: CreatedTenantPayload) => {
    if (isDemo) {
      setTenants((prev) => [
        {
          id: t.id,
          name: t.full_name,
          email: t.email ?? '',
          phone: t.phone ?? '',
          propertyName: t.propertyName ?? '',
          monthlyRent: t.monthlyRent ?? 0,
          startDate: t.startDate ?? null,
          endDate: null,
          status: 'actief',
          balance: 0,
        },
        ...prev,
      ])
    } else {
      setPendingTenantNav(
        `${basePath}/tenants/${t.id}${t.leaseLinkFailed ? '?koppeling=mislukt' : ''}`
      )
    }
    setLeaseDialogTenant({ id: t.id, name: t.full_name, email: t.email ?? undefined, phone: t.phone ?? undefined })
    setLeaseDialogOpen(true)
  }

  const getBalanceCategory = (balance: number | undefined) => {
    const b = balance ?? 0
    if (b === 0) return 'opPeil' as const
    if (b < 0) return 'openstaand' as const
    return 'teveelBetaald' as const
  }

  const uniqueProperties = useMemo(() => {
    return [...new Set(tenants.map((t) => t.propertyName).filter(Boolean))].sort()
  }, [tenants])

  const filteredTenants = tenants.filter((tenant) => {
    const cat = getBalanceCategory(tenant.balance)
    if (!balanceFilter[cat]) return false
    if (tenant.propertyName && propertyFilter[tenant.propertyName] === false) return false
    if (search) {
      const q = search.toLowerCase()
      const match =
        tenant.name.toLowerCase().includes(q) ||
        tenant.email.toLowerCase().includes(q) ||
        tenant.propertyName.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

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

  const sortedTenants = [...filteredTenants]
  if (sort.column && sort.direction) {
    sortedTenants.sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1
      const val = (field: keyof TenantRow) => a[field]
      const valB = (field: keyof TenantRow) => b[field]

      switch (sort.column) {
        case 'name': {
          return dir * String(val('name') ?? '').localeCompare(String(valB('name') ?? ''), 'nl')
        }
        case 'property':
        case 'object': {
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
        <SectionNavDashboard title="Huurders" items={[]} titleVariant="hero" />
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Laden...</p>
        </div>
      </>
    )
  }

  const filterContent = (
    <>
      <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
        Saldo
      </DropdownMenuLabel>
      <div className="space-y-1">
        <DropdownMenuCheckboxItem
          checked={balanceFilter.openstaand}
          onCheckedChange={(v) => setBalanceFilter((f) => ({ ...f, openstaand: Boolean(v) }))}
          onSelect={(e) => e.preventDefault()}
          className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#A8200D' }} />
            <span>Openstaand</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{balanceCounts.openstaand}</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={balanceFilter.opPeil}
          onCheckedChange={(v) => setBalanceFilter((f) => ({ ...f, opPeil: Boolean(v) }))}
          onSelect={(e) => e.preventDefault()}
          className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#2F5711' }} />
            <span>Op peil</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{balanceCounts.opPeil}</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={balanceFilter.teveelBetaald}
          onCheckedChange={(v) => setBalanceFilter((f) => ({ ...f, teveelBetaald: Boolean(v) }))}
          onSelect={(e) => e.preventDefault()}
          className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#EDC843' }} />
            <span>Teveel betaald</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{balanceCounts.teveelBetaald}</span>
        </DropdownMenuCheckboxItem>
      </div>
      {uniqueProperties.length > 0 && (
        <>
          <DropdownMenuLabel className="px-2 pb-1 pt-3 text-xs font-medium text-gray-500 dark:text-gray-400">
            Object
          </DropdownMenuLabel>
          <div className="space-y-1">
            {uniqueProperties.map((prop) => (
              <DropdownMenuCheckboxItem
                key={prop}
                checked={propertyFilter[prop] !== false}
                onCheckedChange={(v) => setPropertyFilter((f) => ({ ...f, [prop]: Boolean(v) }))}
                onSelect={(e) => e.preventDefault()}
                className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
              >
                <span className="truncate max-w-[160px]">{prop}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {tenants.filter((t) => t.propertyName === prop).length}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </>
      )}
    </>
  )

  return (
    <>
            <SectionNavDashboard title="Huurders" items={[]} titleVariant="hero" />
            <div className="flex flex-col gap-8">
            <TableToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Zoek huurder, e-mail, object…"
              filterContent={filterContent}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onAdd={() => setNewTenantOpen(true)}
              addLabel="Nieuw contract"
            />

            {/* Lijst */}
            <div className="rounded-2xl overflow-hidden">
              {/* Grijs header */}
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_2rem] items-center gap-4 mx-1 px-3 pb-2 border-b border-gray-100 dark:border-neutral-800">
                <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Huurder {getSortIcon('name')}
                </button>
                <button type="button" onClick={() => toggleSort('object')} className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Object {getSortIcon('object')}
                </button>
                <button type="button" onClick={() => toggleSort('rent')} className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Huurprijs {getSortIcon('rent')}
                </button>
                <button type="button" onClick={() => toggleSort('status')} className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Status {getSortIcon('status')}
                </button>
                <span />
              </div>

              {/* Rijen */}
              {sortedTenants.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                  Geen huurders gevonden.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {sortedTenants.map((tenant) => (
                    <Fragment key={tenant.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedTenantId(tenant.id)}
                        className="w-full grid grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_2rem] items-center gap-4 mx-1 px-3 py-3.5 hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left rounded-xl"
                      >
                        {/* Huurder */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{tenant.name}</p>
                            <a
                              href={`mailto:${tenant.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-gray-500 dark:text-gray-400 truncate hover:text-[#163300] dark:hover:text-[#9FE870] hover:underline transition-colors"
                            >{tenant.email}</a>
                          </div>
                        </div>
                        {/* Object */}
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{tenant.propertyName}</p>
                        {/* Huurprijs */}
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          €{tenant.monthlyRent?.toLocaleString('nl-NL') || '0'}
                        </p>
                        {/* Status */}
                        <div>
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
                            tenant.status === 'actief' ? 'bg-[#2F5711]' : 'bg-[#A8200D]'
                          )}>
                            {tenant.status}
                          </span>
                        </div>
                        {/* Chevron */}
                        <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 justify-self-end" />
                      </button>
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
            </div>

      <NewTenantDialog
        open={newTenantOpen}
        onClose={() => setNewTenantOpen(false)}
        onCreated={onTenantCreated}
      />

      {leaseDialogTenant && (
        <HuurovereenkomstDialog
          open={leaseDialogOpen}
          onClose={() => { setLeaseDialogOpen(false); setLeaseDialogTenant(null) }}
          onCreated={() => { setLeaseDialogOpen(false); setLeaseDialogTenant(null) }}
          tenant={leaseDialogTenant}
        />
      )}

      <TenantDetailSheet
        tenantId={selectedTenantId}
        open={!!selectedTenantId}
        onClose={() => setSelectedTenantId(null)}
      />
    </>
  )
}

export default function TenantsPage() {
  return (
    <Suspense fallback={null}>
      <TenantsPageContent />
    </Suspense>
  )
}

