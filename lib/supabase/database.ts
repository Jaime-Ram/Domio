// Database schema helpers for storing Stripe Connect account information
// You'll need to create a table in Supabase with the following structure:

/*
CREATE TABLE stripe_connect_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stripe_connect_accounts_user_id ON stripe_connect_accounts(user_id);
CREATE INDEX idx_stripe_connect_accounts_stripe_account_id ON stripe_connect_accounts(stripe_account_id);
*/

import { createClient } from './server'

export async function saveStripeAccount(userId: string, stripeAccountId: string) {
  const supabase = await createClient()
  
  // In a real implementation, you'd insert/update this in your database
  // For now, this is a placeholder
  const { data, error } = await supabase
    .from('stripe_connect_accounts')
    .upsert({
      user_id: userId,
      stripe_account_id: stripeAccountId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving Stripe account:', error)
    throw error
  }

  return data
}

export async function getStripeAccount(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('stripe_connect_accounts')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching Stripe account:', error)
    throw error
  }

  return data
}




