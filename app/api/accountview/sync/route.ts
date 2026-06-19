import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { fetchPayments } from '@/lib/accountview/fetchPayments'

export const runtime = 'nodejs'

/**
 * GET /api/accountview/sync
 * Haalt betalingen op uit de Accountview-koppeling van de ingelogde gebruiker
 * en draait de matcher (via fetchPayments).
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: connection, error } = await admin
    .from('bank_connections')
    .select('id, config')
    .eq('owner_id', user.id)
    .eq('provider', 'accountview')
    .single<{ id: string; config: { endpoint: string; secret: string } | null }>()

  if (error || !connection?.config) {
    return NextResponse.json({ error: 'Geen Accountview-koppeling gevonden' }, { status: 404 })
  }

  try {
    const result = await fetchPayments(connection.id, user.id, connection.config)
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Accountview sync error:', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
