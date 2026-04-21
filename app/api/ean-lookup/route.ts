import { NextRequest, NextResponse } from 'next/server'
import { lookupEanVoorAdres } from '@/lib/supabase/ean-lookup-server'
import { parseHuisnummerInput } from '@/lib/supabase/parse-huisnummer'
import { normalizePostcode } from '@/lib/supabase/address-normalize'

/**
 * Adresverrijking voor pand aanmaken:
 * 1. EAN (stroom/gas) — Supabase `ean_adressen` + RPC `lookup_ean_adres` (zelfde als energiebelastingloket3).
 *    Vereist SUPABASE_SERVICE_ROLE_KEY + geïmporteerde data in `ean_adressen`.
 * 2. PDOK Locatieserver — gratis, geen auth → nummeraanduiding_id + BAG-id hint.
 * 3. BAG adressenuitgebreid — optioneel `BAG_API_KEY` voor bouwjaar, oppervlakte, formele adresregel.
 */

function addressFromEanRow(row: {
  straat: string
  huisnummer: string
  huisletter: string | null
  toevoeging: string | null
}): string {
  const n = `${row.huisnummer}${row.huisletter ?? ''}${row.toevoeging ? `-${row.toevoeging}` : ''}`
  return `${row.straat} ${n}`.replace(/\s+/g, ' ').trim()
}

function addressFromPdokDoc(doc: Record<string, unknown>): string {
  const w = doc.weergavenaam
  if (typeof w === 'string' && w.trim()) return w.trim()
  const straat = String(doc.straatnaam ?? '')
  const hn = doc.huis_nlt != null ? String(doc.huis_nlt) : String(doc.huisnummer ?? '')
  const pc = String(doc.postcode ?? '')
  const plaats = String(doc.woonplaatsnaam ?? '')
  const line = [straat, hn].filter(Boolean).join(' ')
  return [line, pc, plaats].filter(Boolean).join(', ') || line
}

function cityFromPdok(doc: Record<string, unknown>): string {
  return String(doc.woonplaatsnaam ?? doc.woonplaats ?? '').trim()
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { postcode, huisnummer } = body as { postcode?: string; huisnummer?: string }

  if (!postcode || huisnummer == null || String(huisnummer).trim() === '') {
    return NextResponse.json({ error: 'Postcode en huisnummer zijn verplicht' }, { status: 400 })
  }

  const pc = normalizePostcode(postcode)
  const parsedHn = parseHuisnummerInput(String(huisnummer))

  const eanLookup = await lookupEanVoorAdres({
    postcode: pc,
    huisnummer: parsedHn.huisnummer,
    huisletter: parsedHn.huisletter,
    toevoeging: parsedHn.toevoeging,
  })

  const eanFirst = eanLookup.matches[0] ?? null
  let ean_electricity = eanLookup.ean
  let ean_gas = eanLookup.gas_ean

  // ── PDOK: fuzzy adresmatching → IDs ───────────────────────────────────────
  let nummeraanduidingId: string | null = null
  let bagId: string | null = null
  let pdokDoc: Record<string, unknown> | null = null

  const pdokQuery = `${pc} ${String(huisnummer).trim()}`
  try {
    const res = await fetch(
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(pdokQuery)}&fq=type:adres&rows=1`,
      { next: { revalidate: 86400 } }
    )
    if (res.ok) {
      const json = await res.json()
      const doc = json?.response?.docs?.[0] ?? null
      if (doc) {
        pdokDoc = doc as Record<string, unknown>
        nummeraanduidingId = (doc.nummeraanduiding_id as string) ?? null
        bagId = (doc.adresseerbaarobject_id as string) ?? null
      }
    }
  } catch {
    /* ignore */
  }

  if (!nummeraanduidingId && !eanFirst) {
    return NextResponse.json({ error: 'Adres niet gevonden' }, { status: 404 })
  }

  const bagKey = process.env.BAG_API_KEY
  let adr: Record<string, unknown> | null = null

  if (bagKey && nummeraanduidingId) {
    try {
      const res = await fetch(
        `https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2/adressenuitgebreid/${nummeraanduidingId}`,
        {
          headers: {
            'X-Api-Key': bagKey,
            Accept: 'application/hal+json',
            'Accept-Crs': 'epsg:28992',
          },
          next: { revalidate: 86400 },
        }
      )
      if (res.ok) {
        adr = (await res.json()) as Record<string, unknown>
      }
    } catch {
      /* ignore */
    }
  }

  if (adr) {
    const straat = (adr.openbareRuimteNaam as string) ?? ''
    const huisnr = (adr.huisnummer as number) ?? parsedHn.huisnummer
    const letter = (adr.huisletter as string) ?? ''
    const toev = (adr.huisnummertoevoeging as string) ?? ''
    const bouwjaren = (adr.oorspronkelijkBouwjaar as string[]) ?? []
    const bouwjaar = bouwjaren[0] ? Number(bouwjaren[0]) : null

    return NextResponse.json({
      address: `${straat} ${huisnr}${letter}${toev ? ` ${toev}` : ''}`.trim(),
      postcode: (adr.postcode as string) ?? pc,
      city: (adr.woonplaatsNaam as string) ?? '',
      bag_id: bagId,
      build_year: bouwjaar,
      oppervlakte: (adr.oppervlakte as number) ?? null,
      gebruiksdoel: ((adr.gebruiksdoelen as string[]) ?? [])[0] ?? null,
      woz_value: null,
      energy_label: null,
      ean_electricity,
      ean_gas,
    })
  }

  // Geen BAG: voorkeur PDOK voor adresregel; anders EAN-regel uit het register
  let address: string
  let city: string
  let outPostcode: string

  if (pdokDoc) {
    address = addressFromPdokDoc(pdokDoc)
    city = cityFromPdok(pdokDoc)
    const rawPc = String(pdokDoc.postcode ?? pc).replace(/\s/g, '')
    outPostcode = rawPc.length === 6 ? `${rawPc.slice(0, 4)} ${rawPc.slice(4)}` : String(pdokDoc.postcode ?? pc)
  } else if (eanFirst) {
    address = addressFromEanRow(eanFirst)
    city = eanFirst.plaats
    const rawPc = eanFirst.postcode.replace(/\s/g, '')
    outPostcode = rawPc.length === 6 ? `${rawPc.slice(0, 4)} ${rawPc.slice(4)}` : eanFirst.postcode
  } else {
    address = pdokQuery
    city = ''
    outPostcode = pc.length === 6 ? `${pc.slice(0, 4)} ${pc.slice(4)}` : postcode.trim()
  }

  return NextResponse.json({
    address,
    postcode: outPostcode,
    city,
    bag_id: bagId,
    build_year: null,
    oppervlakte: null,
    gebruiksdoel: null,
    woz_value: null,
    energy_label: null,
    ean_electricity,
    ean_gas,
  })
}
