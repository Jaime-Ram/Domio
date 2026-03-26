import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

type DocumentInsert = Database['public']['Tables']['documents']['Insert']
type DocumentRow = Database['public']['Tables']['documents']['Row']

const DOCUMENTS_BUCKET = 'documents'
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/octet-stream', // fallback wanneer browser geen type stuurt
]

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200) || 'document'
}

/** Runtime FormData van Request heeft `.entries()`; TS-typen botsen tussen DOM/undici. */
function formDataGet(formData: unknown, key: string): string | File | null {
  const fd = formData as { entries?: () => IterableIterator<[string, unknown]> }
  if (typeof fd.entries !== 'function') return null
  for (const [k, value] of fd.entries()) {
    if (k !== key) continue
    if (typeof value === 'string') return value
    if (value instanceof File) return value
  }
  return null
}

/**
 * POST /api/documents/upload
 * FormData: file (required), name? (display name), type? (Contract|Keuring|Factuur|Verzekering|Overig), property_id?
 * Uploads file to Storage and creates/updates document row.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
    }

    const formData = await request.formData()
    const fileCandidate = formDataGet(formData, 'file')
    const file = fileCandidate instanceof File ? fileCandidate : null
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Geen bestand ontvangen. Stuur een bestand onder de key "file".' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Bestand is te groot. Maximum ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.` },
        { status: 400 }
      )
    }

    const mimeType = file.type || 'application/octet-stream'
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Bestandstype niet toegestaan. Toegestaan: PDF, Word (.doc/.docx), tekst, CSV, afbeeldingen (JPEG, PNG, WebP).' },
        { status: 400 }
      )
    }

    const nameRaw = formDataGet(formData, 'name')
    const typeRaw = formDataGet(formData, 'type')
    const propertyRaw = formDataGet(formData, 'property_id')
    const nameOverride = typeof nameRaw === 'string' ? nameRaw.trim() : undefined
    const typeParam = typeof typeRaw === 'string' ? typeRaw.trim() : undefined
    const propertyIdParam = typeof propertyRaw === 'string' ? propertyRaw : null
    const docType = ['Contract', 'Keuring', 'Factuur', 'Verzekering', 'Overig'].includes(typeParam || '')
      ? typeParam
      : 'Overig'
    const propertyId = propertyIdParam && propertyIdParam.length > 0 ? propertyIdParam : null

    const displayName = nameOverride || file.name.replace(/\.[^.]+$/, '') || 'Document'
    const fileName = sanitizeFileName(file.name || `${displayName}.pdf`)

    // 1) Insert document row (we need id for storage path)
    const insertPayload: DocumentInsert = {
      owner_id: user.id,
      property_id: propertyId,
      name: displayName,
      type: docType as 'Contract' | 'Keuring' | 'Factuur' | 'Verzekering' | 'Overig',
      file_name: fileName,
      mime_type: mimeType,
      source: 'upload',
    }
    const { data: insertData, error: insertError } = await supabase
      .from('documents')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase generic infers never for documents table
      .insert(insertPayload as any)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message || 'Document aanmaken mislukt' },
        { status: 500 }
      )
    }
    const doc = insertData as DocumentRow

    const storagePath = `${user.id}/${doc.id}/${fileName}`

    const admin = createAdminClient()
    if (!admin) {
      // Rollback: delete document row
      await supabase.from('documents').delete().eq('id', doc.id)
      return NextResponse.json(
        { error: 'Storage niet geconfigureerd (SUPABASE_SERVICE_ROLE_KEY)' },
        { status: 500 }
      )
    }

    // 2) Ensure bucket exists (ignore "already exists")
    const { error: bucketError } = await admin.storage.createBucket(DOCUMENTS_BUCKET, { public: false })
    if (bucketError && !bucketError.message?.toLowerCase().includes('already exists')) {
      await supabase.from('documents').delete().eq('id', doc.id)
      return NextResponse.json(
        { error: bucketError.message || 'Bucket aanmaken mislukt' },
        { status: 500 }
      )
    }

    // 3) Upload file (use arrayBuffer for Node/Edge)
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await admin.storage
      .from(DOCUMENTS_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      })

    if (uploadError) {
      await supabase.from('documents').delete().eq('id', doc.id)
      return NextResponse.json(
        { error: uploadError.message || 'Upload mislukt' },
        { status: 500 }
      )
    }

    // 4) Update document with storage_path
    const { data: updateData, error: updateError } = await supabase
      .from('documents')
      // @ts-expect-error Supabase client infers documents table as never
      .update({ storage_path: storagePath })
      .eq('id', doc.id)
      .select()
      .single()
    const updated = updateData as DocumentRow | null

    if (updateError) {
      // Document exists but path not set; storage has file. Still return doc with path for consistency
    }

    return NextResponse.json({
      document: updated || { ...doc, storage_path: storagePath },
    })
  } catch (e) {
    console.error('Documents upload error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Upload mislukt' },
      { status: 500 }
    )
  }
}
