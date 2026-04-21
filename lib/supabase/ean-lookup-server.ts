/**
 * EAN-lookup via Supabase-register (ean_adressen + lookup_ean_adres RPC).
 * Zelfde aanpak als energiebelastingloket3: service role, geen client-side lezen op de tabel.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeHuisnummer, normalizeOptional, normalizePostcode } from '@/lib/supabase/address-normalize'

export type EanMatchRow = {
  ean: string | null
  gas_ean: string | null
  straat: string
  plaats: string
  postcode: string
  huisnummer: string
  huisletter: string | null
  toevoeging: string | null
}

export type EanLookupResult = {
  found: boolean
  matches: EanMatchRow[]
  has_stroom_ean: boolean
  has_gas_ean: boolean
  ean: string | null
  gas_ean: string | null
}

const empty: EanLookupResult = {
  found: false,
  matches: [],
  has_stroom_ean: false,
  has_gas_ean: false,
  ean: null,
  gas_ean: null,
}

export async function lookupEanVoorAdres(params: {
  postcode: string
  huisnummer: string
  huisletter?: string | null
  toevoeging?: string | null
}): Promise<EanLookupResult> {
  const postcode = normalizePostcode(params.postcode || '')
  const huisnummer = normalizeHuisnummer(params.huisnummer || '')
  const huisletter = normalizeOptional(params.huisletter)
  const toevoeging = normalizeOptional(params.toevoeging)

  if (!postcode || postcode.length < 6 || !huisnummer) {
    return empty
  }

  const admin = createAdminClient()
  if (!admin) {
    return empty
  }

  const { data, error } = await (
    admin as unknown as {
      rpc: (n: string, a: Record<string, string | null>) => Promise<{ data: unknown; error: { message: string } | null }>
    }
  ).rpc('lookup_ean_adres', {
    p_postcode_normalized: postcode,
    p_huisnummer: huisnummer,
    p_huisletter: huisletter,
    p_toevoeging: toevoeging,
  })

  if (error) {
    console.warn('[ean-lookup] lookup_ean_adres:', error.message)
    return empty
  }

  const rows = (data ?? []) as EanMatchRow[]
  if (!rows.length) {
    return empty
  }

  const first = rows[0]
  return {
    found: true,
    matches: rows,
    has_stroom_ean: Boolean(first.ean),
    has_gas_ean: Boolean(first.gas_ean),
    ean: first.ean,
    gas_ean: first.gas_ean,
  }
}
