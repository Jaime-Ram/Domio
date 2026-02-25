import { supabase } from "./client";
import type { Profile, Property, Unit, Ticket, Message, Tenancy, Database } from "./types";

// Type helpers for cleaner code
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];
type UnitInsert = Database['public']['Tables']['units']['Insert'];
type UnitUpdate = Database['public']['Tables']['units']['Update'];
type TenancyInsert = Database['public']['Tables']['tenancies']['Insert'];
type TenancyUpdate = Database['public']['Tables']['tenancies']['Update'];
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];
type TicketUpdate = Database['public']['Tables']['tickets']['Update'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];
type MessageUpdate = Database['public']['Tables']['messages']['Update'];

// ============================================================================
// PROFILES
// ============================================================================

export const profileQueries = {
  // Get profile by user ID
  async getById(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data as Profile;
  },

  // Get all beheerders (property managers)
  async getBeheerders() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'beheerder');
    
    if (error) throw error;
    return data as Profile[];
  },

  // Update profile
  async update(userId: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase types are overly strict
      .update(updates as any)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Profile;
  },
};

// ============================================================================
// PROPERTIES
// ============================================================================

export const propertyQueries = {
  // Get all properties
  async getAll() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Property[];
  },

  // Get properties by owner
  async getByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Property[];
  },

  // Get single property with units
  async getWithUnits(propertyId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        units (*)
      `)
      .eq('id', propertyId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new property
  async create(property: PropertyInsert) {
    const { data, error } = await supabase
      .from('properties')
      .insert(property as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as Property;
  },

  // Update property
  async update(propertyId: string, updates: PropertyUpdate) {
    const { data, error} = await supabase
      .from('properties')
      // @ts-expect-error - Supabase types are overly strict
      .update(updates as any)
      .eq('id', propertyId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Property;
  },

  // Delete property
  async delete(propertyId: string) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    
    if (error) throw error;
  },
};

// ============================================================================
// UNITS
// ============================================================================

export const unitQueries = {
  // Get units by property
  async getByProperty(propertyId: string) {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('property_id', propertyId);
    
    if (error) throw error;
    return data as Unit[];
  },

  // Get unit with active tenancy
  async getWithTenancy(unitId: string) {
    const { data, error } = await supabase
      .from('units')
      .select(`
        *,
        tenancies!tenancies_unit_id_fkey(
          *,
          profiles:tenant_id(*)
        )
      `)
      .eq('id', unitId)
      .eq('tenancies.active', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new unit
  async create(unit: UnitInsert) {
    const { data, error } = await supabase
      .from('units')
      .insert(unit as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as Unit;
  },

  // Update unit
  async update(unitId: string, updates: UnitUpdate) {
    const { data, error } = await supabase
      .from('units')
      // @ts-expect-error - Supabase types are overly strict
      .update(updates as any)
      .eq('id', unitId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Unit;
  },
};

// ============================================================================
// TENANCIES
// ============================================================================

export const tenancyQueries = {
  // Get active tenancies for a tenant
  async getActiveTenancies(tenantId: string) {
    const { data, error } = await supabase
      .from('tenancies')
      .select(`
        *,
        units(*,
          properties(*)
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('active', true);
    
    if (error) throw error;
    return data;
  },

  // Get tenancy history for a unit
  async getUnitHistory(unitId: string) {
    const { data, error } = await supabase
      .from('tenancies')
      .select(`
        *,
        profiles:tenant_id(*)
      `)
      .eq('unit_id', unitId)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create new tenancy
  async create(tenancy: TenancyInsert) {
    const { data, error } = await supabase
      .from('tenancies')
      .insert(tenancy as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tenancy;
  },

  // End a tenancy
  async endTenancy(tenancyId: string) {
    const { data, error } = await supabase
      .from('tenancies')
      // @ts-expect-error - Supabase types are overly strict
      .update({ active: false } as any)
      .eq('id', tenancyId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tenancy;
  },
};

// ============================================================================
// TICKETS
// ============================================================================

export const ticketQueries = {
  // Get all tickets for a property
  async getByProperty(propertyId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        profiles:creator_id(*),
        units(*)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get tickets created by user
  async getByCreator(creatorId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        properties(*),
        units(*)
      `)
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get single ticket with messages
  async getWithMessages(ticketId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        profiles:creator_id(*),
        properties(*),
        units(*),
        messages(
          *,
          profiles:sender_id(*)
        )
      `)
      .eq('id', ticketId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new ticket
  async create(ticket: TicketInsert) {
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticket as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as Ticket;
  },

  // Update ticket status
  async updateStatus(ticketId: string, status: string) {
    const { data, error } = await supabase
      .from('tickets')
      // @ts-expect-error - Supabase types are overly strict
      .update({ status } as any)
      .eq('id', ticketId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Ticket;
  },

  // Update ticket
  async update(ticketId: string, updates: TicketUpdate) {
    const { data, error } = await supabase
      .from('tickets')
      // @ts-expect-error - Supabase types are overly strict
      .update(updates as any)
      .eq('id', ticketId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Ticket;
  },
};

// ============================================================================
// MESSAGES
// ============================================================================

export const messageQueries = {
  // Get messages for a ticket
  async getByTicket(ticketId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_id(*)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Create new message
  async create(message: MessageInsert) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as Message;
  },

  // Subscribe to new messages for a ticket
  subscribeToTicket(ticketId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  },
};
