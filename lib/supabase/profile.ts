import { supabase } from './client'

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: 'verhuurder' | 'huurder' | 'admin'
  phone: string | null
  company_name: string | null
  kvk_number: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as Profile
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'company_name' | 'kvk_number' | 'avatar_url'>>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', userId)
    .select()
    .single()

  if (error) return { data: null, error }
  return { data: data as Profile, error: null }
}
