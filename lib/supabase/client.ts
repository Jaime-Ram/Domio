import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Placeholder zodat de build niet faalt als env vars ontbreken (bijv. op Vercel zonder ingestelde vars).
// Na deploy: zet NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → opnieuw builden.
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-anon-key';

export const supabase: SupabaseClient<Database> = createClient<Database>(url, key);

export const createServerSupabaseClient = () => {
  return createClient<Database>(url, key);
};
