import { supabase } from './client'

export type AllocationMethod = 'equal' | 'surface_area' | 'custom'

export type AllocationUnit =
  | { unit_id: string; m2: number }          // surface_area
  | { unit_id: string; percentage: number }   // custom

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

/** Preview how a given amount splits under a key. Returns array of {unit_id, amount, pct}. */
export function previewAllocation(
  key: CostAllocationKey,
  totalAmount: number,
  unitIds?: string[], // required for 'equal' when units array is empty
): Array<{ unit_id: string; pct: number; amount: number }> {
  if (key.method === 'equal') {
    const ids = unitIds ?? key.units.map((u) => (u as { unit_id: string }).unit_id)
    const n = ids.length
    if (n === 0) return []
    const pct = 100 / n
    return ids.map((uid) => ({ unit_id: uid, pct, amount: (totalAmount * pct) / 100 }))
  }

  if (key.method === 'surface_area') {
    const typed = key.units as { unit_id: string; m2: number }[]
    const totalM2 = typed.reduce((s, u) => s + u.m2, 0)
    if (totalM2 === 0) return []
    return typed.map((u) => {
      const pct = (u.m2 / totalM2) * 100
      return { unit_id: u.unit_id, pct, amount: (totalAmount * pct) / 100 }
    })
  }

  // custom
  const typed = key.units as { unit_id: string; percentage: number }[]
  return typed.map((u) => ({
    unit_id: u.unit_id,
    pct: u.percentage,
    amount: (totalAmount * u.percentage) / 100,
  }))
}
