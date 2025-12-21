# Supabase Setup - Stap voor Stap Guide

Volg deze stappen precies in volgorde om de "Error fetching user profile" error op te lossen.

## 📋 Stap 1: Open Supabase Dashboard

1. Ga naar [https://app.supabase.com](https://app.supabase.com)
2. Log in met je account
3. Selecteer je project (of maak een nieuw project aan als je die nog niet hebt)

## 📋 Stap 2: Open SQL Editor

1. Klik in het linker menu op **"SQL Editor"** (het icoon met `</>`)
2. Klik op **"New query"** om een nieuwe query te maken

## 📋 Stap 3: Check of de tabel bestaat

Kopieer en plak dit in de SQL Editor en klik op **"Run"** (of druk op `Ctrl/Cmd + Enter`):

```sql
SELECT * FROM public.user_profiles LIMIT 1;
```

**Wat betekent het resultaat:**
- ✅ Als je "Success, no rows returned" ziet → De tabel bestaat! Ga door naar Stap 4
- ❌ Als je een error ziet zoals "relation does not exist" → De tabel bestaat niet, ga naar Stap 3a

### Stap 3a: Maak de tabel aan (alleen als deze niet bestaat)

Als de tabel niet bestaat, voer dit uit:

```sql
-- Maak de user_profiles tabel aan
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

-- Voeg indexes toe voor betere performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
```

Klik op **"Run"**. Je zou "Success" moeten zien.

## 📋 Stap 4: Check of RLS is enabled

Voer dit uit:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';
```

**Wat betekent het resultaat:**
- ✅ Als `rowsecurity = true` → RLS is enabled, ga door naar Stap 5
- ❌ Als `rowsecurity = false` → RLS is niet enabled, voer dit uit:

```sql
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

## 📋 Stap 5: Check of policies bestaan

Voer dit uit:

```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'user_profiles';
```

**Wat betekent het resultaat:**
- ✅ Als je **3 of meer policies** ziet → Policies bestaan! 
  - Je moet minimaal deze 3 zien:
    - "Users can view own profile" (SELECT)
    - "Users can update own profile" (UPDATE)
    - "Users can insert own profile" (INSERT)
  - Als je er 4 of meer ziet, kan dat een extra policy zijn (bijv. voor admins) - dat is prima!
  - **Ga door naar Stap 6**
- ❌ Als je "0 rows" ziet → Policies bestaan niet, ga naar Stap 5a

### Stap 5a: Maak de policies aan

Voer dit volledige script uit:

```sql
-- Verwijder bestaande policies (om conflicten te voorkomen)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Policy 1: Gebruikers kunnen hun eigen profiel lezen
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Gebruikers kunnen hun eigen profiel updaten
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy 3: Gebruikers kunnen hun eigen profiel aanmaken
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 4 (Optioneel): Admins kunnen alle profielen zien
-- Deze policy is optioneel maar handig als je admin functionaliteit hebt
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

Klik op **"Run"**. Je zou "Success" moeten zien voor alle statements.

**Let op:** Als je al 4 policies ziet, betekent dit waarschijnlijk dat de "Admins can view all profiles" policy al bestaat. Dat is prima! Je hoeft alleen de eerste 3 policies te hebben voor de basis functionaliteit.

## 📋 Stap 6: Verifieer dat alles werkt

Voer dit uit om te checken:

```sql
-- Check tabel structuur
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'user_profiles';
```

Je zou moeten zien:
- ✅ Een lijst met kolommen (id, email, full_name, role, etc.)
- ✅ Minimaal 3 policies (Users can view own profile, Users can update own profile, Users can insert own profile)
  - Als je er meer ziet (bijv. 4), is dat prima - er kan een extra policy zijn voor admins

## 📋 Stap 7: Test in de applicatie

1. **Ga terug naar je applicatie** (localhost:3000)
2. **Log uit** (als je ingelogd bent)
3. **Log weer in** met je account
4. **Ga naar het dashboard**

**Wat zou er moeten gebeuren:**
- ✅ Geen errors in de console
- ✅ Je ziet je dashboard
- ✅ Als je nog geen profiel had, wordt deze automatisch aangemaakt

## 📋 Stap 8: Verifieer dat je profiel is aangemaakt

Ga terug naar Supabase SQL Editor en voer dit uit:

```sql
SELECT * FROM public.user_profiles;
```

Je zou nu je profiel moeten zien met je email, naam, en rol.

## 🔧 Troubleshooting

### Als je nog steeds errors krijgt:

**1. Check je environment variables:**
- Open `.env.local` in je project
- Zorg dat `NEXT_PUBLIC_SUPABASE_ANON_KEY` is ingesteld (niet de service_role key!)
- Zorg dat `NEXT_PUBLIC_SUPABASE_URL` is ingesteld

**2. Check Supabase Logs:**
- Ga naar Supabase Dashboard → **Logs** (in het linker menu)
- Kijk naar errors bij "Postgres Logs" of "API Logs"

**3. Test de RLS policies handmatig:**
- Ga naar Supabase Dashboard → **Authentication** → **Users**
- Kopieer je User ID
- Ga naar SQL Editor en voer dit uit (vervang `jouw-user-id`):

```sql
-- Test of je je eigen profiel kunt lezen
SELECT * FROM public.user_profiles 
WHERE id = 'jouw-user-id'::uuid;
```

**4. Maak handmatig een profiel aan (als automatisch niet werkt):**
- Ga naar Supabase Dashboard → **Authentication** → **Users**
- Kopieer je User ID en Email
- Ga naar SQL Editor en voer dit uit (vervang de waarden):

```sql
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES (
  'jouw-user-id-hier'::uuid,
  'jouw-email@voorbeeld.nl',
  'Jouw Naam',
  'employer'  -- of 'employee'
)
ON CONFLICT (id) DO NOTHING;
```

## ✅ Checklist

Voordat je verder gaat, zorg dat je dit allemaal hebt gedaan:

- [ ] Tabel `user_profiles` bestaat
- [ ] RLS is enabled op de tabel
- [ ] 3 policies zijn aangemaakt (view, update, insert)
- [ ] Je hebt je environment variables gecontroleerd
- [ ] Je bent uit- en weer ingelogd in de applicatie
- [ ] Je profiel is aangemaakt (check met `SELECT * FROM public.user_profiles`)

## 🆘 Nog steeds problemen?

Als je na al deze stappen nog steeds errors krijgt:

1. **Kopieer de exacte error message** uit de browser console
2. **Check de Supabase logs** voor meer details
3. **Verifieer dat je de juiste Supabase project gebruikt** (check de URL in je `.env.local`)

## 📝 Belangrijke notities

- **Gebruik altijd de `anon` key** in je client-side code (niet de `service_role` key)
- **RLS policies zijn verplicht** - zonder deze kan de applicatie de data niet lezen
- **De applicatie maakt automatisch een profiel aan** als je inlogt en er nog geen bestaat
- **Als je handmatig een profiel aanmaakt**, zorg dat de `id` overeenkomt met je `auth.users` id

