// Database Types - Auto-generated from Supabase Schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'verhuurder' | 'huurder' | 'admin'
          phone: string | null
          company_name: string | null
          kvk_number: string | null
          avatar_url: string | null
          mfa_email_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'verhuurder' | 'huurder' | 'admin'
          phone?: string | null
          company_name?: string | null
          kvk_number?: string | null
          avatar_url?: string | null
          mfa_email_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'verhuurder' | 'huurder' | 'admin'
          phone?: string | null
          company_name?: string | null
          kvk_number?: string | null
          avatar_url?: string | null
          mfa_email_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      email_otp: {
        Row: {
          id: string
          user_id: string
          code_hash: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          code_hash: string
          expires_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          code_hash?: string
          expires_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          name: string
          address: string
          postcode: string | null
          city: string | null
          type: 'appartement' | 'eengezinswoning' | 'bovenwoning' | 'benedenwoning' | 'maisonnette' | 'studio' | 'complex'
          build_year: number | null
          woz_value: number | null
          energy_label: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          address: string
          postcode?: string | null
          city?: string | null
          type?: 'appartement' | 'eengezinswoning' | 'bovenwoning' | 'benedenwoning' | 'maisonnette' | 'studio' | 'complex'
          build_year?: number | null
          woz_value?: number | null
          energy_label?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          address?: string
          postcode?: string | null
          city?: string | null
          type?: 'appartement' | 'eengezinswoning' | 'bovenwoning' | 'benedenwoning' | 'maisonnette' | 'studio' | 'complex'
          build_year?: number | null
          woz_value?: number | null
          energy_label?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      units: {
        Row: {
          id: string
          property_id: string
          unit_number: string
          rooms: number | null
          size_m2: number | null
          monthly_rent: number | null
          status: 'verhuurd' | 'leegstand' | 'onderhoud' | 'te_verhuren'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          unit_number: string
          rooms?: number | null
          size_m2?: number | null
          monthly_rent?: number | null
          status?: 'verhuurd' | 'leegstand' | 'onderhoud' | 'te_verhuren'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          unit_number?: string
          rooms?: number | null
          size_m2?: number | null
          monthly_rent?: number | null
          status?: 'verhuurd' | 'leegstand' | 'onderhoud' | 'te_verhuren'
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          owner_id: string
          profile_id: string | null
          full_name: string
          email: string | null
          phone: string | null
          date_of_birth: string | null
          id_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          profile_id?: string | null
          full_name: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          id_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          profile_id?: string | null
          full_name?: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          id_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leases: {
        Row: {
          id: string
          owner_id: string
          unit_id: string
          tenant_id: string | null
          payment_profile_id: string
          start_date: string
          end_date: string | null
          monthly_rent: number
          deposit: number | null
          status: 'actief' | 'verlopen' | 'opgezegd' | 'concept'
          notes: string | null
          base_rent: number | null
          indexation_method: 'none' | 'cpi' | 'cpi_plus' | 'fixed'
          indexation_pct: number | null
          index_month: number | null
          last_indexed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          unit_id: string
          tenant_id?: string | null
          payment_profile_id: string
          start_date: string
          end_date?: string | null
          monthly_rent: number
          deposit?: number | null
          status?: 'actief' | 'verlopen' | 'opgezegd' | 'concept'
          notes?: string | null
          base_rent?: number | null
          indexation_method?: 'none' | 'cpi' | 'cpi_plus' | 'fixed'
          indexation_pct?: number | null
          index_month?: number | null
          last_indexed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          unit_id?: string
          tenant_id?: string | null
          payment_profile_id?: string
          start_date?: string
          end_date?: string | null
          monthly_rent?: number
          deposit?: number | null
          status?: 'actief' | 'verlopen' | 'opgezegd' | 'concept'
          notes?: string | null
          base_rent?: number | null
          indexation_method?: 'none' | 'cpi' | 'cpi_plus' | 'fixed'
          indexation_pct?: number | null
          index_month?: number | null
          last_indexed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          owner_id: string
          unit_id: string | null
          property_id: string | null
          lease_id: string | null
          scope: 'pand' | 'persoon' | null
          title: string
          description: string | null
          status: 'open' | 'in_behandeling' | 'gepland' | 'afgerond' | 'geannuleerd'
          priority: 'laag' | 'normaal' | 'hoog' | 'urgent'
          due_date: string | null
          category: 'onderhoud' | 'inspectie' | 'klacht' | 'compliance' | 'huurgebeurtenis' | null
          source: 'landlord' | 'tenant' | 'system' | 'flow' | null
          ticket_number: number | null
          assignee_id: string | null
          sla_deadline: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          unit_id?: string | null
          property_id?: string | null
          lease_id?: string | null
          scope?: 'pand' | 'persoon' | null
          title: string
          description?: string | null
          status?: 'open' | 'in_behandeling' | 'gepland' | 'afgerond' | 'geannuleerd'
          priority?: 'laag' | 'normaal' | 'hoog' | 'urgent'
          due_date?: string | null
          category?: 'onderhoud' | 'inspectie' | 'klacht' | 'compliance' | 'huurgebeurtenis' | null
          source?: 'landlord' | 'tenant' | 'system' | 'flow' | null
          assignee_id?: string | null
          sla_deadline?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          unit_id?: string | null
          property_id?: string | null
          lease_id?: string | null
          scope?: 'pand' | 'persoon' | null
          title?: string
          description?: string | null
          status?: 'open' | 'in_behandeling' | 'gepland' | 'afgerond' | 'geannuleerd'
          priority?: 'laag' | 'normaal' | 'hoog' | 'urgent'
          due_date?: string | null
          category?: 'onderhoud' | 'inspectie' | 'klacht' | 'compliance' | 'huurgebeurtenis' | null
          source?: 'landlord' | 'tenant' | 'system' | 'flow' | null
          assignee_id?: string | null
          sla_deadline?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          ticket_id: string
          sender_id: string | null
          content: string
          visibility: 'public' | 'internal' | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_id?: string | null
          content: string
          visibility?: 'public' | 'internal' | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_id?: string | null
          content?: string
          visibility?: 'public' | 'internal' | null
          created_at?: string
        }
      }
      ticket_events: {
        Row: {
          id: string
          ticket_id: string
          actor_id: string | null
          event_type: string
          from_value: string | null
          to_value: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          actor_id?: string | null
          event_type: string
          from_value?: string | null
          to_value?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          actor_id?: string | null
          event_type?: string
          from_value?: string | null
          to_value?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      work_orders: {
        Row: {
          id: string
          ticket_id: string
          owner_id: string
          vendor_name: string | null
          description: string | null
          scheduled_at: string | null
          cost_estimate: number | null
          cost_actual: number | null
          status: 'concept' | 'ingepland' | 'uitgevoerd' | 'gefactureerd'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          owner_id: string
          vendor_name?: string | null
          description?: string | null
          scheduled_at?: string | null
          cost_estimate?: number | null
          cost_actual?: number | null
          status?: 'concept' | 'ingepland' | 'uitgevoerd' | 'gefactureerd'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          owner_id?: string
          vendor_name?: string | null
          description?: string | null
          scheduled_at?: string | null
          cost_estimate?: number | null
          cost_actual?: number | null
          status?: 'concept' | 'ingepland' | 'uitgevoerd' | 'gefactureerd'
          created_at?: string
          updated_at?: string
        }
      }
      ticket_attachments: {
        Row: {
          id: string
          ticket_id: string
          owner_id: string
          uploader_id: string | null
          file_name: string
          mime_type: string | null
          storage_path: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          owner_id: string
          uploader_id?: string | null
          file_name: string
          mime_type?: string | null
          storage_path: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          owner_id?: string
          uploader_id?: string | null
          file_name?: string
          mime_type?: string | null
          storage_path?: string
          created_at?: string
        }
      }
      wws: {
        Row: {
          id: string
          owner_id: string
          unit_id: string
          year: number
          points: number
          sector: 'sociaal' | 'midden' | 'vrij'
          max_rent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          unit_id: string
          year: number
          points: number
          sector: 'sociaal' | 'midden' | 'vrij'
          max_rent: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          unit_id?: string
          year?: number
          points?: number
          sector?: 'sociaal' | 'midden' | 'vrij'
          max_rent?: number
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          owner_id: string
          property_id: string | null
          name: string
          type: 'Contract' | 'Keuring' | 'Factuur' | 'Verzekering' | 'Overig'
          file_name: string | null
          mime_type: string | null
          extracted_data: Json | null
          storage_path: string | null
          source: 'upload' | 'generated' | null
          template_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          property_id?: string | null
          name: string
          type?: 'Contract' | 'Keuring' | 'Factuur' | 'Verzekering' | 'Overig'
          file_name?: string | null
          mime_type?: string | null
          extracted_data?: Json | null
          storage_path?: string | null
          source?: 'upload' | 'generated' | null
          template_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          property_id?: string | null
          name?: string
          type?: 'Contract' | 'Keuring' | 'Factuur' | 'Verzekering' | 'Overig'
          file_name?: string | null
          mime_type?: string | null
          extracted_data?: Json | null
          storage_path?: string | null
          source?: 'upload' | 'generated' | null
          template_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          owner_id: string
          tenant_id: string | null
          property_id: string | null
          amount: number
          due_date: string
          paid_date: string | null
          status: 'betaald' | 'openstaand' | 'te_laat' | 'geannuleerd'
          description: string | null
          tink_payment_request_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          tenant_id?: string | null
          property_id?: string | null
          amount: number
          due_date: string
          paid_date?: string | null
          status?: 'betaald' | 'openstaand' | 'te_laat' | 'geannuleerd'
          description?: string | null
          tink_payment_request_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          tenant_id?: string | null
          property_id?: string | null
          amount?: number
          due_date?: string
          paid_date?: string | null
          status?: 'betaald' | 'openstaand' | 'te_laat' | 'geannuleerd'
          description?: string | null
          tink_payment_request_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bank_connections: {
        Row: {
          id: string
          owner_id: string
          provider: string
          access_token: string
          refresh_token: string | null
          iban: string | null
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          provider?: string
          access_token: string
          refresh_token?: string | null
          iban?: string | null
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          provider?: string
          access_token?: string
          refresh_token?: string | null
          iban?: string | null
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      raw_transactions: {
        Row: {
          id: string
          owner_id: string
          bank_connection_id: string
          external_id: string
          value_date: string | null
          amount: number
          currency: string
          counterparty_iban: string | null
          counterparty_name: string | null
          description: string | null
          raw_data: Json | null
          imported_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          bank_connection_id: string
          external_id: string
          value_date?: string | null
          amount: number
          currency?: string
          counterparty_iban?: string | null
          counterparty_name?: string | null
          description?: string | null
          raw_data?: Json | null
          imported_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          bank_connection_id?: string
          external_id?: string
          value_date?: string | null
          amount?: number
          currency?: string
          counterparty_iban?: string | null
          counterparty_name?: string | null
          description?: string | null
          raw_data?: Json | null
          imported_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'starter' | 'pro' | null
          status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'paused'
          trial_ends_at: string
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'starter' | 'pro' | null
          status?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'paused'
          trial_ends_at?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'starter' | 'pro' | null
          status?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'paused'
          trial_ends_at?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_exists: {
        Args: { p_email: string }
        Returns: boolean
      }
      /** Adres → stroom/gas-EAN uit ean_adressen (alleen service_role). */
      lookup_ean_adres: {
        Args: {
          p_postcode_normalized: string
          p_huisnummer: string
          p_huisletter?: string | null
          p_toevoeging?: string | null
        }
        Returns: {
          ean: string | null
          gas_ean: string | null
          straat: string
          plaats: string
          postcode: string
          huisnummer: string
          huisletter: string | null
          toevoeging: string | null
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience type exports
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type Unit = Database['public']['Tables']['units']['Row']
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type Lease = Database['public']['Tables']['leases']['Row']
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type TicketEvent = Database['public']['Tables']['ticket_events']['Row']
export type WorkOrder = Database['public']['Tables']['work_orders']['Row']
export type TicketAttachment = Database['public']['Tables']['ticket_attachments']['Row']
export type WWS = Database['public']['Tables']['wws']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type BankConnection = Database['public']['Tables']['bank_connections']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
