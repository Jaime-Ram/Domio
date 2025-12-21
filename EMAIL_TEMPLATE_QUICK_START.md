# Quick Start: Email Template Setup

## Snelle Stappen

### 1. Upload Afbeeldingen

Zorg dat deze bestanden publiek toegankelijk zijn:

- ✅ Logo: `public/images/Logo.png` → `https://your-domain.com/images/Logo.png`
- ✅ App Icon: `public/images/Appicon.png` (gebruik voor mockup)
- ⚠️ Phone Mockup: Maak deze aan (zie hieronder)

### 2. Maak Phone Mockup

**Optie A: Online Tool (Snelst)**
1. Ga naar [Mockuphone.com](https://mockuphone.com/)
2. Upload je `Appicon.png` of een screenshot van je app
3. Kies iPhone template
4. Download de mockup
5. Upload naar `public/images/phone-mockup.png`

**Optie B: Met je App Icon**
1. Gebruik [Screenshots.pro](https://screenshots.pro/) of [AppMockup.com](https://app-mockup.com/)
2. Upload `Appicon.png` als app icon
3. Genereer iPhone mockup
4. Download en upload naar je project

### 3. Supabase Dashboard

1. Ga naar: **Authentication** > **Email Templates** > **Confirm signup**
2. Kopieer de HTML uit `SUPABASE_EMAIL_SETUP.md` (Stap 3)
3. Vervang alle `https://your-domain.com` met je echte domain
4. Vervang `https://your-domain.com/images/logo.png` met je logo URL
5. Vervang `https://your-domain.com/images/phone-mockup.png` met je mockup URL
6. Update App Store en Google Play links (of laat placeholder staan)
7. Sla op

### 4. Subject Line

```
Verify your ServeSync account
```

### 5. Test

1. Maak een test account
2. Check je email
3. Verifieer dat alles correct wordt weergegeven

## Belangrijke URLs om te Vervangen

In de template, zoek en vervang:

- `https://your-domain.com` → Je echte domain
- `https://your-domain.com/images/logo.png` → Je logo URL
- `https://your-domain.com/images/phone-mockup.png` → Je mockup URL
- `https://apps.apple.com/app/servesync` → Je App Store link (of placeholder)
- `https://play.google.com/store/apps/details?id=com.servesync` → Je Google Play link (of placeholder)
- `https://twitter.com/servesync` → Je social media links

## Voor Development (Localhost)

Als je lokaal test, gebruik:
- Logo: `http://localhost:3000/images/Logo.png`
- Mockup: `http://localhost:3000/images/phone-mockup.png`

**Let op:** Supabase emails werken alleen met publieke URLs. Voor lokale ontwikkeling, gebruik een service zoals [ngrok](https://ngrok.com/) om je localhost publiek te maken, of upload naar een tijdelijke hosting service.

## Volledige Documentatie

Zie `SUPABASE_EMAIL_SETUP.md` voor gedetailleerde instructies.




