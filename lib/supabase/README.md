# Supabase Database Usage Guide

This guide provides an overview of all available database queries in the Domio application.

## Available Query Objects

### **profileQueries** (3 methods)

- `getById(userId)` - Get profile by user ID
- `getVerhuurders()` - Get all verhuurders (landlords)
- `update(userId, updates)` - Update profile

### **propertyQueries** (6 methods)

- `getAll()` - Get all properties
- `getByOwner(ownerId)` - Get properties by owner
- `getWithUnits(propertyId)` - Get single property with units
- `create(property)` - Create new property
- `update(propertyId, updates)` - Update property
- `delete(propertyId)` - Delete property

### **unitQueries** (4 methods)

- `getByProperty(propertyId)` - Get units by property
- `getWithLease(unitId)` - Get unit with active lease
- `create(unit)` - Create new unit
- `update(unitId, updates)` - Update unit

### **tenantQueries** (5 methods)

- `getByOwner(ownerId)` - Get all tenants for owner
- `getById(tenantId)` - Get single tenant
- `create(tenant)` - Create new tenant
- `update(tenantId, updates)` - Update tenant
- `delete(tenantId)` - Delete tenant

### **leaseQueries** (6 methods)

- `getActiveLeases(tenantId)` - Get active leases for a tenant
- `getUnitHistory(unitId)` - Get lease history for a unit
- `getByOwner(ownerId)` - Get leases by owner
- `create(lease)` - Create new lease
- `update(leaseId, updates)` - Update lease
- `endLease(leaseId, endDate)` - End a lease

### **ticketQueries** (6 methods)

- `getByOwner(ownerId)` - Get tickets by owner
- `getByUnit(unitId)` - Get tickets by unit
- `getWithMessages(ticketId)` - Get single ticket with messages
- `create(ticket)` - Create new ticket
- `updateStatus(ticketId, status)` - Update ticket status
- `update(ticketId, updates)` - Update ticket

### **messageQueries** (3 methods)

- `getByTicket(ticketId)` - Get messages for a ticket
- `create(message)` - Create new message
- `subscribeToTicket(ticketId, callback)` - Subscribe to new messages

### **wwsQueries** (6 methods)

- `getByOwner(ownerId)` - Get WWS records by owner
- `getByUnit(unitId)` - Get WWS records by unit
- `getLatestForUnit(unitId)` - Get latest WWS for unit
- `create(wws)` - Create WWS record
- `update(wwsId, updates)` - Update WWS record
- `delete(wwsId)` - Delete WWS record

### **documentQueries** (6 methods)

- `getByOwner(ownerId)` - Get documents by owner
- `getByProperty(propertyId)` - Get documents by property
- `getById(documentId)` - Get single document
- `create(document)` - Create document
- `update(documentId, updates)` - Update document
- `delete(documentId)` - Delete document

### **paymentQueries** (8 methods)

- `getByOwner(ownerId)` - Get payments by owner
- `getByTenant(tenantId)` - Get payments by tenant
- `getByProperty(propertyId)` - Get payments by property
- `getOverdue(ownerId)` - Get overdue payments
- `create(payment)` - Create payment
- `update(paymentId, updates)` - Update payment
- `markAsPaid(paymentId, paidDate?)` - Mark payment as paid
- `delete(paymentId)` - Delete payment

---

**Total: 59 query methods across 10 query objects**

## Usage Examples

### Profiles

```typescript
import { profileQueries } from "@/lib/supabase/queries";

// Get current user profile
const profile = await profileQueries.getById(userId);

// Get all verhuurders
const landlords = await profileQueries.getVerhuurders();

// Update profile
await profileQueries.update(userId, {
  full_name: "Jan Jansen",
  phone: "0612345678",
});
```

### Properties

```typescript
import { propertyQueries } from "@/lib/supabase/queries";

// Get all properties (filtered by RLS)
const properties = await propertyQueries.getAll();

// Get properties by owner
const ownerProperties = await propertyQueries.getByOwner(ownerId);

// Get property with units
const property = await propertyQueries.getWithUnits(propertyId);

// Create new property
const newProperty = await propertyQueries.create({
  owner_id: userId,
  name: "Hoofdstraat 123",
  address: "Hoofdstraat 123",
  postcode: "1234AB",
  city: "Amsterdam",
  type: "appartement",
});

// Update property
await propertyQueries.update(propertyId, {
  woz_value: 250000,
  energy_label: "B",
});

// Delete property
await propertyQueries.delete(propertyId);
```

### Units

```typescript
import { unitQueries } from "@/lib/supabase/queries";

// Get units by property
const units = await unitQueries.getByProperty(propertyId);

// Get unit with active lease
const unitWithLease = await unitQueries.getWithLease(unitId);

// Create new unit
const unit = await unitQueries.create({
  property_id: propertyId,
  unit_number: "A1",
  rooms: 3,
  size_m2: 75,
  monthly_rent: 1200,
  status: "leegstand",
});

// Update unit status
await unitQueries.update(unitId, { status: "verhuurd" });
```

### Tenants

```typescript
import { tenantQueries } from "@/lib/supabase/queries";

// Get all tenants for owner
const tenants = await tenantQueries.getByOwner(ownerId);

// Get single tenant
const tenant = await tenantQueries.getById(tenantId);

// Create new tenant
const tenant = await tenantQueries.create({
  owner_id: userId,
  full_name: "Jan Jansen",
  email: "jan@example.com",
  phone: "0612345678",
});

// Update tenant
await tenantQueries.update(tenantId, { phone: "0687654321" });

// Delete tenant
await tenantQueries.delete(tenantId);
```

