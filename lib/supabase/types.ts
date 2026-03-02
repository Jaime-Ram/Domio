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
          created_at?: string
          updated_at?: string
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
          start_date: string
          end_date: string | null
          monthly_rent: number
          deposit: number | null
          status: 'actief' | 'verlopen' | 'opgezegd' | 'concept'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          unit_id: string
          tenant_id?: string | null
          start_date: string
          end_date?: string | null
          monthly_rent: number
          deposit?: number | null
          status?: 'actief' | 'verlopen' | 'opgezegd' | 'concept'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          unit_id?: string
          tenant_id?: string | null
          start_date?: string
          end_date?: string | null
          monthly_rent?: number
          deposit?: number | null
          status?: 'actief' | 'verlopen' | 'opgezegd' | 'concept'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          owner_id: string
          unit_id: string | null
          title: string
          description: string | null
          status: 'open' | 'in_behandeling' | 'afgerond' | 'geannuleerd'
          priority: 'laag' | 'normaal' | 'hoog' | 'urgent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          unit_id?: string | null
          title: string
          description?: string | null
          status?: 'open' | 'in_behandeling' | 'afgerond' | 'geannuleerd'
          priority?: 'laag' | 'normaal' | 'hoog' | 'urgent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          unit_id?: string | null
          title?: string
          description?: string | null
          status?: 'open' | 'in_behandeling' | 'afgerond' | 'geannuleerd'
          priority?: 'laag' | 'normaal' | 'hoog' | 'urgent'
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
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_id?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_id?: string | null
          content?: string
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
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
export type WWS = Database['public']['Tables']['wws']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
