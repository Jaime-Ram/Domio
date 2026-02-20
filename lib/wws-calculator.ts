// WWS (Woningwaarderingsstelsel) berekeningslogica
// Vereenvoudigde formules voor demo - niet juridisch bindend

export type WWSSector = 'sociaal' | 'midden' | 'vrij'

export interface WWInput {
  postcode: string
  huisnummer: string
  typeWoning: 'appartement' | 'eengezinswoning' | 'bovenwoning' | 'benedenwoning' | 'maisonnette'
  bouwjaar: number
  woonOpp: number
  overigeOpp: number
  buitenOpp: number
  aantalKamers: number
  keukenItems: string[]
  sanitairItems: string[]
  verwarming: 'centraal' | 'individueel' | 'geen'
  energielabel: string
  wozWaarde: number
}

export interface WWResult {
  punten: number
  sector: WWSSector
  maxHuur: number
  breakdown: { category: string; punten: number; toelichting: string }[]
}

const LABEL_PUNTEN: Record<string, number> = {
  'A++++': 54,
  'A+++': 50,
  'A++': 48,
  'A+': 46,
  A: 44,
  B: 36,
  C: 22,
  D: 14,
  E: 8,
  F: 4,
  G: 0,
  Onbekend: 0,
}

export function berekenWWS(input: WWInput): WWResult {
  const breakdown: { category: string; punten: number; toelichting: string }[] = []
  let punten = 0

  // Oppervlakte
  const oppWoon = input.woonOpp * 1
  punten += oppWoon
  breakdown.push({
    category: 'Oppervlakte woonruimte',
    punten: oppWoon,
    toelichting: `${input.woonOpp} m² × 1 punt`,
  })

  const oppOverig = Math.round(input.overigeOpp * 0.75)
  punten += oppOverig
  breakdown.push({
    category: 'Oppervlakte overige ruimtes',
    punten: oppOverig,
    toelichting: `${input.overigeOpp} m² × 0,75 punt`,
  })

  const buitenPunten = Math.min(Math.round(input.buitenOpp * 0.35), 15)
  punten += buitenPunten
  breakdown.push({
    category: 'Buitenruimte',
    punten: buitenPunten,
    toelichting: `${input.buitenOpp} m² × 0,35 (max 15)`,
  })

  // Energie
  const labelPunten = LABEL_PUNTEN[input.energielabel] ?? 0
  punten += labelPunten
  breakdown.push({
    category: 'Energielabel',
    punten: labelPunten,
    toelichting: `Label ${input.energielabel}`,
  })

  // WOZ
  let wozPunten = 0
  if (input.wozWaarde > 0 && input.woonOpp > 0) {
    wozPunten = Math.min(Math.round(input.wozWaarde / input.woonOpp / 200), 60)
    punten += wozPunten
  }
  breakdown.push({
    category: 'WOZ-waarde component',
    punten: wozPunten,
    toelichting: input.wozWaarde > 0 ? `WOZ €${input.wozWaarde.toLocaleString('nl-NL')} / ${input.woonOpp}m²` : '-',
  })

  // Keuken
  const keukenPunten = Math.min(input.keukenItems.length * 2, 8)
  punten += keukenPunten
  breakdown.push({
    category: 'Keuken',
    punten: keukenPunten,
    toelichting: `${input.keukenItems.length} voorzieningen (max 8)`,
  })

  // Sanitair
  const sanitairPunten = Math.min(input.sanitairItems.length * 3, 12)
  punten += sanitairPunten
  breakdown.push({
    category: 'Sanitair',
    punten: sanitairPunten,
    toelichting: `${input.sanitairItems.length} voorzieningen (max 12)`,
  })

  // Verwarming
  const verwarmingPunten = input.verwarming !== 'geen' ? 2 : 0
  punten += verwarmingPunten
  breakdown.push({
    category: 'Verwarming',
    punten: verwarmingPunten,
    toelichting: input.verwarming === 'geen' ? 'Geen' : input.verwarming === 'centraal' ? 'Centraal' : 'Individueel',
  })

  punten = Math.round(punten)

  const sector: WWSSector =
    punten <= 143 ? 'sociaal' : punten <= 186 ? 'midden' : 'vrij'

  // Max huur (vereenvoudigde indicatieve waarden)
  let maxHuur = 0
  if (sector === 'sociaal') {
    maxHuur = Math.min(punten * 5.5, 932.93)
  } else if (sector === 'midden') {
    maxHuur = Math.min(punten * 6.8, 1228.07)
  } else {
    maxHuur = punten * 8.5
  }
  maxHuur = Math.round(maxHuur)

  return { punten, sector, maxHuur, breakdown }
}

export const KEUKEN_OPTIES = [
  { id: 'aanrecht', label: 'Aanrecht' },
  { id: 'spoelbak', label: 'Spoelbak' },
  { id: 'kooktoestel', label: 'Kooktoestel' },
  { id: 'afzuigkap', label: 'Afzuigkap' },
]

export const SANITAIR_OPTIES = [
  { id: 'douche', label: 'Douche' },
  { id: 'bad', label: 'Bad' },
  { id: 'wastafel', label: 'Wastafel' },
  { id: 'tweede_toilet', label: 'Tweede toilet' },
]

export const ENERGIELABELS = [
  'A++++',
  'A+++',
  'A++',
  'A+',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'Onbekend',
]

export const WONINGTYPEN = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'eengezinswoning', label: 'Eengezinswoning' },
  { value: 'bovenwoning', label: 'Bovenwoning' },
  { value: 'benedenwoning', label: 'Benedenwoning' },
  { value: 'maisonnette', label: 'Maisonnette' },
]
