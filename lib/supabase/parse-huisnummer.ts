/**
 * Splits een NL-huisnummerveld (één input) naar nummer, letter en toevoeging voor EAN-matching.
 * Overgenomen uit energiebelastingloket3.
 */

export type ParsedHuisnummer = {
  huisnummer: string
  huisletter: string | null
  toevoeging: string | null
}

export function parseHuisnummerInput(raw: string): ParsedHuisnummer {
  const s = raw.trim()
  if (!s) return { huisnummer: '', huisletter: null, toevoeging: null }
  const compact = s.replace(/\s+/g, '')

  const dash = compact.match(/^(\d+)-(.+)$/)
  if (dash) {
    return { huisnummer: dash[1], huisletter: null, toevoeging: dash[2] }
  }

  const withLetter = compact.match(/^(\d+)([a-zA-Z])$/)
  if (withLetter) {
    return {
      huisnummer: withLetter[1],
      huisletter: withLetter[2].toUpperCase(),
      toevoeging: null,
    }
  }

  const digitsOnly = compact.match(/^(\d+)$/)
  if (digitsOnly) {
    return { huisnummer: digitsOnly[1], huisletter: null, toevoeging: null }
  }

  return { huisnummer: compact, huisletter: null, toevoeging: null }
}
