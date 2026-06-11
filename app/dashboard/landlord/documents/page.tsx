'use client'

import { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS } from '@/app/dashboard/landlord/dashboard-ui'
import { DocumentCard, type DocumentCardDoc } from '@/components/documents/document-card'
import { DocumentTypeGlyph } from '@/components/documents/document-type-icon'
import { LocalPdfThumbnail } from '@/components/documents/local-pdf-thumbnail'
import { mockDocuments } from '@/lib/mock-data/vastgoed'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { useDocumentPreview } from '@/providers/document-preview-provider'
import { documentQueries, propertyQueries, leaseQueries, ticketQueries } from '@/lib/supabase/queries'
import { supabase } from '@/lib/supabase/client'
import { getUser } from '@/lib/supabase/auth'
import { useSortable, applySortedRows } from '@/components/ui/sortable-table'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table-grid'
import { Eye, Download, Trash2, Upload, X, Plus, CheckSquare, Link2, ChevronDown, Search, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { TableToolbar } from '@/components/dashboard/table-toolbar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

const DOC_TYPES = ['Contract', 'Keuring', 'Factuur', 'Verzekering', 'Overig'] as const
type SortKey = 'name' | 'type' | 'date' | 'property'

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [dropActive, setDropActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  /** Bestanden gekozen in de popup; pas na bevestiging uploaden. */
  const [stagedUploadFiles, setStagedUploadFiles] = useState<File[]>([])
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const { sort: docSort, toggleSort } = useSortable<string>('date', 'desc')
  const [typeFilter, setTypeFilter] = useState<Record<string, boolean>>({
    Contract: true,
    Keuring: true,
    Factuur: true,
    Verzekering: true,
    Overig: true,
  })
  const [propertyFilter, setPropertyFilter] = useState<Record<string, boolean>>({})
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  /** Documenten waar nu een bulk-download of -verwijdering op bezig is (per id spinner op de kaart). */
  const [bulkProcessingIds, setBulkProcessingIds] = useState<string[]>([])

  type LinkType = 'property' | 'unit' | 'lease' | 'ticket'
  type LinkOption = { id: string; label: string; sublabel?: string }

  // Upload dialog link state
  const [linkEnabled, setLinkEnabled] = useState(false)
  const [linkType, setLinkType] = useState<LinkType>('property')
  const [linkSearch, setLinkSearch] = useState('')
  const [linkSelectedId, setLinkSelectedId] = useState<string | null>(null)
  const [linkOptions, setLinkOptions] = useState<LinkOption[]>([])
  const [linkOptionsLoading, setLinkOptionsLoading] = useState(false)

  // Assign dialog (for existing documents)
  const [assignDialogDoc, setAssignDialogDoc] = useState<{ id: string; name: string } | null>(null)
  const [assignType, setAssignType] = useState<LinkType>('property')
  const [assignSearch, setAssignSearch] = useState('')
  const [assignSelectedId, setAssignSelectedId] = useState<string | null>(null)
  const [assignOptions, setAssignOptions] = useState<LinkOption[]>([])
  const [assignOptionsLoading, setAssignOptionsLoading] = useState(false)
  const [assignSaving, setAssignSaving] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
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

  useEffect(() => {
    if (!linkEnabled || !linkType) return
    setLinkOptionsLoading(true)
    setLinkOptions([])
    setLinkSearch('')
    getUser().then(async ({ user }) => {
      if (!user) { setLinkOptionsLoading(false); return }
      try {
        if (linkType === 'property') {
          const props = await propertyQueries.getByOwner(user.id)
          setLinkOptions(props.map(p => ({ id: p.id, label: (p as any).name || p.address || 'Pand', sublabel: p.address })))
        } else if (linkType === 'unit') {
          const props = await propertyQueries.getByOwner(user.id)
          const propIds = props.map(p => p.id)
          if (propIds.length > 0) {
            const { data } = await supabase.from('units').select('id, unit_number, properties(name, address)').in('property_id', propIds)
            setLinkOptions((data || []).map((u: any) => ({
              id: u.id,
              label: u.unit_number ? `Eenheid ${u.unit_number}` : 'Woning',
              sublabel: u.properties?.address || u.properties?.name,
            })))
          }
        } else if (linkType === 'lease') {
          const leases = await leaseQueries.getByOwner(user.id)
          setLinkOptions((leases || []).map((l: any) => ({
            id: l.id,
            label: [l.units?.unit_number && `Eenheid ${l.units.unit_number}`, l.tenants?.full_name].filter(Boolean).join(' — ') || 'Huurcontract',
            sublabel: [l.units?.properties?.address, l.status].filter(Boolean).join(' · '),
          })))
        } else if (linkType === 'ticket') {
          const tickets = await ticketQueries.getByOwner(user.id)
          setLinkOptions((tickets || []).map((t: any) => ({
            id: t.id,
            label: `#${t.ticket_number} ${t.title || t.subject || ''}`.trim(),
            sublabel: t.units?.properties?.name || (t.properties as any)?.name || '',
          })))
        }
      } catch { /* ignore */ }
      setLinkOptionsLoading(false)
    })
  }, [linkType, linkEnabled])

  const filteredLinkOptions = useMemo(() => {
    if (!linkSearch) return linkOptions
    const q = linkSearch.toLowerCase()
    return linkOptions.filter(o => o.label.toLowerCase().includes(q) || (o.sublabel || '').toLowerCase().includes(q))
  }, [linkOptions, linkSearch])

  const loadOptionsForType = async (type: LinkType, set: (opts: LinkOption[]) => void) => {
    const { user } = await getUser()
    if (!user) return
    if (type === 'property') {
      const props = await propertyQueries.getByOwner(user.id)
      set(props.map(p => ({ id: p.id, label: (p as any).name || p.address || 'Pand', sublabel: p.address })))
    } else if (type === 'unit') {
      const props = await propertyQueries.getByOwner(user.id)
      const propIds = props.map(p => p.id)
      if (propIds.length > 0) {
        const { data } = await supabase.from('units').select('id, unit_number, properties(name, address)').in('property_id', propIds)
        set((data || []).map((u: any) => ({
          id: u.id,
          label: u.unit_number ? `Eenheid ${u.unit_number}` : 'Woning',
          sublabel: u.properties?.address || u.properties?.name,
        })))
      }
    } else if (type === 'lease') {
      const leases = await leaseQueries.getByOwner(user.id)
      set((leases || []).map((l: any) => ({
        id: l.id,
        label: [l.units?.unit_number && `Eenheid ${l.units.unit_number}`, l.tenants?.full_name].filter(Boolean).join(' — ') || 'Huurcontract',
        sublabel: [l.units?.properties?.address, l.status].filter(Boolean).join(' · '),
      })))
    } else if (type === 'ticket') {
      const tickets = await ticketQueries.getByOwner(user.id)
      set((tickets || []).map((t: any) => ({
        id: t.id,
        label: `#${t.ticket_number} ${t.title || t.subject || ''}`.trim(),
        sublabel: t.units?.properties?.name || (t.properties as any)?.name || '',
      })))
    }
  }

  useEffect(() => {
    if (!assignDialogDoc) return
    setAssignOptionsLoading(true)
    setAssignOptions([])
    setAssignSearch('')
    loadOptionsForType(assignType, setAssignOptions)
      .catch(() => {})
      .finally(() => setAssignOptionsLoading(false))
  }, [assignType, assignDialogDoc])

  const filteredAssignOptions = useMemo(() => {
    if (!assignSearch) return assignOptions
    const q = assignSearch.toLowerCase()
    return assignOptions.filter(o => o.label.toLowerCase().includes(q) || (o.sublabel || '').toLowerCase().includes(q))
  }, [assignOptions, assignSearch])

  const handleAssignSave = async () => {
    if (!assignDialogDoc || !assignSelectedId) return
    setAssignSaving(true)
    setAssignError(null)
    try {
      const body: Record<string, string | null> = {
        property_id: null, unit_id: null, lease_id: null, ticket_id: null,
      }
      body[`${assignType}_id`] = assignSelectedId
      const res = await fetch(`/api/documents/${assignDialogDoc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setAssignError(json.error || 'Opslaan mislukt')
        return
      }
      setAssignDialogDoc(null)
      refreshDocuments()
    } catch {
      setAssignError('Opslaan mislukt')
    } finally {
      setAssignSaving(false)
    }
  }

  const uniqueProperties = useMemo(() => {
    const names = documents.map((doc: any) => {
      const prop = doc.property ?? doc.properties
      return prop?.address ?? prop?.name ?? null
    }).filter(Boolean) as string[]
    return [...new Set(names)].sort()
  }, [documents])

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: any) => {
      if (typeFilter[doc.type] === false) return false
      const prop = doc.property ?? doc.properties
      const address = prop?.address ?? prop?.name ?? null
      if (address && propertyFilter[address] === false) return false
      if (search) {
        const q = search.toLowerCase()
        const name = (doc.name ?? doc.file_name ?? '').toLowerCase()
        const type = (doc.type ?? '').toLowerCase()
        const addr = (address ?? '').toLowerCase()
        if (!name.includes(q) && !type.includes(q) && !addr.includes(q)) return false
      }
      return true
    })
  }, [documents, typeFilter, propertyFilter, search])

  const sortedDocuments = useMemo(() =>
    applySortedRows(filteredDocuments, docSort, (d, k) => {
      if (k === 'name') return d.name ?? ''
      if (k === 'type') return d.type ?? ''
      if (k === 'property') return (d.property ?? d.properties)?.address ?? ''
      if (k === 'date') return new Date(d.created_at || 0).getTime()
      return null
    })
  , [filteredDocuments, docSort])

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
        if (linkEnabled && linkSelectedId && linkType) {
          formData.set(`${linkType}_id`, linkSelectedId)
        }
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


  return (
    <>
      <Suspense fallback={null}>
        <PreviewOpener openPreview={openPreview} />
      </Suspense>
      <div ref={contentRef}>
        {/* Hidden file input */}
        {!isDemo && (
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
        )}
        <TableToolbar
          title="Documenten"
          count={`${filteredDocuments.length} van ${documents.length} document${documents.length === 1 ? '' : 'en'}`}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Zoek document, type, adres…"
          filterContent={mounted ? (
            <>
              <DropdownMenuLabel className="px-2 pb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Type
              </DropdownMenuLabel>
              <div className="space-y-1">
                {DOC_TYPES.map((t) => (
                  <DropdownMenuCheckboxItem
                    key={t}
                    checked={typeFilter[t] !== false}
                    onCheckedChange={(v) => setTypeFilter((f) => ({ ...f, [t]: Boolean(v) }))}
                    onSelect={(e) => e.preventDefault()}
                    className={DASHBOARD_FILTER_CHECKBOX_ITEM_CLASS}
                  >
                    {t}
                  </DropdownMenuCheckboxItem>
                ))}
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
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : undefined}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAdd={!isDemo ? handleUploadClick : undefined}
          addLabel={uploading ? 'Bezig…' : 'Document uploaden'}
          addDisabled={uploading}
          extra={
            <button
              type="button"
              onClick={toggleSelectionMode}
              disabled={bulkBusy}
              title={selectionMode ? 'Annuleer selectie' : 'Selecteer documenten'}
              className={cn(
                'h-8 w-8 flex items-center justify-center rounded-full transition-colors',
                selectionMode
                  ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800',
              )}
            >
              {selectionMode ? <X className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
            </button>
          }
        />
        {!isDemo && (
          <>
                  <Dialog
                    open={uploadDialogOpen}
                    onOpenChange={(open) => {
                      setUploadDialogOpen(open)
                      if (!open) {
                        setUploadError(null)
                        setDropActive(false)
                        setStagedUploadFiles([])
                        setLinkEnabled(false)
                        setLinkType('property')
                        setLinkSearch('')
                        setLinkSelectedId(null)
                        setLinkOptions([])
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
                        {/* Link section */}
                        <div className="border-t border-gray-100 dark:border-neutral-800 pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setLinkEnabled((prev) => !prev)
                            }}
                            className="flex w-full items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors py-1"
                          >
                            <Link2 className="h-4 w-4 shrink-0" />
                            <span className="flex-1 text-left">Koppel document aan…</span>
                            {linkEnabled && linkSelectedId && (
                              <span className="text-xs bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870] px-2 py-0.5 rounded-full font-medium">
                                Gekoppeld
                              </span>
                            )}
                            <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', linkEnabled && 'rotate-180')} />
                          </button>

                          {linkEnabled && (
                            <div className="mt-3 space-y-3">
                              {/* Type pills */}
                              <div className="flex flex-wrap gap-1.5">
                                {([
                                  { key: 'property', label: 'Pand' },
                                  { key: 'unit', label: 'Woning' },
                                  { key: 'lease', label: 'Huurcontract' },
                                  { key: 'ticket', label: 'Ticket' },
                                ] as const).map(({ key, label }) => (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => { setLinkType(key); setLinkSelectedId(null) }}
                                    className={cn(
                                      'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                                      linkType === key
                                        ? 'bg-[#163300] text-white border-[#163300] dark:bg-[#9FE870] dark:text-[#163300] dark:border-[#9FE870]'
                                        : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-400'
                                    )}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>

                              {/* Search */}
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                                <input
                                  type="text"
                                  value={linkSearch}
                                  onChange={(e) => setLinkSearch(e.target.value)}
                                  placeholder={`Zoek ${linkType === 'property' ? 'pand' : linkType === 'unit' ? 'woning' : linkType === 'lease' ? 'huurcontract' : 'ticket'}…`}
                                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#163300]/20 dark:focus:ring-[#9FE870]/20"
                                />
                              </div>

                              {/* Options list */}
                              <div className="max-h-[160px] overflow-y-auto space-y-0.5 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/30 p-1">
                                {linkOptionsLoading ? (
                                  <div className="py-4 text-center text-xs text-gray-400">Laden…</div>
                                ) : filteredLinkOptions.length === 0 ? (
                                  <div className="py-4 text-center text-xs text-gray-400">
                                    {linkSearch ? 'Geen resultaten' : 'Geen items gevonden'}
                                  </div>
                                ) : filteredLinkOptions.map((opt) => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setLinkSelectedId(linkSelectedId === opt.id ? null : opt.id)}
                                    className={cn(
                                      'flex w-full items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors',
                                      linkSelectedId === opt.id
                                        ? 'bg-[#163300] text-white dark:bg-[#9FE870] dark:text-[#163300]'
                                        : 'hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-900 dark:text-gray-100'
                                    )}
                                  >
                                    <span className="flex-1 min-w-0">
                                      <span className="text-sm font-medium truncate block">{opt.label}</span>
                                      {opt.sublabel && (
                                        <span className={cn(
                                          'text-xs truncate block',
                                          linkSelectedId === opt.id
                                            ? 'text-white/70 dark:text-[#163300]/70'
                                            : 'text-gray-500 dark:text-gray-400'
                                        )}>
                                          {opt.sublabel}
                                        </span>
                                      )}
                                    </span>
                                    {linkSelectedId === opt.id && (
                                      <Check className="h-4 w-4 shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

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

                  {/* Assign dialog */}
                  <Dialog
                    open={!!assignDialogDoc}
                    onOpenChange={(open) => {
                      if (!open) {
                        setAssignDialogDoc(null)
                        setAssignType('property')
                        setAssignSearch('')
                        setAssignSelectedId(null)
                        setAssignOptions([])
                        setAssignError(null)
                      }
                    }}
                  >
                    <DialogContent className="sm:max-w-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-0 gap-0 [&>button]:inline-flex [&>button]:items-center [&>button]:justify-center [&>button]:p-0 [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-full [&>button]:bg-gray-100 [&>button]:text-gray-600 [&>button]:opacity-100 [&>button:hover]:bg-gray-200 [&>button:hover]:text-gray-900 dark:[&>button]:bg-neutral-800 dark:[&>button]:text-gray-300 dark:[&>button:hover]:bg-neutral-700 dark:[&>button:hover]:text-white">
                      <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                        <DialogTitle className="text-[#163300] dark:text-[#9FE870] text-lg">
                          Toewijzen
                        </DialogTitle>
                        <DialogDescription className="truncate">
                          {assignDialogDoc?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="px-6 pb-4 flex flex-col gap-3">
                        {/* Type pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {([
                            { key: 'property', label: 'Pand' },
                            { key: 'unit', label: 'Woning' },
                            { key: 'lease', label: 'Huurcontract' },
                            { key: 'ticket', label: 'Ticket' },
                          ] as const).map(({ key, label }) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => { setAssignType(key); setAssignSelectedId(null) }}
                              className={cn(
                                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                                assignType === key
                                  ? 'bg-[#163300] text-white border-[#163300] dark:bg-[#9FE870] dark:text-[#163300] dark:border-[#9FE870]'
                                  : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-400'
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>

                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            value={assignSearch}
                            onChange={(e) => setAssignSearch(e.target.value)}
                            placeholder={`Zoek ${assignType === 'property' ? 'pand' : assignType === 'unit' ? 'woning' : assignType === 'lease' ? 'huurcontract' : 'ticket'}…`}
                            className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#163300]/20 dark:focus:ring-[#9FE870]/20"
                          />
                        </div>

                        {/* Options list */}
                        <div className="max-h-[200px] overflow-y-auto space-y-0.5 rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/30 p-1">
                          {assignOptionsLoading ? (
                            <div className="py-5 text-center text-xs text-gray-400">Laden…</div>
                          ) : filteredAssignOptions.length === 0 ? (
                            <div className="py-5 text-center text-xs text-gray-400">
                              {assignSearch ? 'Geen resultaten' : 'Geen items gevonden'}
                            </div>
                          ) : filteredAssignOptions.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setAssignSelectedId(assignSelectedId === opt.id ? null : opt.id)}
                              className={cn(
                                'flex w-full items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors',
                                assignSelectedId === opt.id
                                  ? 'bg-[#163300] text-white dark:bg-[#9FE870] dark:text-[#163300]'
                                  : 'hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-900 dark:text-gray-100'
                              )}
                            >
                              <span className="flex-1 min-w-0">
                                <span className="text-sm font-medium truncate block">{opt.label}</span>
                                {opt.sublabel && (
                                  <span className={cn(
                                    'text-xs truncate block',
                                    assignSelectedId === opt.id ? 'text-white/70 dark:text-[#163300]/70' : 'text-gray-500 dark:text-gray-400'
                                  )}>
                                    {opt.sublabel}
                                  </span>
                                )}
                              </span>
                              {assignSelectedId === opt.id && <Check className="h-4 w-4 shrink-0" />}
                            </button>
                          ))}
                        </div>

                        {assignError && (
                          <p className="text-sm text-red-600 dark:text-red-400" role="alert">{assignError}</p>
                        )}
                      </div>
                      <DialogFooter className="px-6 pb-6 pt-0 flex-row justify-end gap-2 sm:gap-2 border-t border-gray-100 dark:border-neutral-800 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setAssignDialogDoc(null)}
                          disabled={assignSaving}
                        >
                          Annuleren
                        </Button>
                        <Button
                          type="button"
                          className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F] disabled:opacity-60"
                          onClick={handleAssignSave}
                          disabled={!assignSelectedId || assignSaving}
                        >
                          {assignSaving ? 'Opslaan…' : 'Opslaan'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
          </>
        )}
        {viewMode === 'table' ? (
            <div className="mt-8">
              <DataTable
                rows={sortedDocuments}
                getRowId={(d) => d.id}
                sort={docSort}
                onSort={toggleSort}
                onRowClick={(doc) => handleView(doc)}
                columns={[
                  { key: 'name', header: 'Naam', sortable: true, width: 'minmax(0,2fr)', render: (doc) => {
                    const cardDoc = toCardDoc(doc)
                    return (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                          <DocumentTypeGlyph name={cardDoc.name} file_name={cardDoc.file_name} mime_type={cardDoc.mime_type} className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="text-[12.5px] font-medium text-gray-900 dark:text-white truncate">{cardDoc.name}</span>
                      </div>
                    )
                  } },
                  { key: 'type', header: 'Type', sortable: true, width: 'minmax(0,1fr)', render: (doc) => <span className="text-[12.5px] text-gray-600 dark:text-gray-400 truncate">{toCardDoc(doc).type}</span> },
                  { key: 'date', header: 'Datum', sortable: true, width: 'minmax(0,1fr)', render: (doc) => <span className="text-[12.5px] text-gray-600 dark:text-gray-400">{doc.created_at ? format(new Date(doc.created_at), 'd MMM yyyy', { locale: nl }) : '—'}</span> },
                  { key: 'property', header: 'Pand', sortable: true, width: 'minmax(0,1.5fr)', render: (doc) => { const prop = doc.property ?? doc.properties; return <span className="text-[12.5px] text-gray-600 dark:text-gray-400 truncate">{prop?.address ?? '—'}</span> } },
                ] as DataTableColumn<any>[]}
                rowActions={(doc) => [
                  { label: 'Downloaden', icon: Download, onClick: () => handleDownload(doc) },
                  ...(isDemo ? [] : [{ label: 'Toewijzen aan pand', icon: Link2, onClick: () => setAssignDialogDoc({ id: doc.id, name: toCardDoc(doc).name }) }]),
                  { label: 'Verwijderen', icon: Trash2, danger: true, onClick: () => handleDelete(doc) },
                ]}
                empty="Geen documenten."
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
                {sortedDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={toCardDoc(doc)}
                    onPreview={selectionMode ? undefined : () => handleView(doc)}
                    onDownload={selectionMode ? undefined : () => handleDownload(doc)}
                    onDelete={selectionMode ? undefined : () => handleDelete(doc)}
                    onAssign={selectionMode || isDemo ? undefined : () => setAssignDialogDoc({ id: doc.id, name: toCardDoc(doc).name })}
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
      </div>
    </>
  )
}

function PreviewOpener({ openPreview }: { openPreview: (id: string) => void }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const id = searchParams.get('preview')
    if (!id) return
    openPreview(id)
    // Clean the param from the URL without adding a history entry
    const url = new URL(window.location.href)
    url.searchParams.delete('preview')
    window.history.replaceState(null, '', url.toString())
  }, [])

  return null
}



