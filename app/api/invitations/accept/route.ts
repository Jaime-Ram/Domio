import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { verifyInvitationToken } from '@/lib/invitations'

export async function POST(req: NextRequest) {
  try {
    const { token, invitationId: bodyInvitationId, password } = await req.json()
    if (!token && !bodyInvitationId) {
      return NextResponse.json({ error: 'token of invitationId is verplicht' }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!admin) return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })

    const db = admin as any

    // Bepaal welke uitnodiging het betreft + het bijbehorende e-mailadres.
    // Via e-maillink: token (JWT bewijst e-mailbezit, wachtwoord mag).
    // In-app (al ingelogd): invitationId — altijd de password-loze authed flow.
    let invitationDbId: string
    let tenantId: string
    let email: string
    const authedOnly = !token // invitationId-pad vereist een ingelogde sessie

    if (token) {
      let payload
      try {
        payload = await verifyInvitationToken(token)
      } catch {
        return NextResponse.json({ error: 'Uitnodigingslink is verlopen of ongeldig.' }, { status: 400 })
      }
      invitationDbId = payload.invitationId
      tenantId = payload.tenantId
      email = payload.email.toLowerCase()
    } else {
      const { data: inv } = await db
        .from('tenant_invitations')
        .select('id, tenant_id, email, status')
        .eq('id', bodyInvitationId)
        .single()
      if (!inv) return NextResponse.json({ error: 'Uitnodiging niet gevonden.' }, { status: 404 })
      invitationDbId = inv.id
      tenantId = inv.tenant_id
      email = (inv.email ?? '').toLowerCase()
    }

    // Check invitation is still pending
    const { data: invitation, error: invitationErr } = await db
      .from('tenant_invitations')
      .select('id, status, email')
      .eq('id', invitationDbId)
      .single()

    // PGRST116 = geen rij gevonden; elke andere fout (bv. permission denied)
    // is een serverfout en mag niet als "niet gevonden" worden verstopt.
    if (invitationErr && invitationErr.code !== 'PGRST116') {
      console.error('[invitations/accept] DB-fout bij ophalen uitnodiging', invitationErr)
      return NextResponse.json({ error: 'Kon de uitnodiging niet ophalen. Probeer het later opnieuw.' }, { status: 500 })
    }
    if (!invitation) return NextResponse.json({ error: 'Uitnodiging niet gevonden.' }, { status: 404 })
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Deze uitnodiging is al gebruikt of geannuleerd.' }, { status: 400 })
    }

    const supabase = await createClient()
    let userId: string

    if (authedOnly || !password) {
      // ── Pad 1: al ingelogd, accepteer in één klik ──
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Log in om de aanvraag te accepteren.' }, { status: 401 })
      }
      if ((user.email ?? '').toLowerCase() !== email) {
        return NextResponse.json(
          { error: 'Je bent ingelogd met een ander account dan waarvoor deze uitnodiging bedoeld is. Log uit en probeer opnieuw.' },
          { status: 403 }
        )
      }
      userId = user.id

      // Magic-link-gebruikers (of andere nieuwe accounts) hebben mogelijk nog
      // geen huurder-profiel — maak het aan zodat de koppeling klopt.
      const { data: prof } = await db.from('profiles').select('id').eq('id', userId).single()
      if (!prof) {
        const { data: t } = await db.from('tenants').select('full_name').eq('id', tenantId).single()
        await admin.from('profiles').upsert({
          id: userId,
          email,
          full_name: (t as any)?.full_name ?? '',
          role: 'huurder',
        } as any)
      }
    } else {
      // ── Pad 2: wachtwoord meegegeven ──
      const { data: existingUsers } = await admin.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => (u.email ?? '').toLowerCase() === email)

      if (existingUser) {
        // Bestaand account: verifieer wachtwoord door in te loggen
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) {
          return NextResponse.json(
            { error: 'Je hebt al een Domio-account met dit e-mailadres. Vul je bestaande wachtwoord in om de aanvraag te accepteren.' },
            { status: 400 }
          )
        }
        userId = existingUser.id
      } else {
        // Nieuw account aanmaken (e-mail is geverifieerd via de uitnodigingslink)
        const { data: newUser, error: createError } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })
        if (createError) throw createError
        userId = newUser.user.id

        const { data: tenantData } = await db.from('tenants').select('full_name').eq('id', tenantId).single()
        await admin.from('profiles').upsert({
          id: userId,
          email,
          full_name: (tenantData as any)?.full_name ?? '',
          role: 'huurder',
        } as any)

        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }
    }

    // Link profile_id to tenant record
    await db.from('tenants').update({ profile_id: userId }).eq('id', tenantId)

    // Mark invitation as accepted
    await db
      .from('tenant_invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invitationDbId)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[invitations/accept]', err)
    return NextResponse.json({ error: err.message || 'Onbekende fout' }, { status: 500 })
  }
}
