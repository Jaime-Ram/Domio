import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { readJson } from '@/lib/api/validation'
import { encryptJson } from '@/lib/crypto/secrets'

export const runtime = 'nodejs'

const connectSchema = z.object({
  endpoint: z.string().trim().url().max(500),
  username: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(500),
})

/**
 * POST /api/accountview/connect
 * Slaat de Accountview-webservice koppeling op voor de ingelogde gebruiker.
 * Credentials worden versleuteld (AES-256-GCM) in bank_connections.config.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = await readJson(request, connectSchema)
  if (!parsed.ok) return parsed.response
  const { endpoint, username, password } = parsed.data

  const config = { endpoint, secret: encryptJson({ username, password }) }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { error } = await admin
    .from('bank_connections')
    .upsert(
      { owner_id: user.id, provider: 'accountview', config, updated_at: new Date().toISOString() },
      { onConflict: 'owner_id,provider' },
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
