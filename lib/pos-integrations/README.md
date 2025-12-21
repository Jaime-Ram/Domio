# POS Integration Module

Deze module biedt een generieke interface voor het integreren met verschillende POS systemen (Point of Sale). De architectuur is ontworpen om eenvoudig uitbreidbaar te zijn voor nieuwe POS providers.

## Architectuur

### Basis Structuur

```
lib/pos-integrations/
├── types.ts          # TypeScript types en interfaces
├── base.ts           # Abstract base class voor alle POS integraties
├── factory.ts        # Factory pattern voor het creëren van integraties
├── lightspeed.ts    # Lightspeed implementatie (proof of concept)
├── database.ts      # Database helper functies
└── index.ts         # Main exports
```

### Generieke Interface

Alle POS integraties implementeren de `POSIntegrationInterface`:

```typescript
interface POSIntegrationInterface {
  testConnection(): Promise<boolean>
  fetchSales(since: Date, until?: Date): Promise<POSSalesData[]>
  fetchEmployees(): Promise<POSEmployee[]>
  fetchProducts(): Promise<POSProduct[]>
  fetchReservations(date: Date): Promise<POSReservation[]>
  getSyncStatus(): Promise<SyncStatus>
  refreshToken?(): Promise<void> // Voor OAuth-based integraties
}
```

## Ondersteunde Providers

### ✅ Geïmplementeerd
- **Lightspeed** - OAuth-based integratie (proof of concept)

### 🔜 Toekomstige Implementaties
- Toast
- Square
- Untill
- TouchBistro
- Resengo
- Zenchef
- Formitable

## Database Schema

De `pos_integrations` tabel slaat de configuratie op voor elke POS integratie:

```sql
CREATE TABLE pos_integrations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  api_key TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  location_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sync_settings JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, provider)
);
```

## Gebruik

### 1. Integratie Ophalen

```typescript
import { getPOSIntegration } from '@/lib/pos-integrations/database'
import { POSIntegrationFactory } from '@/lib/pos-integrations/factory'

const integration = await getPOSIntegration(userId, 'lightspeed')
const posIntegration = POSIntegrationFactory.create(integration)
```

### 2. Connectie Testen

```typescript
const isConnected = await posIntegration.testConnection()
```

### 3. Data Synchroniseren

```typescript
// Sales data ophalen
const sales = await posIntegration.fetchSales(
  new Date('2024-01-01'),
  new Date('2024-01-31')
)

// Employees ophalen
const employees = await posIntegration.fetchEmployees()

// Products ophalen
const products = await posIntegration.fetchProducts()

// Reservations ophalen
const reservations = await posIntegration.fetchReservations(new Date())
```

### 4. Via API Routes

```typescript
// Test connection
POST /api/pos-integrations/test
{
  "provider": "lightspeed"
}

// Sync data
POST /api/pos-integrations/sync
{
  "provider": "lightspeed",
  "sync_type": "sales",
  "days_back": 7
}
```

## Nieuwe POS Provider Toevoegen

1. **Maak een nieuwe class** die `BasePOSIntegration` extend:

```typescript
// lib/pos-integrations/toast.ts
import { BasePOSIntegration } from './base'
import type { POSSalesData, POSEmployee, ... } from './types'

export class ToastIntegration extends BasePOSIntegration {
  async testConnection(): Promise<boolean> {
    // Implementatie
  }
  
  async fetchSales(since: Date, until?: Date): Promise<POSSalesData[]> {
    // Implementatie
  }
  
  // ... andere methodes
}
```

2. **Voeg toe aan factory**:

```typescript
// lib/pos-integrations/factory.ts
import { ToastIntegration } from './toast'

case 'toast':
  return new ToastIntegration(config)
```

3. **Update types** (indien nodig):

```typescript
// lib/pos-integrations/types.ts
export type POSProvider = 'lightspeed' | 'toast' | ...
```

4. **Update database schema** (indien nodig):

```sql
-- Voeg nieuwe provider toe aan CHECK constraint
ALTER TABLE pos_integrations 
  DROP CONSTRAINT pos_integrations_provider_check;
  
ALTER TABLE pos_integrations 
  ADD CONSTRAINT pos_integrations_provider_check 
  CHECK (provider IN ('lightspeed', 'toast', ...));
```

## Environment Variables

Voor OAuth-based integraties (zoals Lightspeed):

```env
LIGHTSPEED_CLIENT_ID=your_client_id
LIGHTSPEED_CLIENT_SECRET=your_client_secret
```

## Error Handling

Alle POS integraties gooien errors die opgevangen moeten worden:

```typescript
try {
  const sales = await posIntegration.fetchSales(since)
} catch (error) {
  console.error('Failed to fetch sales:', error)
  // Handle error (retry, notify user, etc.)
}
```

## Rate Limiting

POS API's hebben vaak rate limits. Implementeer:
- Request throttling
- Exponential backoff bij errors
- Caching van responses

## Security

- API keys en tokens worden encrypted opgeslagen (via Supabase Vault)
- OAuth tokens worden automatisch vernieuwd
- Row Level Security (RLS) policies beschermen gebruikersdata

## Testing

Test elke integratie met:
1. Sandbox/test accounts van de POS provider
2. Mock data voor development
3. Integration tests voor API calls

## Volgende Stappen

- [ ] Implementeer Toast integratie
- [ ] Implementeer Square integratie
- [ ] Implementeer Untill integratie
- [ ] Voeg webhook support toe
- [ ] Implementeer real-time sync
- [ ] Voeg error recovery toe
- [ ] Implementeer rate limiting
- [ ] Voeg caching toe


