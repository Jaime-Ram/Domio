'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type TenantActionResult =
  | { ok: true }
  | { ok: false, error: string }

type InviteContext = {
  userId: string
  tenant: {
    id: string
    owner_id: string
    full_name: string
    email: string | null
    profile_id: string | null
    portal_status: string
  }
  adminClient: NonNullable<ReturnType<typeof createAdminClient>>
}

async function loadInviteContext(tenantId: string): Promise<
  | { ok: true, ctx: InviteContext }
  | { ok: false, error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Niet geautoriseerd.' }

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id, owner_id, full_name, email, profile_id, portal_status' as never)
    .eq('id', tenantId)
    .maybeSingle()

  if (error) return { ok: false, error: 'Huurder kon niet worden geladen.' }
  if (!tenant) return { ok: false, error: 'Huurder niet gevonden.' }

  const row = tenant as unknown as InviteContext['tenant']
  if (row.owner_id !== user.id) {
    return { ok: false, error: 'Geen toegang tot deze huurder.' }
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    return { ok: false, error: 'Serverconfiguratie ontbreekt (service role key).' }
  }

  return { ok: true, ctx: { userId: user.id, tenant: row, adminClient } }
}

async function findAuthUserIdByEmail(
  adminClient: NonNullable<ReturnType<typeof createAdminClient>>,
  email: string,
): Promise<string | null> {
  const normalized = email.trim().toLowerCase()
  let page = 1
  const perPage = 200
  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage })
    if (error || !data) return null
    const match = data.users.find(u => (u.email ?? '').toLowerCase() === normalized)
    if (match) return match.id
    if (data.users.length < perPage) return null
    page += 1
    if (page > 50) return null
  }
}

export async function inviteTenantToPortal(tenantId: string): Promise<TenantActionResult> {
  const loaded = await loadInviteContext(tenantId)
  if (!loaded.ok) return loaded
  const { tenant, adminClient } = loaded.ctx

  if (!tenant.email) {
    return { ok: false, error: 'Deze huurder heeft geen e-mailadres.' }
  }
  if (tenant.profile_id) {
    return { ok: false, error: 'Deze huurder is al gekoppeld aan een account.' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    return { ok: false, error: 'Serverconfiguratie ontbreekt (NEXT_PUBLIC_APP_URL).' }
  }

  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    tenant.email,
    {
      redirectTo: `${appUrl}/auth/callback`,
      data: {
        tenant_id: tenant.id,
        role: 'huurder',
        full_name: tenant.full_name,
      },
    },
  )

  if (inviteError) {
    return { ok: false, error: 'Uitnodiging kon niet worden verstuurd.' }
  }

  const supabase = await createClient()
  const { error: updateError } = await supabase
    .from('tenants')
    .update({ portal_status: 'uitgenodigd', invited_at: new Date().toISOString() } as never)
    .eq('id', tenant.id)

  if (updateError) {
    const { error: adminUpdateError } = await adminClient
      .from('tenants')
      .update({ portal_status: 'uitgenodigd', invited_at: new Date().toISOString() } as never)
      .eq('id', tenant.id)
    if (adminUpdateError) {
      return { ok: false, error: 'Uitnodiging verstuurd, maar status kon niet worden bijgewerkt.' }
    }
  }

  revalidatePath(`/dashboard/landlord/tenants/${tenant.id}`)
  return { ok: true }
}

export async function revokeTenantInvite(tenantId: string): Promise<TenantActionResult> {
  const loaded = await loadInviteContext(tenantId)
  if (!loaded.ok) return loaded
  const { tenant, adminClient } = loaded.ctx

  if (tenant.profile_id) {
    const { error } = await adminClient.auth.admin.deleteUser(tenant.profile_id)
    if (error) {
      return { ok: false, error: 'Account kon niet worden verwijderd.' }
    }
  } else if (tenant.portal_status === 'uitgenodigd' && tenant.email) {
    const authUserId = await findAuthUserIdByEmail(adminClient, tenant.email)
    if (authUserId) {
      const { error } = await adminClient.auth.admin.deleteUser(authUserId)
      if (error) {
        return { ok: false, error: 'Openstaande uitnodiging kon niet worden ingetrokken.' }
      }
    }
  }

  const resetPayload = {
    portal_status: 'ingetrokken',
    profile_id: null,
    claimed_at: null,
    invited_at: null,
  }

  const supabase = await createClient()
  const { error: updateError } = await supabase
    .from('tenants')
    .update(resetPayload as never)
    .eq('id', tenant.id)

  if (updateError) {
    const { error: adminUpdateError } = await adminClient
      .from('tenants')
      .update(resetPayload as never)
      .eq('id', tenant.id)
    if (adminUpdateError) {
      return { ok: false, error: 'Status kon niet worden bijgewerkt.' }
    }
  }

  revalidatePath(`/dashboard/landlord/tenants/${tenant.id}`)
  return { ok: true }
}

export async function resendTenantInvite(tenantId: string): Promise<TenantActionResult> {
  const loaded = await loadInviteContext(tenantId)
  if (!loaded.ok) return loaded
  const { tenant, adminClient } = loaded.ctx

  if (tenant.portal_status !== 'uitgenodigd' || tenant.profile_id) {
    return { ok: false, error: 'Opnieuw uitnodigen is alleen mogelijk voor openstaande uitnodigingen.' }
  }
  if (!tenant.email) {
    return { ok: false, error: 'Deze huurder heeft geen e-mailadres.' }
  }

  const existingAuthUserId = await findAuthUserIdByEmail(adminClient, tenant.email)
  if (existingAuthUserId) {
    const { error } = await adminClient.auth.admin.deleteUser(existingAuthUserId)
    if (error) {
      return { ok: false, error: 'Bestaande uitnodiging kon niet worden opgeschoond.' }
    }
  }

  return inviteTenantToPortal(tenantId)
}
