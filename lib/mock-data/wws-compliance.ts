// Mock data voor WWS (Woningwaarderingsstelsel) compliance
// Sinds 1 januari 2025 verplichte puntentelling bij nieuw huurcontract

export type WWSSector = 'sociaal' | 'midden' | 'vrij'

export interface WWSBreakdownItem {
  category: string
  punten: number
  toelichting: string
}

export interface WWSComplianceObject {
  id: string
  address: string
  punten: number
  sector: WWSSector
  maxHuur: number
  huidigeHuur: number
  verschil: number
  status: 'compliant' | 'verlopen' | 'te_hoog' | 'pdf_mist'
  laatsteCheck: string
}

export interface WWSAlert {
  id: string
  address: string
  urgency: 'hoog' | 'midden'
  title: string
  description: string
  actie: string
  objectId: string
}

export const mockWwsObjects: WWSComplianceObject[] = [
  { id: '1', address: 'Keizersgracht 12-A', punten: 194, sector: 'vrij', maxHuur: 1612, huidigeHuur: 1450, verschil: 162, status: 'compliant', laatsteCheck: '2026-01-15' },
  { id: '2', address: 'Keizersgracht 12-B', punten: 168, sector: 'midden', maxHuur: 1085, huidigeHuur: 1050, verschil: 35, status: 'verlopen', laatsteCheck: '2025-01-14' },
  { id: '3', address: 'Prinsengracht 8-1', punten: 172, sector: 'midden', maxHuur: 1135, huidigeHuur: 1180, verschil: -45, status: 'te_hoog', laatsteCheck: '2025-12-10' },
  { id: '4', address: 'Vondelstraat 22', punten: 156, sector: 'midden', maxHuur: 998, huidigeHuur: 950, verschil: 48, status: 'pdf_mist', laatsteCheck: '2026-01-08' },
  { id: '5', address: 'Herengracht 45-2', punten: 188, sector: 'vrij', maxHuur: 1565, huidigeHuur: 1480, verschil: 85, status: 'compliant', laatsteCheck: '2026-01-12' },
  { id: '6', address: 'Singel 88', punten: 178, sector: 'vrij', maxHuur: 1482, huidigeHuur: 1420, verschil: 62, status: 'compliant', laatsteCheck: '2026-01-18' },
  { id: '7', address: 'Rozengracht 14-1', punten: 145, sector: 'midden', maxHuur: 928, huidigeHuur: 890, verschil: 38, status: 'compliant', laatsteCheck: '2026-01-05' },
  { id: '8', address: 'Rozengracht 14-2', punten: 165, sector: 'midden', maxHuur: 1055, huidigeHuur: 1020, verschil: 35, status: 'compliant', laatsteCheck: '2026-01-20' },
  { id: '9', address: 'Westerstraat 67', punten: 165, sector: 'midden', maxHuur: 1055, huidigeHuur: 1020, verschil: 35, status: 'compliant', laatsteCheck: '2026-01-20' },
  { id: '10', address: 'Leidsegracht 33', punten: 192, sector: 'vrij', maxHuur: 1598, huidigeHuur: 1550, verschil: 48, status: 'compliant', laatsteCheck: '2026-01-10' },
  { id: '11', address: 'Oudezijds Achterburgwal 5', punten: 138, sector: 'sociaal', maxHuur: 759, huidigeHuur: 720, verschil: 39, status: 'compliant', laatsteCheck: '2026-01-14' },
  { id: '12', address: 'Jordaan 12-4', punten: 182, sector: 'vrij', maxHuur: 1515, huidigeHuur: 1490, verschil: 25, status: 'compliant', laatsteCheck: '2026-01-22' },
  { id: '13', address: 'Bloemgracht 42', punten: 176, sector: 'vrij', maxHuur: 1465, huidigeHuur: 1400, verschil: 65, status: 'compliant', laatsteCheck: '2026-01-11' },
  { id: '14', address: 'Egelantiersgracht 18', punten: 158, sector: 'midden', maxHuur: 1012, huidigeHuur: 980, verschil: 32, status: 'compliant', laatsteCheck: '2026-01-19' },
  { id: '15', address: 'Lijnbaansgracht 89', punten: 186, sector: 'vrij', maxHuur: 1548, huidigeHuur: 1500, verschil: 48, status: 'compliant', laatsteCheck: '2026-01-16' },
  { id: '16', address: 'Utrechtsestraat 55', punten: 162, sector: 'midden', maxHuur: 1038, huidigeHuur: 1000, verschil: 38, status: 'compliant', laatsteCheck: '2026-01-09' },
  { id: '17', address: 'Overtoom 120', punten: 148, sector: 'midden', maxHuur: 948, huidigeHuur: 910, verschil: 38, status: 'compliant', laatsteCheck: '2026-01-07' },
  { id: '18', address: 'Kerkstraat 33-A', punten: 190, sector: 'vrij', maxHuur: 1580, huidigeHuur: 1520, verschil: 60, status: 'compliant', laatsteCheck: '2026-01-13' },
  { id: '19', address: 'Reguliersgracht 72', punten: 174, sector: 'vrij', maxHuur: 1448, huidigeHuur: 1380, verschil: 68, status: 'compliant', laatsteCheck: '2026-01-21' },
  { id: '20', address: 'Ferdinand Bolstraat 88', punten: 152, sector: 'midden', maxHuur: 974, huidigeHuur: 945, verschil: 29, status: 'compliant', laatsteCheck: '2026-01-06' },
  { id: '21', address: 'Van Baerlestraat 12', punten: 198, sector: 'vrij', maxHuur: 1648, huidigeHuur: 1600, verschil: 48, status: 'compliant', laatsteCheck: '2026-01-17' },
  { id: '22', address: 'P.C. Hooftstraat 45', punten: 184, sector: 'vrij', maxHuur: 1532, huidigeHuur: 1475, verschil: 57, status: 'compliant', laatsteCheck: '2026-01-23' },
  { id: '23', address: 'Museumplein 8-2', punten: 172, sector: 'midden', maxHuur: 1102, huidigeHuur: 1060, verschil: 42, status: 'compliant', laatsteCheck: '2026-01-04' },
  { id: '24', address: 'Eerste van der Helststraat 3', punten: 169, sector: 'midden', maxHuur: 1082, huidigeHuur: 1045, verschil: 37, status: 'compliant', laatsteCheck: '2026-01-24' },
]

