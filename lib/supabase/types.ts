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
          full_name: string | null
          role: 'beheerder' | 'huurder'
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'beheerder' | 'huurder'
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'beheerder' | 'huurder'
          updated_at?: string | null
        }
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          name: string
          address: string | null
          property_type: 'woning' | 'deelwoning' | 'kantoorpand' | null
          created_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          address?: string | null
          property_type?: 'woning' | 'deelwoning' | 'kantoorpand' | null
          created_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          address?: string | null
          property_type?: 'woning' | 'deelwoning' | 'kantoorpand' | null
          created_at?: string | null
        }
      }
      units: {
        Row: {
          id: string
          property_id: string
          unit_number: string
          status: string | null
        }
        Insert: {
          id?: string
          property_id: string
          unit_number: string
          status?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          unit_number?: string
          status?: string | null
        }
      }
      tenancies: {
        Row: {
          id: string
          unit_id: string
          tenant_id: string
          start_date: string
          rent_amount: number | null
          active: boolean | null
        }
        Insert: {
          id?: string
          unit_id: string
          tenant_id: string
          start_date: string
          rent_amount?: number | null
          active?: boolean | null
        }
        Update: {
          id?: string
          unit_id?: string
          tenant_id?: string
          start_date?: string
          rent_amount?: number | null
          active?: boolean | null
        }
      }
      tickets: {
        Row: {
          id: string
          property_id: string
          unit_id: string | null
          creator_id: string
          title: string
          description: string | null
          status: string | null
          priority: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          property_id: string
          unit_id?: string | null
          creator_id: string
          title: string
          description?: string | null
          status?: string | null
          priority?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          unit_id?: string | null
          creator_id?: string
          title?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          created_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          ticket_id: string
          sender_id: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_id: string
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_id?: string
          content?: string
          created_at?: string | null
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
export type Tenancy = Database['public']['Tables']['tenancies']['Row']
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
