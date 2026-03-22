/** Zelfde vertalingen als web (`lib/auth-errors.ts`) — compact voor de app. */
const TRANSLATIONS: Array<[RegExp | string, string]> = [
  ['Invalid login credentials', 'Onjuist e-mailadres of wachtwoord.'],
  ['Invalid credentials', 'Onjuist e-mailadres of wachtwoord.'],
  ['Email not confirmed', 'Bevestig eerst je e-mailadres.'],
  ['Failed to fetch', 'Geen verbinding. Controleer je internetverbinding.'],
  ['Load failed', 'Geen verbinding. Controleer je internetverbinding.'],
  ['Network request failed', 'Netwerkfout. Controleer je verbinding.'],
]

export function translateAuthError(message: string): string {
  if (!message || typeof message !== 'string') return 'Er is een fout opgetreden.'
  const trimmed = message.trim()
  for (const [pattern, nl] of TRANSLATIONS) {
    if (typeof pattern === 'string') {
      if (trimmed === pattern || trimmed.toLowerCase().includes(pattern.toLowerCase())) return nl
    } else if (pattern.test(trimmed)) {
      return nl
    }
  }
  return message
}
