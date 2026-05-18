import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { unitId, tenantId, startDate, endDate, monthlyRent, deposit, indexationMethod, indexationPct, indexMonth } = await req.json()
  if (!unitId || !tenantId || !monthlyRent) {
    return NextResponse.json({ error: 'unitId, tenantId en monthlyRent zijn verplicht' }, { status: 400 })
  }

  // Verifieer eigenaarschap via RLS-beschermde client — voorkomt dat iemand
  // een unit of huurder van een andere verhuurder kan koppelen.
  // Units hebben geen owner_id; eigenaarschap loopt via properties.
  const [{ data: unit, error: unitErr }, { data: tenant, error: tenantErr }] = await Promise.all([
    supabase.from('units').select('id, properties!inner(owner_id)').eq('id', unitId).eq('properties.owner_id', user.id).single(),
    (supabase as any).from('tenants').select('id').eq('id', tenantId).eq('owner_id', user.id).single(),
  ])

  if (unitErr || !unit) return NextResponse.json({ error: 'Unit niet gevonden of geen toegang' }, { status: 403 })
  if (tenantErr || !tenant) return NextResponse.json({ error: 'Huurder niet gevonden of geen toegang' }, { status: 403 })

  // Admin client alleen voor payment_profiles — RLS laat client-side inserts hier niet toe
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Server niet geconfigureerd' }, { status: 500 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = admin as any

  const { data: profiles } = await adminAny
    .from('payment_profiles')
    .select('id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)

  let paymentProfileId: string
  if (profiles && profiles.length > 0) {
    paymentProfileId = profiles[0].id
  } else {
    const { data: newProfile, error: profileErr } = await adminAny
      .from('payment_profiles')
      .insert({ owner_id: user.id, name: 'Standaard', pay_date: 1, reminders: [-3, 7, 14] })
      .select('id')
      .single()
    if (profileErr || !newProfile) {
      return NextResponse.json({ error: 'Betaalprofiel aanmaken mislukt' }, { status: 500 })
    }
    paymentProfileId = newProfile.id
  }

  // Lease en unit-update via gewone server client — RLS beschermt mee
  const { data: lease, error: leaseErr } = await (supabase as any)
    .from('leases')
    .insert({
      owner_id: user.id,
      unit_id: unitId,
      tenant_id: tenantId,
      payment_profile_id: paymentProfileId,
      start_date: startDate || new Date().toISOString().slice(0, 10),
      end_date: endDate || null,
      monthly_rent: monthlyRent,
      deposit: deposit || null,
      status: 'actief',
      notes: null,
      base_rent: monthlyRent,
      indexation_method: indexationMethod || 'none',
      indexation_pct: indexationPct || null,
      index_month: indexMonth || null,
    })
    .select()
    .single()

  if (leaseErr) {
    console.error('[api/leases] lease aanmaken mislukt:', leaseErr.message, leaseErr.code)
    return NextResponse.json({ error: leaseErr.message }, { status: 500 })
  }

  await supabase.from('units').update({ status: 'verhuurd' } as never).eq('id', unitId)

  return NextResponse.json({ lease })
}
