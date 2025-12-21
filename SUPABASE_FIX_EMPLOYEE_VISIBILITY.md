# Fix: Werknemers niet zichtbaar in rooster

## Probleem
Werknemers die zijn toegevoegd met een `employer_email` verschijnen niet in het rooster van de werkgever.

## Oorzaak
1. De `employer_id` is niet automatisch gekoppeld aan de werknemer
2. De email matching is mogelijk case-sensitive of heeft whitespace issues
3. De trigger is mogelijk niet uitgevoerd of werkt niet correct

## Oplossing

### Stap 1: Voer het SQL script uit

1. Ga naar Supabase Dashboard → SQL Editor
2. Open `SUPABASE_FIX_EMPLOYEE_VISIBILITY.sql`
3. Kopieer en plak de volledige code
4. Klik op **Run**

Dit script:
- Voegt de `employer_id` kolom toe (als deze nog niet bestaat)
- Koppelt alle bestaande werknemers aan hun werkgever op basis van `employer_email`
- Zorgt ervoor dat de trigger correct werkt voor nieuwe werknemers
- Maakt indexes voor betere performance

### Stap 2: Verifieer de koppeling

Voer deze query uit in Supabase SQL Editor om te zien welke werknemers gekoppeld zijn:

```sql
SELECT 
  up_employee.id as employee_id,
  up_employee.full_name as employee_name,
  up_employee.email as employee_email,
  up_employee.employer_email,
  up_employee.employer_id,
  up_employer.email as employer_email_match,
  up_employer.id as employer_id_match
FROM public.user_profiles up_employee
LEFT JOIN public.user_profiles up_employer ON up_employee.employer_id = up_employer.id
WHERE up_employee.role = 'employee'
ORDER BY up_employee.created_at DESC;
```

### Stap 3: Test in de applicatie

1. Log uit en log weer in als werkgever
2. Ga naar het Rooster dashboard
3. De werknemer "ralph" zou nu zichtbaar moeten zijn

## Wat is er verbeterd?

1. **Case-insensitive email matching**: De query gebruikt nu `LOWER(TRIM())` voor zowel `employer_email` als `email`
2. **Dubbele query**: De applicatie zoekt nu zowel op `employer_id` als op `employer_email` (case-insensitive)
3. **Automatische koppeling**: De trigger werkt nu ook bij updates, niet alleen bij inserts
4. **Betere indexes**: Indexes op lowercase emails voor snellere queries

## Debugging

Als werknemers nog steeds niet verschijnen:

1. **Check de browser console** (F12 → Console):
   - Je zou debug logs moeten zien met informatie over hoeveel werknemers gevonden zijn
   - Controleer of `employerId` en `employerEmail` correct zijn

2. **Check Supabase**:
   - Ga naar Table Editor → `user_profiles`
   - Zoek de werknemer "ralph"
   - Controleer of `employer_email` exact overeenkomt met het email van de werkgever
   - Controleer of `employer_id` is ingevuld

3. **Handmatige fix**:
   Als de automatische koppeling niet werkt, kun je handmatig de `employer_id` instellen:
   
   ```sql
   -- Vervang 'EMPLOYER_USER_ID' met de UUID van de werkgever
   -- Vervang 'EMPLOYEE_EMAIL' met het email van de werknemer
   UPDATE public.user_profiles
   SET employer_id = 'EMPLOYER_USER_ID'
   WHERE email = 'EMPLOYEE_EMAIL'
     AND role = 'employee';
   ```

## Voorkomen van toekomstige problemen

- Zorg ervoor dat bij het aanmaken van een werknemer account, het `employer_email` exact overeenkomt met het email van de werkgever (case-insensitive)
- De trigger zou automatisch moeten werken voor nieuwe werknemers
- Als je handmatig een werknemer toevoegt, zorg ervoor dat `employer_email` correct is ingevuld




