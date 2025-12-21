/**
 * API Route: Sync Data from POS System
 * POST /api/pos-integrations/sync
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPOSIntegration, updateSyncStatus } from '@/lib/pos-integrations/database'
import { POSIntegrationFactory } from '@/lib/pos-integrations/factory'
import { subDays } from 'date-fns'

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
    const { provider, sync_type = 'sales', days_back = 7 } = body

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
        { error: 'Integration not found' },
        { status: 404 }
      )
    }

    // Create integration instance
    const posIntegration = POSIntegrationFactory.create(integration)

    const since = subDays(new Date(), days_back)
    const results: any = {
      provider,
      sync_type,
      synced_at: new Date().toISOString(),
    }

    // Sync based on type
    if (sync_type === 'sales' || integration.sync_settings?.sync_sales) {
      const sales = await posIntegration.fetchSales(since)
      results.sales_count = sales.length

      // Store sales data in database
      if (sales.length > 0) {
        const { error: insertError } = await supabase
          .from('sales_data')
          .upsert(
            sales.map((sale) => ({
              user_id: user.id,
              pos_integration_id: integration.id,
              pos_order_id: sale.pos_order_id,
              sale_date: sale.sale_date,
              total_amount: sale.total_amount,
              payment_method: sale.payment_method,
              employee_id: sale.employee_id || null,
              table_number: sale.table_number || null,
              items: sale.items,
            })),
            {
              onConflict: 'user_id,pos_order_id',
            }
          )

        if (insertError) {
          console.error('Error inserting sales data:', insertError)
          results.sales_error = insertError.message
        }
      }
    }

    if (sync_type === 'employees' || integration.sync_settings?.sync_employees) {
      const employees = await posIntegration.fetchEmployees()
      results.employees_count = employees.length
      // TODO: Map and store employees
    }

    if (sync_type === 'products' || integration.sync_settings?.sync_products) {
      const products = await posIntegration.fetchProducts()
      results.products_count = products.length
      // TODO: Map and store products
    }

    if (sync_type === 'reservations' || integration.sync_settings?.sync_reservations) {
      const reservations = await posIntegration.fetchReservations(new Date())
      results.reservations_count = reservations.length
      // TODO: Map and store reservations
    }

    // Update sync status
    await updateSyncStatus(user.id, provider, new Date().toISOString())

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error: any) {
    console.error('Error syncing POS data:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to sync data',
        success: false,
      },
      { status: 500 }
    )
  }
}
