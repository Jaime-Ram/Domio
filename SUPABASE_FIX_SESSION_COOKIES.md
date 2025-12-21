# Fix: "Unauthorized: No user session" bij API calls

## Probleem
Bij het aanmaken van een shift krijg je "Unauthorized: No user session". Dit betekent dat de server-side Supabase client de cookies niet kan lezen.

## Mogelijke Oorzaken

1. **Cookies worden niet correct doorgegeven** van de client naar de server
2. **Session is verlopen** en moet worden ververst
3. **Cookie settings** zijn niet correct geconfigureerd

## Oplossingen

### Stap 1: Controleer of je ingelogd bent
- Log uit en log weer in
- Controleer of je session actief is

### Stap 2: Controleer Cookie Settings in Supabase
1. Ga naar Supabase Dashboard → Authentication → Settings
2. Controleer **Site URL**: Dit moet je productie URL zijn (of `http://localhost:3000` voor development)
3. Controleer **Redirect URLs**: Zorg dat deze correct zijn ingesteld

### Stap 3: Test de Session
Voer deze query uit in Supabase SQL Editor om te zien of je session actief is:

```sql
-- Check active sessions (alleen voor debugging)
-- Let op: Deze query werkt alleen als je admin rechten hebt
SELECT 
  id,
  user_id,
  created_at,
  updated_at
FROM auth.sessions
ORDER BY created_at DESC
LIMIT 10;
```

**Let op**: De `auth.sessions` tabel is alleen toegankelijk voor admins. Als je deze query niet kunt uitvoeren, is dat normaal. Je kunt in plaats daarvan controleren of je ingelogd bent door te kijken naar je browser cookies of door de applicatie te gebruiken.

### Stap 4: Verifieer Environment Variables
Zorg ervoor dat je `.env.local` de juiste waarden heeft:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Stap 5: Hard Refresh
- Druk op `Cmd+Shift+R` (Mac) of `Ctrl+Shift+R` (Windows) voor een hard refresh
- Log uit en log weer in

## Debugging

Als het probleem blijft bestaan:

1. **Open Browser Console** (F12 → Console)
2. **Check Network Tab** (F12 → Network)
3. Kijk naar de `/api/shifts/create` request:
   - Check of cookies worden meegestuurd (Request Headers → Cookie)
   - Check de response voor meer details

4. **Check Server Logs**:
   - Kijk naar de terminal waar `npm run dev` draait
   - Je zou error logs moeten zien met meer details

## Alternatieve Oplossing

Als de session problemen blijven bestaan, kun je proberen:

1. **Clear Browser Cookies**:
   - Ga naar je browser settings
   - Clear cookies voor localhost (of je domain)
   - Log opnieuw in

2. **Check Supabase Auth Settings**:
   - Ga naar Authentication → Settings
   - Zorg dat "Enable email confirmations" is uitgeschakeld (voor development)
   - Of bevestig je email als het aan staat

3. **Test met een andere browser**:
   - Probeer het in een incognito/private window
   - Of gebruik een andere browser

## Als Niets Werkt

Als het probleem blijft bestaan, kan het zijn dat:
- De middleware de session niet correct refresh
- De cookies niet correct worden opgeslagen
- Er een probleem is met de Supabase configuratie

In dat geval, check:
1. Supabase Dashboard → Logs voor errors
2. Browser Console voor JavaScript errors
3. Network tab voor HTTP errors

