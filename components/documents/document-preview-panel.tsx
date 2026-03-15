'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Minus, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null
function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((m) => {
      const version = (m as { version?: string }).version ?? '4.4.168'
      m.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
      return m
    })
  }
  return pdfjsPromise
}

const ZOOM_STEPS = [75, 90, 100, 125, 150, 175, 200]
const MIN_ZOOM = 50
const MAX_ZOOM = 200

type DocumentPreviewPanelProps = {
  docId: string
  onClose: () => void
  fullPage?: boolean
  className?: string
}

const DEFAULT_ZOOM = 100

export function DocumentPreviewPanel({
  docId,
  onClose,
  fullPage = false,
  className,
}: DocumentPreviewPanelProps) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [mode, setMode] = useState<'loading' | 'pdf' | 'other'>('loading')
  const [error, setError] = useState<string | null>(null)
  const pdfDocRef = useRef<Awaited<ReturnType<Awaited<ReturnType<typeof getPdfjs>>['getDocument']>['promise']> | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wheelCooldownRef = useRef(0)
  const wheelAccumRef = useRef(0)
  const wheelDirRef = useRef(0)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  // Fullpage: voorkom scroll op de pagina (body) zolang de preview open is
  useEffect(() => {
    if (!fullPage) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [fullPage])

  const WHEEL_THRESHOLD = 120
  const WHEEL_COOLDOWN_MS = 450

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, ZOOM_STEPS.find((s) => s > z) ?? z + 25))
  }, [])
  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, [...ZOOM_STEPS].reverse().find((s) => s < z) ?? z - 25))
  }, [])

  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), [])
  const nextPage = useCallback(() => setPage((p) => Math.min(totalPages, p + 1)), [totalPages])

  // Load document: probeer als PDF, anders als afbeelding/iframe
  useEffect(() => {
    setMode('loading')
    setError(null)
    setPage(1)
    setTotalPages(1)
    const url = `/api/documents/${docId}/file`
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(url, { credentials: 'include', cache: 'no-store' })
        if (!res.ok) {
          setError(`Document laden mislukt (${res.status})`)
          return
        }
        const blob = await res.blob()
        if (cancelled) return
        const isPdf = blob.type === 'application/pdf' || (blob.type === '' && blob.size > 4)
        if (isPdf) {
          const arrayBuffer = await blob.arrayBuffer()
          if (cancelled) return
          const pdfjs = await getPdfjs()
          if (cancelled) return
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
          if (cancelled) return
          pdfDocRef.current = pdf
          setTotalPages(pdf.numPages)
          setMode('pdf')
        } else {
          const createdUrl = URL.createObjectURL(blob)
          if (cancelled) {
            URL.revokeObjectURL(createdUrl)
            return
          }
          setObjectUrl(createdUrl)
          setTotalPages(1)
          setMode('other')
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Laden mislukt')
      }
    }
    load()
    return () => {
      cancelled = true
      pdfDocRef.current = null
      setObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }
  }, [docId])

  // Render PDF current page: A4-verhouding (210:297), max 420px breed, zoom via CSS transform
  const DOC_MAX_WIDTH_PX = 420
  const A4_HEIGHT_PX = DOC_MAX_WIDTH_PX * (297 / 210) // 594

  useEffect(() => {
    if (mode !== 'pdf' || !pdfDocRef.current || !canvasRef.current) return
    const pdf = pdfDocRef.current
    const pageNum = Math.min(page, pdf.numPages)
    let cancelled = false
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

    const render = async () => {
      try {
        const pdfPage = await pdf.getPage(pageNum)
        const vp1 = pdfPage.getViewport({ scale: 1 })
        const fitScale = Math.min(DOC_MAX_WIDTH_PX / vp1.width, A4_HEIGHT_PX / vp1.height, 2)
        const viewport = pdfPage.getViewport({ scale: fitScale * dpr })
        const canvas = canvasRef.current
        if (!canvas || cancelled) return
        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx || cancelled) return
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        canvas.style.width = `${viewport.width / dpr}px`
        canvas.style.height = `${viewport.height / dpr}px`
        await pdfPage.render({ canvasContext: ctx, viewport, intent: 'display' }).promise
      } catch {
        // ignore
      }
    }
    render()
    return () => { cancelled = true }
  }, [mode, page])

  // Scroll = pagina wisselen; drempel + cooldown zodat je niet per ongeluk door de docs vliegt
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (mode !== 'pdf' && mode !== 'other') return
      e.preventDefault()
      const now = Date.now()
      if (now < wheelCooldownRef.current) return
      const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0
      if (dir === 0) return
      if (dir !== wheelDirRef.current) {
        wheelDirRef.current = dir
        wheelAccumRef.current = 0
      }
      wheelAccumRef.current += e.deltaY
      if (Math.abs(wheelAccumRef.current) < WHEEL_THRESHOLD) return
      wheelAccumRef.current = 0
      wheelCooldownRef.current = now + WHEEL_COOLDOWN_MS
      if (dir > 0) nextPage()
      else prevPage()
    },
    [mode, nextPage, prevPage]
  )

  return (
    <div
      className={cn(
        'flex flex-col bg-[#e8ebe6] dark:bg-neutral-800 min-h-0 overflow-hidden',
        fullPage ? 'fixed inset-0 z-50 h-screen' : 'h-full min-w-0 w-full',
        className
      )}
    >
      {/* Pijltje terug linksboven */}
      <div className="flex items-center justify-between flex-shrink-0 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-500"
          aria-label="Terug"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Document: geen scroll, past in viewport; scrollwiel wisselt pagina */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 flex flex-col items-center justify-center select-none overflow-hidden py-4"
        onWheel={onWheel}
        style={{ touchAction: 'pan-y' }}
      >
        {mode === 'loading' && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Document laden…</p>
        )}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {mode === 'pdf' && (
          <div
            className="shrink-0 w-[min(100%,420px)] flex items-center justify-center rounded-xl overflow-hidden bg-white dark:bg-neutral-900 aspect-[210/297]"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <canvas ref={canvasRef} className="block bg-white dark:bg-neutral-900" />
          </div>
        )}
        {mode === 'other' && objectUrl && (
          <div
            className="shrink-0 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 flex items-center justify-center aspect-[210/297]"
            style={{
              width: 'min(420px, min(100%, calc(55vh * 210 / 297)))',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={objectUrl}
              alt="Document"
              className="w-full h-full object-contain bg-white dark:bg-neutral-900"
              draggable={false}
            />
          </div>
        )}
      </div>

      {/* Witte pil: links page selector, midden vergrootglas, rechts min + plus */}
      <div className="flex-shrink-0 flex justify-center py-4">
        <div className="flex items-center gap-2 sm:gap-4 px-3 py-2 rounded-full bg-white dark:bg-neutral-700 shadow-sm border border-gray-200/80 dark:border-neutral-600 min-w-[280px] sm:min-w-[320px]">
          {/* Links: page selector */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-500 disabled:opacity-50"
              onClick={prevPage}
              disabled={page <= 1}
              aria-label="Vorige pagina"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[3rem] text-center text-sm font-medium text-gray-700 dark:text-gray-200 tabular-nums py-1.5">
              {page}/{totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-500 disabled:opacity-50"
              onClick={nextPage}
              disabled={page >= totalPages}
              aria-label="Volgende pagina"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {/* Midden: vergrootglas (zoom 100%) */}
          <div className="flex-1 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-500"
              onClick={() => setZoom(DEFAULT_ZOOM)}
              aria-label="Zoom op 100%"
              title="Zoom 100%"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {/* Rechts: min en plus */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-500 disabled:opacity-50"
              onClick={zoomOut}
              disabled={zoom <= MIN_ZOOM}
              aria-label="Uitzoomen"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="min-w-[3rem] text-center text-sm font-medium text-gray-700 dark:text-gray-200 tabular-nums py-1.5">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-500 disabled:opacity-50"
              onClick={zoomIn}
              disabled={zoom >= MAX_ZOOM}
              aria-label="Inzoomen"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
