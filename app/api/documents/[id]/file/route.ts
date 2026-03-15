import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const DOCUMENTS_BUCKET = 'documents'

/**
 * GET /api/documents/[id]/file
 * Streams the document file (same-origin, for PDF.js preview without CORS).
 * User must own the document.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Document-id ontbreekt' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
    }

    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, owner_id, storage_path, mime_type')
      .eq('id', id)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document niet gevonden' }, { status: 404 })
    }
    if (doc.owner_id !== user.id) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }
    if (!doc.storage_path) {
      return NextResponse.json({ error: 'Geen bestand' }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Storage niet geconfigureerd' }, { status: 500 })
    }

    const { data: file, error: downloadError } = await admin.storage
      .from(DOCUMENTS_BUCKET)
      .download(doc.storage_path)

    if (downloadError || !file) {
      return NextResponse.json(
        { error: downloadError?.message || 'Download mislukt' },
        { status: 500 }
      )
    }

    const contentType = doc.mime_type || 'application/pdf'
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=60',
      },
    })
  } catch (e) {
    console.error('Documents file error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Fout' },
      { status: 500 }
    )
  }
}