export const mockWwsAlerts: WWSAlert[] = [
  {
    id: '1',
    address: 'Prinsengracht 8-1',
    urgency: 'hoog',
    title: 'Huur €45 boven WWS-maximum',
    description: '€1.180 vs max €1.135',
    actie: 'Huurprijs verlagen of puntentelling laten herberekenen',
    objectId: '3',
  },
  {
    id: '2',
    address: 'Keizersgracht 12-B',
    urgency: 'midden',
    title: 'Puntentelling verlopen',
    description: 'Laatste: 14-01-2025',
    actie: 'Nieuwe puntentelling uitvoeren',
    objectId: '2',
  },
  {
    id: '3',
    address: 'Vondelstraat 22',
    urgency: 'midden',
    title: 'Puntentelling PDF mist bij huurcontract',
    description: 'PDF ontbreekt in contractdocumenten',
    actie: 'PDF genereren en toevoegen aan contract',
    objectId: '4',
  },
]

export const mockWwsBreakdown: WWSBreakdownItem[] = [
  { category: 'Oppervlakte woonruimte', punten: 72, toelichting: '72 m² × 1 punt' },
  { category: 'Oppervlakte overige ruimtes', punten: 6, toelichting: '8 m² × 0,75 punt' },
  { category: 'Verwarming', punten: 2, toelichting: 'Individueel CV' },
  { category: 'Energielabel', punten: 44, toelichting: 'Label A' },
  { category: 'Keuken', punten: 7, toelichting: 'Compleet (alle voorzieningen)' },
  { category: 'Sanitair', punten: 10, toelichting: 'Douche + wastafel + toilet' },
  { category: 'WOZ-waarde component', punten: 48, toelichting: 'WOZ €385.000 / 72m²' },
  { category: 'Buitenruimte', punten: 5, toelichting: 'Balkon 12 m²' },
]

export const mockWwsSectorDistribution = [
  { sector: 'sociaal', label: 'Sociaal (≤143)', count: 1, color: '#64748B' },
  { sector: 'midden', label: 'Midden (144-186)', count: 9, color: '#F59E0B' },
  { sector: 'vrij', label: 'Vrij (≥187)', count: 14, color: '#10B981' },
]

export const mockWwsOptimalisatieAdviezen = [
  {
    id: '1',
    titel: 'Warmtepomp installeren',
    investering: 6000,
    extraPunten: 8,
    extraHuur: 85,
    terugverdientijd: 6,
    huidig: 'Individueel CV',
    na: 'Warmtepomp',
  },
  {
    id: '2',
    titel: 'Buitenruimte vergroten',
    investering: 3000,
    extraPunten: 3,
    extraHuur: 35,
    terugverdientijd: 7,
    huidig: '12 m² balkon',
    na: 'Dakterras 25 m²',
  },
]

// Gemiddeld puntenaantal vorig jaar (voor trend)
export const mockWwsVorigeJaarGemiddeld = 175
