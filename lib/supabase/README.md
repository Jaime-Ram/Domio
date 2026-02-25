# Supabase Database Usage Guide

## Setup

### 1. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Get your credentials from: https://supabase.com/dashboard/project/_/settings/api

### 2. Import What You Need

```typescript
// Import everything
import { supabase, propertyQueries, ticketQueries, Profile } from '@/lib/supabase';

// Or import specific modules
import { propertyQueries } from '@/lib/supabase/queries';
import { Property } from '@/lib/supabase/types';
```

## Usage Examples

### Properties

```typescript
// Get all properties
const properties = await propertyQueries.getAll();

// Get properties by owner
const myProperties = await propertyQueries.getByOwner(userId);

// Get property with units
const property = await propertyQueries.getWithUnits(propertyId);

// Create new property
const newProperty = await propertyQueries.create({
  owner_id: userId,
  name: 'New Apartment Building',
  address: 'Main Street 123',
  property_type: 'woning'
});

// Update property
const updated = await propertyQueries.update(propertyId, {
  name: 'Updated Name'
});

// Delete property
await propertyQueries.delete(propertyId);
```

### Units

```typescript
// Get all units for a property
const units = await unitQueries.getByProperty(propertyId);

// Get unit with active tenancy
const unitWithTenant = await unitQueries.getWithTenancy(unitId);

// Create new unit
const newUnit = await unitQueries.create({
  property_id: propertyId,
  unit_number: 'A1',
  status: 'vrij'
});

// Update unit status
await unitQueries.update(unitId, { status: 'bezet' });
```

### Tenancies

```typescript
// Get active tenancies for a tenant
const tenancies = await tenancyQueries.getActiveTenancies(tenantId);

// Get tenancy history for a unit
const history = await tenancyQueries.getUnitHistory(unitId);

// Create new tenancy
const tenancy = await tenancyQueries.create({
  unit_id: unitId,
  tenant_id: tenantId,
  start_date: '2024-01-01',
  rent_amount: 1200,
  active: true
});

// End a tenancy
await tenancyQueries.endTenancy(tenancyId);
```

### Tickets

```typescript
// Get tickets for a property
const tickets = await ticketQueries.getByProperty(propertyId);

// Get tickets created by user
const myTickets = await ticketQueries.getByCreator(userId);

// Get ticket with all messages
const ticket = await ticketQueries.getWithMessages(ticketId);

// Create new ticket
const newTicket = await ticketQueries.create({
  property_id: propertyId,
  unit_id: unitId, // optional
  creator_id: userId,
  title: 'Leaking pipe',
  description: 'The kitchen sink is leaking',
  status: 'open',
  priority: 'high'
});

// Update ticket status
await ticketQueries.updateStatus(ticketId, 'in-behandeling');
```

### Messages

```typescript
// Get messages for a ticket
const messages = await messageQueries.getByTicket(ticketId);

// Create new message
const message = await messageQueries.create({
  ticket_id: ticketId,
  sender_id: userId,
  content: 'I will fix this tomorrow'
});

// Real-time subscription to new messages
const channel = messageQueries.subscribeToTicket(ticketId, (newMessage) => {
  console.log('New message received:', newMessage);
  // Update your UI here
});

// Unsubscribe when done
channel.unsubscribe();
```

### Profiles

```typescript
// Get profile by ID
const profile = await profileQueries.getById(userId);

// Get all property managers
const managers = await profileQueries.getBeheerders();

// Update profile
await profileQueries.update(userId, {
  full_name: 'John Doe'
});
```

## Using in Next.js Components

### Server Component (recommended for data fetching)

```typescript
// app/properties/page.tsx
import { propertyQueries } from '@/lib/supabase';

export default async function PropertiesPage() {
  const properties = await propertyQueries.getAll();
  
  return (
    <div>
      {properties.map(property => (
        <div key={property.id}>
          <h2>{property.name}</h2>
          <p>{property.address}</p>
        </div>
      ))}
    </div>
  );
}
```

### Client Component (for interactive features)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ticketQueries, Ticket } from '@/lib/supabase';

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await ticketQueries.getByProperty(propertyId);
        setTickets(data);
      } catch (error) {
        console.error('Error loading tickets:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadTickets();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {tickets.map(ticket => (
        <div key={ticket.id}>{ticket.title}</div>
      ))}
    </div>
  );
}
```

### API Route

```typescript
// app/api/properties/route.ts
import { NextResponse } from 'next/server';
import { propertyQueries } from '@/lib/supabase';

export async function GET() {
  try {
    const properties = await propertyQueries.getAll();
    return NextResponse.json(properties);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const property = await propertyQueries.create(body);
    return NextResponse.json(property);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
```

## Error Handling

All queries throw errors if something goes wrong. Always wrap them in try-catch:

```typescript
try {
  const properties = await propertyQueries.getAll();
  // Use properties
} catch (error) {
  console.error('Database error:', error);
  // Handle error appropriately
}
```

## Direct Supabase Client Access

For custom queries not covered by the helper functions:

```typescript
import { supabase } from '@/lib/supabase';

// Custom query
const { data, error } = await supabase
  .from('properties')
  .select('*, units(*)')
  .eq('property_type', 'woning')
  .limit(10);

if (error) throw error;
```

## Next Steps

1. Set up your `.env.local` file with your Supabase credentials
2. Set up Row Level Security (RLS) policies in your Supabase dashboard
3. Implement authentication to get user IDs for queries
4. Start building your features using these query helpers

## Important Notes

- All timestamps are stored as ISO strings
- UUIDs are strings in TypeScript
- Remember to handle authentication - these queries assume you have a valid user session
- Set up Row Level Security policies in Supabase to protect your data
