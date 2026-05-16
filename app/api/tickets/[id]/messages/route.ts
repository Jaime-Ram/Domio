import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import * as React from 'react'
import TicketReplyEmail from '@/emails/ticket-reply'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://domiovastgoedbeheer.nl'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: ticketId } = await params
  const { content, visibility = 'public' } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Inhoud vereist' }, { status: 400 })

  const db = supabase as any

  // Fetch ticket + tenant info for email
  const { data: ticket } = await db
    .from('tickets')
    .select(`
      id, title, ticket_number, owner_id,
      leases:lease_id(
        tenants(full_name, profiles:profile_id(email))
      )
    `)
    .eq('id', ticketId)
    .single()

  if (!ticket) return NextResponse.json({ error: 'Ticket niet gevonden' }, { status: 404 })

  // Verhuurder only: owner must match
  if (ticket.owner_id !== user.id) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  // Insert message
  const { data: message, error } = await db
    .from('messages')
    .insert({
      ticket_id: ticketId,
      sender_id: user.id,
      content: content.trim(),
      visibility,
    })
    .select('*, profiles:sender_id(full_name, email)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send email to tenant (only for public messages)
  if (visibility === 'public') {
    try {
      const { data: senderProfile } = await db
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single() as { data: { full_name: string | null } | null }

      const tenant = ticket.leases?.tenants
      const tenantEmail = tenant?.profiles?.email
      const tenantName = tenant?.full_name ?? 'Huurder'

      if (tenantEmail) {
        await sendEmail({
          to: tenantEmail,
          subject: `Reactie op je ticket: ${ticket.title}`,
          react: React.createElement(TicketReplyEmail, {
            recipientName: tenantName,
            senderName: senderProfile?.full_name ?? 'Verhuurder',
            ticketTitle: ticket.title,
            ticketNumber: ticket.ticket_number ?? null,
            messageContent: content.trim(),
            portalUrl: `${APP_URL}/dashboard/tenant/tickets`,
            direction: 'landlord_to_tenant',
          }),
          tags: ['ticket-reply'],
        })
      }
    } catch (emailErr) {
      console.error('[email] ticket-reply failed:', emailErr)
    }
  }

  return NextResponse.json({ success: true, message })
}
