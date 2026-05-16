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
  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Inhoud vereist' }, { status: 400 })

  const db = supabase as any

  // Verify tenant has access to this ticket via their lease
  const { data: access } = await db
    .from('tickets')
    .select(`
      id, title, ticket_number, owner_id,
      leases:lease_id(
        tenants(profile_id, full_name)
      )
    `)
    .eq('id', ticketId)
    .single()

  if (!access) return NextResponse.json({ error: 'Ticket niet gevonden' }, { status: 404 })

  const tenant = access.leases?.tenants
  if (!tenant || tenant.profile_id !== user.id) {
    return NextResponse.json({ error: 'Geen toegang tot dit ticket' }, { status: 403 })
  }

  // Insert message (RLS: tenant_insert_public_messages policy vereist)
  const { data: message, error } = await db
    .from('messages')
    .insert({
      ticket_id: ticketId,
      sender_id: user.id,
      content: content.trim(),
      visibility: 'public',
    })
    .select('*, profiles:sender_id(full_name, email)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send email to landlord
  try {
    const { data: landlordProfile } = await db
      .from('profiles')
      .select('email, full_name')
      .eq('id', access.owner_id)
      .single() as { data: { email: string; full_name: string | null } | null }

    const { data: tenantProfile } = await db
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single() as { data: { full_name: string | null } | null }

    if (landlordProfile?.email) {
      await sendEmail({
        to: landlordProfile.email,
        subject: `Huurder heeft gereageerd op ticket: ${access.title}`,
        react: React.createElement(TicketReplyEmail, {
          recipientName: landlordProfile.full_name ?? 'Verhuurder',
          senderName: tenantProfile?.full_name ?? tenant.full_name ?? 'Huurder',
          ticketTitle: access.title,
          ticketNumber: access.ticket_number ?? null,
          messageContent: content.trim(),
          portalUrl: `${APP_URL}/dashboard/landlord/maintenance`,
          direction: 'tenant_to_landlord',
        }),
        tags: ['ticket-reply'],
      })
    }
  } catch (emailErr) {
    console.error('[email] tenant-reply failed:', emailErr)
  }

  return NextResponse.json({ success: true, message })
}