Deze module biedt een generieke interface voor het integreren met verschillende POS systemen (Point of Sale). De architectuur is ontworpen om eenvoudig uitbreidbaar te zijn voor nieuwe POS providers.

## Architectuur

### Basis Structuur

```
lib/pos-integrations/
├── types.ts          # TypeScript types en interfaces
├── base.ts           # Abstract base class voor alle POS integraties
├── factory.ts        # Factory pattern voor het creëren van integraties
├── lightspeed.ts    # Lightspeed implementatie (proof of concept)
├── database.ts      # Database helper functies
└── index.ts         # Main exports
```

### Generieke Interface

Alle POS integraties implementeren de `POSIntegrationInterface`:

```typescript
interface POSIntegrationInterface {
  testConnection(): Promise<boolean>
  fetchSales(since: Date, until?: Date): Promise<POSSalesData[]>
  fetchEmployees(): Promise<POSEmployee[]>
  fetchProducts(): Promise<POSProduct[]>
  fetchReservations(date: Date): Promise<POSReservation[]>
  getSyncStatus(): Promise<SyncStatus>
  refreshToken?(): Promise<void> // Voor OAuth-based integraties
}
```

## Ondersteunde Providers

### ✅ Geïmplementeerd
- **Lightspeed** - OAuth-based integratie (proof of concept)

### 🔜 Toekomstige Implementaties
- Toast
- Square
- Untill
- TouchBistro
- Resengo
- Zenchef
- Formitable

## Database Schema

De `pos_integrations` tabel slaat de configuratie op voor elke POS integratie:

```sql
CREATE TABLE pos_integrations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  api_key TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  location_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sync_settings JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, provider)
);
```

## Gebruik

### 1. Integratie Ophalen

```typescript
import { getPOSIntegration } from '@/lib/pos-integrations/database'
import { POSIntegrationFactory } from '@/lib/pos-integrations/factory'

const integration = await getPOSIntegration(userId, 'lightspeed')
const posIntegration = POSIntegrationFactory.create(integration)
```

### 2. Connectie Testen

```typescript
const isConnected = await posIntegration.testConnection()
```

### 3. Data Synchroniseren

```typescript
// Sales data ophalen
const sales = await posIntegration.fetchSales(
  new Date('2024-01-01'),
  new Date('2024-01-31')
)

// Employees ophalen
const employees = await posIntegration.fetchEmployees()

// Products ophalen
const products = await posIntegration.fetchProducts()

// Reservations ophalen
const reservations = await posIntegration.fetchReservations(new Date())
```

### 4. Via API Routes

```typescript
// Test connection
POST /api/pos-integrations/test
{
  "provider": "lightspeed"
}

// Sync data
POST /api/pos-integrations/sync
{
  "provider": "lightspeed",
  "sync_type": "sales",
  "days_back": 7
}
```

## Nieuwe POS Provider Toevoegen

1. **Maak een nieuwe class** die `BasePOSIntegration` extend:

```typescript
// lib/pos-integrations/toast.ts
import { BasePOSIntegration } from './base'
import type { POSSalesData, POSEmployee, ... } from './types'

export class ToastIntegration extends BasePOSIntegration {
  async testConnection(): Promise<boolean> {
    // Implementatie
  }
  
  async fetchSales(since: Date, until?: Date): Promise<POSSalesData[]> {
    // Implementatie
  }
  
  // ... andere methodes
}
```

2. **Voeg toe aan factory**:

```typescript
// lib/pos-integrations/factory.ts
import { ToastIntegration } from './toast'

case 'toast':
  return new ToastIntegration(config)
```

3. **Update types** (indien nodig):

```typescript
// lib/pos-integrations/types.ts
export type POSProvider = 'lightspeed' | 'toast' | ...
```

4. **Update database schema** (indien nodig):

```sql
-- Voeg nieuwe provider toe aan CHECK constraint
ALTER TABLE pos_integrations 
  DROP CONSTRAINT pos_integrations_provider_check;
  
ALTER TABLE pos_integrations 
  ADD CONSTRAINT pos_integrations_provider_check 
  CHECK (provider IN ('lightspeed', 'toast', ...));
```

## Environment Variables

Voor OAuth-based integraties (zoals Lightspeed):

```env
LIGHTSPEED_CLIENT_ID=your_client_id
LIGHTSPEED_CLIENT_SECRET=your_client_secret
```

## Error Handling

Alle POS integraties gooien errors die opgevangen moeten worden:

```typescript
try {
  const sales = await posIntegration.fetchSales(since)
} catch (error) {
  console.error('Failed to fetch sales:', error)
  // Handle error (retry, notify user, etc.)
}
```

## Rate Limiting

POS API's hebben vaak rate limits. Implementeer:
- Request throttling
- Exponential backoff bij errors
- Caching van responses

## Security

- API keys en tokens worden encrypted opgeslagen (via Supabase Vault)
- OAuth tokens worden automatisch vernieuwd
- Row Level Security (RLS) policies beschermen gebruikersdata

## Testing

Test elke integratie met:
1. Sandbox/test accounts van de POS provider
2. Mock data voor development
3. Integration tests voor API calls

## Volgende Stappen

- [ ] Implementeer Toast integratie
- [ ] Implementeer Square integratie
- [ ] Implementeer Untill integratie
- [ ] Voeg webhook support toe
- [ ] Implementeer real-time sync
- [ ] Voeg error recovery toe
- [ ] Implementeer rate limiting
- [ ] Voeg caching toe




