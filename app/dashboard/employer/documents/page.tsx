'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { DocumentCard, type DocumentCardDoc } from '@/components/documents/document-card'
import { mockDocuments } from '@/lib/mock-data/vastgoed'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { useDocumentPreview } from '@/providers/document-preview-provider'
import { documentQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { SectionHeroHeader } from '@/components/dashboard/section-hero-header'
import { SectionWidgetMenu, SectionWidgetMenuPlaceholder } from '@/components/dashboard/section-widget-menu'
import { Search, Filter, Grid3x3, Table2, Plus, FileText, Eye, Download, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

const DOC_TYPES = ['Contract', 'Keuring', 'Factuur', 'Verzekering', 'Overig'] as const
type SortKey = 'name' | 'type' | 'date'

export default function DocumentsPage() {
  const { isDemo } = useDashboardUser()
  const { previewDocId, openPreview } = useDocumentPreview()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortAsc, setSortAsc] = useState(false)
  const [typeFilter, setTypeFilter] = useState<Record<string, boolean>>({
    Contract: true,
    Keuring: true,
    Factuur: true,
    Verzekering: true,
    Overig: true,
  })
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [bulkCenter, setBulkCenter] = useState<number | null>(null)

  const [loadedDocuments, setLoadedDocuments] = useState<any[]>([])
  const documents = isDemo ? mockDocuments : loadedDocuments

  const refreshDocuments = () => {
    if (isDemo) return
    getUser().then(({ user }) => {
      if (user) {
        documentQueries.getByOwner(user.id).then((data) => setLoadedDocuments(data ?? [])).catch(() => setLoadedDocuments([]))
      }
    })
  }

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (isDemo) return
    refreshDocuments()
  }, [isDemo])

  useEffect(() => {
    const updateCenter = () => {
      if (!contentRef.current) return
      const rect = contentRef.current.getBoundingClientRect()
      setBulkCenter(rect.left + rect.width / 2)
    }
    updateCenter()
    window.addEventListener('resize', updateCenter)
    return () => {
      window.removeEventListener('resize', updateCenter)
    }
  }, [])

  useEffect(() => {
    if (!selectionMode || selectedIds.length === 0) return
    const id = requestAnimationFrame(() => {
      if (!contentRef.current) return
      const rect = contentRef.current.getBoundingClientRect()
      setBulkCenter(rect.left + rect.width / 2)
    })
    return () => cancelAnimationFrame(id)
  }, [selectionMode, selectedIds.length])

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: any) => {
      const matchesSearch = (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      const typeOk = typeFilter[doc.type] !== false
      return matchesSearch && typeOk
    })
  }, [documents, searchQuery, typeFilter])

  const sortedDocuments = useMemo(() => {
    const list = [...filteredDocuments]
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') {
        cmp = (a.name || '').localeCompare(b.name || '')
      } else if (sortKey === 'type') {
        cmp = (a.type || '').localeCompare(b.type || '')
      } else {
        const da = new Date(a.created_at || 0).getTime()
        const db = new Date(b.created_at || 0).getTime()
        cmp = da - db
      }
      return sortAsc ? cmp : -cmp
    })
    return list
  }, [filteredDocuments, sortKey, sortAsc])

  const toCardDoc = (doc: any): DocumentCardDoc => {
    const extracted = doc.extracted_data as Record<string, unknown> | null | undefined
    const amountDue = typeof extracted?.totalAmount === 'number' ? extracted.totalAmount : (extracted?.amountDue as number | undefined)
    const dueDate = (extracted?.dueDate as string) ?? (extracted?.date as string)
    return {
      id: doc.id,
      name: doc.name ?? doc.file_name ?? 'Document',
      type: doc.type ?? 'Overig',
      created_at: doc.created_at,
      uploadDate: doc.uploadDate,
      file_name: doc.file_name,
      mime_type: doc.mime_type ?? undefined,
      property: doc.property ?? doc.properties,
      amount_due: doc.type === 'Factuur' ? (amountDue ?? doc.amount_due ?? null) : null,
      due_date: doc.type === 'Factuur' ? (dueDate ?? doc.due_date ?? null) : null,
    }
  }

  const handleUploadClick = () => {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0 || isDemo) return
    setUploading(true)
    setUploadError(null)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.set('file', file)
        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          setUploadError(json.error || 'Upload mislukt')
          break
        }
      }
      refreshDocuments()
    } catch {
      setUploadError('Upload mislukt')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      if (prev) {
        setSelectedIds([])
      }
      return !prev
    })
  }

  const toggleSelectDoc = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const openDocumentUrl = async (docId: string, download: boolean) => {
    try {
      const res = await fetch(`/api/documents/${docId}/url${download ? '?download=1' : ''}`)
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.url) {
        if (json.error) alert(json.error)
        return
      }
      if (download) {
        const a = document.createElement('a')
        a.href = json.url
        a.download = ''
        a.rel = 'noopener noreferrer'
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        window.open(json.url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      alert(download ? 'Document kon niet worden gedownload.' : 'Document kon niet worden geopend.')
    }
  }


  const handleView = (doc: { id: string }) => {
    openPreview(doc.id)
  }

  const handleDownload = (doc: { id: string }) => {
    openDocumentUrl(doc.id, true)
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a)
    else {
      setSortKey(key)
      setSortAsc(key === 'date')
    }
  }

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null
    return sortAsc ? ' ↑' : ' ↓'
  }

  return (
    <>
      <div className="mb-8" ref={contentRef}>
        <SectionHeroHeader
          title="Documenten"
          className="mb-0"
          widgetMenu={
            <SectionWidgetMenu>
              <SectionWidgetMenuPlaceholder />
            </SectionWidgetMenu>
          }
        />
      </div>

      <Card className={dashboardCardClass(undefined, isDemo)}>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full min-w-0">
              <div className="relative flex-1 min-w-[140px] max-w-[220px] sm:max-w-[220px] flex h-9 items-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-3 pr-3">
                <Search className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
                <Input
                  placeholder="Zoek documenten..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-2 text-sm min-w-0 flex-1 bg-transparent py-0"
                />
              </div>
              {mounted ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      id="documents-filter-trigger"
                      type="button"
                      variant="outline"
                      className="inline-flex h-9 rounded-full border-gray-200 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-900 px-3 md:px-4"
                    >
                      <Filter className="h-4 w-4 md:mr-1.5" />
                      <span className="hidden md:inline">Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="rounded-2xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-soft px-2 py-2 min-w-[220px]"
                  >
                    <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Type
                    </DropdownMenuLabel>
                    <div className="space-y-1">
                      {DOC_TYPES.map((t) => (
                        <DropdownMenuCheckboxItem
                          key={t}
                          checked={typeFilter[t] !== false}
                          onCheckedChange={(v) => setTypeFilter((f) => ({ ...f, [t]: Boolean(v) }))}
                          className="flex items-center justify-between rounded-lg py-1.5 pl-8 pr-2 text-sm"
                        >
                          {t}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="inline-flex h-9 rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 md:px-4 items-center gap-1.5 min-w-[4.5rem]" aria-hidden />
              )}
              {/* Selecteer voor bulkacties */}
              <Button
                type="button"
                variant="outline"
                onClick={toggleSelectionMode}
                className={cn(
                  'h-9 rounded-full border-gray-200 dark:border-neutral-700 text-sm font-medium bg-white dark:bg-neutral-900 px-3 md:px-4',
                  selectionMode
                    ? 'text-[#163300] dark:text-[#9FE870] border-[#163300] dark:border-[#9FE870]'
                    : 'text-gray-700 dark:text-gray-200'
                )}
              >
                {selectionMode ? 'Annuleer' : 'Selecteer'}
              </Button>
              <div className={cn('flex flex-wrap items-center gap-3', !previewDocId && 'lg:ml-auto')}>
              <Button
                id="documents-view-mode-trigger"
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  'hidden md:inline-flex h-9 w-9 rounded-full border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200',
                  'hover:bg-[#f4f4f4] dark:hover:bg-neutral-800'
                )}
                onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                aria-label={viewMode === 'grid' ? 'Toon als tabel' : 'Toon als raster'}
              >
                {viewMode === 'grid' ? (
                  <Table2 className="h-4 w-4" />
                ) : (
                  <Grid3x3 className="h-4 w-4" />
                )}
              </Button>
              {!isDemo && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.csv,image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={uploading}
                    className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 sm:px-5 h-9 text-sm font-medium gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {uploading ? 'Bezig…' : 'Document uploaden'}
                  </Button>
                </>
              )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {uploadError && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{uploadError}</p>
          )}
          {sortedDocuments.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 py-8 text-center">
              {!isDemo ? 'Nog geen documenten. Klik op "Document uploaden" om te beginnen.' : 'Geen documenten in demomodus.'}
            </p>
          ) : viewMode === 'table' ? (
            <div className="rounded-block border-[0.5px] border-gray-200 dark:border-neutral-700 overflow-hidden">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('name')}>
                        Naam {getSortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('type')}>
                        Type {getSortIcon('type')}
                      </button>
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('date')}>
                        Datum {getSortIcon('date')}
                      </button>
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Pand
                    </TableHead>
                    <TableHead className="w-px py-3 pr-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Acties
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDocuments.map((doc) => {
                    const cardDoc = toCardDoc(doc)
                    const prop = doc.property ?? doc.properties
                    const address = prop?.address ?? null
                    const created = doc.created_at ? format(new Date(doc.created_at), 'd MMM yyyy', { locale: nl }) : '—'
                    return (
                      <TableRow
                        key={doc.id}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-800"
                      >
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-[#163300]/50 dark:text-[#9FE870]/50" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                              {cardDoc.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {cardDoc.type}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {created}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
                          {address || '—'}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-[#163300] dark:text-[#9FE870]"
                              onClick={() => handleView(doc)}
                              aria-label="Bekijken"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => handleDownload(doc)}
                              aria-label="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={toCardDoc(doc)}
                    onPreview={selectionMode ? undefined : () => handleView(doc)}
                    onDownload={selectionMode ? undefined : () => handleDownload(doc)}
                    skipPreviewFetch={isDemo}
                    selectionMode={selectionMode}
                    selected={selectedIds.includes(doc.id)}
                    onToggleSelect={() => toggleSelectDoc(doc.id)}
                  />
                ))}
              </div>
              {selectionMode && selectedIds.length > 0 && bulkCenter !== null && (
                <div
                  className="fixed bottom-6 z-30 pointer-events-none"
                  style={{ left: bulkCenter, transform: 'translateX(-50%)' }}
                >
                  <div className="pointer-events-auto inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-neutral-700 shadow-sm border border-gray-200/80 dark:border-neutral-600">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 tabular-nums">
                      {selectedIds.length} geselecteerd
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-500"
                      aria-label="Download geselecteerde documenten"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-500"
                      aria-label="Geselecteerde verwijderen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full px-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-600"
                      onClick={toggleSelectionMode}
                    >
                      Annuleer
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}



