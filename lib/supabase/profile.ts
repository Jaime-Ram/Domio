import { supabase } from './client'

export type NotificationPrefs = {
  email: boolean
  push: boolean
  in_app: boolean
  new_payment: boolean
  payment_overdue: boolean
  maintenance_request: boolean
  document_expiring: boolean
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: 'verhuurder' | 'huurder' | 'admin'
  phone: string | null
  company_name: string | null
  kvk_number: string | null
  btw_number: string | null
  company_address: string | null
  company_postal_code: string | null
  company_city: string | null
  company_email: string | null
  company_phone: string | null
  company_logo_url: string | null
  avatar_url: string | null
  language: 'nl' | 'en'
  notification_prefs: NotificationPrefs
  mfa_email_enabled?: boolean
  mfa_method?: 'none' | 'sms' | 'totp'
  created_at: string
  updated_at: string
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  email: true,
  push: false,
  in_app: true,
  new_payment: true,
  payment_overdue: true,
  maintenance_request: true,
  document_expiring: true,
}

export function getDefaultNotificationPrefs(): NotificationPrefs {
  return { ...DEFAULT_NOTIFICATION_PREFS }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  const profile = data as Profile
  if (!profile.notification_prefs) profile.notification_prefs = getDefaultNotificationPrefs()
  return profile
}

export type ProfileUpdatable = Partial<Pick<Profile,
  | 'full_name' | 'phone' | 'avatar_url'
  | 'company_name' | 'kvk_number' | 'btw_number'
  | 'company_address' | 'company_postal_code' | 'company_city'
  | 'company_email' | 'company_phone' | 'company_logo_url'
  | 'language' | 'notification_prefs' | 'mfa_email_enabled' | 'mfa_method'
>>

export async function updateProfile(userId: string, updates: ProfileUpdatable) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', userId)
    .select()
    .single()

  if (error) return { data: null, error }
  return { data: data as Profile, error: null }
}
