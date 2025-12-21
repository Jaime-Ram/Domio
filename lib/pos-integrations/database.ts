/**
 * POS Integration Database Helpers
 * Functions for managing POS integrations in Supabase
 */

import { createClient } from '@/lib/supabase/server'
import type { POSIntegration, POSSyncSettings } from './types'

export async function getPOSIntegration(
  userId: string,
  provider: string
): Promise<POSIntegration | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pos_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No integration found
      return null
    }
    console.error('Error fetching POS integration:', error)
    throw error
  }

  return data as POSIntegration
}

export async function getAllPOSIntegrations(
  userId: string
): Promise<POSIntegration[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pos_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching POS integrations:', error)
    throw error
  }

  return (data || []) as POSIntegration[]
}

export async function savePOSIntegration(
  userId: string,
  integration: {
    provider: string
    api_key?: string
    access_token?: string
    refresh_token?: string
    token_expires_at?: string
    location_id?: string
    sync_settings?: POSSyncSettings
  }
): Promise<POSIntegration> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pos_integrations')
    .upsert(
      {
        user_id: userId,
        provider: integration.provider,
        api_key: integration.api_key,
        access_token: integration.access_token,
        refresh_token: integration.refresh_token,
        token_expires_at: integration.token_expires_at,
        location_id: integration.location_id,
        sync_settings: integration.sync_settings || {
          sync_sales: true,
          sync_employees: false,
          sync_products: false,
          sync_reservations: false,
          sync_frequency: '15min',
        },
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,provider',
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error saving POS integration:', error)
    throw error
  }

  return data as POSIntegration
}

export async function updatePOSIntegration(
  userId: string,
  provider: string,
  updates: Partial<POSIntegration>
): Promise<POSIntegration> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pos_integrations')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('provider', provider)
    .select()
    .single()

  if (error) {
    console.error('Error updating POS integration:', error)
    throw error
  }

  return data as POSIntegration
}

export async function deletePOSIntegration(
  userId: string,
  provider: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('pos_integrations')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider)

  if (error) {
    console.error('Error deleting POS integration:', error)
    throw error
  }
}

export async function updateSyncStatus(
  userId: string,
  provider: string,
  lastSyncAt: string
): Promise<void> {
  const supabase = await createClient()

  const integration = await getPOSIntegration(userId, provider)
  if (!integration) {
    throw new Error('Integration not found')
  }

  const syncSettings = integration.sync_settings || {}
  syncSettings.last_sync_at = lastSyncAt

  await updatePOSIntegration(userId, provider, {
    sync_settings: syncSettings,
  })
}




