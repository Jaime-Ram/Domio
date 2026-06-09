import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/**
 * Geeft de openstaande uitnodigingen terug die gericht zijn aan het e-mailadres
 * van de ingelogde gebruiker. Wordt gebruikt voor de in-app accepteren-popup.
 * We scopen strikt op het e-mailadres van de sessie, dus een gebruiker ziet
 * alleen uitnodigingen die voor hem/haar bedoeld zijn.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ invitations: [] })

    const admin = createAdminClient()
    if (!admin) return NextResponse.json({ invitations: [] })
    const db = admin as any

    const { data: invites } = await db
      .from('tenant_invitations')
      .select('id, tenant_id, owner_id, created_at')
      .ilike('email', user.email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (!invites?.length) return NextResponse.json({ invitations: [] })

    const invitations = await Promise.all(
      invites.map(async (inv: any) => {
        const [{ data: owner }, { data: lease }] = await Promise.all([
          db.from('profiles').select('full_name, company_name').eq('id', inv.owner_id).single(),
          db
            .from('leases')
            .select('units(unit_number, properties(address, city))')
            .eq('tenant_id', inv.tenant_id)
            .eq('status', 'actief')
            .limit(1)
            .maybeSingle(),
        ])
        const unit = (lease as any)?.units
        const property = unit?.properties
        return {
          id: inv.id,
          landlord: (owner as any)?.company_name || (owner as any)?.full_name || 'Je verhuurder',
          property: property
            ? `${property.address}${unit?.unit_number ? `, ${unit.unit_number}` : ''}, ${property.city}`
            : null,
        }
      })
    )

    return NextResponse.json({ invitations })
  } catch (err: any) {
    console.error('[invitations/pending]', err)
    return NextResponse.json({ invitations: [] })
  }
}
