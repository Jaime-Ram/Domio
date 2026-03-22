'use client'

import { useState, useEffect, useRef } from 'react'
import { Eye, MoreHorizontal, UserPlus, Building2, Tag, Building, Pencil, Trash2, Info, Download, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { DocumentTypeGlyph } from '@/components/documents/document-type-icon'
import { getPdfjs } from '@/lib/pdfjs-client'

/** Maximaal 2 previews tegelijk laden om de main thread niet te overbelasten. */
const MAX_CONCURRENT_PREVIEWS = 2
let activePreviews = 0
const previewQueue: Array<() => void> = []
function runWhenSlotFree(fn: () => void) {
  if (activePreviews < MAX_CONCURRENT_PREVIEWS) {
    activePreviews++
    fn()
  } else {
    previewQueue.push(fn)
  }
}
function releaseSlot() {
  activePreviews = Math.max(0, activePreviews - 1)
  if (previewQueue.length > 0 && activePreviews < MAX_CONCURRENT_PREVIEWS) {
    activePreviews++
    const next = previewQueue.shift()!
    next()
  }
}

export type DocumentCardDoc = {
  id: string
  name: string
  type: string
  created_at?: string
  uploadDate?: string
  amount_due?: number | null
  due_date?: string | null
  file_name?: string | null
  mime_type?: string | null
  property?: { address?: string } | null
}

type DocumentCardProps = {
  doc: DocumentCardDoc
  onPreview?: (doc: DocumentCardDoc) => void
  onDownload?: (doc: DocumentCardDoc) => void
  /** Bij true wordt geen PDF-voortvertoning opgehaald (voorkomt 404 bij demo/mock documenten). */
  skipPreviewFetch?: boolean
  /** Acties uit het driepuntenmenu (optioneel). */
  onAddToPerson?: (doc: DocumentCardDoc) => void
  onAddToProperty?: (doc: DocumentCardDoc) => void
  onTag?: (doc: DocumentCardDoc) => void
  onLegalEntity?: (doc: DocumentCardDoc) => void
  onRename?: (doc: DocumentCardDoc) => void
  onDelete?: (doc: DocumentCardDoc) => void
  onMoreInfo?: (doc: DocumentCardDoc) => void
  /** Bulk-select modus: hele kaart selecteert/deselecteert in plaats van openen. */
  selectionMode?: boolean
  selected?: boolean
  onToggleSelect?: (doc: DocumentCardDoc) => void
  /** Tijdens bulk download/verwijderen: toon laad-indicator in de selectiecirkels. */
  bulkActionLoading?: boolean
}

function getExtension(name: string, file_name?: string | null): string {
  if (file_name && /\.\w+$/.test(file_name)) return file_name.replace(/.*\./, '').toUpperCase()
  if (/\.\w+$/.test(name)) return name.replace(/.*\./, '').toUpperCase()
  return 'PDF'
}

/** Toonlabel voor documenttype in het witte deel */
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    Contract: 'Huurcontract',
    Keuring: 'Keuring',
    Factuur: 'Factuur',
    Verzekering: 'Verzekering',
    Overig: 'Overig',
  }
  return labels[type] ?? type
}

function isPdf(doc: DocumentCardDoc): boolean {
  if (doc.mime_type === 'application/pdf') return true
  const name = (doc.file_name ?? doc.name ?? '').toLowerCase()
  return name.endsWith('.pdf')
}

const IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
function isImage(doc: DocumentCardDoc): boolean {
  if (doc.mime_type && IMAGE_MIMES.includes(doc.mime_type)) return true
  const name = (doc.file_name ?? doc.name ?? '').toLowerCase()
  return IMAGE_EXT.some((e) => name.endsWith(e))
}

