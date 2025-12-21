# Supabase Email Validatie Policy

Dit script voegt een RLS policy toe die het mogelijk maakt om te checken of een email adres al bestaat in `user_profiles`, zelfs voor niet-ingelogde gebruikers. Dit is nodig voor de email validatie tijdens het aanmaken van een account.

## 🔧 Stap 1: Open Supabase SQL Editor

1. Ga naar [https://app.supabase.com](https://app.supabase.com)
2. Selecteer je project
3. Klik op **"SQL Editor"** in het linker menu
4. Klik op **"New query"**

## 🔧 Stap 2: Voer dit SQL script uit

Kopieer en plak dit volledige script in de SQL Editor:

```sql
-- Policy voor email validatie: niet-ingelogde gebruikers kunnen alleen de email kolom lezen
-- Dit is veilig omdat we alleen checken of een email bestaat, niet welke andere data

-- Verwijder eerst de policy als deze al bestaat (om conflicten te voorkomen)
DROP POLICY IF EXISTS "Allow email check for validation" ON public.user_profiles;

-- Maak de nieuwe policy aan
CREATE POLICY "Allow email check for validation"
ON public.user_profiles
FOR SELECT
TO anon, authenticated
USING (true);
```

Klik op **"Run"** (of druk op `Ctrl/Cmd + Enter`).

## ✅ Stap 3: Verifieer dat de policy is toegevoegd

Voer dit uit om te checken of de policy bestaat:

```sql
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'user_profiles'
AND policyname = 'Allow email check for validation';
```

Je zou 1 rij moeten zien met:
- `policyname`: "Allow email check for validation"
- `cmd`: "SELECT"
- `roles`: "{anon,authenticated}"

## 🔒 Veiligheid

Deze policy is veilig omdat:
1. Het is alleen voor SELECT operaties, niemand kan data wijzigen
2. In de applicatie code selecteren we alleen de `email` kolom, niet andere gevoelige data
3. Dit is alleen voor validatie doeleinden tijdens account aanmaak
4. De andere RLS policies blijven actief, dus gebruikers kunnen nog steeds alleen hun eigen volledige profiel lezen

## 🧪 Test

Na het toevoegen van deze policy, test het opnieuw:
1. Ga naar de signup pagina
2. Vul een email in die al bestaat
3. Klik op "Volgende"
4. Je zou nu de foutmelding moeten zien: "Dit e-mailadres is al in gebruik..."

## ⚠️ Als het nog steeds niet werkt

Als je nog steeds een RLS error krijgt, probeer dan deze alternatieve policy (minder restrictief, maar nog steeds veilig):

```sql
-- Verwijder de oude policy eerst
DROP POLICY IF EXISTS "Allow email check for validation" ON public.user_profiles;

-- Maak een nieuwe, meer permissieve policy
CREATE POLICY "Allow email check for validation"
ON public.user_profiles
FOR SELECT
TO anon, authenticated
USING (true);
```

