import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyInvitationToken } from '@/lib/invitations'

/**
 * Publieke samenvatting van een uitnodiging op basis van het token.
 * Het token (uit de e-mail) bewijst e-mailbezit, dus we mogen de
 * uitnodigingsgegevens teruggeven aan wie de link heeft.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'token ontbreekt' }, { status: 400 })

  let payload
  try {
    payload = await verifyInvitationToken(token)
  } catch {
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'config' }, { status: 500 })
  const db = admin as any

  const [{ data: invitation }, { data: owner }, { data: lease }] = await Promise.all([
    db.from('tenant_invitations').select('status').eq('id', payload.invitationId).single(),
    db.from('profiles').select('full_name, company_name').eq('id', payload.ownerId).single(),
    db
      .from('leases')
      .select('monthly_rent, units(unit_number, properties(address, city))')
      .eq('tenant_id', payload.tenantId)
      .eq('status', 'actief')
      .limit(1)
      .maybeSingle(),
  ])

  const unit = (lease as any)?.units
  const property = unit?.properties

  return NextResponse.json({
    email: payload.email,
    status: invitation?.status ?? 'pending',
    landlord: (owner as any)?.company_name || (owner as any)?.full_name || 'Je verhuurder',
    property: property
      ? `${property.address}${unit?.unit_number ? `, ${unit.unit_number}` : ''}, ${property.city}`
      : null,
    monthlyRent: (lease as any)?.monthly_rent ?? null,
  })
}
