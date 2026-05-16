import { after } from 'next/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildInvitationUrl, sendTenantInvitationEmail } from '@/lib/invitations'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { tenantId } = await req.json()
    if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 })

    // Fetch tenant + owner profile
    const [{ data: tenantRaw }, { data: ownerRaw }] = await Promise.all([
      supabase.from('tenants').select('id, full_name, email, owner_id').eq('id', tenantId).single(),
      supabase.from('profiles').select('full_name, company_name').eq('id', user.id).single(),
    ])
    const tenant = tenantRaw as any
    const owner = ownerRaw as any

    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    if (tenant.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (!tenant.email) return NextResponse.json({ error: 'Tenant has no email address' }, { status: 400 })

    const db = supabase as any

    // Cancel any existing pending invitation for this tenant
    await db
      .from('tenant_invitations')
      .update({ status: 'cancelled' })
      .eq('tenant_id', tenantId)
      .eq('status', 'pending')

    // Create new invitation record
    const { data: invitation, error: insertError } = await db
      .from('tenant_invitations')
      .insert({
        tenant_id: tenantId,
        owner_id: user.id,
        email: tenant.email,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) throw insertError

    // Find property address via active lease → unit → property
    const { data: leaseRaw } = await supabase
      .from('leases')
      .select('units(unit_number, properties(address, city))')
      .eq('tenant_id', tenantId)
      .eq('status', 'actief')
      .limit(1)
      .maybeSingle()

    const lease = leaseRaw as any
    const unit = lease?.units
    const property = unit?.properties
    const propertyAddress = property
      ? `${property.address}${unit?.unit_number ? ` (${unit.unit_number})` : ''}, ${property.city}`
      : 'jouw woning'

    const landlordName = owner?.company_name || owner?.full_name || 'Je verhuurder'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://domiovastgoedbeheer.nl'

    // Build URL synchronously so we can return immediately
    const { portalUrl } = await buildInvitationUrl({
      invitationId: invitation.id,
      tenantId,
      ownerId: user.id,
      tenantEmail: tenant.email,
      appUrl,
    })

    // Send email after response — user sees instant feedback
    after(async () => {
      try {
        await sendTenantInvitationEmail({
          tenantEmail: tenant.email,
          tenantName: tenant.full_name,
          landlordName,
          propertyAddress,
          portalUrl,
        })
      } catch (err) {
        console.error('[invitations/send] email failed', err)
      }
    })

    return NextResponse.json({ success: true, portalUrl })
  } catch (err: any) {
    console.error('[invitations/send]', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
