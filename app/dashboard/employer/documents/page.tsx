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
import {
  dashboardCardClass,
  DASHBOARD_TABLE_HEAD_SHADCN_CLASS,
  DASHBOARD_TABLE_ICON_WRAP_CLASS,
  DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS,
  DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS,
} from '@/app/dashboard/employer/dashboard-ui'
import { DashboardTableBlock } from '@/components/dashboard/dashboard-table-block'
import { DocumentCard, type DocumentCardDoc } from '@/components/documents/document-card'
import { DocumentTypeGlyph } from '@/components/documents/document-type-icon'
import { LocalPdfThumbnail } from '@/components/documents/local-pdf-thumbnail'
import { mockDocuments } from '@/lib/mock-data/vastgoed'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { useDocumentPreview } from '@/providers/document-preview-provider'
import { documentQueries } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { SectionHeroHeader } from '@/components/dashboard/section-hero-header'
import { Search, Filter, Grid3x3, Table2, Plus, Eye, Download, Trash2, Upload, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getLocalPreviewKind(file: File): 'image' | 'pdf' | 'other' {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'pdf'
  return 'other'
}

export default function DocumentsPage() {
  const { isDemo } = useDashboardUser()
  const { previewDocId, openPreview } = useDocumentPreview()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [dropActive, setDropActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  /** Bestanden gekozen in de popup; pas na bevestiging uploaden. */
  const [stagedUploadFiles, setStagedUploadFiles] = useState<File[]>([])
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
  /** Documenten waar nu een bulk-download of -verwijdering op bezig is (per id spinner op de kaart). */
  const [bulkProcessingIds, setBulkProcessingIds] = useState<string[]>([])
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

  /** Alleen voor afbeeldingen (blob-URL); PDF gebruikt LocalPdfThumbnail (geen iframe / geen zwarte viewerbalk). */
  const stagedImagePreviewUrls = useMemo(
    () =>
      stagedUploadFiles.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : '')),
    [stagedUploadFiles]
  )

  useEffect(() => {
    return () => {
      stagedImagePreviewUrls.forEach((u) => {
        if (u) URL.revokeObjectURL(u)
      })
    }
  }, [stagedImagePreviewUrls])

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

  /** Upload bevestigde bestanden; sluit dialoog alleen bij succes. */
  const uploadFilesWithClose = async (files: File[]) => {
    if (files.length === 0 || isDemo) return
    setUploading(true)
    setUploadError(null)
    let hadError = false
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
          hadError = true
          break
        }
      }
      if (!hadError) {
        setStagedUploadFiles([])
        refreshDocuments()
        setUploadDialogOpen(false)
      }
    } catch {
      setUploadError('Upload mislukt')
    } finally {
      setUploading(false)
    }
  }

  const addFilesToUploadStage = (files: File[]) => {
    if (files.length === 0) return
    setStagedUploadFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`))
      const merged = [...prev]
      for (const f of files) {
        const key = `${f.name}-${f.size}-${f.lastModified}`
        if (!seen.has(key)) {
          seen.add(key)
          merged.push(f)
        }
      }
      return merged
    })
    setUploadError(null)
  }

  const removeStagedFile = (index: number) => {
    setStagedUploadFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadClick = () => {
    setUploadError(null)
    setStagedUploadFiles([])
    setUploadDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    addFilesToUploadStage(files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDropActive(false)
    const files = Array.from(e.dataTransfer.files)
    addFilesToUploadStage(files)
  }

  const handleConfirmUpload = () => {
    if (stagedUploadFiles.length === 0) return
    void uploadFilesWithClose(stagedUploadFiles)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const toggleSelectionMode = () => {
    if (bulkProcessingIds.length > 0) return
    setSelectionMode((prev) => {
      if (prev) {
        setSelectedIds([])
      }
      return !prev
    })
  }

  const toggleSelectDoc = (id: string) => {
    if (bulkProcessingIds.length > 0) return
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

  const deleteDocumentById = async (docId: string, opts?: { quiet?: boolean }): Promise<boolean> => {
    if (isDemo) {
      if (!opts?.quiet) alert('In demomodus kun je geen documenten verwijderen.')
      return false
    }
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (!opts?.quiet) {
          alert(typeof json.error === 'string' ? json.error : 'Verwijderen mislukt')
        }
        return false
      }
      return true
    } catch {
      if (!opts?.quiet) alert('Verwijderen mislukt')
      return false
    }
  }

  const handleDelete = (doc: { id: string }) => {
    if (!window.confirm('Dit document permanent verwijderen?')) return
    void (async () => {
      const ok = await deleteDocumentById(doc.id)
      if (ok) refreshDocuments()
    })()
  }

  const handleBulkDownloadSelected = () => {
    if (selectedIds.length === 0 || bulkProcessingIds.length > 0) return
    if (isDemo) {
      alert('In demomodus kun je niet downloaden.')
      return
    }
    const ids = [...selectedIds]
    setBulkProcessingIds(ids)
    void (async () => {
      try {
        for (let i = 0; i < ids.length; i++) {
          if (i > 0) await new Promise((r) => setTimeout(r, 350))
          await openDocumentUrl(ids[i], true)
          setBulkProcessingIds((prev) => prev.filter((x) => x !== ids[i]))
        }
      } finally {
        setBulkProcessingIds([])
      }
    })()
  }

  const handleBulkDeleteSelected = () => {
    if (selectedIds.length === 0 || bulkProcessingIds.length > 0) return
    if (isDemo) {
      alert('In demomodus kun je niet verwijderen.')
      return
    }
    if (!window.confirm(`${selectedIds.length} document(en) permanent verwijderen?`)) return
    const ids = [...selectedIds]
    setBulkProcessingIds(ids)
    void (async () => {
      try {
        let failed = 0
        for (const id of ids) {
          const ok = await deleteDocumentById(id, { quiet: true })
          setBulkProcessingIds((prev) => prev.filter((x) => x !== id))
          if (!ok) failed++
        }
        if (failed > 0) {
          alert(
            failed === ids.length
              ? 'Verwijderen mislukt. Probeer het opnieuw.'
              : `${failed} van ${ids.length} document(en) konden niet worden verwijderd.`
          )
        }
        setSelectedIds([])
        setSelectionMode(false)
        refreshDocuments()
      } finally {
        setBulkProcessingIds([])
      }
    })()
  }

  const bulkBusy = bulkProcessingIds.length > 0

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

  const tableBleedDocuments = viewMode === 'table'

  return (
    <>
      <div className="mb-8" ref={contentRef}>
        <SectionHeroHeader title="Documenten" className="mb-0" />
      </div>

      <Card className={cn(dashboardCardClass(undefined, isDemo), 'overflow-hidden')}>
        <CardHeader
          className={cn(
            'space-y-3',
            tableBleedDocuments && DASHBOARD_TABLE_TOOLBAR_HEADER_SHADCN_CLASS
          )}
        >
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
                disabled={bulkBusy}
                className={cn(
                  'h-9 rounded-full border-gray-200 dark:border-neutral-700 text-sm font-medium bg-white dark:bg-neutral-900 px-3 md:px-4',
                  selectionMode
                    ? 'text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/60 hover:bg-red-50 dark:hover:bg-red-950/40'
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
                  <Dialog
                    open={uploadDialogOpen}
                    onOpenChange={(open) => {
                      setUploadDialogOpen(open)
                      if (!open) {
                        setUploadError(null)
                        setDropActive(false)
                        setStagedUploadFiles([])
                      }
                    }}
                  >
                    <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-0 gap-0 overflow-hidden [&>button]:inline-flex [&>button]:items-center [&>button]:justify-center [&>button]:p-0 [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-full [&>button]:bg-gray-100 [&>button]:text-gray-600 [&>button]:opacity-100 [&>button:hover]:bg-gray-200 [&>button:hover]:text-gray-900 dark:[&>button]:bg-neutral-800 dark:[&>button]:text-gray-300 dark:[&>button:hover]:bg-neutral-700 dark:[&>button:hover]:text-white">
                      <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                        <DialogTitle className="text-[#163300] dark:text-[#9FE870] text-lg">
                          Documenten uploaden
                        </DialogTitle>
                        <DialogDescription>
                          Kies bestanden en controleer de voorbeelden. Daarna upload je ze definitief naar je documenten.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="px-6 pb-2 flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto">
                        {stagedUploadFiles.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Te uploaden ({stagedUploadFiles.length})
                            </p>
                            <ul className="space-y-3">
                              {stagedUploadFiles.map((file, index) => {
                                const imageUrl = stagedImagePreviewUrls[index]
                                const kind = getLocalPreviewKind(file)
                                return (
                                  <li
                                    key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                                    className="flex gap-3 rounded-xl border border-gray-200 dark:border-neutral-600 bg-gray-50/80 dark:bg-neutral-800/80 p-3 pr-2"
                                  >
                                    <div className="w-[100px] h-[72px] shrink-0 rounded-lg overflow-hidden bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-700 flex items-center justify-center">
                                      {kind === 'image' && imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element -- lokale blob-preview vóór upload
                                        <img src={imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                                      ) : kind === 'pdf' ? (
                                        <LocalPdfThumbnail file={file} />
                                      ) : (
                                        <DocumentTypeGlyph
                                          name={file.name}
                                          file_name={file.name}
                                          mime_type={file.type || undefined}
                                          className="h-10 w-10 text-gray-400 dark:text-neutral-500"
                                        />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1 py-0.5">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatFileSize(file.size)}</p>
                                      {kind === 'other' && (
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                                          Voorbeeld niet beschikbaar; bestand wordt wel geüpload.
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 shrink-0 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                      onClick={() => removeStagedFile(index)}
                                      disabled={uploading}
                                      aria-label={`${file.name} uit lijst halen`}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          onDragEnter={(e) => {
                            e.preventDefault()
                            setDropActive(true)
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault()
                            if (e.currentTarget.contains(e.relatedTarget as Node)) return
                            setDropActive(false)
                          }}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          disabled={uploading}
                          className={cn(
                            'w-full rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#163300] focus-visible:ring-offset-2',
                            stagedUploadFiles.length > 0 ? 'py-5' : 'py-10',
                            dropActive
                              ? 'border-[#163300] bg-[#9FE870]/20 dark:bg-[#9FE870]/10'
                              : 'border-gray-200 dark:border-neutral-600 bg-gray-50/90 dark:bg-neutral-800/80 hover:border-[#163300]/50 hover:bg-gray-100/80 dark:hover:bg-neutral-800',
                            uploading && 'pointer-events-none opacity-70'
                          )}
                        >
                          <Upload
                            className={cn(
                              'mx-auto h-8 w-8 mb-2',
                              stagedUploadFiles.length > 0 ? 'mb-1.5' : 'mb-3 h-10 w-10',
                              dropActive ? 'text-[#163300] dark:text-[#9FE870]' : 'text-gray-400 dark:text-gray-500'
                            )}
                            aria-hidden
                          />
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {stagedUploadFiles.length > 0 ? 'Meer bestanden toevoegen' : 'Sleep bestanden hierheen'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            of klik om te bladeren · PDF, Word, afbeeldingen, CSV, …
                          </p>
                        </button>
                        {uploadError && (
                          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                            {uploadError}
                          </p>
                        )}
                      </div>
                      <DialogFooter className="px-6 pb-6 pt-3 flex-row flex-wrap justify-end gap-2 sm:gap-2 border-t border-gray-100 dark:border-neutral-800 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setUploadDialogOpen(false)}
                          disabled={uploading}
                        >
                          Annuleren
                        </Button>
                        {stagedUploadFiles.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                          >
                            Bestanden toevoegen
                          </Button>
                        )}
                        <Button
                          type="button"
                          className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] disabled:opacity-60"
                          onClick={stagedUploadFiles.length > 0 ? handleConfirmUpload : () => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading
                            ? 'Bezig met uploaden…'
                            : stagedUploadFiles.length > 0
                              ? `Definitief uploaden (${stagedUploadFiles.length})`
                              : 'Bestanden kiezen'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent
          className={cn(
            tableBleedDocuments && 'p-0 px-0 pb-0',
            tableBleedDocuments && DASHBOARD_TABLE_TOOLBAR_TO_TABLE_GAP_CLASS
          )}
        >
          {viewMode === 'table' ? (
            <DashboardTableBlock empty={sortedDocuments.length === 0}>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('name')}>
                        Naam {getSortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('type')}>
                        Type {getSortIcon('type')}
                      </button>
                    </TableHead>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('date')}>
                        Datum {getSortIcon('date')}
                      </button>
                    </TableHead>
                    <TableHead className={DASHBOARD_TABLE_HEAD_SHADCN_CLASS}>
                      Pand
                    </TableHead>
                    <TableHead
                      className={cn(DASHBOARD_TABLE_HEAD_SHADCN_CLASS, 'w-px pr-4 text-right')}
                    >
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
                            <div
                              className={cn(
                                'h-10 w-10 rounded-lg',
                                DASHBOARD_TABLE_ICON_WRAP_CLASS
                              )}
                            >
                              <DocumentTypeGlyph
                                name={cardDoc.name}
                                file_name={cardDoc.file_name}
                                mime_type={cardDoc.mime_type}
                                className="h-5 w-5 text-[#163300] dark:text-[#9FE870]"
                              />
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
            </DashboardTableBlock>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={toCardDoc(doc)}
                    onPreview={selectionMode ? undefined : () => handleView(doc)}
                    onDownload={selectionMode ? undefined : () => handleDownload(doc)}
                    onDelete={selectionMode ? undefined : () => handleDelete(doc)}
                    skipPreviewFetch={isDemo}
                    selectionMode={selectionMode}
                    selected={selectedIds.includes(doc.id)}
                    onToggleSelect={() => toggleSelectDoc(doc.id)}
                    bulkActionLoading={bulkProcessingIds.includes(doc.id)}
                  />
                ))}
              </div>
              {selectionMode && bulkCenter !== null && (
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
                      disabled={selectedIds.length === 0 || bulkBusy}
                      onClick={handleBulkDownloadSelected}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-500"
                      aria-label="Geselecteerde verwijderen"
                      disabled={selectedIds.length === 0 || bulkBusy}
                      onClick={handleBulkDeleteSelected}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full px-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                      disabled={bulkBusy}
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



