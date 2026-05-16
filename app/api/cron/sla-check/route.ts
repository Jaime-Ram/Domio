import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import * as React from 'react'
import TicketSlaExceededEmail from '@/emails/ticket-sla-exceeded'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://domiovastgoedbeheer.nl'

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const db = supabase as any

  // Tickets met overschreden SLA die nog niet gesloten zijn
  const { data: overdueTickets, error } = await db
    .from('tickets')
    .select(`
      id, title, ticket_number, priority, owner_id, sla_deadline, created_at,
      properties:property_id(name, address, city),
      leases:lease_id(units(properties(name, address, city))),
      ticket_events(event_type)
    `)
    .lt('sla_deadline', new Date().toISOString())
    .not('status', 'in', '("afgerond","geannuleerd")')

  if (error) {
    console.error('[cron/sla-check] query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const toProcess = (overdueTickets ?? []).filter((t: any) => {
    // Sla over als we al een 'sla_exceeded' event hebben gelogd
    const alreadyNotified = (t.ticket_events ?? []).some(
      (ev: any) => ev.event_type === 'sla_exceeded'
    )
    return !alreadyNotified
  })

  let sent = 0
  const errors: string[] = []

  for (const ticket of toProcess) {
    try {
      // Haal eigenaar op
      const { data: owner } = await db
        .from('profiles')
        .select('email, full_name')
        .eq('id', ticket.owner_id)
        .single() as { data: { email: string; full_name: string | null } | null }

      if (!owner?.email) continue

      // Bereken hoe laat
      const deadline = new Date(ticket.sla_deadline)
      const hoursOverdue = Math.floor((Date.now() - deadline.getTime()) / 3600000)

      // Property label
      const prop = ticket.properties ?? ticket.leases?.units?.properties
      const propertyLabel = prop
        ? `${prop.address ?? prop.name}, ${prop.city ?? ''}`.trim().replace(/,$/, '')
        : 'een van je objecten'

      await sendEmail({
        to: owner.email,
        subject: `SLA overschreden: ${ticket.title}`,
        react: React.createElement(TicketSlaExceededEmail, {
          landlordName: owner.full_name ?? 'Verhuurder',
          ticketTitle: ticket.title,
          ticketNumber: ticket.ticket_number ?? null,
          priority: ticket.priority,
          hoursOverdue,
          propertyLabel,
          dashboardUrl: `${APP_URL}/dashboard/landlord/maintenance?ticket=${ticket.id}`,
        }),
        tags: ['sla-exceeded'],
      })

      // Log event zodat we niet dubbel sturen
      await db.from('ticket_events').insert({
        ticket_id: ticket.id,
        actor_id: null,
        event_type: 'sla_exceeded',
        from_value: null,
        to_value: `${hoursOverdue}h over`,
      })

      sent++
    } catch (e: any) {
      errors.push(`${ticket.id}: ${e.message}`)
    }
  }

  return NextResponse.json({
    ok: true,
    checked: toProcess.length,
    sent,
    errors: errors.length > 0 ? errors : undefined,
  })
}