export function DocumentCard({
  doc,
  onPreview,
  onDownload,
  skipPreviewFetch,
  onAddToPerson,
  onAddToProperty,
  onTag,
  onLegalEntity,
  onRename,
  onDelete,
  onMoreInfo,
  selectionMode = false,
  selected = false,
  onToggleSelect,
  bulkActionLoading = false,
}: DocumentCardProps) {
  const ext = getExtension(doc.name, doc.file_name)
  const realName = doc.name || doc.file_name || 'Document'
  const createdAt = doc.created_at ?? doc.uploadDate
  const addedDate = createdAt
    ? format(new Date(createdAt), 'd MMMM yyyy', { locale: nl })
    : null

  const previewRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewRendered, setPreviewRendered] = useState(false)
  const [previewSize, setPreviewSize] = useState<{ w: number; h: number } | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isPdf(doc)) {
      if (typeof window !== 'undefined' && doc.id && !isImage(doc)) {
        console.log('[DocumentCard preview]', doc.id, 'niet als PDF/afbeelding herkend', { file_name: doc.file_name, name: doc.name, mime_type: doc.mime_type })
      }
      return
    }
    const previewUrl = skipPreviewFetch ? '/api/sample-pdf' : `/api/documents/${doc.id}/file`
    setPreviewError(null)
    let cancelled = false
    const loadPdf = async () => {
      runWhenSlotFree(async () => {
        try {
          const res = await fetch(previewUrl, { credentials: 'include', cache: 'no-store' })
          if (!res.ok) {
            const text = await res.text().catch(() => '')
            setPreviewError(`HTTP ${res.status}`)
            return
          }
          if (cancelled) return
          const arrayBuffer = await res.arrayBuffer()
          if (cancelled) return
          const pdfjs = await getPdfjs()
          if (cancelled) return
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
          if (cancelled) return
          const page = await pdf.getPage(1)
          const vp = page.getViewport({ scale: 1 })
          // Het kader is alleen de bovenste helft van een A4'tje → document ook "doormidden": alleen bovenste 50% tonen
          const halfPageHeight = vp.height * 0.5
          const scale = Math.min(140 / vp.width, 72 / halfPageHeight)
          const viewport = page.getViewport({ scale })
          const canvas = canvasRef.current
          if (!canvas || cancelled) return
          const ctx = canvas.getContext('2d', { alpha: false })
          if (!ctx) return
          const dpr = window.devicePixelRatio || 1
          const w = 140
          const h = 72
          const offscreen = document.createElement('canvas')
          offscreen.width = Math.ceil(viewport.width * dpr)
          offscreen.height = Math.ceil(viewport.height * dpr)
          const offCtx = offscreen.getContext('2d', { alpha: false })
          if (!offCtx) return
          offCtx.scale(dpr, dpr)
          const renderCtx = {
            canvasContext: offCtx,
            viewport,
            intent: 'display' as const,
          }
          await page.render(renderCtx).promise
          if (cancelled) return
          canvas.width = Math.ceil(w * dpr)
          canvas.height = Math.ceil(h * dpr)
          canvas.style.width = `${w}px`
          canvas.style.height = `${h}px`
          const destCtx = canvas.getContext('2d', { alpha: false })
          if (!destCtx) return
          destCtx.scale(dpr, dpr)
          // Alleen bovenste helft van de gerenderde pagina (in de lengte) → vult het halve A4-kader 1-op-1
          // drawImage bronrect in bron-pixels: offscreen is viewport.width*dpr × viewport.height*dpr
          const srcWpx = Math.ceil(viewport.width * dpr)
          const srcHalfHpx = Math.ceil(viewport.height * 0.5 * dpr)
          destCtx.drawImage(offscreen, 0, 0, srcWpx, srcHalfHpx, 0, 0, w, h)
          if (!cancelled) {
            setPreviewSize({ w, h })
            setPreviewRendered(true)
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          setPreviewError(msg)
        } finally {
          releaseSlot()
        }
      })
    }
    const el = previewRef.current
    if (!el) return
    let loaded = false
    const tryLoad = () => {
      if (loaded) return
      loaded = true
      loadPdf()
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) tryLoad()
      },
      { rootMargin: '200px', threshold: 0 }
    )
    observer.observe(el)
    tryLoad()
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [skipPreviewFetch, doc.id, doc.file_name, doc.name, doc.mime_type])

  // Afbeeldingen (JPEG, PNG, etc.): laad bestand en toon als preview
  useEffect(() => {
    if (!isImage(doc) || skipPreviewFetch) return
    setPreviewError(null)
    let cancelled = false
    let objectUrl: string | null = null
    const loadImage = () => {
      runWhenSlotFree(async () => {
        try {
          const res = await fetch(`/api/documents/${doc.id}/file`, { credentials: 'include', cache: 'no-store' })
          if (!res.ok) {
            setPreviewError(`HTTP ${res.status}`)
            return
          }
          if (cancelled) return
          const blob = await res.blob()
          if (cancelled) return
          objectUrl = URL.createObjectURL(blob)
          if (!cancelled) setImagePreviewUrl(objectUrl)
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          setPreviewError(msg)
        } finally {
          if (objectUrl && cancelled) URL.revokeObjectURL(objectUrl)
          releaseSlot()
        }
      })
    }
    const el = previewRef.current
    if (!el) return
    let loaded = false
    const tryLoad = () => {
      if (loaded) return
      loaded = true
      loadImage()
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) tryLoad()
      },
      { rootMargin: '200px', threshold: 0 }
    )
    observer.observe(el)
    tryLoad()
    return () => {
      cancelled = true
      observer.disconnect()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setImagePreviewUrl(null)
    }
  }, [skipPreviewFetch, doc.id])

  useEffect(() => {
    setPreviewRendered(false)
    setPreviewSize(null)
    setPreviewError(null)
    setImagePreviewUrl(null)
  }, [doc.id])

  const showPdfPreview = isPdf(doc) && previewRendered
  const showImagePreview = isImage(doc) && imagePreviewUrl

  const handleView = () => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect(doc)
      return
    }
    if (onPreview) {
      onPreview(doc)
      return
    }
    if (onDownload) {
      onDownload(doc)
    }
  }

  /** Hele kaart klikbaar alleen in selectiemodus (selecteren). */
  const handleArticleClick = () => {
    if (selectionMode && bulkActionLoading) return
    if (selectionMode) handleView()
  }

  /** Alleen bovenste (preview) deel: voorvertoning openen. */
  const handlePreviewAreaClick = (e: React.MouseEvent) => {
    if (selectionMode) return
    e.stopPropagation()
    handleView()
  }

  return (
    <article
      className={cn(
        '@container rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700 shadow-sm',
        selectionMode && 'cursor-pointer'
      )}
      onClick={selectionMode ? handleArticleClick : undefined}
    >
      {/* Bovenste deel: grijs — klik = voorvertoning (niet in selectiemodus: hele kaart selecteert). */}
      <div
        className={cn(
          'bg-[#e8ebe6] dark:bg-neutral-700/80 px-4 pt-4 pb-0 flex flex-col group',
          !selectionMode && 'cursor-pointer'
        )}
        onClick={handlePreviewAreaClick}
        role={selectionMode ? undefined : 'button'}
        tabIndex={selectionMode ? undefined : 0}
        onKeyDown={
          selectionMode
            ? undefined
            : (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleView()
                }
              }
        }
        aria-label={selectionMode ? undefined : `Open voorvertoning: ${realName}`}
      >
        <div className="mb-1 flex flex-col gap-0 @[320px]:flex-row @[320px]:items-baseline @[320px]:gap-1.5 min-w-0">
          <p
            className="font-semibold text-gray-900 dark:text-white text-sm min-w-0 truncate group-hover:underline"
            title={realName}
          >
            {realName}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-normal mt-0.5 @[320px]:mt-0 flex-shrink-0">
            <span className="hidden @[320px]:inline"> · </span>{ext}
          </p>
        </div>
        <div className="flex items-end justify-between gap-3 pt-1.5">
          <div
            ref={previewRef}
            className="relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-t-xl bg-white dark:bg-neutral-900 shadow-sm w-[140px] h-[72px]"
          >
            {isPdf(doc) && (
              <canvas
                ref={canvasRef}
                className={
                  previewRendered
                    ? 'absolute left-1/2 top-1/2 z-[5] block -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900'
                    : 'block bg-white dark:bg-neutral-900'
                }
                style={{
                  width: previewSize ? `${previewSize.w}px` : '140px',
                  height: previewSize ? `${previewSize.h}px` : '72px',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  opacity: previewRendered ? 1 : 0,
                  pointerEvents: 'none',
                }}
              />
            )}
            {showImagePreview && imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt=""
                className="absolute inset-0 z-[5] h-full w-full object-cover object-top bg-white dark:bg-neutral-900"
                style={{ pointerEvents: 'none' }}
              />
            )}
            {!showPdfPreview && !showImagePreview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white dark:bg-neutral-900 p-2">
                <DocumentTypeGlyph
                  name={realName}
                  file_name={doc.file_name}
                  mime_type={doc.mime_type}
                  className="h-8 w-8 text-gray-400 dark:text-neutral-500 shrink-0"
                />
                <span className="text-[10px] font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wide">{ext}</span>
                {previewError && (
                  <span className="text-[9px] text-red-600 dark:text-red-400 max-w-full truncate" title={previewError}>
                    {previewError}
                  </span>
                )}
              </div>
            )}
          </div>
          <Button
            size="icon"
            disabled={selectionMode && bulkActionLoading && selected}
            className={cn(
              'h-8 w-8 rounded-full flex-shrink-0 self-end mb-4',
              selectionMode
                ? selected
                  ? 'bg-[#163300] dark:bg-[#163300] border border-[#163300] shadow-none'
                  : 'bg-transparent border border-[#163300] dark:border-[#9FE870] shadow-none hover:bg-[#163300]/10 dark:hover:bg-[#9FE870]/10'
                : 'bg-[#b8bfb4] hover:bg-[#a8b0a4] text-[#3d4a38] dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:text-[#c8d4c0] border-0 shadow-none'
            )}
            onClick={(e) => {
              e.stopPropagation()
              if (selectionMode && bulkActionLoading && selected) return
              handleView()
            }}
            aria-label={
              selectionMode && bulkActionLoading && selected
                ? 'Bezig met verwerken'
                : selectionMode
                  ? selected
                    ? 'Deselecteer'
                    : 'Selecteer'
                  : 'Bekijk'
            }
          >
            {selectionMode ? (
              selected ? (
                bulkActionLoading ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" aria-hidden />
                ) : (
                  <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                )
              ) : null
            ) : (
              <Eye className="h-4 w-4 shrink-0" />
            )}
          </Button>
        </div>
      </div>

      {/* Onderste deel: wit — klik opent actiemenu; in selectiemodus: klik op kaart selecteert (geen menu). */}
      {selectionMode ? (
        <div className="bg-white dark:bg-neutral-900 px-4 py-3 relative">
          <div className="flex items-start justify-between gap-2 pr-8">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {getTypeLabel(doc.type)}
              </p>
              {addedDate && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Toegevoegd {addedDate}
                </p>
              )}
            </div>
          </div>
          <div
            className="absolute right-4 bottom-3 h-8 w-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center pointer-events-none"
            aria-hidden
          >
            {bulkActionLoading && selected ? (
              <Loader2 className="h-4 w-4 text-[#163300] dark:text-[#9FE870] animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </div>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className="bg-white dark:bg-neutral-900 px-4 py-3 relative w-full text-left cursor-pointer outline-none transition-colors hover:bg-gray-50/90 dark:hover:bg-neutral-800/90 focus-visible:ring-2 focus-visible:ring-[#163300] focus-visible:ring-offset-2"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Acties voor ${realName}`}
            >
              <div className="flex items-start justify-between gap-2 pr-8">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getTypeLabel(doc.type)}
                  </p>
                  {addedDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Toegevoegd {addedDate}
                    </p>
                  )}
                </div>
              </div>
              <div className="absolute right-4 bottom-3 h-8 w-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center pointer-events-none">
                <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-xl min-w-[220px] border-gray-200 dark:border-neutral-700"
            sideOffset={6}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem onClick={() => onAddToPerson?.(doc)} className="gap-2 focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:focus:bg-neutral-700 dark:focus:text-white dark:hover:bg-neutral-700 dark:hover:text-white">
              <UserPlus className="h-4 w-4" />
              Toewijzen aan bewoner
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddToProperty?.(doc)} className="gap-2 focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:focus:bg-neutral-700 dark:focus:text-white dark:hover:bg-neutral-700 dark:hover:text-white">
              <Building2 className="h-4 w-4" />
              Toewijzen aan pand
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLegalEntity?.(doc)} className="gap-2 focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:focus:bg-neutral-700 dark:focus:text-white dark:hover:bg-neutral-700 dark:hover:text-white">
              <Building className="h-4 w-4" />
              Rechtspersoon
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTag?.(doc)} className="gap-2 focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:focus:bg-neutral-700 dark:focus:text-white dark:hover:bg-neutral-700 dark:hover:text-white">
              <Tag className="h-4 w-4" />
              Tag
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRename?.(doc)} className="gap-2 focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:focus:bg-neutral-700 dark:focus:text-white dark:hover:bg-neutral-700 dark:hover:text-white">
              <Pencil className="h-4 w-4" />
              Naam wijzigen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMoreInfo?.(doc)} className="gap-2 focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:focus:bg-neutral-700 dark:focus:text-white dark:hover:bg-neutral-700 dark:hover:text-white">
              <Info className="h-4 w-4" />
              Meer info
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                setTimeout(() => onDownload?.(doc), 0)
              }}
              className="gap-2 focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:focus:bg-neutral-700 dark:focus:text-white dark:hover:bg-neutral-700 dark:hover:text-white"
            >
              <Download className="h-4 w-4" />
              Downloaden
            </DropdownMenuItem>
            <div className="my-1 h-px bg-gray-200 dark:bg-neutral-700" role="separator" />
            <DropdownMenuItem
              onSelect={() => {
                setTimeout(() => onDelete?.(doc), 0)
              }}
              className="gap-2 text-red-600 dark:text-red-400 focus:bg-gray-100 focus:text-red-600 hover:bg-gray-100 hover:text-red-600 dark:focus:bg-neutral-700 dark:focus:text-red-400 dark:hover:bg-neutral-700 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Verwijderen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </article>
  )
}
