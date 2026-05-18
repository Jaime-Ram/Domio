/**
 * CBS Open Data API — CPI alle huishoudens (tabel 83131NED)
 * Index 2015=100, gepubliceerd maandelijks.
 * Gebruikt voor huurindexatie op basis van CPI.
 */

const CBS_BASE = 'https://opendata.cbs.nl/ODataApi/odata/83131NED/TypedDataSet'

// Perioden-formaat dat CBS verwacht: "2024MM01" voor jan 2024
function cbsPeriod(year: number, month: number) {
  return `${year}MM${String(month).padStart(2, '0')}`
}

export async function getCpiForMonth(year: number, month: number): Promise<number | null> {
  const period = cbsPeriod(year, month)
  const url = `${CBS_BASE}?$filter=Perioden eq '${period}'&$select=Perioden,CPI_1`
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } }) // 24u cache
    if (!res.ok) return null
    const json = await res.json()
    const value = json?.value?.[0]?.CPI_1
    return typeof value === 'number' ? value : null
  } catch {
    return null
  }
}

/**
 * Haalt de meest recent gepubliceerde CPI op (loopt maximaal 3 maanden terug).
 * CBS publiceert met ~6 weken vertraging, dus jan-CPI is pas medio feb beschikbaar.
 */
export async function getLatestCpi(): Promise<{ cpi: number; year: number; month: number } | null> {
  const now = new Date()
  for (let offset = 1; offset <= 4; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const cpi = await getCpiForMonth(year, month)
    if (cpi !== null) return { cpi, year, month }
  }
  return null
}

/**
 * Indexatiefactor berekenen: CPI van targetJaar/maand vs CPI van vorig jaar/maand.
 * Retourneert bijv. 1.032 voor 3,2% stijging.
 */
export async function getCpiIndexFactor(
  targetYear: number,
  targetMonth: number,
): Promise<number | null> {
  const [current, previous] = await Promise.all([
    getCpiForMonth(targetYear, targetMonth),
    getCpiForMonth(targetYear - 1, targetMonth),
  ])
  if (!current || !previous || previous === 0) return null
  return current / previous
}
