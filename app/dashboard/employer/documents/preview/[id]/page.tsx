'use client'

import { useParams, useRouter } from 'next/navigation'
import { DocumentPreviewPanel } from '@/components/documents/document-preview-panel'

export default function DocumentPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : null

  if (!id) {
    router.replace('/dashboard/employer/documents')
    return null
  }

  return (
    <DocumentPreviewPanel
      docId={id}
      onClose={() => router.push('/dashboard/employer/documents')}
      fullPage
    />
  )
}
