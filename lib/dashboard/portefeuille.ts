/* Datalaag voor het portefeuille-overzicht.
 *
 * Bewust één benoemde functie die platte data teruggeeft: de UI roept hem aan,
 * en later kan een agent-tool hem net zo goed aanroepen. Alle afgeleide logica
 * (bezetting, achterstand, gezondheid) zit hier, niet in de pagina.
 */

import { propertyQueries, ticketQueries, paymentQueries } from '@/lib/supabase/queries'

export type PandRij = {
  id: string
  naam: string
  adres: string
  plaats: string
  type: string
  eenheden: number
  bezet: number
  huur: number
  lasten: number
  achterstand: number
  incasso: number
  aflopend: number
  openTickets: number
  label: 'A' | 'B' | 'C' | 'D' | null
  bouwjaar: number | null
  agent: boolean
  beheerder: string
  mjopPost: string
}

export type PortefeuilleData = {
  panden: PandRij[]
  totaal: {
    panden: number
    eenheden: number
    bezet: number
    huurPerMaand: number
    lastenPerMaand: number
    achterstand: number
    aflopend: number
    openTickets: number
  }
}

const OPEN_TICKET_STATUSSEN = ['open', 'nieuw', 'in_behandeling', 'wacht_op_onderdelen']

/* initialen voor de avatar */
function initialen(naam: string | null | undefined, email: string | null | undefined): string {
  const bron = naam?.trim() || email?.split('@')[0] || ''
  if (!bron) return '?'
  const delen = bron.split(/\s+/)
  if (delen.length >= 2) return (delen[0][0] + delen[delen.length - 1][0]).toUpperCase()
  return bron.slice(0, 2).toUpperCase()
}

/* Haalt de portefeuille op voor één eigenaar en rekent de afgeleide cijfers uit. */
export async function getPortefeuille(
  ownerId: string,
  beheerderNaam?: string | null,
  beheerderEmail?: string | null,
): Promise<PortefeuilleData> {
  const [propsData, ticketsData, achterstandenData] = await Promise.all([
    propertyQueries.getByOwner(ownerId),
    ticketQueries.getByOwner(ownerId).catch(() => [] as any[]),
    paymentQueries.getOverdue(ownerId).catch(() => [] as any[]),
  ])

  /* open tickets per pand */
  const ticketsPerPand = new Map<string, number>()
  for (const t of (ticketsData ?? []) as any[]) {
    const status = String(t.status ?? '').toLowerCase()
    if (!OPEN_TICKET_STATUSSEN.includes(status)) continue
    const pandId = t.property_id ?? t.units?.properties?.id ?? null
    if (!pandId) continue
    ticketsPerPand.set(pandId, (ticketsPerPand.get(pandId) ?? 0) + 1)
  }

  /* achterstand per pand */
  const achterstandPerPand = new Map<string, number>()
  for (const b of (achterstandenData ?? []) as any[]) {
    const pandId = b.property_id ?? b.properties?.id ?? null
    if (!pandId) continue
    const bedrag = Number(b.amount ?? 0)
    achterstandPerPand.set(pandId, (achterstandPerPand.get(pandId) ?? 0) + bedrag)
  }

  const beheerder = initialen(beheerderNaam, beheerderEmail)

  const panden: PandRij[] = ((propsData ?? []) as any[]).map((p) => {
    const units = (p.units ?? []) as { id: string; monthly_rent: number | null; status?: string }[]
    const eenheden = units.length
    const bezet = units.filter((u) => u.status === 'verhuurd').length
    const huur = units
      .filter((u) => u.status === 'verhuurd')
      .reduce((s, u) => s + Number(u.monthly_rent ?? 0), 0)
    const achterstand = achterstandPerPand.get(p.id) ?? 0
    const gefactureerd = huur + achterstand

    return {
      id: p.id,
      naam: p.name ?? p.address ?? 'Naamloos pand',
      adres: p.address ?? '',
      plaats: p.city ?? 'Onbekend',
      type: p.type ?? 'Overig',
      eenheden,
      bezet,
      huur,
      /* exploitatielasten zijn nog niet gemodelleerd; tot die tijd geen schatting tonen */
      lasten: 0,
      achterstand,
      incasso: gefactureerd > 0 ? Math.round((huur / gefactureerd) * 100) : 100,
      /* aflopende contracten volgen zodra de lease-einddatums zijn aangesloten */
      aflopend: 0,
      openTickets: ticketsPerPand.get(p.id) ?? 0,
      label: (p.energy_label as PandRij['label']) ?? null,
      bouwjaar: p.build_year ?? null,
      agent: false,
      beheerder,
      mjopPost: 'Geen posten',
    }
  })

  return {
    panden,
    totaal: {
      panden: panden.length,
      eenheden: panden.reduce((s, p) => s + p.eenheden, 0),
      bezet: panden.reduce((s, p) => s + p.bezet, 0),
      huurPerMaand: panden.reduce((s, p) => s + p.huur, 0),
      lastenPerMaand: panden.reduce((s, p) => s + p.lasten, 0),
      achterstand: panden.reduce((s, p) => s + p.achterstand, 0),
      aflopend: panden.reduce((s, p) => s + p.aflopend, 0),
      openTickets: panden.reduce((s, p) => s + p.openTickets, 0),
    },
  }
}

/* Gezondheid van een pand in één signaal. Ook bruikbaar buiten de UI,
   bijvoorbeeld om een agent te laten bepalen waar hij moet ingrijpen. */
export function gezondheid(p: PandRij): { toon: 'goed' | 'let-op' | 'slecht'; titel: string } {
  if (p.eenheden > 0 && p.bezet === 0) return { toon: 'slecht', titel: 'Volledig leeg' }
  if (p.achterstand > 900) return { toon: 'slecht', titel: `Achterstand van ${p.achterstand} euro` }
  const punten: string[] = []
  if (p.bezet < p.eenheden) punten.push('leegstand')
  if (p.achterstand > 0) punten.push('achterstand')
  if (p.aflopend > 0) punten.push(`${p.aflopend} contract(en) aflopend`)
  if (p.openTickets > 1) punten.push(`${p.openTickets} open tickets`)
  return punten.length ? { toon: 'let-op', titel: punten.join(' · ') } : { toon: 'goed', titel: 'Alles in orde' }
}
