import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client when Supabase is not configured
    console.warn('⚠️ Supabase not configured. Using mock client. App will work with limited functionality.')
    return null as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

