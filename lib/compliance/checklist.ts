/**
 * Compliance-checklist voor verhuurders (NL).
 *
 * Vier hoofdonderdelen met subonderdelen. Dit is de bron voor het
 * compliance-overzicht; per pand houden we bij welke items op orde zijn.
 * Later koppelen we hier tools/automatisering aan (energielabel ophalen,
 * WWS berekenen, keuringsdata uit onderhoud, etc.).
 */

export interface ComplianceItem {
  key: string
  label: string
  hint?: string
}

export interface ComplianceCategory {
  key: string
  label: string
  items: ComplianceItem[]
}

export const COMPLIANCE_CHECKLIST: ComplianceCategory[] = [
  {
    key: 'goed_verhuurderschap',
    label: 'Goed verhuurderschap',
    items: [
      { key: 'schriftelijk_contract', label: 'Schriftelijke huurovereenkomst aanwezig' },
      { key: 'waarborgsom', label: 'Waarborgsom max. 2x de kale huur' },
      { key: 'informatieplicht', label: 'Huurder schriftelijk geïnformeerd (rechten, contactpunt, servicekosten)' },
      { key: 'selectie', label: 'Transparante, niet-discriminerende huurderselectie' },
      { key: 'verhuurvergunning', label: 'Verhuurvergunning aanwezig (indien gemeente vereist)' },
    ],
  },
  {
    key: 'huurprijs',
    label: 'Huurprijs & punten',
    items: [
      { key: 'wws', label: 'WWS-puntentelling uitgevoerd' },
      { key: 'huur_binnen_max', label: 'Huurprijs valt binnen het wettelijk maximum' },
      { key: 'energielabel', label: 'Geldig energielabel geregistreerd' },
      { key: 'huurverhoging', label: 'Jaarlijkse huurverhoging binnen het maximum' },
    ],
  },
  {
    key: 'veiligheid',
    label: 'Veiligheid & onderhoud',
    items: [
      { key: 'rookmelders', label: 'Rookmelders op elke verdieping' },
      { key: 'cv_keuring', label: 'CV/gas-keuring actueel' },
      { key: 'elektra', label: 'Elektrische installatie veilig' },
      { key: 'legionella', label: 'Legionellabeheer (indien van toepassing)' },
    ],
  },
  {
    key: 'financieel',
    label: 'Financieel & administratief',
    items: [
      { key: 'servicekosten', label: 'Jaarlijkse servicekosten-afrekening gedaan' },
      { key: 'avg', label: 'Huurdersgegevens AVG-proof verwerkt' },
    ],
  },
]

export const COMPLIANCE_TOTAL_ITEMS = COMPLIANCE_CHECKLIST.reduce((s, c) => s + c.items.length, 0)

/** Compliance-percentage o.b.v. een set afgevinkte item-keys. */
export function compliancePct(checked: Set<string>): number {
  if (COMPLIANCE_TOTAL_ITEMS === 0) return 0
  let done = 0
  for (const cat of COMPLIANCE_CHECKLIST) for (const it of cat.items) if (checked.has(it.key)) done++
  return Math.round((done / COMPLIANCE_TOTAL_ITEMS) * 100)
}

export function categoryPct(category: ComplianceCategory, checked: Set<string>): number {
  if (category.items.length === 0) return 0
  const done = category.items.filter((it) => checked.has(it.key)).length
  return Math.round((done / category.items.length) * 100)
}
