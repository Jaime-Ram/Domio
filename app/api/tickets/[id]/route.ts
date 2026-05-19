import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import * as React from 'react'
import TicketStatusChangedEmail from '@/emails/ticket-status-changed'
import TicketAssignedEmail from '@/emails/ticket-assigned'

const PORTAL_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://domiovastgoedbeheer.nl'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: ticketId } = await params
  const body = await req.json()
  const { status, priority, category, assignee_id, due_date, sla_deadline, resolved_at, message } = body

  const db = supabase as any

  // Fetch current ticket + tenant info for email
  const { data: ticket, error: fetchError } = await db
    .from('tickets')
    .select(`
      id, status, priority, category, title, ticket_number, owner_id,
      leases:lease_id(
        tenants(profile_id, full_name, profiles:profile_id(email))
      )
    `)
    .eq('id', ticketId)
    .single()

  if (fetchError || !ticket) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  // Build update payload
  const updates: Record<string, any> = {}
  if (status !== undefined) updates.status = status
  if (priority !== undefined) updates.priority = priority
  if (category !== undefined) updates.category = category
  if (assignee_id !== undefined) updates.assignee_id = assignee_id
  if (due_date !== undefined) updates.due_date = due_date
  if (sla_deadline !== undefined) updates.sla_deadline = sla_deadline
  if (resolved_at !== undefined) updates.resolved_at = resolved_at
  if (status === 'afgerond' && !resolved_at) updates.resolved_at = new Date().toISOString()

  const { data: updated, error: updateError } = await db
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Log event for status change
  if (status && status !== ticket.status) {
    await db.from('ticket_events').insert({
      ticket_id: ticketId,
      actor_id: user.id,
      event_type: 'status_changed',
      from_value: ticket.status,
      to_value: status,
    })

    // Send email to tenant if ticket was submitted by tenant via lease
    try {
      const lease = ticket.leases
      const tenant = lease?.tenants
      const tenantProfile = tenant?.profiles
      const tenantEmail = tenantProfile?.email
      const tenantName = tenant?.full_name ?? 'Huurder'

      if (tenantEmail) {
        await sendEmail({
          to: tenantEmail,
          subject: `Update voor je ticket: ${ticket.title}`,
          react: React.createElement(TicketStatusChangedEmail, {
            tenantName,
            ticketTitle: ticket.title,
            ticketNumber: ticket.ticket_number ?? null,
            fromStatus: ticket.status,
            toStatus: status,
            propertyLabel: 'je huurobject',
            message: message ?? null,
            portalUrl: `${PORTAL_URL}/dashboard/tenant/tickets`,
          }),
          tags: ['ticket-status-changed'],
        })
      }
    } catch (emailErr) {
      console.error('[email] ticket-status-changed failed:', emailErr)
    }
  }

  // Log event for priority change
  if (priority && priority !== ticket.priority) {
    await db.from('ticket_events').insert({
      ticket_id: ticketId,
      actor_id: user.id,
      event_type: 'priority_changed',
      from_value: ticket.priority,
      to_value: priority,
    })
  }

  // Log event for category change
  if (category && category !== ticket.category) {
    await db.from('ticket_events').insert({
      ticket_id: ticketId,
      actor_id: user.id,
      event_type: 'category_changed',
      from_value: ticket.category,
      to_value: category,
    })
  }

  // Log event + email for assignee change
  if (assignee_id !== undefined && assignee_id !== ticket.assignee_id) {
    await db.from('ticket_events').insert({
      ticket_id: ticketId,
      actor_id: user.id,
      event_type: 'assigned',
      from_value: ticket.assignee_id ?? null,
      to_value: assignee_id ?? null,
    })

    if (assignee_id && assignee_id !== user.id) {
      try {
        const { data: assigneeProfile } = await db
          .from('profiles')
          .select('email, full_name')
          .eq('id', assignee_id)
          .single() as { data: { email: string; full_name: string | null } | null }

        const { data: senderProfile } = await db
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single() as { data: { full_name: string | null } | null }

        if (assigneeProfile?.email) {
          await sendEmail({
            to: assigneeProfile.email,
            subject: `Ticket aan jou toegewezen: ${ticket.title}`,
            react: React.createElement(TicketAssignedEmail, {
              assigneeName: assigneeProfile.full_name ?? 'Collega',
              assignedByName: senderProfile?.full_name ?? 'Verhuurder',
              ticketTitle: ticket.title,
              ticketNumber: ticket.ticket_number ?? null,
              category: ticket.category ?? null,
              priority: ticket.priority,
              dashboardUrl: `${PORTAL_URL}/dashboard/landlord/maintenance?ticket=${ticketId}`,
            }),
            tags: ['ticket-assigned'],
          })
        }
      } catch (emailErr) {
        console.error('[email] ticket-assigned failed:', emailErr)
      }
    }
  }

  return NextResponse.json({ success: true, ticket: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: ticketId } = await params
  const db = supabase as any

  const { data: ticket } = await db
    .from('tickets')
    .select('owner_id')
    .eq('id', ticketId)
    .single()

  if (!ticket || ticket.owner_id !== user.id)
    return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  const { error } = await db.from('tickets').delete().eq('id', ticketId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
