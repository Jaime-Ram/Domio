import { after } from 'next/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateNewRent } from '@/lib/indexation'
import { sendRentIncreaseEmail } from '@/lib/rent-increase-email'

/**
 * POST /api/leases/index
 * Body: { leaseId: string, preview?: boolean, sendEmail?: boolean }
 *
 * preview=true  → retourneert berekening zonder op te slaan
 * preview=false → past indexatie toe, slaat op, stuurt optioneel e-mail
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { leaseId, preview = false, sendEmail = true } = await req.json()
  if (!leaseId) return NextResponse.json({ error: 'leaseId is verplicht' }, { status: 400 })

  // Haal lease + huurder + pand op in één query
  const { data: lease, error: leaseErr } = await (supabase as any)
    .from('leases')
    .select('*, tenants(id, full_name, email), units(unit_number, properties(address, city))')
    .eq('id', leaseId)
    .eq('owner_id', user.id)
    .single()

  if (leaseErr || !lease) {
    return NextResponse.json({ error: 'Lease niet gevonden' }, { status: 404 })
  }

  const result = await calculateNewRent(lease)
  if (!result) {
    return NextResponse.json({ error: 'Geen indexatie van toepassing op dit contract' }, { status: 422 })
  }

  if (preview) {
    return NextResponse.json({ result })
  }

  // Nieuwe huur opslaan
  const today = new Date().toISOString().slice(0, 10)
  const { error: updateErr } = await (supabase as any)
    .from('leases')
    .update({
      monthly_rent: result.newRent,
      last_indexed_at: today,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leaseId)
    .eq('owner_id', user.id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // Audittrail
  await (supabase as any)
    .from('ticket_events')
    .insert({
      ticket_id: null,
      actor_id: user.id,
      event_type: 'rent_indexed',
      from_value: String(result.oldRent),
      to_value: String(result.newRent),
      metadata: {
        lease_id: leaseId,
        factor: result.factor,
        percentage: result.percentage,
        method: result.method,
        cpi_year: result.cpiYear,
        cpi_month: result.cpiMonth,
      },
    })
    .catch(() => {})

  // E-mail na response (non-blocking)
  if (sendEmail) {
    const tenant = lease.tenants
    const property = lease.units?.properties

    if (tenant?.email) {
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('full_name, company_name')
        .eq('id', user.id)
        .single()
      const ownerRaw = ownerProfile as any
      const landlordName = ownerRaw?.company_name || ownerRaw?.full_name || 'Je verhuurder'

      const propertyAddress = property
        ? `${property.address}${lease.units?.unit_number ? ` (${lease.units.unit_number})` : ''}, ${property.city}`
        : 'jouw woning'

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://domiovastgoedbeheer.nl'
      const effectiveMonth = new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })

      after(async () => {
        try {
          await sendRentIncreaseEmail({
            tenantEmail: tenant.email,
            tenantName: tenant.full_name,
            landlordName,
            propertyAddress,
            result,
            effectiveDate: `1 ${effectiveMonth}`,
            portalUrl: `${appUrl}/portal`,
          })
        } catch (err) {
          console.error('[leases/index] email failed', err)
        }
      })
    }
  }

  return NextResponse.json({ result })
}
