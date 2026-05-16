import { after } from 'next/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildInvitationUrl, sendTenantInvitationEmail } from '@/lib/invitations'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { unitId, tenantName, tenantEmail } = await req.json()
    if (!unitId || !tenantName || !tenantEmail) {
      return NextResponse.json({ error: 'unitId, tenantName en tenantEmail zijn verplicht' }, { status: 400 })
    }

    // Verify unit belongs to a property owned by this user
    const { data: unit } = await supabase
      .from('units')
      .select('id, unit_number, monthly_rent, properties(id, address, city, owner_id)')
      .eq('id', unitId)
      .single()

    const property = (unit as any)?.properties
    if (!unit || !property) return NextResponse.json({ error: 'Unit niet gevonden' }, { status: 404 })
    if (property.owner_id !== user.id) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

    const db = supabase as any

    // Fetch owner profile for landlord name
    const { data: ownerRaw } = await supabase
      .from('profiles')
      .select('full_name, company_name')
      .eq('id', user.id)
      .single()
    const owner = ownerRaw as any

    // Create tenant
    const { data: tenantRaw, error: tenantError } = await (supabase as any)
      .from('tenants')
      .insert({ owner_id: user.id, full_name: tenantName, email: tenantEmail })
      .select('id')
      .single()
    if (tenantError) throw tenantError
    const tenant = tenantRaw as { id: string }

    // Create lease linking tenant to unit (concept status — landlord fills details later)
    const today = new Date().toISOString().slice(0, 10)
    await (supabase as any).from('leases').insert({
      owner_id: user.id,
      unit_id: unitId,
      tenant_id: tenant.id,
      start_date: today,
      monthly_rent: (unit as any).monthly_rent ?? 0,
      status: 'concept',
    })

    // Cancel any existing pending invitations for this tenant (shouldn't exist, but defensive)
    await db
      .from('tenant_invitations')
      .update({ status: 'cancelled' })
      .eq('tenant_id', tenant.id)
      .eq('status', 'pending')

    // Create invitation record
    const { data: invitation, error: inviteError } = await db
      .from('tenant_invitations')
      .insert({ tenant_id: tenant.id, owner_id: user.id, email: tenantEmail, status: 'pending' })
      .select('id')
      .single()
    if (inviteError) throw inviteError

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://domiovastgoedbeheer.nl'
    const landlordName = owner?.company_name || owner?.full_name || 'Je verhuurder'
    const propertyAddress = `${property.address}${(unit as any).unit_number ? `, ${(unit as any).unit_number}` : ''}, ${property.city}`

    const { portalUrl } = await buildInvitationUrl({
      invitationId: invitation.id,
      tenantId: tenant.id,
      ownerId: user.id,
      tenantEmail,
      appUrl,
    })

    after(async () => {
      try {
        await sendTenantInvitationEmail({ tenantEmail, tenantName, landlordName, propertyAddress, portalUrl })
      } catch (err) {
        console.error('[invite-to-unit] email failed', err)
      }
    })

    return NextResponse.json({ success: true, tenantId: tenant.id, portalUrl })
  } catch (err: any) {
    console.error('[invite-to-unit]', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
