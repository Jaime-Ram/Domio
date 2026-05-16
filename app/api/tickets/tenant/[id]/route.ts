import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = supabase as any
  const { id: ticketId } = await params

  // Fetch ticket with events + public messages (RLS enforces tenant access)
  const { data: ticket, error } = await db
    .from('tickets')
    .select(`
      id, title, description, status, priority, category, source,
      ticket_number, created_at, due_date, sla_deadline, resolved_at,
      ticket_events(id, event_type, from_value, to_value, created_at, profiles:actor_id(full_name)),
      messages(id, content, visibility, created_at, profiles:sender_id(full_name))
    `)
    .eq('id', ticketId)
    .single()

  if (error || !ticket) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  // Filter messages: tenant only sees public messages
  const publicMessages = (ticket.messages ?? []).filter((m: any) => m.visibility !== 'internal')

  return NextResponse.json({
    ticket: {
      ...ticket,
      messages: publicMessages,
    },
  })
}
