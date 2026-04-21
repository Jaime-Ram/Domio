/**
 * Normalisatie voor matching met de ean_adressen-tabel (NL-adressen).
 * Overgenomen uit energiebelastingloket3.
 */

export function normalizePostcode(postcode: string): string {
  return postcode.replace(/\s+/g, '').toUpperCase()
}

/** Weergave NL-postcode met spatie (1234 AB). */
export function formatPostcodeDisplay(postcode: string): string {
  const n = normalizePostcode(postcode)
  if (n.length === 6) return `${n.slice(0, 4)} ${n.slice(4)}`
  return postcode.trim()
}

export function normalizeHuisnummer(huisnummer: string): string {
  return huisnummer.trim()
}

export function normalizeOptional(s: string | undefined | null): string | null {
  if (s == null || String(s).trim() === '') return null
  return String(s).trim()
}
