import { supabase } from "./client";
import type { Profile, Property, Unit, Tenant, Lease, Ticket, Message, WWS, Document, Payment, Database } from "./types";

// Type helpers for cleaner code
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];
type UnitInsert = Database['public']['Tables']['units']['Insert'];
type UnitUpdate = Database['public']['Tables']['units']['Update'];
type TenantInsert = Database['public']['Tables']['tenants']['Insert'];
type TenantUpdate = Database['public']['Tables']['tenants']['Update'];
type LeaseInsert = Database['public']['Tables']['leases']['Insert'];
type LeaseUpdate = Database['public']['Tables']['leases']['Update'];
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];
type TicketUpdate = Database['public']['Tables']['tickets']['Update'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];
type MessageUpdate = Database['public']['Tables']['messages']['Update'];
type WWSInsert = Database['public']['Tables']['wws']['Insert'];
type WWSUpdate = Database['public']['Tables']['wws']['Update'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
type DocumentUpdate = Database['public']['Tables']['documents']['Update'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

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

  // Get all verhuurders (property landlords)
  async getVerhuurders() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'verhuurder');
    
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
      .select('*, units(id, monthly_rent)')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as (Property & { units: { id: string; monthly_rent: number | null }[] })[];
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

  // Get unit with active lease
  async getWithLease(unitId: string) {
    const { data, error } = await supabase
      .from('units')
      .select(`
        *,
        properties(*),
        leases!inner(
          *,
          tenants(*)
        )
      `)
      .eq('id', unitId)
      .eq('leases.status', 'actief')
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

  // Delete unit
  async delete(unitId: string) {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', unitId);
    
    if (error) throw error;
  },
};

// ============================================================================
// TENANTS
// ============================================================================

export const tenantQueries = {
  // Get all tenants for owner
  async getByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Tenant[];
  },

  // Get single tenant
  async getById(tenantId: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
    
    if (error) throw error;
    return data as Tenant;
  },

  // Create new tenant
  async create(tenant: TenantInsert) {
    const { data, error } = await supabase
      .from('tenants')
      .insert(tenant as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tenant;
  },

  // Update tenant
  async update(tenantId: string, updates: TenantUpdate) {
    const { data, error } = await supabase
      .from('tenants')
      // @ts-expect-error - Supabase types are overly strict
      .update(updates as any)
      .eq('id', tenantId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tenant;
  },

  // Delete tenant
  async delete(tenantId: string) {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', tenantId);
    
    if (error) throw error;
  },
};

// ============================================================================
// LEASES
// ============================================================================

export const leaseQueries = {
  // Get active leases for a tenant
  async getActiveLeases(unitId: string) {
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        units(*,
          properties(*)
        ),
        tenants(*)
      `)
      .eq('unit_id', unitId)
      .eq('status', 'actief');
    
    if (error) throw error;
    return data;
  },

  // Get lease history for a unit
  async getUnitHistory(unitId: string) {
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        tenants(*)
      `)
      .eq('unit_id', unitId)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get leases by owner
  async getByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        units(*,
          properties(*)
        ),
        tenants(*)
      `)
      .eq('owner_id', ownerId)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create new lease
  async create(lease: LeaseInsert) {
    const { data, error } = await supabase
      .from('leases')
      .insert(lease as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as Lease;
  },

  // Update lease
  async update(leaseId: string, updates: LeaseUpdate) {
    const { data, error } = await supabase
      .from('leases')
      // @ts-expect-error - Supabase types are overly strict
      .update(updates as any)
      .eq('id', leaseId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Lease;
  },

  // End a lease
  async endLease(leaseId: string, endDate: string) {
    const { data, error } = await supabase
      .from('leases')
      // @ts-expect-error - Supabase types are overly strict
      .update({ status: 'opgezegd', end_date: endDate } as any)
      .eq('id', leaseId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Lease;
  },
};

// ============================================================================
// TICKETS
// ============================================================================

export const ticketQueries = {
  // Get tickets by owner
  async getByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        profiles:owner_id(*),
        units(*)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get tickets by unit
  async getByUnit(unitId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        profiles:owner_id(*),
        units(*)
      `)
      .eq('unit_id', unitId)
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
        profiles:owner_id(*),
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

// ============================================================================
// WWS (Woningwaarderingsstelsel)
// ============================================================================

export const wwsQueries = {
  // Get WWS records by owner
  async getByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('wws')
      .select(`
        *,
        units(*, properties(*))
      `)
      .eq('owner_id', ownerId)
      .order('year', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get WWS records by unit
  async getByUnit(unitId: string) {
    const { data, error } = await supabase
      .from('wws')
      .select('*')
      .eq('unit_id', unitId)
      .order('year', { ascending: false });
    
    if (error) throw error;
    return data as WWS[];
  },

  // Get latest WWS for unit
  async getLatestForUnit(unitId: string) {
    const { data, error } = await supabase
      .from('wws')
      .select('*')
      .eq('unit_id', unitId)
      .order('year', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return data as WWS;
  },

  // Create WWS record
  async create(wws: WWSInsert) {
    const { data, error } = await supabase
      .from('wws')
      .insert(wws as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as WWS;
  },

  // Update WWS record
  async update(wwsId: string, updates: WWSUpdate) {
    const { data, error } = await supabase
      .from('wws')
      // @ts-expect-error - Supabase types are overly strict
      .update(updates as any)
      .eq('id', wwsId)
      .select()
      .single();
    
    if (error) throw error;
    return data as WWS;
  },

  // Delete WWS record
  async delete(wwsId: string) {
    const { error } = await supabase
      .from('wws')
      .delete()
      .eq('id', wwsId);
    
    if (error) throw error;
  },
};

// ============================================================================
// DOCUMENTS
// ============================================================================

export const documentQueries = {
  // Get documents by owner
  async getByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        properties(*)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get documents by property
  async getByProperty(propertyId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Document[];
  },

  // Get single document
  async getById(documentId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error) throw error;
    return data as Document;
  },

  // Create document
  async create(document: DocumentInsert) {
    const { data, error } = await supabase
      .from('documents')
      .insert(document as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as Document;
  },

  // Update document
  async update(documentId: string, updates: DocumentUpdate) {
    const { data, error } = await supabase
      .from('documents')
      // @ts-expect-error - Supabase types are overly strict
      .update(updates as any)
      .eq('id', documentId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Document;
  },

  // Delete document
  async delete(documentId: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (error) throw error;
  },
};

// ============================================================================
// PAYMENTS
// ============================================================================

export const paymentQueries = {
  // Get payments by owner
  async getByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        tenants(*),
        properties(*)
      `)
      .eq('owner_id', ownerId)
      .order('due_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get payments by tenant
  async getByTenant(tenantId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        properties(*)
      `)
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get payments by property
  async getByProperty(propertyId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        tenants(*)
      `)
      .eq('property_id', propertyId)
      .order('due_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get overdue payments
  async getOverdue(ownerId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        tenants(*),
        properties(*)
      `)
      .eq('owner_id', ownerId)
      .eq('status', 'openstaand')
      .lt('due_date', today)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get payment by Tink payment request id (for callback)
  async getByTinkPaymentRequestId(tinkPaymentRequestId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tink_payment_request_id', tinkPaymentRequestId)
      .maybeSingle();
    if (error) throw error;
    return data as Payment | null;
  },

  // Create payment
  async create(payment: PaymentInsert) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as Payment;
  },

  // Update payment
  async update(paymentId: string, updates: PaymentUpdate) {
    const { data, error } = await supabase
      .from('payments')
      // @ts-expect-error - Supabase types are overly strict
      .update(updates as any)
      .eq('id', paymentId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Payment;
  },

  // Mark payment as paid
  async markAsPaid(paymentId: string, paidDate?: string) {
    const { data, error } = await supabase
      .from('payments')
      // @ts-expect-error - Supabase types are overly strict
      .update({ 
        status: 'betaald', 
        paid_date: paidDate || new Date().toISOString().split('T')[0]
      } as any)
      .eq('id', paymentId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Payment;
  },

  // Delete payment
  async delete(paymentId: string) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (error) throw error;
  },
};

// ============================================================================
// TASKS
// ============================================================================

export const taskQueries = {
  async getByOwner(ownerId: string) {
    // @ts-ignore - tasks table not yet in generated types
    const { data, error } = await supabase
      .from('tasks')
      .select('*, properties(id, name), tenants(id, full_name)')
      .eq('owner_id', ownerId)
      .order('due_date', { ascending: true, nullsFirst: false });
    if (error) throw error;
    return (data ?? []) as any[];
  },

  async create(task: Record<string, any>) {
    // @ts-ignore - tasks table not yet in generated types
    const { data, error } = await supabase
      .from('tasks')
      .insert(task as any)
      .select('*, properties(id, name), tenants(id, full_name)')
      .single();
    if (error) throw error;
    return data as any;
  },

  async update(taskId: string, updates: Record<string, any>) {
    // @ts-ignore - tasks table not yet in generated types
    const { data, error } = await (supabase as any)
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select('*, properties(id, name), tenants(id, full_name)')
      .single();
    if (error) throw error;
    return data as any;
  },

  async delete(taskId: string) {
    // @ts-ignore - tasks table not yet in generated types
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    if (error) throw error;
  },
};

