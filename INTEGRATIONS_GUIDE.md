# POS Systeem Integraties - ServeSync

ServeSync integreert met de populairste POS en reserveringssystemen die gebruikt worden in de Nederlandse horeca.

## Ondersteunde Integraties

### 1. Lightspeed
**Meest gebruikt POS systeem in Nederlandse restaurants**

- **API Documentatie**: [Lightspeed API](https://developers.lightspeedhq.com/retail/endpoints/)
- **Integratie Type**: REST API
- **Functionaliteit**:
  - Synchronisatie van tafelindeling
  - Automatische bestellingen import
  - Betalingsgegevens synchronisatie
  - Werknemer uren tracking
- **Setup**: OAuth 2.0 authenticatie vereist

### 2. TouchBistro
**Populair iPad POS systeem**

- **API Documentatie**: [TouchBistro API](https://www.touchbistro.com/api/)
- **Integratie Type**: REST API
- **Functionaliteit**:
  - Bestellingen synchronisatie
  - Tafelbeheer
  - Betalingsverwerking
- **Setup**: API key authenticatie

### 3. Square
**Internationaal POS platform**

- **API Documentatie**: [Square API](https://developer.squareup.com/docs)
- **Integratie Type**: REST API
- **Functionaliteit**:
  - Transacties synchronisatie
  - Team management
  - Betalingsgegevens
- **Setup**: OAuth 2.0 of API key

### 4. Resengo
**Nederlands reserverings- en tafelbeheersysteem**

- **API Documentatie**: [Resengo API](https://www.resengo.com/nl/api)
- **Integratie Type**: REST API
- **Functionaliteit**:
  - Reserveringen synchronisatie
  - Tafelindeling
  - Gastgegevens
- **Setup**: API key authenticatie

### 5. Zenchef
**Nederlands reserveringssysteem**

- **API Documentatie**: [Zenchef API](https://www.zenchef.com/nl/api)
- **Integratie Type**: REST API
- **Functionaliteit**:
  - Reserveringen en afhaalbestellingen
  - Tafelbeheer
  - Gastgegevens synchronisatie
- **Setup**: API key authenticatie

### 6. Formitable
**Reserverings- en bestelsysteem**

- **API Documentatie**: [Formitable API](https://help.formitable.com/hc/nl/articles/18305853640989)
- **Integratie Type**: REST API
- **Functionaliteit**:
  - Reserveringen synchronisatie
  - Afhaalbestellingen
  - Automatische bestellingen aanmaken
- **Setup**: API key authenticatie

## API Integratie Structuur

### Database Schema

```sql
-- POS Integraties tabel
CREATE TABLE pos_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('lightspeed', 'touchbistro', 'square', 'resengo', 'zenchef', 'formitable')),
  api_key TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  location_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sync_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_pos_integrations_user_id ON pos_integrations(user_id);
CREATE INDEX idx_pos_integrations_provider ON pos_integrations(provider);
```

### API Routes Structuur

```
app/api/integrations/
├── lightspeed/
│   ├── connect/route.ts          # OAuth connect flow
│   ├── callback/route.ts         # OAuth callback
│   ├── sync/route.ts             # Sync data
│   └── webhook/route.ts          # Webhook handler
├── touchbistro/
│   ├── connect/route.ts
│   ├── sync/route.ts
│   └── webhook/route.ts
├── square/
│   ├── connect/route.ts
│   ├── sync/route.ts
│   └── webhook/route.ts
└── [provider]/
    └── disconnect/route.ts       # Disconnect integration
```

## Implementatie Stappen

### Stap 1: Database Setup
Voer het SQL script uit in Supabase SQL Editor om de `pos_integrations` tabel aan te maken.

### Stap 2: API Credentials
Voor elke integratie heb je nodig:
- **Lightspeed**: Client ID, Client Secret (via Lightspeed Developer Portal)
- **TouchBistro**: API Key (via TouchBistro Dashboard)
- **Square**: Application ID, Application Secret (via Square Developer Portal)
- **Resengo**: API Key (via Resengo Dashboard)
- **Zenchef**: API Key (via Zenchef Dashboard)
- **Formitable**: API Key (via Formitable Dashboard)

### Stap 3: OAuth Flow (voor Lightspeed, Square)
1. Gebruiker klikt op "Verbind Lightspeed"
2. Redirect naar OAuth provider
3. Gebruiker autoriseert
4. Callback met authorization code
5. Exchange code voor access token
6. Sla tokens op in database

### Stap 4: API Key Flow (voor anderen)
1. Gebruiker voert API key in
2. Valideer API key met test call
3. Sla API key op in database (encrypted)

### Stap 5: Data Synchronisatie
- Webhooks: Real-time updates van POS systeem
- Polling: Periodieke sync (bijv. elke 5 minuten)
- Manual: Gebruiker triggert sync

## Data Synchronisatie

### Wat wordt gesynchroniseerd:
- **Bestellingen**: Transacties en betalingen
- **Tafels**: Tafelindeling en status
- **Reserveringen**: Gast reserveringen
- **Werknemers**: Uren en prestaties
- **Producten**: Menu items en prijzen

### Sync Frequentie:
- **Real-time**: Via webhooks (waar beschikbaar)
- **Polling**: Elke 5-15 minuten
- **Manual**: Op verzoek van gebruiker

## Security

- Alle API keys worden encrypted opgeslagen
- OAuth tokens worden veilig bewaard
- Refresh tokens worden automatisch vernieuwd
- Webhook signatures worden gevalideerd

## Testing

Elke integratie heeft een sandbox/test mode:
- Lightspeed: Test account
- TouchBistro: Demo mode
- Square: Sandbox environment
- Resengo: Test account
- Zenchef: Test account
- Formitable: Test account

## Support

Voor vragen over integraties:
- Email: integrations@servesync.nl
- Documentatie: [docs.servesync.nl/integrations](https://docs.servesync.nl/integrations)




