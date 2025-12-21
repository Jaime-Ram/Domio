/**
 * API Route: Test POS Integration Connection
 * POST /api/pos-integrations/test
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPOSIntegration } from '@/lib/pos-integrations/database'
import { POSIntegrationFactory } from '@/lib/pos-integrations/factory'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider } = body

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }

    // Get the integration from database
    const integration = await getPOSIntegration(user.id, provider)

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found. Please connect your POS system first.' },
        { status: 404 }
      )
    }

    // Create integration instance
    const posIntegration = POSIntegrationFactory.create(integration)

    // Test connection
    const isConnected = await posIntegration.testConnection()

    // Get sync status
    const syncStatus = await posIntegration.getSyncStatus()

    return NextResponse.json({
      success: isConnected,
      is_connected: isConnected,
      sync_status: syncStatus,
    })
  } catch (error: any) {
    console.error('Error testing POS integration:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to test connection',
        success: false,
      },
      { status: 500 }
    )
  }
}




