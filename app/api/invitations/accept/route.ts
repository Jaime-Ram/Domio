import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { verifyInvitationToken } from '@/lib/invitations'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'token en password zijn verplicht' }, { status: 400 })
    }

    // Verify JWT
    let payload
    try {
      payload = await verifyInvitationToken(token)
    } catch {
      return NextResponse.json({ error: 'Uitnodigingslink is verlopen of ongeldig.' }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!admin) return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })

    const db = admin as any

    // Check invitation is still pending
    const { data: invitation } = await db
      .from('tenant_invitations')
      .select('id, status, email')
      .eq('id', payload.invitationId)
      .single()

    if (!invitation) return NextResponse.json({ error: 'Uitnodiging niet gevonden.' }, { status: 404 })
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Deze uitnodiging is al gebruikt of geannuleerd.' }, { status: 400 })
    }

    // Check if auth user already exists
    const { data: existingUsers } = await admin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === payload.email)

    let userId: string

    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create new auth user (email already verified via magic link)
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: payload.email,
        password,
        email_confirm: true,
      })
      if (createError) throw createError
      userId = newUser.user.id

      // Create profile for the new user
      const { data: tenantData } = await (admin as any).from('tenants').select('full_name').eq('id', payload.tenantId).single()
      await admin.from('profiles').upsert({
        id: userId,
        email: payload.email,
        full_name: (tenantData as any)?.full_name ?? '',
        role: 'huurder',
      } as any)
    }

    // Link profile_id to tenant record
    await (admin as any)
      .from('tenants')
      .update({ profile_id: userId })
      .eq('id', payload.tenantId)

    // Mark invitation as accepted
    await db
      .from('tenant_invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', payload.invitationId)

    // Sign in the user and return a session cookie
    const supabase = await createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password,
    })
    if (signInError) throw signInError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[invitations/accept]', err)
    return NextResponse.json({ error: err.message || 'Onbekende fout' }, { status: 500 })
  }
}
