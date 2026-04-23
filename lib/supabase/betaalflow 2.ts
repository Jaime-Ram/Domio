import { supabase } from './client'

export type PaymentProfile = {
  id: string
  owner_id: string
  name: string
  description: string | null
  pay_date: number
  reminders: number[]
  created_at: string
  updated_at: string
  tenant_count?: number
}

export type PaymentProfileInsert = {
  owner_id: string
  name: string
  description?: string | null
  pay_date: number
  reminders: number[]
}

export type PaymentProfileUpdate = Partial<Omit<PaymentProfileInsert, 'owner_id'>>

export const paymentProfileQueries = {
  async getByOwner(ownerId: string): Promise<PaymentProfile[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('payment_profiles')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as PaymentProfile[]
  },

  async getWithTenantCounts(ownerId: string): Promise<PaymentProfile[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('payment_profiles')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const profiles = (data ?? []) as PaymentProfile[]

    // Count tenants per profile
    const { data: tenants } = await supabase
      .from('tenants')
      .select('payment_profile_id')
      .eq('owner_id', ownerId)
      .not('payment_profile_id', 'is', null)

    const countMap: Record<string, number> = {}
    for (const t of (tenants ?? []) as { payment_profile_id: string | null }[]) {
      if (t.payment_profile_id) {
        countMap[t.payment_profile_id] = (countMap[t.payment_profile_id] ?? 0) + 1
      }
    }

    return profiles.map(p => ({ ...p, tenant_count: countMap[p.id] ?? 0 }))
  },

  async create(profile: PaymentProfileInsert): Promise<PaymentProfile> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('payment_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) throw error
    return data as PaymentProfile
  },

  async update(id: string, updates: PaymentProfileUpdate): Promise<PaymentProfile> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('payment_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as PaymentProfile
  },

  async delete(id: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('payment_profiles')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
