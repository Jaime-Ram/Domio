import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { fetchTransactions } from '@/lib/yapily/fetchTransactions'

const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: connection, error: connError } = await supabaseAdmin
    .from('bank_connections')
    .select('id, access_token, account_id')
    .eq('owner_id', user.id)
    .eq('provider', 'yapily')
    .single()

  if (connError || !connection) {
    return NextResponse.json({ error: 'No bank connection found' }, { status: 404 })
  }

  if (!connection.account_id) {
    return NextResponse.json({ error: 'No account ID stored — please reconnect your bank' }, { status: 400 })
  }

  try {
    const result = await fetchTransactions(
      connection.id,
      connection.access_token,
      user.id,
      connection.account_id,
    )
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Yapily sync error:', err)

    if (msg.includes('401') || msg.includes('403')) {
      return NextResponse.json({ error: 'reauth_required' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
