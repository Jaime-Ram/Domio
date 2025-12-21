# Google OAuth Setup - Stap voor Stap

Google login is al geïmplementeerd in de code! Je hoeft alleen nog Google OAuth te configureren in Supabase en Google Cloud Console.

---

## ✅ Wat is al gedaan:

- ✅ Google login button op de login pagina
- ✅ OAuth callback handler (`/auth/callback`)
- ✅ Automatische profiel aanmaak voor Google gebruikers
- ✅ Redirect naar dashboard na login

---

## 🔧 Wat je moet doen:

### Stap 1: Google Cloud Console Setup

1. **Ga naar Google Cloud Console**
   - Open [https://console.cloud.google.com](https://console.cloud.google.com)
   - Log in met je Google account

2. **Maak een nieuw project aan** (of gebruik een bestaand project)
   - Klik op project dropdown bovenaan
   - Klik op "New Project"
   - Geef het project een naam (bijv. "ServeSync")
   - Klik op "Create"

3. **Enable Google+ API**
   - Ga naar "APIs & Services" > "Library"
   - Zoek naar "Google+ API" of "People API"
   - Klik erop en klik op "Enable"

4. **Maak OAuth 2.0 Credentials aan**
   - Ga naar "APIs & Services" > "Credentials"
   - Klik op "+ CREATE CREDENTIALS" > "OAuth client ID"
   - Als je dit voor het eerst doet, moet je eerst "Configure consent screen" doen:
     - Kies "External" (tenzij je Google Workspace hebt)
     - Vul in:
       - App name: ServeSync
       - User support email: jouw email
       - Developer contact: jouw email
     - Klik op "Save and Continue"
     - Scopes: Laat standaard staan, klik "Save and Continue"
     - Test users: Voeg je eigen email toe (voor testing)
     - Klik "Save and Continue" en dan "Back to Dashboard"

5. **Maak OAuth Client ID**
   - Klik op "+ CREATE CREDENTIALS" > "OAuth client ID"
   - Application type: **Web application**
   - Name: ServeSync Web
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (voor development)
     - `https://jouw-domein.nl` (voor production)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/auth/callback` (voor development)
     - `https://jouw-domein.nl/auth/callback` (voor production)
     - **BELANGRIJK:** Voeg ook toe:
       - `https://[jouw-project-ref].supabase.co/auth/v1/callback`
       - Vervang `[jouw-project-ref]` met je Supabase project reference (bijv. `ipxmosxtvvbkjmmrkauz`)
   - Klik op "Create"
   - **Kopieer de Client ID en Client Secret** (je hebt deze nodig voor Supabase)

---

### Stap 2: Supabase Configuration

1. **Open Supabase Dashboard**
   - Ga naar [https://app.supabase.com](https://app.supabase.com)
   - Selecteer je ServeSync project

2. **Ga naar Authentication Settings**
   - Klik in het linker menu op **"Authentication"**
   - Klik op **"Providers"** in het submenu

3. **Enable Google Provider**
   - Scroll naar **"Google"**
   - Klik op de toggle om Google in te schakelen
   - Vul in:
     - **Client ID (for OAuth):** Plak hier je Google Client ID
     - **Client Secret (for OAuth):** Plak hier je Google Client Secret
   - Klik op **"Save"**

4. **Configure Redirect URLs**
   - Supabase gebruikt automatisch: `https://[project-ref].supabase.co/auth/v1/callback`
   - Zorg dat deze URL is toegevoegd aan je Google OAuth redirect URIs (zie Stap 1.5)

---

### Stap 3: Testen

1. **Start je development server** (als die nog niet draait):
   ```bash
   npm run dev
   ```

2. **Ga naar de login pagina**
   - Open [http://localhost:3000/login](http://localhost:3000/login)

3. **Klik op "Inloggen met Google"**
   - Je wordt doorgestuurd naar Google
   - Log in met je Google account
   - Geef toestemming (als je dat nog niet hebt gedaan)
   - Je wordt terug gestuurd naar ServeSync
   - Je wordt automatisch ingelogd en doorgestuurd naar het dashboard

---

## ⚠️ Belangrijke Opmerkingen

### Development vs Production

**Voor Development:**
- Gebruik `http://localhost:3000` in Google OAuth configuratie
- Redirect URI: `http://localhost:3000/auth/callback`

**Voor Production:**
- Vervang `localhost:3000` met je echte domein
- Voeg beide redirect URIs toe:
  - `https://jouw-domein.nl/auth/callback`
  - `https://[project-ref].supabase.co/auth/v1/callback`

### OAuth Consent Screen

- In **Testing mode** kunnen alleen toegevoegde test users inloggen
- Voor **Production** moet je de app verifiëren bij Google (kan enkele dagen duren)
- Voor nu: voeg test users toe in Google Cloud Console

### Supabase Redirect URL

De Supabase redirect URL ziet er zo uit:
```
https://[jouw-project-ref].supabase.co/auth/v1/callback
```

Vervang `[jouw-project-ref]` met je Supabase project reference. Je vindt dit in:
- Supabase Dashboard > Settings > API > Project URL
- Bijvoorbeeld: `https://ipxmosxtvvbkjmmrkauz.supabase.co`

---

## 🔍 Troubleshooting

### "redirect_uri_mismatch" Error
- **Oorzaak:** De redirect URI in Google komt niet overeen
- **Oplossing:** Controleer of je alle redirect URIs hebt toegevoegd:
  - `http://localhost:3000/auth/callback` (development)
  - `https://[project-ref].supabase.co/auth/v1/callback` (Supabase)

### "access_denied" Error
- **Oorzaak:** Je hebt geen toestemming gegeven of je staat niet in de test users lijst
- **Oplossing:** 
  - Zorg dat je email in de test users lijst staat (Google Cloud Console)
  - Of verander de OAuth consent screen naar "Production" (vereist verificatie)

### "invalid_client" Error
- **Oorzaak:** Client ID of Client Secret is incorrect
- **Oplossing:** Controleer of je de juiste credentials hebt gekopieerd in Supabase

### Gebruiker wordt niet aangemaakt
- **Oorzaak:** Database trigger of RLS policy blokkeert het
- **Oplossing:** Controleer of de `user_profiles` tabel bestaat en RLS policies correct zijn ingesteld

---

## ✅ Checklist

- [ ] Google Cloud Console project aangemaakt
- [ ] Google+ API of People API enabled
- [ ] OAuth consent screen geconfigureerd
- [ ] OAuth Client ID aangemaakt (Web application)
- [ ] Redirect URIs toegevoegd in Google:
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `https://[project-ref].supabase.co/auth/v1/callback`
- [ ] Google provider enabled in Supabase
- [ ] Client ID en Client Secret ingevuld in Supabase
- [ ] Getest met Google login

---

## 🎉 Klaar!

Na het voltooien van deze stappen werkt Google login volledig. Gebruikers kunnen nu:
- Inloggen met Google
- Automatisch een profiel krijgen
- Direct naar het dashboard worden gestuurd

---

## 📞 Hulp Nodig?

Als je problemen hebt:
1. Controleer de browser console voor errors
2. Controleer Supabase logs (Authentication > Logs)
3. Controleer Google Cloud Console voor OAuth errors
4. Zorg dat alle redirect URIs correct zijn geconfigureerd




