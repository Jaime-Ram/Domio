'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FileText,
  Download,
  Eye,
  Filter,
  Grid3x3,
  Table2,
  MapPin,
  Home,
  FileCheck,
} from 'lucide-react'
import { mockDocuments } from '@/lib/mock-data/vastgoed'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { documentQueries } from '@/lib/supabase/queries'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  dashboardCardClass,
  DASHBOARD_TABLE_ICON_WRAP_CLASS,
  DASHBOARD_FILTER_TRIGGER_BUTTON_CLASS,
  DASHBOARD_FILTER_MENU_CONTENT_CLASS,
  DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS,
} from '@/app/dashboard/landlord/dashboard-ui'
import { useSortable, applySortedRows, SortableHeader } from '@/components/ui/sortable-table'
import { cn } from '@/lib/utils'

const DOC_TYPES = ['Contract', 'Keuring', 'Factuur', 'Verzekering', 'Overig'] as const

type DocumentRow = {
  id: string
  name: string
  type: string
  scope: string
  created_at: string
  storage_path: string | null
  scopeLabel: string | null
}

function getTypeBadge(type: string) {
  switch (type) {
    case 'Contract':
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400">Contract</Badge>
    case 'Keuring':
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400">Keuring</Badge>
    case 'Factuur':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400">Factuur</Badge>
    case 'Verzekering':
      return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400">Verzekering</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

function getScopeIcon(scope: string) {
  if (scope === 'lease') return <FileCheck className="h-3 w-3 shrink-0" />
  if (scope === 'unit') return <Home className="h-3 w-3 shrink-0" />
  return <MapPin className="h-3 w-3 shrink-0" />
}

async function openDocumentUrl(id: string, download: boolean) {
  const res = await fetch(`/api/documents/${id}/url${download ? '?download=1' : ''}`)
  if (!res.ok) return
  const { url } = await res.json()
  if (url) window.open(url, '_blank')
}

export default function TenantDocumentsPage() {
  const { user, isDemo } = useDashboardUser()
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [typeFilter, setTypeFilter] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DOC_TYPES.map((t) => [t, true]))
  )
  const { sort: docSort, toggleSort } = useSortable<string>('created_at', 'desc')

  useEffect(() => {
    if (isDemo) {
      setDocuments(
        mockDocuments.map((d: any) => ({
          id: d.id,
          name: d.name,
          type: d.type ?? 'Overig',
          scope: 'property',
          created_at: d.uploadDate ? new Date(d.uploadDate).toISOString() : new Date().toISOString(),
          storage_path: null,
          scopeLabel: d.property?.address ?? d.property?.name ?? null,
        }))
      )
      setLoading(false)
      return
    }
    if (!user?.id) {
      setDocuments([])
      setLoading(false)
      return
    }
    documentQueries
      .getByTenant()
      .then((rows) => {
        setDocuments(
          (rows || []).map((d: any) => {
            let scopeLabel: string | null = null
            if (d.scope === 'property') scopeLabel = d.properties?.address ?? d.properties?.name ?? null
            else if (d.scope === 'unit') scopeLabel = d.units?.unit_number ? `Eenheid ${d.units.unit_number}` : null
            else if (d.scope === 'lease') scopeLabel = 'Huurcontract'
            return {
              id: d.id,
              name: d.name,
              type: d.type ?? 'Overig',
              scope: d.scope ?? 'property',
              created_at: d.created_at,
              storage_path: d.storage_path ?? null,
              scopeLabel,
            }
          })
        )
      })
      .finally(() => setLoading(false))
  }, [user?.id, isDemo])

  const filteredDocuments = useMemo(() =>
    documents.filter((d) => typeFilter[d.type] !== false)
  , [documents, typeFilter])

  const sortedDocuments = useMemo(() =>
    applySortedRows(filteredDocuments, docSort, (d, k) => {
      if (k === 'name') return d.name
      if (k === 'type') return d.type
      if (k === 'created_at') return new Date(d.created_at).getTime()
      return null
    })
  , [filteredDocuments, docSort])

  const renderActions = (d: DocumentRow, layout: 'inline' | 'stack' = 'inline') => (
    <div className={cn('flex gap-2', layout === 'stack' ? 'flex-col w-full mt-3' : 'justify-end flex-wrap')}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn('rounded-full', layout === 'stack' && 'w-full justify-center')}
        disabled={!d.storage_path && !isDemo}
        onClick={() => !isDemo && openDocumentUrl(d.id, false)}
      >
        <Eye className="h-4 w-4 mr-1" />
        Bekijken
      </Button>
      <Button
        type="button"
        size="sm"
        className={cn('rounded-full bg-[#c8e957] text-[#1d3014] hover:bg-[#8AD45F]', layout === 'stack' && 'w-full justify-center')}
        disabled={!d.storage_path && !isDemo}
        onClick={() => !isDemo && openDocumentUrl(d.id, true)}
      >
        <Download className="h-4 w-4 mr-1" />
        Download
      </Button>
    </div>
  )

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-[#1d3014] dark:text-[#c8e957]">Documenten</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredDocuments.length} van {documents.length} document{documents.length === 1 ? '' : 'en'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto min-w-0">
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
              className={cn(DASHBOARD_FILTER_MENU_CONTENT_CLASS, 'max-h-[min(70vh,420px)] overflow-y-auto')}
            >
              <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Type
              </DropdownMenuLabel>
              <div className="space-y-1">
                {DOC_TYPES.map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={typeFilter[key] !== false}
                    onCheckedChange={(v) => setTypeFilter((f) => ({ ...f, [key]: Boolean(v) }))}
                    onSelect={(e) => e.preventDefault()}
                    className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
                  >
                    {key}
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
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl overflow-hidden">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 bg-gray-200 dark:bg-neutral-700 rounded-block animate-pulse" />
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          sortedDocuments.length === 0 ? null : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedDocuments.map((d) => (
                <Card
                  key={d.id}
                  className={cn(
                    dashboardCardClass('transition-colors', isDemo),
                    'rounded-block border-[0.5px] border-gray-200 dark:border-neutral-700'
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn('h-10 w-10 rounded-lg shrink-0', DASHBOARD_TABLE_ICON_WRAP_CLASS)}>
                        <FileText className="h-5 w-5 text-[#1d3014] dark:text-[#c8e957]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-semibold text-[#1d3014] dark:text-[#c8e957] line-clamp-2">
                          {d.name}
                        </CardTitle>
                        {d.scopeLabel ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 truncate">
                            {getScopeIcon(d.scope)}
                            <span className="truncate">{d.scopeLabel}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">{getTypeBadge(d.type)}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      {format(new Date(d.created_at), 'd MMM yyyy', { locale: nl })}
                    </p>
                    {renderActions(d, 'stack')}
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : sortedDocuments.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">Geen documenten gevonden.</div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 mx-1 px-3 pb-2 border-b border-gray-100 dark:border-neutral-800">
              <SortableHeader label="Naam" sortKey="name" sort={docSort} onSort={toggleSort} />
              <SortableHeader label="Type" sortKey="type" sort={docSort} onSort={toggleSort} />
              <SortableHeader label="Datum" sortKey="created_at" sort={docSort} onSort={toggleSort} />
              <span className="text-sm font-medium text-gray-400 dark:text-gray-500 text-right">Acties</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {sortedDocuments.map((d) => (
                <div
                  key={d.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 mx-1 px-3 py-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{d.name}</p>
                      {d.scopeLabel ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                          {getScopeIcon(d.scope)}{d.scopeLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div>{getTypeBadge(d.type)}</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {format(new Date(d.created_at), 'd MMM yyyy', { locale: nl })}
                  </p>
                  <div>{renderActions(d, 'inline')}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
