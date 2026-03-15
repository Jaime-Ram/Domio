import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sample-pdf
 * Returns a minimal valid PDF (one small page) for demo/document preview placeholder.
 */
export async function GET() {
  const minimalPdf = Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000125 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n218\n%%EOF',
    'utf-8'
  )
  return new NextResponse(minimalPdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
