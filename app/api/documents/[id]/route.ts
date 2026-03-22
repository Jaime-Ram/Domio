import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const DOCUMENTS_BUCKET = 'documents'

type DocumentRow = { id: string; owner_id: string; storage_path: string | null }

/**
 * DELETE /api/documents/[id]
 * Verwijdert het bestand uit Storage (indien aanwezig) en de documentrij.
 * Alleen de eigenaar mag verwijderen.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Document-id ontbreekt' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
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
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const admin = createAdminClient()
    if (doc.storage_path) {
      if (!admin) {
        return NextResponse.json({ error: 'Storage niet geconfigureerd' }, { status: 500 })
      }
      const { error: removeError } = await admin.storage.from(DOCUMENTS_BUCKET).remove([doc.storage_path])
      if (removeError) {
        console.error('Storage remove:', removeError)
        // Ga door met DB-delete zodat orphan rows opgeschoond kunnen worden
      }
    }

    const { error: deleteError } = await supabase.from('documents').delete().eq('id', id)
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message || 'Verwijderen mislukt' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Documents DELETE error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Fout' },
      { status: 500 }
    )
  }
}
