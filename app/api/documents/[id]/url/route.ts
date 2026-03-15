import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const DOCUMENTS_BUCKET = 'documents'
const URL_EXPIRY_SECONDS = 60

type DocumentRow = { id: string; owner_id: string; storage_path: string | null }

/**
 * GET /api/documents/[id]/url?download=1
 * Returns a signed URL to view (or download) the document file.
 * User must own the document.
 */
export async function GET(
  request: NextRequest,
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

    const { data, error: docError } = await supabase
      .from('documents')
      .select('id, owner_id, storage_path')
      .eq('id', id)
      .single()

    const doc = data as DocumentRow | null
    if (docError || !doc) {
      return NextResponse.json({ error: 'Document niet gevonden' }, { status: 404 })
    }
    if (doc.owner_id !== user.id) {
      return NextResponse.json({ error: 'Geen toegang tot dit document' }, { status: 403 })
    }
    if (!doc.storage_path) {
      return NextResponse.json({ error: 'Geen bestand gekoppeld aan dit document' }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json(
        { error: 'Storage niet geconfigureerd' },
        { status: 500 }
      )
    }

    const download = request.nextUrl.searchParams.get('download') === '1'
    const { data: signed, error: signError } = await admin.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(doc.storage_path, URL_EXPIRY_SECONDS, {
        download: download ? doc.storage_path.split('/').pop() || 'document' : undefined,
      })

    if (signError || !signed?.signedUrl) {
      return NextResponse.json(
        { error: signError?.message || 'Signed URL aanmaken mislukt' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: signed.signedUrl })
  } catch (e) {
    console.error('Documents URL error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Fout' },
      { status: 500 }
    )
  }
}
