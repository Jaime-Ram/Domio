'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronRight,
  AlertCircle,
  X,
  CheckCircle2,
  Mail,
  RotateCcw,
  Loader2,
  Trash2,
} from 'lucide-react'
import { mockTenants } from '@/lib/mock-data/vastgoed'
import { cn } from '@/lib/utils'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { tenantQueries } from '@/lib/supabase/queries'
import {
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS } from '@/app/dashboard/landlord/dashboard-ui'
import { TableToolbar } from '@/components/dashboard/table-toolbar'
import { TenantDetailSheet } from '@/components/tenants/tenant-detail-sheet'
import { NewTenantDialog, type CreatedTenantPayload } from '@/components/tenants/new-tenant-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { DialogField } from '@/components/ui/dialog-field'
import { Input } from '@/components/ui/input'
import { useSortable, applySortedRows } from '@/components/ui/sortable-table'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table-grid'

type TenantRow = {
  id: string
  name: string
  email: string
  phone: string
  propertyName: string
  unitNumber: string
  monthlyRent: number
  startDate: string | null
  endDate: string | null
  status: string
  balance?: number
  portalStatus: 'niet_uitgenodigd' | 'uitgenodigd' | 'actief' | 'ingetrokken'
  profileId: string | null
}

function TenantsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isDemo, basePath } = useDashboardUser()
  const [tenants, setTenants] = useState<TenantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [invitingIds, setInvitingIds] = useState<Set<string>>(new Set())
  const [emailDialogTenantId, setEmailDialogTenantId] = useState<string | null>(null)
  const [emailDialogValue, setEmailDialogValue] = useState('')
  const [emailDialogSaving, setEmailDialogSaving] = useState(false)

  const { sort: tenantSort, toggleSort } = useSortable<string>()

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
  const [deleteTenant, setDeleteTenant] = useState<TenantRow | null>(null)
  const [deletingTenant, setDeletingTenant] = useState(false)

  const handleDeleteTenant = async () => {
    if (!deleteTenant) return
    setDeletingTenant(true)
    try {
      if (!isDemo) await tenantQueries.delete(deleteTenant.id)
      setTenants((prev) => prev.filter((t) => t.id !== deleteTenant.id))
      setDeleteTenant(null)
    } catch (e) { console.error(e) }
    finally { setDeletingTenant(false) }
  }
  const [leaseLinkError, setLeaseLinkError] = useState<string | null>(null)


  useEffect(() => {
    if (searchParams.get('nieuw') === '1') {
      setNewTenantOpen(true)
      router.replace(`${basePath}/tenants`, { scroll: false })
    }
    const tenantParam = searchParams.get('tenant')
    if (tenantParam) {
      setSelectedTenantId(tenantParam)
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
        unitNumber: '',
        monthlyRent: t.lease?.monthlyRent ?? 0,
        startDate: t.lease?.startDate ?? null,
        endDate: t.lease?.endDate ?? null,
        status: t.status ?? 'actief',
        balance: t.balance ?? 0,
        portalStatus: 'actief' as const,
        profileId: null,
      })))
      setLoading(false)
      return
    }
    if (!user?.id) {
      setLoading(false)
      return
    }
    tenantQueries.getByOwnerWithLeases(user.id).then((tenantData) => {
      const rows: TenantRow[] = (tenantData || []).map((t: any) => {
        const allLeases = (t.lease_tenants ?? []).flatMap((lt: any) => lt.leases ? [lt.leases] : [])
        const lease =
          allLeases.find((l: any) => l.status === 'actief') ??
          allLeases.find((l: any) => l.status === 'concept') ??
          allLeases[0] ?? null
        return {
          id: t.id,
          name: t.full_name ?? '',
          email: t.email ?? '',
          phone: t.phone ?? '',
          propertyName: lease?.units?.properties?.name ?? '',
          unitNumber: lease?.units?.unit_number ?? '',
          monthlyRent: lease?.monthly_rent ?? 0,
          startDate: lease?.start_date ?? null,
          endDate: lease?.end_date ?? null,
          status: lease?.status ?? 'geen contract',
          portalStatus: t.portal_status ?? 'niet_uitgenodigd',
          profileId: t.profile_id ?? null,
        }
      })
      setTenants(rows)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user?.id, isDemo])

  const onTenantCreated = (t: CreatedTenantPayload) => {
    setTenants((prev) => [
      {
        id: t.id,
        name: t.full_name,
        email: t.email ?? '',
        phone: t.phone ?? '',
        propertyName: t.propertyName ?? '',
        unitNumber: '',
        monthlyRent: t.monthlyRent ?? 0,
        startDate: t.startDate ?? null,
        endDate: null,
        status: 'actief',
        balance: 0,
        portalStatus: 'niet_uitgenodigd' as const,
        profileId: null,
      },
      ...prev,
    ])
    if (!isDemo && t.leaseLinkFailed) {
      setLeaseLinkError(`${t.full_name} is aangemaakt, maar koppeling aan het object is mislukt. Koppel een huurovereenkomst via het object of via de huurdersheet.`)
    }
  }

  const openEmailDialog = (tenantId: string) => {
    setEmailDialogTenantId(tenantId)
    setEmailDialogValue('')
  }

  const submitEmailAndInvite = async () => {
    if (!emailDialogTenantId || !emailDialogValue.trim()) return
    setEmailDialogSaving(true)
    try {
      await tenantQueries.update(emailDialogTenantId, { email: emailDialogValue.trim() } as any)
      setTenants((prev) => prev.map((t) =>
        t.id === emailDialogTenantId ? { ...t, email: emailDialogValue.trim() } : t
      ))
      setEmailDialogTenantId(null)
      await sendInvite(emailDialogTenantId)
    } catch {
      // keep dialog open on failure
    } finally {
      setEmailDialogSaving(false)
    }
  }

  const sendInvite = async (tenantId: string) => {
    setInvitingIds((s) => new Set(s).add(tenantId))
    try {
      const res = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })
      if (!res.ok) throw new Error(await res.text())
      setTenants((prev) => prev.map((t) =>
        t.id === tenantId ? { ...t, portalStatus: 'uitgenodigd' } : t
      ))
    } catch {
      // keep existing status on failure
    } finally {
      setInvitingIds((s) => { const n = new Set(s); n.delete(tenantId); return n })
    }
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

  const sortedTenants = applySortedRows(filteredTenants, tenantSort, (t, k) => {
    if (k === 'name') return t.name ?? ''
    if (k === 'unit') return t.unitNumber ?? t.propertyName ?? ''
    if (k === 'rent') return t.monthlyRent ?? 0
    if (k === 'status') return t.status ?? ''
    return null
  })

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

  const tenantColumns: DataTableColumn<any>[] = [
    {
      key: 'name', header: 'Huurder', sortable: true, width: 'minmax(0,2fr)',
      render: (tenant) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">{tenant.name}</p>
            <a
              href={`mailto:${tenant.email}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-block max-w-full text-xs text-gray-500 dark:text-gray-400 truncate leading-tight mt-0.5 hover:text-[#163300] dark:hover:text-[#9FE870] hover:underline transition-colors"
            >{tenant.email}</a>
          </div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true, width: 'minmax(0,1fr)',
      render: (tenant) => (
        <span className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          tenant.status === 'actief'
            ? 'bg-[#2F5711] text-white'
            : tenant.status === 'concept'
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
            : tenant.status === 'geen contract'
            ? 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400'
            : 'bg-[#A8200D] text-white'
        )}>
          {tenant.status === 'concept' ? 'Uitgenodigd' : tenant.status === 'geen contract' ? 'Geen contract' : tenant.status === 'actief' ? 'Actief Contract' : tenant.status}
        </span>
      ),
    },
    {
      key: 'unit', header: 'Eenheid', sortable: true, width: 'minmax(0,1.5fr)',
      render: (tenant) => (
        tenant.unitNumber || tenant.propertyName ? (
          <>
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{tenant.unitNumber || '—'}</p>
            {tenant.propertyName && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{tenant.propertyName}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-600">—</p>
        )
      ),
    },
    {
      key: 'rent', header: 'Huurprijs', sortable: true, width: 'minmax(0,1fr)',
      render: (tenant) => (
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {tenant.monthlyRent ? `€${tenant.monthlyRent.toLocaleString('nl-NL')}` : '—'}
        </p>
      ),
    },
    {
      key: 'portaal', header: 'Portaal', width: 'minmax(0,1.4fr)',
      render: (tenant) => (
        <div onClick={(e) => e.stopPropagation()}>
          {tenant.profileId !== null ? (
            <div className="flex items-center gap-1.5 text-[#2F5711] dark:text-[#9FE870]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="text-xs font-medium">Actief</span>
            </div>
          ) : tenant.portalStatus === 'uitgenodigd' ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="text-xs font-medium">Uitgenodigd</span>
              <button
                onClick={() => sendInvite(tenant.id)}
                disabled={invitingIds.has(tenant.id)}
                title="Opnieuw sturen"
                className="ml-0.5 text-amber-400 hover:text-amber-600 dark:text-amber-500 dark:hover:text-amber-300 transition-colors disabled:opacity-50"
              >
                {invitingIds.has(tenant.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              </button>
            </div>
          ) : tenant.email ? (
            <button
              onClick={() => sendInvite(tenant.id)}
              disabled={invitingIds.has(tenant.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-[#163300] hover:text-[#163300] dark:hover:border-[#9FE870] dark:hover:text-[#9FE870] transition-colors disabled:opacity-50"
            >
              {invitingIds.has(tenant.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
              Uitnodigen
            </button>
          ) : (
            <button
              onClick={() => openEmailDialog(tenant.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-[#163300] hover:text-[#163300] dark:hover:border-[#9FE870] dark:hover:text-[#9FE870] transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              Uitnodigen
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      {leaseLinkError && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300 flex-1">{leaseLinkError}</p>
          <button type="button" onClick={() => setLeaseLinkError(null)} className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
            <div className="flex flex-col gap-8">
            <TableToolbar
              title="Huurders"
              count={`${filteredTenants.length} van ${tenants.length} huurder${tenants.length === 1 ? '' : 's'}`}
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Zoek huurder, e-mail, object…"
              filterContent={filterContent}
              onAdd={() => setNewTenantOpen(true)}
              addLabel="Nieuw contract"
            />

            <DataTable
              rows={sortedTenants}
              columns={tenantColumns}
              getRowId={(t) => t.id}
              sort={tenantSort}
              onSort={toggleSort}
              onRowClick={(t) => setSelectedTenantId(t.id)}
              empty="Geen huurders gevonden."
            />
            </div>

      <Dialog open={!!emailDialogTenantId} onOpenChange={(open) => { if (!open) setEmailDialogTenantId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>E-mailadres toevoegen</DialogTitle>
            <DialogDescription>
              Voer het e-mailadres in van{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {tenants.find((t) => t.id === emailDialogTenantId)?.name}
              </span>
              . De uitnodiging wordt daarna direct verstuurd.
            </DialogDescription>
          </DialogHeader>
          <DialogField label="E-mailadres" required>
            <Input
              type="email"
              placeholder="naam@voorbeeld.nl"
              value={emailDialogValue}
              onChange={(e) => setEmailDialogValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitEmailAndInvite() }}
              className="rounded-xl"
              autoFocus
            />
          </DialogField>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2">
                Annuleren
              </button>
            </DialogClose>
            <button
              onClick={submitEmailAndInvite}
              disabled={emailDialogSaving || !emailDialogValue.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#163300] text-white text-sm font-medium px-4 py-2 hover:bg-[#1e4a00] disabled:opacity-50 transition-colors"
            >
              {emailDialogSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Opslaan & uitnodigen
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewTenantDialog
        open={newTenantOpen}
        onClose={() => setNewTenantOpen(false)}
        onCreated={onTenantCreated}
      />
      <TenantDetailSheet
        tenantId={selectedTenantId}
        open={!!selectedTenantId}
        onClose={() => setSelectedTenantId(null)}
        onDeleted={(id) => setTenants((prev) => prev.filter((t) => t.id !== id))}
      />

      <Dialog open={!!deleteTenant} onOpenChange={(o) => { if (!o) setDeleteTenant(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Huurder verwijderen?</DialogTitle>
            <DialogDescription>
              {deleteTenant?.name} wordt permanent verwijderd. Dit kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" onClick={() => setDeleteTenant(null)}
              className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-3 py-2">
              Annuleren
            </button>
            <button type="button" onClick={handleDeleteTenant} disabled={deletingTenant}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 transition-colors">
              {deletingTenant ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Verwijderen
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

