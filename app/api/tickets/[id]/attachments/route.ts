import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'documents'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: ticketId } = await params
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Server misconfiguratie' }, { status: 500 })

  const { data: attachments, error } = await admin
    .from('documents')
    .select('id, name, file_name, mime_type, storage_path, created_at')
    .eq('ticket_id', ticketId)
    .eq('scope', 'ticket')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const withUrls = await Promise.all(
    (attachments ?? []).map(async (att: any) => {
      const { data: signed } = await admin.storage
        .from(BUCKET)
        .createSignedUrl(att.storage_path, 3600)
      return { ...att, url: signed?.signedUrl ?? null }
    })
  )

  return NextResponse.json({ attachments: withUrls })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: ticketId } = await params
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Server misconfiguratie' }, { status: 500 })

  const { data: ticket } = await admin
    .from('tickets')
    .select('id, owner_id, created_by')
    .eq('id', ticketId)
    .single()

  if (!ticket) return NextResponse.json({ error: 'Ticket niet gevonden' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Geen bestand meegegeven' }, { status: 400 })

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Bestandstype niet toegestaan (gebruik JPG, PNG, WEBP, HEIC of PDF)' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Bestand te groot (max 10 MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const fileId = crypto.randomUUID()
  const storagePath = `tickets/${ticketId}/${fileId}.${ext}`

  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: `Upload mislukt: ${uploadError.message}` }, { status: 500 })
  }

  const { data: attachment, error: dbError } = await admin
    .from('documents')
    .insert({
      owner_id: ticket.owner_id,
      name: file.name.replace(/\.[^.]+$/, '') || 'Bijlage',
      file_name: file.name,
      mime_type: file.type,
      storage_path: storagePath,
      source: 'upload',
      scope: 'ticket',
      ticket_id: ticketId,
    } as any)
    .select('id, name, file_name, mime_type, storage_path, created_at')
    .single()

  if (dbError) {
    await admin.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  const { data: signed } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600)

  return NextResponse.json({
    success: true,
    attachment: { ...attachment, url: signed?.signedUrl ?? null },
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: ticketId } = await params
  const { attachmentId } = await req.json()
  if (!attachmentId) return NextResponse.json({ error: 'attachmentId vereist' }, { status: 400 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Server misconfiguratie' }, { status: 500 })

  const { data: att } = await admin
    .from('documents')
    .select('id, storage_path, owner_id')
    .eq('id', attachmentId)
    .eq('ticket_id', ticketId)
    .eq('scope', 'ticket')
    .single()

  if (!att) return NextResponse.json({ error: 'Bijlage niet gevonden' }, { status: 404 })
  if (att.owner_id !== user.id) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  await admin.storage.from(BUCKET).remove([att.storage_path])
  await admin.from('documents').delete().eq('id', attachmentId)

  return NextResponse.json({ success: true })
}
