/**
 * Base POS Integration Class
 * Abstract base class that all POS integrations extend
 */

import type {
  POSIntegrationInterface,
  POSSalesData,
  POSEmployee,
  POSProduct,
  POSReservation,
} from './types'

export abstract class BasePOSIntegration implements POSIntegrationInterface {
  protected apiKey?: string
  protected accessToken?: string
  protected refreshTokenValue?: string
  protected locationId?: string
  protected apiBaseUrl: string

  constructor(config: {
    apiKey?: string
    accessToken?: string
    refreshToken?: string
    locationId?: string
    apiBaseUrl: string
  }) {
    this.apiKey = config.apiKey
    this.accessToken = config.accessToken
    this.refreshTokenValue = config.refreshToken
    this.locationId = config.locationId
    this.apiBaseUrl = config.apiBaseUrl
  }

  /**
   * Make an authenticated API request
   */
  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.apiBaseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    // Add authentication header
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    } else if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
      headers['X-API-Key'] = this.apiKey
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(`POS API Error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  /**
   * Abstract methods that must be implemented by each POS provider
   */
  abstract testConnection(): Promise<boolean>
  abstract fetchSales(since: Date, until?: Date): Promise<POSSalesData[]>
  abstract fetchEmployees(): Promise<POSEmployee[]>
  abstract fetchProducts(): Promise<POSProduct[]>
  abstract fetchReservations(date: Date): Promise<POSReservation[]>
  abstract getSyncStatus(): Promise<{
    last_sync_at?: string
    is_connected: boolean
    error?: string
  }>

  /**
   * Optional method for OAuth-based integrations
   */
  refreshAccessToken?(): Promise<void>
}




