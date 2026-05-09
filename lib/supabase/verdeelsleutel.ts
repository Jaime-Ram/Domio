import { supabase } from './client'

export type AllocationMethod = 'equal' | 'surface_area' | 'custom'

// Only `custom` keys store per-unit data; equal/surface_area derive everything
// from the property's units at compute time.
export type AllocationUnit = { unit_id: string; percentage: number }

export type PropertyUnitInput = { id: string; size_m2: number | null }

export type CostAllocationKey = {
  id: string
  owner_id: string
  property_id: string | null
  name: string
  method: AllocationMethod
  units: AllocationUnit[]
  created_at: string
  updated_at: string
}

export type CostAllocationKeyInsert = {
  owner_id: string
  property_id?: string | null
  name: string
  method: AllocationMethod
  units?: AllocationUnit[]
}

export type CostAllocationKeyUpdate = Partial<Omit<CostAllocationKeyInsert, 'owner_id'>>

export const costAllocationKeyQueries = {
  async getByOwner(ownerId: string): Promise<CostAllocationKey[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('cost_allocation_keys')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as CostAllocationKey[]
  },

  async create(key: CostAllocationKeyInsert): Promise<CostAllocationKey> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('cost_allocation_keys')
      .insert({ ...key, units: key.units ?? [] })
      .select()
      .single()

    if (error) throw error
    return data as CostAllocationKey
  },

  async update(id: string, updates: CostAllocationKeyUpdate): Promise<CostAllocationKey> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('cost_allocation_keys')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as CostAllocationKey
  },

  async delete(id: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('cost_allocation_keys')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

/** Preview how a given amount splits under a key. Returns array of {unit_id, amount, pct}.
 *
 * `propertyUnits` is required for `equal` and `surface_area` (the unit list and
 * m² values come from the property, not the key). For `custom`, the key's own
 * units array is authoritative.
 */
export function previewAllocation(
  key: CostAllocationKey,
  totalAmount: number,
  propertyUnits: PropertyUnitInput[] = [],
): Array<{ unit_id: string; pct: number; amount: number }> {
  if (key.method === 'equal') {
    const n = propertyUnits.length
    if (n === 0) return []
    const pct = 100 / n
    return propertyUnits.map((u) => ({
      unit_id: u.id,
      pct,
      amount: (totalAmount * pct) / 100,
    }))
  }

  if (key.method === 'surface_area') {
    const totalM2 = propertyUnits.reduce((s, u) => s + (u.size_m2 ?? 0), 0)
    if (totalM2 === 0) return []
    return propertyUnits.map((u) => {
      const m2 = u.size_m2 ?? 0
      const pct = (m2 / totalM2) * 100
      return { unit_id: u.id, pct, amount: (totalAmount * pct) / 100 }
    })
  }

  // custom — use the key's stored percentages
  return key.units.map((u) => ({
    unit_id: u.unit_id,
    pct: u.percentage,
    amount: (totalAmount * u.percentage) / 100,
  }))
}
