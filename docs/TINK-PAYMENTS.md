# Tink Payment Initiation (Betaal met bank)

Domio ondersteunt **Pay by Bank** via [Tink](https://tink.com/products/payment-initiation). Huurders kunnen zo direct vanuit hun eigen bank betalen.

## Setup

### 1. Tink Console

1. Ga naar [Tink Console → App settings → Client](https://console.tink.com/app-settings/client).
2. Maak een app aan (of gebruik bestaande) en noteer:
   - **Client ID**
   - **Client secret**

### 2. Omgevingsvariabelen

Voeg toe aan `.env.local`:

```env
# Tink Payment Initiation (Pay by Bank)
TINK_CLIENT_ID=your_client_id
TINK_CLIENT_SECRET=your_client_secret

# Vereist voor callback-URL (bijv. https://jouwdomein.nl of http://localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Redirect URI in Tink Console

Registreer je callback-URL in Tink:

- **Redirect URI:** `{NEXT_PUBLIC_APP_URL}/api/payments/tink/callback`  
  Voorbeeld: `https://jouwdomein.nl/api/payments/tink/callback`

Stel deze in onder **App settings** / **TPP credentials** in de Tink Console.

### 4. Database (eenmalig)

Voer in Supabase (SQL Editor) uit:

```sql
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS tink_payment_request_id text;
```

Of gebruik de migration: `lib/supabase/migrations/20250214_tink_payment_request_id.sql`.

## Gebruik

- **Betalingen-pagina:** Dashboard → Financieel → Betalingen. Vul bedrag, IBAN en naam ontvanger in en klik op **Betaal met bank starten**. De gebruiker wordt doorgestuurd naar Tink Link, kiest zijn bank en autoriseert de betaling. Na afronding komt hij terug op het financiële overzicht.
- **Bestaande betaling koppelen:** Bij een POST naar `/api/payments/tink/create` kun je optioneel `paymentId` meesturen (UUID van een bestaande payment). Na succesvolle betaling wordt die payment automatisch op **betaald** gezet.

## API

- **POST `/api/payments/tink/create`**  
  Body: `{ amount, recipientIban, recipientName, description?, paymentId? }`  
  Response: `{ redirectUrl, paymentRequestId }` – stuur de gebruiker naar `redirectUrl`.

- **GET `/api/payments/tink/callback`**  
  Wordt door Tink aangeroepen met `?payment_request_id=...`. Zoekt de gekoppelde payment, zet deze op betaald en redirect naar het dashboard.

## Referenties

- [Tink – Initiate your first one-time payment](https://docs.tink.com/resources/payments/one-time-payments/initiate-your-first-one-time-payment)
- [Tink Console](https://console.tink.com/app-settings/client)
