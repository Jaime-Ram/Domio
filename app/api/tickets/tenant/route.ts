import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import * as React from 'react'
import TicketSubmittedEmail from '@/emails/ticket-submitted'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://domiovastgoedbeheer.nl'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = supabase as any

  // Haal tenant op via profile_id
  const { data: tenant } = await db
    .from('tenants')
    .select('id, owner_id')
    .eq('profile_id', user.id)
    .single()

  if (!tenant) return NextResponse.json({ tickets: [], context: null })

  // Haal lease context op via lease_tenants join table
  const { data: leaseTenantRows } = await db
    .from('lease_tenants')
    .select('lease_id')
    .eq('tenant_id', tenant.id)

  const leaseIds = (leaseTenantRows ?? []).map((r: any) => r.lease_id)

  const { data: lease } = leaseIds.length
    ? await db
        .from('leases')
        .select('id, unit_id, owner_id, units(id, unit_number, properties(id, name, address, city))')
        .in('id', leaseIds)
        .in('status', ['actief', 'concept'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  const unit = lease?.units
  const property = unit?.properties

  // Haal tickets op die door deze huurder aangemaakt zijn
  const { data: tickets } = await db
    .from('tickets')
    .select('id, title, description, status, priority, scope, category, created_at, due_date')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({
    tickets: tickets ?? [],
    context: lease ? {
      leaseId: lease.id,
      unitId: unit?.id ?? null,
      unitLabel: unit?.unit_number ? `Kamer ${unit.unit_number}` : 'Mijn object',
      propertyId: property?.id ?? null,
      propertyLabel: property ? `${property.address}, ${property.city}` : null,
      ownerId: lease.owner_id,
    } : null,
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, leaseId, ownerId, category, priority, due_date } = await req.json()
  if (!title || !leaseId || !ownerId) return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 })

  const db = supabase as any

  const SLA_HOURS: Record<string, number> = { urgent: 4, hoog: 24, normaal: 72, laag: 168 }
  const resolvedPriority = priority ?? 'normaal'
  const slaDeadline = new Date(Date.now() + (SLA_HOURS[resolvedPriority] ?? 72) * 3600000).toISOString()

  const { data: ticket, error } = await db
    .from('tickets')
    .insert({
      owner_id: ownerId,
      created_by: user.id,
      title,
      description: description || null,
      status: 'open',
      priority: resolvedPriority,
      scope: 'lease',
      lease_id: leaseId,
      source: 'tenant',
      category: category || 'onderhoud',
      due_date: due_date || null,
      sla_deadline: slaDeadline,
    })
    .select('id, ticket_number')
    .single()

  if (error) return NextResponse.json({ error: `${error.message} (${error.code})` }, { status: 500 })

  // Notify landlord via email
  try {
    const { data: landlordProfile } = await db
      .from('profiles')
      .select('email, full_name')
      .eq('id', ownerId)
      .single() as { data: { email: string; full_name: string | null } | null }

    const { data: tenantProfile } = await db
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single() as { data: { full_name: string | null } | null }

    if (landlordProfile?.email) {
      // Resolve property label via lease → unit → property
      let propertyLabel = 'een van je objecten'
      const { data: lease } = await db
        .from('leases')
        .select('units(unit_number, properties(address, city))')
        .eq('id', leaseId)
        .maybeSingle()
      if (lease?.units) {
        const unit = lease.units as { unit_number: string | null; properties: { address: string; city: string } | null } | null
        const prop = unit?.properties
        if (prop) propertyLabel = `${prop.address}, ${prop.city}`
      }

      await sendEmail({
        to: landlordProfile.email,
        subject: `Nieuw ticket van huurder: ${title}`,
        react: React.createElement(TicketSubmittedEmail, {
          landlordName: landlordProfile.full_name ?? 'Verhuurder',
          tenantName: tenantProfile?.full_name ?? 'Huurder',
          ticketTitle: title,
          ticketNumber: ticket.ticket_number ?? null,
          propertyLabel,
          category: category || 'onderhoud',
          description: description || null,
          dashboardUrl: `${APP_URL}/dashboard/landlord/maintenance`,
        }),
        tags: ['ticket-submitted'],
      })
    }
  } catch (emailErr) {
    console.error('[email] ticket-submitted failed:', emailErr)
  }

  return NextResponse.json({ success: true, ticketId: ticket.id })
}
