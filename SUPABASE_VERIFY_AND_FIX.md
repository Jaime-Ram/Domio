# Supabase Verificatie en Fix

## Stap 1: Verifieer dat alles correct is ingesteld

Voer deze queries uit in Supabase SQL Editor om te controleren:

```sql
-- 1. Check of de tabel bestaat en RLS is enabled
SELECT 
  tablename, 
  rowsecurity,
  schemaname
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- 2. Check of de policies bestaan
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 3. Check de structuur van de tabel
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;
```

## Stap 2: Maak een profiel aan voor je huidige gebruiker

Als je al ingelogd bent, kun je handmatig een profiel aanmaken:

```sql
-- Vervang 'jouw-user-id-hier' met je daadwerkelijke user ID
-- Je kunt je user ID vinden in Supabase Dashboard → Authentication → Users
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES (
  'jouw-user-id-hier'::uuid,
  'jouw-email@voorbeeld.nl',
  'Jouw Naam',
  'employer'  -- of 'employee' afhankelijk van je rol
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();
```

## Stap 3: Of gebruik de automatische trigger (Aanbevolen)

Als je wilt dat profielen automatisch worden aangemaakt bij registratie, voer dit uit:

```sql
-- Functie om automatisch een user profile aan te maken
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop bestaande trigger als die bestaat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Maak de trigger aan
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Stap 4: Test het

1. Log uit en log weer in
2. Of maak een nieuw account aan
3. Check of het profiel is aangemaakt:

```sql
SELECT * FROM public.user_profiles;
```

## Troubleshooting

### Als je nog steeds errors krijgt:

1. **Check of RLS policies correct zijn:**
```sql
-- Test of je je eigen profiel kunt lezen (vervang met je user ID)
SELECT * FROM public.user_profiles 
WHERE id = auth.uid();
```

2. **Check of je de juiste Supabase keys gebruikt:**
   - In `.env.local` moet je `NEXT_PUBLIC_SUPABASE_ANON_KEY` gebruiken (niet de service_role key)
   - De anon key heeft de juiste permissions voor RLS

3. **Check de Supabase logs:**
   - Ga naar Supabase Dashboard → Logs
   - Kijk naar errors bij het ophalen van user_profiles

4. **Test de RLS policies handmatig:**
```sql
-- Als je ingelogd bent in Supabase, test dit:
SET ROLE authenticated;
SELECT * FROM public.user_profiles WHERE id = auth.uid();
```

## Belangrijk

- Zorg ervoor dat RLS is enabled: `ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;`
- Zorg ervoor dat de policies bestaan en correct zijn
- Gebruik de `anon` key in je client-side code, niet de `service_role` key

