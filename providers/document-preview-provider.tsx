'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type DocumentPreviewContextValue = {
  /** Document id to show in the side panel (null = panel closed). */
  previewDocId: string | null
  /** Open preview panel with this document (large screens) or navigate to full-page preview (small screens). */
  openPreview: (docId: string) => void
  /** Close the side panel. */
  closePreview: () => void
}

const DocumentPreviewContext = createContext<DocumentPreviewContextValue | null>(null)

const PREVIEW_BREAKPOINT_PX = 1024

export function DocumentPreviewProvider({ children }: { children: ReactNode }) {
  const [previewDocId, setPreviewDocId] = useState<string | null>(null)

  const openPreview = useCallback((docId: string) => {
    if (typeof window === 'undefined') return
    if (window.innerWidth >= PREVIEW_BREAKPOINT_PX) {
      setPreviewDocId(docId)
    } else {
      window.location.href = `/dashboard/employer/documents/preview/${docId}`
    }
  }, [])

  const closePreview = useCallback(() => {
    setPreviewDocId(null)
  }, [])

  return (
    <DocumentPreviewContext.Provider
      value={{ previewDocId, openPreview, closePreview }}
    >
      {children}
    </DocumentPreviewContext.Provider>
  )
}

export function useDocumentPreview() {
  const ctx = useContext(DocumentPreviewContext)
  if (!ctx) {
    return {
      previewDocId: null,
      openPreview: (_docId: string) => {},
      closePreview: () => {},
    }
  }
  return ctx
}

export { PREVIEW_BREAKPOINT_PX }
