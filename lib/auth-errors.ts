/**
 * Vertaalt Supabase/auth foutmeldingen van Engels naar Nederlands.
 * Gebruik overal waar auth-errors aan de gebruiker getoond worden.
 */
const TRANSLATIONS: Array<[RegExp | string, string]> = [
  // Wachtwoord
  ['New password should be different from the old password', 'Het nieuwe wachtwoord moet verschillen van het oude wachtwoord.'],
  ['new password should be different', 'Het nieuwe wachtwoord moet verschillen van het oude wachtwoord.'],
  ['different from the old password', 'Het nieuwe wachtwoord moet verschillen van het oude wachtwoord.'],
  ['Password should be at least 6 characters', 'Wachtwoord moet minimaal 6 tekens zijn.'],
  ['password must be at least 6 characters', 'Wachtwoord moet minimaal 6 tekens zijn.'],
  ['Password update requires reauthentication', 'Wachtwoordwijziging vereist opnieuw inloggen.'],
  ['update requires reauthentication', 'Deze wijziging vereist opnieuw inloggen.'],

  // Inloggen
  ['Invalid login credentials', 'Onjuist e-mailadres of wachtwoord.'],
  ['Invalid credentials', 'Onjuist e-mailadres of wachtwoord.'],
  ['Email not confirmed', 'Bevestig eerst je e-mailadres.'],
  ['Email link is invalid or has expired', 'De link is ongeldig of verlopen.'],

  // Registreren / e-mail
  ['User already registered', 'Dit e-mailadres is al geregistreerd.'],
  ['A user with this email address has already been registered', 'Dit e-mailadres is al geregistreerd.'],
  ['Signup requires a valid password', 'Registratie vereist een geldig wachtwoord.'],

  // Netwerk / technisch
  ['Failed to fetch', 'Geen verbinding. Controleer je internetverbinding.'],
  ['Load failed', 'Geen verbinding. Controleer je internetverbinding.'],
  ['Network request failed', 'Netwerkfout. Controleer je verbinding.'],

  // OAuth
  ['Auth session missing', 'Sessie verlopen. Log opnieuw in.'],
  ['Auth session expired', 'Sessie verlopen. Log opnieuw in.'],

  // Algemeen
  ['Database error updating user', 'Databasefout. Probeer het later opnieuw.'],
  ['Failed to update user', 'Kon gegevens niet bijwerken. Probeer het later opnieuw.'],
]

export function translateAuthError(message: string): string {
  if (!message || typeof message !== 'string') return 'Er is een fout opgetreden.'
  const trimmed = message.trim()
  for (const [pattern, nl] of TRANSLATIONS) {
    if (typeof pattern === 'string') {
      if (trimmed === pattern || trimmed.toLowerCase().includes(pattern.toLowerCase())) return nl
    } else {
      if (pattern.test(trimmed)) return nl
    }
  }
  return message
}
