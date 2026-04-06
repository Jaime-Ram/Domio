import { supabase } from './client'

/** Origin voor auth-redirects: productie-URL als gezet (NEXT_PUBLIC_APP_URL), anders huidige origin. */
function getAppOrigin(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || ''
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: 'verhuurder' | 'huurder',
  phone?: string
) {
  const origin = getAppOrigin()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role, phone: phone || null },
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
    },
  })
  if (error && (error.message === 'Failed to fetch' || error.message === 'Load failed')) {
    error.message =
      'Geen verbinding met de auth-server. Controleer: (1) .env.local heeft NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY, (2) Supabase-project is actief (niet gepauzeerd), (3) internetverbinding.'
  }
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message === 'Invalid login credentials') {
      error.message = 'Onjuist e-mailadres of wachtwoord'
    }
    if (error.message === 'Failed to fetch' || error.message === 'Load failed') {
      error.message =
        'Geen verbinding met de auth-server. Controleer: (1) .env.local heeft NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY, (2) Supabase-project is actief (niet gepauzeerd), (3) internetverbinding. Fout: ' +
        error.message
    }
  }

  return { data, error }
}

export async function signInWithGoogle() {
  const origin = getAppOrigin()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: origin ? `${origin}/auth/callback` : undefined },
  })
  return { data, error }
}

export async function signInWithMicrosoft() {
  const origin = getAppOrigin()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: { redirectTo: origin ? `${origin}/auth/callback` : undefined },
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  return { data, error }
}

export async function updateEmail(newEmail: string) {
  const origin = getAppOrigin()
  const redirectTo = origin ? `${origin}/auth/callback?next=/dashboard/employer/settings` : undefined
  
  // Debug log
  console.log('[updateEmail] origin:', origin)
  console.log('[updateEmail] redirectTo:', redirectTo)
  
  const { data, error } = await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: redirectTo }
  )
  return { data, error }
}

// ─── MFA / 2FA ───
export async function enrollMfa() {
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Authenticator ${Date.now()}` })
  return { data, error }
}

export async function verifyMfa(factorId: string, code: string) {
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
  if (challengeError) return { data: null, error: challengeError }
  const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId: challengeData.id, code })
  return { data, error }
}

export async function enrollPhoneMfa(phone: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.auth.mfa as any).enroll({ factorType: 'phone', phone })
  return { data: data as { id: string; phone: string } | null, error }
}

export async function challengeMfa(factorId: string) {
  const { data, error } = await supabase.auth.mfa.challenge({ factorId })
  return { data, error }
}

export async function verifyMfaCode(factorId: string, challengeId: string, code: string) {
  const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId, code })
  return { data, error }
}

export async function unenrollMfa(factorId: string) {
  const { data, error } = await supabase.auth.mfa.unenroll({ factorId })
  return { data, error }
}

export async function listMfaFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors()
  return { data, error }
}

export async function getMfaAssuranceLevel() {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  return { data, error }
}

export async function deleteAccount() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'Niet ingelogd' } }
  const res = await fetch('/api/auth/delete-account', { method: 'POST' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return { error: { message: body.error || 'Account verwijderen mislukt' } }
  }
  await supabase.auth.signOut()
  return { error: null }
}

export async function resetPassword(email: string) {
  const origin = getAppOrigin()
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: origin ? `${origin}/auth/reset-password` : undefined,
  })
  return { data, error }
}

/** Ongeldige refresh token – sessie opschonen zodat gebruiker opnieuw kan inloggen */
function isInvalidRefreshTokenError(error: { message?: string } | null): boolean {
  return Boolean(
    error?.message &&
    (error.message.includes('Refresh Token') || error.message.includes('refresh_token') || error.message.includes('JWT'))
  )
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error && isInvalidRefreshTokenError(error)) {
    await supabase.auth.signOut({ scope: 'local' })
    return { session: null, error: null }
  }
  return { session: data.session, error }
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error && isInvalidRefreshTokenError(error)) {
    await supabase.auth.signOut({ scope: 'local' })
    return { user: null, error: null }
  }
  return { user: data.user, error }
}
