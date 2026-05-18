import { getCpiIndexFactor, getLatestCpi } from './cbs'
import type { Database } from './supabase/types'

type Lease = Database['public']['Tables']['leases']['Row']

export type IndexationResult = {
  oldRent: number
  newRent: number
  factor: number
  percentage: number
  method: Lease['indexation_method']
  cpiYear?: number
  cpiMonth?: number
}

/**
 * Bereken de nieuwe huur voor een lease op basis van de ingestelde indexatiemethode.
 * Retourneert null als er geen indexatie van toepassing is.
 */
export async function calculateNewRent(lease: Lease): Promise<IndexationResult | null> {
  if (lease.indexation_method === 'none') return null

  const currentRent = lease.monthly_rent

  if (lease.indexation_method === 'fixed') {
    const pct = lease.indexation_pct ?? 0
    const factor = 1 + pct / 100
    const newRent = roundToNearestCent(currentRent * factor)
    return {
      oldRent: currentRent,
      newRent,
      factor,
      percentage: pct,
      method: 'fixed',
    }
  }

  // CPI of CPI+opslag
  const latest = await getLatestCpi()
  if (!latest) return null

  const cpiFactor = await getCpiIndexFactor(latest.year, latest.month)
  if (!cpiFactor) return null

  let factor = cpiFactor
  if (lease.indexation_method === 'cpi_plus' && lease.indexation_pct) {
    factor = cpiFactor + lease.indexation_pct / 100
  }

  const newRent = roundToNearestCent(currentRent * factor)
  const percentage = (factor - 1) * 100

  return {
    oldRent: currentRent,
    newRent,
    factor,
    percentage,
    method: lease.indexation_method,
    cpiYear: latest.year,
    cpiMonth: latest.month,
  }
}

/**
 * Bepaalt of een lease in aanmerking komt voor indexatie deze maand.
 * Criteria: actief contract, index_month = huidige maand, nog niet geïndexeerd dit jaar.
 */
export function isDueForIndexation(lease: Lease): boolean {
  if (lease.status !== 'actief') return false
  if (lease.indexation_method === 'none') return false
  if (!lease.index_month) return false

  const now = new Date()
  if (now.getMonth() + 1 !== lease.index_month) return false

  if (lease.last_indexed_at) {
    const lastIndexed = new Date(lease.last_indexed_at)
    if (lastIndexed.getFullYear() >= now.getFullYear()) return false
  }

  return true
}

function roundToNearestCent(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function formatMonth(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString('nl-NL', { month: 'long' })
}

export const INDEXATION_METHOD_LABELS: Record<Lease['indexation_method'], string> = {
  none: 'Geen indexatie',
  cpi: 'CPI (CBS)',
  cpi_plus: 'CPI + opslag',
  fixed: 'Vast percentage',
}

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: formatMonth(i + 1),
}))
