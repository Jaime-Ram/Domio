import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

/**
 * Supabase admin client met service role key.
 * Alleen gebruiken op de server (API routes, server components).
 * Bypassed RLS - nooit exposen naar de client.
 * Retourneert null als de service role key ontbreekt.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !serviceRoleKey) return null
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
