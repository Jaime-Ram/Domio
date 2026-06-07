import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Owner-scoped tables included in the AVG data export. RLS restricts each
// select to the rows the logged-in user is allowed to see (their own data).
const OWNER_TABLES = [
  'portfolios',
  'properties',
  'units',
  'tenants',
  'leases',
  'lease_tenants',
  'payments',
  'payment_assignments',
  'rent_expectations',
  'documents',
  'tickets',
  'ticket_events',
  'work_orders',
  'messages',
  'contacts',
  'tasks',
  'flows',
  'subscriptions',
  'mjop_buildings',
  'mjop_elements',
  'mjop_inspections',
] as const

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }

  const sb = supabase as any
  const out: Record<string, unknown> = {
    _meta: {
      generated_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      note: 'AVG-gegevensexport (recht op inzage en dataportabiliteit). Bevat de persoonsgegevens die aan dit account zijn gekoppeld. Documentbestanden zelf zijn niet opgenomen, alleen de metadata.',
    },
  }

  // Eigen profiel
  try {
    const { data } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle()
    out.profile = data ?? null
  } catch {
    out.profile = null
  }

  // Eigenaar-gescopte tabellen (RLS beperkt tot eigen rijen)
  await Promise.all(
    OWNER_TABLES.map(async (table) => {
      try {
        const { data } = await sb.from(table).select('*')
        out[table] = data ?? []
      } catch {
        out[table] = []
      }
    }),
  )

  const body = JSON.stringify(out, null, 2)
  const date = new Date().toISOString().slice(0, 10)
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="domio-gegevensexport-${date}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
