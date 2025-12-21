/**
 * POS Integration Types
 * Generic types for all POS system integrations
 */

export type POSProvider = 'lightspeed' | 'toast' | 'square' | 'untill' | 'touchbistro' | 'resengo' | 'zenchef' | 'formitable'

export interface POSIntegration {
  id: string
  user_id: string
  provider: POSProvider
  api_key?: string
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  location_id?: string
  is_active: boolean
  sync_settings: POSSyncSettings
  created_at: string
  updated_at: string
}

export interface POSSyncSettings {
  sync_sales: boolean
  sync_employees: boolean
  sync_products: boolean
  sync_reservations: boolean
  sync_frequency: 'realtime' | '5min' | '15min' | '30min' | 'manual'
  last_sync_at?: string
}

export interface POSSalesData {
  id: string
  pos_order_id: string
  sale_date: string
  total_amount: number
  payment_method: string
  employee_id?: string
  table_number?: string
  items: POSOrderItem[]
}

export interface POSOrderItem {
  id: string
  name: string
  quantity: number
  price: number
  category?: string
}

export interface POSEmployee {
  id: string
  name: string
  email?: string
  role?: string
  hourly_rate?: number
}

export interface POSProduct {
  id: string
  name: string
  price: number
  category?: string
  description?: string
}

export interface POSReservation {
  id: string
  date: string
  time: string
  party_size: number
  guest_name: string
  guest_phone?: string
  guest_email?: string
  table_number?: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
}

/**
 * Generic POS Integration Interface
 * All POS providers must implement this interface
 */
export interface POSIntegrationInterface {
  /**
   * Test the connection to the POS system
   */
  testConnection(): Promise<boolean>

  /**
   * Fetch sales data from the POS system
   * @param since - Start date for fetching sales
   * @param until - End date for fetching sales (optional)
   */
  fetchSales(since: Date, until?: Date): Promise<POSSalesData[]>

  /**
   * Fetch employees from the POS system
   */
  fetchEmployees(): Promise<POSEmployee[]>

  /**
   * Fetch products from the POS system
   */
  fetchProducts(): Promise<POSProduct[]>

  /**
   * Fetch reservations from the POS system
   * @param date - Date to fetch reservations for
   */
  fetchReservations(date: Date): Promise<POSReservation[]>

  /**
   * Refresh the access token (for OAuth-based integrations)
   */
  refreshToken?(): Promise<void>

  /**
   * Get the current sync status
   */
  getSyncStatus(): Promise<{
    last_sync_at?: string
    is_connected: boolean
    error?: string
  }>
}

/**
 * Configuration for each POS provider
 */
export interface POSProviderConfig {
  name: string
  provider: POSProvider
  auth_type: 'oauth' | 'api_key'
  api_base_url: string
  documentation_url: string
  supports_webhooks: boolean
  supports_realtime_sync: boolean
}




