import { supabase } from './client'

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: 'verhuurder' | 'huurder',
  phone?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role, phone: phone || null },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
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
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
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
