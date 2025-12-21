/**
 * Lightspeed POS Integration
 * Implementation for Lightspeed Restaurant API
 * Documentation: https://developers.lightspeedhq.com/retail/endpoints/
 */

import { BasePOSIntegration } from './base'
import type {
  POSSalesData,
  POSEmployee,
  POSProduct,
  POSReservation,
} from './types'

interface LightspeedConfig {
  accessToken: string
  refreshToken?: string
  locationId: string
  apiBaseUrl?: string
}

export class LightspeedIntegration extends BasePOSIntegration {
  private locationId: string

  constructor(config: LightspeedConfig) {
    super({
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      locationId: config.locationId,
      apiBaseUrl: config.apiBaseUrl || 'https://api.lightspeedapp.com/API/V3',
    })
    this.locationId = config.locationId
  }

  /**
   * Test connection to Lightspeed API
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test by fetching account info
      await this.makeRequest<{ account?: { accountID?: string } }>(
        `/Account.json`
      )
      return true
    } catch (error) {
      console.error('Lightspeed connection test failed:', error)
      return false
    }
  }

  /**
   * Fetch sales data from Lightspeed
   * Note: This is a simplified implementation. The actual Lightspeed API
   * may have different endpoints and data structures.
   */
  async fetchSales(since: Date, until?: Date): Promise<POSSalesData[]> {
    try {
      const sinceStr = since.toISOString().split('T')[0]
      const untilStr = until ? until.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

      // Fetch sales/orders from Lightspeed
      // Note: Adjust endpoint based on actual Lightspeed API documentation
      const response = await this.makeRequest<{
        Sale?: Array<{
          saleID: string
          timeStamp: string
          total: string
          payments?: Array<{
            paymentTypeID: string
            amount: string
          }>
          employeeID?: string
          SaleLine?: Array<{
            saleLineID: string
            itemID: string
            description: string
            quantity: string
            unitPrice: string
          }>
        }>
      }>(`/Account/${this.locationId}/Sale.json?timeStamp=>=${sinceStr}&timeStamp=<=${untilStr}`)

      if (!response.Sale) {
        return []
      }

      // Transform Lightspeed data to our POSSalesData format
      return response.Sale.map((sale) => ({
        id: sale.saleID,
        pos_order_id: sale.saleID,
        sale_date: sale.timeStamp,
        total_amount: parseFloat(sale.total),
        payment_method: sale.payments?.[0]?.paymentTypeID || 'unknown',
        employee_id: sale.employeeID,
        items: (sale.SaleLine || []).map((line) => ({
          id: line.saleLineID,
          name: line.description,
          quantity: parseFloat(line.quantity),
          price: parseFloat(line.unitPrice),
        })),
      }))
    } catch (error) {
      console.error('Error fetching Lightspeed sales:', error)
      throw error
    }
  }

  /**
   * Fetch employees from Lightspeed
   */
  async fetchEmployees(): Promise<POSEmployee[]> {
    try {
      const response = await this.makeRequest<{
        Employee?: Array<{
          employeeID: string
          firstName: string
          lastName: string
          email?: string
          contact?: {
            Emails?: {
              contactID?: string
              address?: string
            }
          }
        }>
      }>(`/Account/${this.locationId}/Employee.json`)

      if (!response.Employee) {
        return []
      }

      return response.Employee.map((emp) => ({
        id: emp.employeeID,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email || emp.contact?.Emails?.[0]?.address,
      }))
    } catch (error) {
      console.error('Error fetching Lightspeed employees:', error)
      throw error
    }
  }

  /**
   * Fetch products from Lightspeed
   */
  async fetchProducts(): Promise<POSProduct[]> {
    try {
      const response = await this.makeRequest<{
        Item?: Array<{
          itemID: string
          description: string
          Prices?: {
            ItemPrice?: Array<{
              amount: string
            }>
          }
          Category?: {
            name?: string
          }
        }>
      }>(`/Account/${this.locationId}/Item.json`)

      if (!response.Item) {
        return []
      }

      return response.Item.map((item) => ({
        id: item.itemID,
        name: item.description,
        price: parseFloat(item.Prices?.ItemPrice?.[0]?.amount || '0'),
        category: item.Category?.name,
      }))
    } catch (error) {
      console.error('Error fetching Lightspeed products:', error)
      throw error
    }
  }

  /**
   * Fetch reservations from Lightspeed
   * Note: Lightspeed may not have a direct reservations API
   * This is a placeholder implementation
   */
  async fetchReservations(date: Date): Promise<POSReservation[]> {
    try {
      // Lightspeed may not have a reservations endpoint
      // This would need to be implemented based on actual API availability
      const dateStr = date.toISOString().split('T')[0]
      
      // Placeholder - adjust based on actual Lightspeed API
      const response = await this.makeRequest<{
        Reservation?: Array<{
          reservationID: string
          date: string
          time: string
          partySize: string
          guestName: string
          guestPhone?: string
          guestEmail?: string
          tableNumber?: string
          status: string
        }>
      }>(`/Account/${this.locationId}/Reservation.json?date=${dateStr}`)

      if (!response.Reservation) {
        return []
      }

      return response.Reservation.map((res) => ({
        id: res.reservationID,
        date: res.date,
        time: res.time,
        party_size: parseInt(res.partySize),
        guest_name: res.guestName,
        guest_phone: res.guestPhone,
        guest_email: res.guestEmail,
        table_number: res.tableNumber,
        status: res.status as 'confirmed' | 'pending' | 'cancelled' | 'completed',
      }))
    } catch (error) {
      console.error('Error fetching Lightspeed reservations:', error)
      // Return empty array if reservations are not supported
      return []
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    last_sync_at?: string
    is_connected: boolean
    error?: string
  }> {
    try {
      const isConnected = await this.testConnection()
      return {
        is_connected: isConnected,
        last_sync_at: new Date().toISOString(),
      }
    } catch (error: any) {
      return {
        is_connected: false,
        error: error.message,
      }
    }
  }

  /**
   * Refresh OAuth token
   */
  async refreshToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      // Implement OAuth token refresh based on Lightspeed's OAuth flow
      // This would typically involve calling the token endpoint
      const response = await fetch('https://api.lightspeedapp.com/oauth/access_token.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: process.env.LIGHTSPEED_CLIENT_ID || '',
          client_secret: process.env.LIGHTSPEED_CLIENT_SECRET || '',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      this.accessToken = data.access_token
      if (data.refresh_token) {
        this.refreshToken = data.refresh_token
      }
    } catch (error) {
      console.error('Error refreshing Lightspeed token:', error)
      throw error
    }
  }
}