### Leases

```typescript
import { leaseQueries } from "@/lib/supabase/queries";

// Get active leases for a tenant
const leases = await leaseQueries.getActiveLeases(tenantId);

// Get lease history for a unit
const history = await leaseQueries.getUnitHistory(unitId);

// Get leases by owner
const ownerLeases = await leaseQueries.getByOwner(ownerId);

// Create new lease
const lease = await leaseQueries.create({
  owner_id: userId,
  unit_id: unitId,
  tenant_id: tenantId,
  start_date: "2024-01-01",
  monthly_rent: 1200,
  deposit: 2400,
  status: "actief",
});

// Update lease
await leaseQueries.update(leaseId, { monthly_rent: 1250 });

// End a lease
await leaseQueries.endLease(leaseId, "2024-12-31");
```

### Tickets

```typescript
import { ticketQueries } from "@/lib/supabase/queries";

// Get tickets by owner
const tickets = await ticketQueries.getByOwner(ownerId);

// Get tickets by unit
const unitTickets = await ticketQueries.getByUnit(unitId);

// Get ticket with messages
const ticket = await ticketQueries.getWithMessages(ticketId);

// Create new ticket
const ticket = await ticketQueries.create({
  owner_id: userId,
  unit_id: unitId,
  title: "Lekkage in badkamer",
  description: "Er lekt water uit de kraan",
  status: "open",
  priority: "hoog",
});

// Update ticket status
await ticketQueries.updateStatus(ticketId, "in_behandeling");
```

### Messages

```typescript
import { messageQueries } from "@/lib/supabase/queries";

// Get messages for a ticket
const messages = await messageQueries.getByTicket(ticketId);

// Create new message
const message = await messageQueries.create({
  ticket_id: ticketId,
  sender_id: userId,
  content: "I will fix this tomorrow",
});

// Subscribe to real-time updates
const subscription = messageQueries.subscribeToTicket(
  ticketId,
  (newMessage) => {
    console.log("New message:", newMessage);
  },
);

// Unsubscribe when done
subscription.unsubscribe();
```

### WWS (Woningwaarderingsstelsel)

```typescript
import { wwsQueries } from "@/lib/supabase/queries";

// Get WWS records by owner
const wwsRecords = await wwsQueries.getByOwner(ownerId);

// Get WWS records by unit
const unitWws = await wwsQueries.getByUnit(unitId);

// Get latest WWS for unit
const latestWws = await wwsQueries.getLatestForUnit(unitId);

// Create WWS record
const wws = await wwsQueries.create({
  owner_id: userId,
  unit_id: unitId,
  year: 2024,
  points: 142,
  sector: "sociaal",
  max_rent: 879.66,
});

// Update WWS record
await wwsQueries.update(wwsId, { points: 145, max_rent: 895.5 });

// Delete WWS record
await wwsQueries.delete(wwsId);
```

### Documents

```typescript
import { documentQueries } from "@/lib/supabase/queries";

// Get documents by owner
const documents = await documentQueries.getByOwner(ownerId);

// Get documents by property
const propertyDocs = await documentQueries.getByProperty(propertyId);

// Get single document
const doc = await documentQueries.getById(documentId);

// Create document
const document = await documentQueries.create({
  owner_id: userId,
  property_id: propertyId,
  name: "Huurcontract 2024",
  type: "Contract",
  file_name: "contract.pdf",
  mime_type: "application/pdf",
});

// Update document
await documentQueries.update(documentId, {
  extracted_data: { parties: ["A", "B"] },
});

// Delete document
await documentQueries.delete(documentId);
```

### Payments

```typescript
import { paymentQueries } from "@/lib/supabase/queries";

// Get payments by owner
const payments = await paymentQueries.getByOwner(ownerId);

// Get payments by tenant
const tenantPayments = await paymentQueries.getByTenant(tenantId);

// Get payments by property
const propertyPayments = await paymentQueries.getByProperty(propertyId);

// Get overdue payments
const overdue = await paymentQueries.getOverdue(ownerId);

// Create payment
const payment = await paymentQueries.create({
  owner_id: userId,
  tenant_id: tenantId,
  property_id: propertyId,
  amount: 1200,
  due_date: "2024-02-01",
  status: "openstaand",
  description: "Huur februari 2024",
});

// Update payment
await paymentQueries.update(paymentId, { amount: 1250 });

// Mark payment as paid
await paymentQueries.markAsPaid(paymentId);

// Mark payment as paid with custom date
await paymentQueries.markAsPaid(paymentId, "2024-02-03");

// Delete payment
await paymentQueries.delete(paymentId);
```

## Row Level Security (RLS)

All queries are automatically filtered by Supabase's Row Level Security policies:

- Users can only access their own profiles
- Users can only access properties, units, tenants, leases, etc. where they are the owner
- The `.eq('owner_id', ownerId)` filters in queries provide explicit query specificity, but RLS provides the security boundary

## Type Safety

All queries use TypeScript types generated from the database schema. Import types from:

```typescript
import type {
  Profile,
  Property,
  Unit,
  Tenant,
  Lease,
  Ticket,
  Message,
  WWS,
  Document,
  Payment,
} from "@/lib/supabase/types";
```
