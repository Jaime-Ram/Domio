'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getPdfjs } from '@/lib/pdfjs-client'
import { DocumentTypeGlyph } from '@/components/documents/document-type-icon'
import { cn } from '@/lib/utils'

type Props = {
  file: File
  className?: string
}

/** Eerste pagina van een lokaal PDF-bestand als canvas (geen browser-PDF-viewer / geen zwarte toolbar). */
export function LocalPdfThumbnail({ file, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    setStatus('loading')
    let cancelled = false
    ;(async () => {
      try {
        const buf = await file.arrayBuffer()
        const pdfjs = await getPdfjs()
        const pdf = await pdfjs.getDocument({ data: buf }).promise
        const page = await pdf.getPage(1)
        const vp = page.getViewport({ scale: 1 })
        const maxW = 100
        const maxH = 72
        const scale = Math.min(maxW / vp.width, maxH / vp.height)
        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current
        if (!canvas || cancelled) return
        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) return
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
        canvas.width = Math.ceil(viewport.width * dpr)
        canvas.height = Math.ceil(viewport.height * dpr)
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        ctx.scale(dpr, dpr)
        await page
          .render({
            canvasContext: ctx,
            viewport,
            intent: 'display' as const,
          })
          .promise
        if (!cancelled) setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [file])

  if (status === 'error') {
    return (
      <div className={cn('flex h-full w-full items-center justify-center', className)}>
        <DocumentTypeGlyph
          name={file.name}
          file_name={file.name}
          mime_type="application/pdf"
          className="h-10 w-10 text-gray-400 dark:text-neutral-500"
        />
      </div>
    )
  }

  return (
    <div className={cn('relative flex h-full w-full items-center justify-center overflow-hidden bg-white dark:bg-neutral-900', className)}>
      {status === 'loading' && (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-gray-400 dark:text-neutral-500" aria-hidden />
      )}
      <canvas
        ref={canvasRef}
        className={cn('max-h-full max-w-full object-contain', status === 'loading' && 'absolute opacity-0 pointer-events-none')}
        aria-hidden
      />
    </div>
  )
}
