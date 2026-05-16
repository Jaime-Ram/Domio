import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'documents'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: ticketId } = await params
  const db = supabase as any

  const { data: attachments, error } = await db
    .from('ticket_attachments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Generate signed URLs for each attachment (valid 1 hour)
  const withUrls = await Promise.all(
    (attachments ?? []).map(async (att: any) => {
      const { data: signed } = await supabase.storage
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
  const db = supabase as any

  // Verify ticket exists and user has access (owner or tenant via lease)
  const { data: ticket } = await db
    .from('tickets')
    .select('id, owner_id')
    .eq('id', ticketId)
    .single()

  if (!ticket) return NextResponse.json({ error: 'Ticket niet gevonden' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Geen bestand meegegeven' }, { status: 400 })

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Bestandstype niet toegestaan (gebruik JPG, PNG, WEBP, HEIC of PDF)' }, { status: 400 })
  }

  // Max 10 MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Bestand te groot (max 10 MB)' }, { status: 400 })
  }

  // Generate unique storage path
  const ext = file.name.split('.').pop() ?? 'bin'
  const attachmentId = crypto.randomUUID()
  const storagePath = `tickets/${ticketId}/${attachmentId}.${ext}`

  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: `Upload mislukt: ${uploadError.message}` }, { status: 500 })
  }

  // Record in DB
  const { data: attachment, error: dbError } = await db
    .from('ticket_attachments')
    .insert({
      ticket_id: ticketId,
      owner_id: ticket.owner_id,
      uploader_id: user.id,
      file_name: file.name,
      mime_type: file.type,
      storage_path: storagePath,
    })
    .select()
    .single()

  if (dbError) {
    // Clean up orphan file
    await supabase.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  // Return with signed URL
  const { data: signed } = await supabase.storage
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

  const db = supabase as any

  const { data: att } = await db
    .from('ticket_attachments')
    .select('id, storage_path, owner_id')
    .eq('id', attachmentId)
    .eq('ticket_id', ticketId)
    .single()

  if (!att) return NextResponse.json({ error: 'Bijlage niet gevonden' }, { status: 404 })
  if (att.owner_id !== user.id) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  await supabase.storage.from(BUCKET).remove([att.storage_path])
  await db.from('ticket_attachments').delete().eq('id', attachmentId)

  return NextResponse.json({ success: true })
}
