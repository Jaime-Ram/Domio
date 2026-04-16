import { NextRequest, NextResponse } from 'next/server'

/**
 * Adres- en pandverrijking voor Nederlandse adressen.
 *
 * Stap 1 — PDOK Locatieserver         gratis, geen auth → adres + BAG-IDs
 * Stap 2 — WOZ Waardeloket            gratis, geen auth → WOZ-waarde
 * Stap 3 — EP-online                  gratis, geen auth → energielabel
 * Stap 4 — BAG Kadaster               vereist BAG_API_KEY (.env.local) → bouwjaar
 * Stap 5 — EDSN EAN-codeboek          geen auth nodig → EAN elektra + gas
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { postcode, huisnummer } = body as { postcode?: string; huisnummer?: string }

  if (!postcode || !huisnummer) {
    return NextResponse.json({ error: 'Postcode en huisnummer zijn verplicht' }, { status: 400 })
  }

  const pc = postcode.replace(/\s/g, '').toUpperCase()
  const hn = String(huisnummer).trim()

  // ── 1. PDOK Locatieserver ───────────────────────────────────────────────────
  let doc: Record<string, any> | null = null
  try {
    const res = await fetch(
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(pc + ' ' + hn)}&fq=type:adres&rows=1`,
      { next: { revalidate: 86400 } }
    )
    if (res.ok) {
      const json = await res.json()
      doc = json?.response?.docs?.[0] ?? null
    }
  } catch {}

  if (!doc) {
    return NextResponse.json({ error: 'Adres niet gevonden' }, { status: 404 })
  }

  const letter = doc.huisletter ?? ''
  const toev   = doc.huisnummertoevoeging ?? ''
  const bagId  = doc.identificatie ?? null          // verblijfsobjectidentificatie
  const pandId = doc.pandidentificatie ?? null

  const result: Record<string, any> = {
    address:        `${doc.straatnaam ?? ''} ${doc.huisnummer ?? hn}${letter}${toev ? ` ${toev}` : ''}`.trim(),
    postcode:       doc.postcode ?? pc,
    city:           doc.woonplaatsnaam ?? '',
    bag_id:         bagId,
    woz_value:      null,
    energy_label:   null,
    build_year:     null,
    ean_electricity: null,
    ean_gas:        null,
  }

  // ── 2. WOZ Waardeloket (altijd gratis) ─────────────────────────────────────
  if (bagId) {
    try {
      const res = await fetch(
        `https://api.wozwaardeloket.nl/woz-waarden?adresseerbaarobjectidentificatie=${bagId}`,
        { next: { revalidate: 3600 } }
      )
      if (res.ok) {
        const data = await res.json()
        const waardes: any[] =
          data?.[0]?.wozWaarden ?? data?.wozWaarden ?? []
        if (waardes.length > 0) {
          // Meest recente peildatum
          const sorted = [...waardes].sort((a, b) =>
            String(b.peildatum ?? '').localeCompare(String(a.peildatum ?? ''))
          )
          result.woz_value = sorted[0]?.vastgesteldeWaarde ?? null
        }
      }
    } catch {}
  }

  // ── 3. EP-online energielabel (altijd gratis) ──────────────────────────────
  try {
    const url = new URL('https://public.ep-online.nl/api/v5/PandEnergielabel/Adres')
    url.searchParams.set('postcode', pc)
    url.searchParams.set('huisnummer', hn)
    if (toev) url.searchParams.set('toevoeging', toev)
    if (letter) url.searchParams.set('huisletter', letter)

    const res = await fetch(url.toString(), { next: { revalidate: 86400 } })
    if (res.ok) {
      const data = await res.json()
      const label = Array.isArray(data) ? data[0]?.labelLetter : data?.labelLetter
      if (label) result.energy_label = String(label).toUpperCase()
    }
  } catch {}

  // ── 4. BAG Kadaster — bouwjaar (vereist BAG_API_KEY) ──────────────────────
  if (pandId && process.env.BAG_API_KEY) {
    try {
      const res = await fetch(
        `https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2/panden/${pandId}`,
        {
          headers: {
            'X-Api-Key': process.env.BAG_API_KEY,
            Accept: 'application/hal+json',
            'Accept-Crs': 'epsg:28992',
          },
          next: { revalidate: 86400 },
        }
      )
      if (res.ok) {
        const data = await res.json()
        const pand = data.pand ?? data
        if (pand.oorspronkelijkBouwjaar) result.build_year = pand.oorspronkelijkBouwjaar
      }
    } catch {}
  }

  // ── 5. EDSN EAN-codeboek (geen auth nodig) ────────────────────────────────
  if (bagId) {
    try {
      const res = await fetch(
        `https://api.edsn.nl/ean-lookup?bagId=${bagId}`,
        { next: { revalidate: 86400 } }
      )
      if (res.ok) {
        const data = await res.json()
        result.ean_electricity = data?.ean_electricity ?? null
        result.ean_gas         = data?.ean_gas         ?? null
      }
    } catch {}
  }

  return NextResponse.json(result)
}
