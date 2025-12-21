# Supabase User Profiles Setup

Deze guide helpt je om de `user_profiles` tabel correct in te stellen in Supabase om de "Error fetching user profile" error op te lossen.

## Stap 1: Maak de `user_profiles` tabel aan

Ga naar je Supabase Dashboard → SQL Editor en voer het volgende SQL script uit:

```sql
-- Maak de user_profiles tabel aan (als deze nog niet bestaat)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'employer', 'employee')) DEFAULT 'employee',
  employer_email TEXT,
  restaurant_name TEXT,
  restaurant_address TEXT,
  avatar_url TEXT,
  profile_picture TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voeg ontbrekende kolommen toe (als de tabel al bestaat)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS employer_email TEXT,
ADD COLUMN IF NOT EXISTS restaurant_name TEXT,
ADD COLUMN IF NOT EXISTS restaurant_address TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Maak een index voor snellere queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

## Stap 2: Stel Row Level Security (RLS) Policies in

Dit is cruciaal! Zonder de juiste RLS policies kan de applicatie de user profiles niet lezen.

```sql
-- Policy: Gebruikers kunnen hun eigen profiel lezen
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Gebruikers kunnen hun eigen profiel updaten
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Gebruikers kunnen hun eigen profiel aanmaken
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Service role kan alles (voor server-side operaties)
-- Deze policy is optioneel maar handig voor admin operaties
CREATE POLICY "Service role can do everything"
  ON public.user_profiles
  FOR ALL
  USING (auth.role() = 'service_role');
```

## Stap 3: Maak een Database Trigger aan (Optioneel maar Aanbevolen)

Dit zorgt ervoor dat automatisch een user profile wordt aangemaakt wanneer een nieuwe gebruiker zich registreert:

```sql
-- Functie om automatisch een user profile aan te maken
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger die de functie aanroept bij nieuwe gebruikers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Stap 4: Verifieer de Setup

Test of alles werkt door het volgende SQL query uit te voeren:

```sql
-- Check of de tabel bestaat
SELECT * FROM public.user_profiles LIMIT 1;

-- Check of RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- Check of de policies bestaan
SELECT * FROM pg_policies 
WHERE tablename = 'user_profiles';
```

## Stap 5: Test in de Applicatie

1. Log uit en log weer in
2. Ga naar het dashboard
3. De error zou nu niet meer moeten verschijnen

## Troubleshooting

### Error: "relation user_profiles does not exist"
- Zorg ervoor dat je de tabel hebt aangemaakt (Stap 1)

### Error: "new row violates row-level security policy"
- Controleer of de RLS policies correct zijn ingesteld (Stap 2)
- Zorg ervoor dat je ingelogd bent met een geldig account

### Error: "permission denied for table user_profiles"
- Controleer of RLS is enabled
- Controleer of de policies correct zijn ingesteld
- Zorg ervoor dat je de `anon` key gebruikt (niet de `service_role` key) in je client-side code

### Error: "column does not exist"
- Controleer of alle kolommen in de tabel bestaan
- Voeg ontbrekende kolommen toe met `ALTER TABLE`

## Extra Kolommen Toevoegen

Als je later extra kolommen wilt toevoegen:

```sql
-- Voorbeeld: avatar_url toevoegen
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Voorbeeld: profile_picture toevoegen
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;
```

## Belangrijke Notities

1. **RLS is verplicht**: Zonder RLS policies kan de applicatie de data niet lezen
2. **Service Role Key**: Gebruik deze NOOIT in client-side code, alleen in server-side API routes
3. **Anon Key**: Dit is de key die je gebruikt in je `.env.local` voor `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Trigger**: De trigger zorgt ervoor dat nieuwe gebruikers automatisch een profiel krijgen

## Hulp Nodig?

Als je nog steeds errors krijgt:
1. Check de Supabase logs in het Dashboard → Logs
2. Check de browser console voor meer details
3. Verifieer dat je environment variables correct zijn ingesteld

