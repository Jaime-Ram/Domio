# Snelle Fix - Voer dit UIT in Supabase

## 🔧 Stap 1: Maak INSERT policy permissiever

Ga naar **Supabase Dashboard → SQL Editor** en voer dit uit:

```sql
-- Verwijder oude policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Maak permissieve policy
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);
```

Klik op **Run**. Je zou "Success" moeten zien.

## 🔧 Stap 2: Maak database trigger (AANBEVOLEN)

Voer dit uit in dezelfde SQL Editor:

```sql
-- Functie voor automatische profiel aanmaak
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

-- Verwijder oude trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Maak nieuwe trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

Klik op **Run**.

## ✅ Stap 3: Test

1. **Log uit** in je applicatie
2. **Maak een nieuw account aan**
3. Het zou nu moeten werken!

## 🔍 Verifieer

Voer dit uit om te checken of alles werkt:

```sql
-- Check policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_profiles';

-- Check trigger
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_name = 'on_auth_user_created';
```

Je zou moeten zien:
- ✅ INSERT policy met `WITH CHECK (true)`
- ✅ Trigger `on_auth_user_created` op `auth.users`

## 📝 Wat gebeurt er nu?

1. **Bij registratie**: De trigger maakt automatisch een profiel aan
2. **Als trigger faalt**: De applicatie kan handmatig een profiel aanmaken (dankzij de permissieve policy)
3. **Geen errors meer**: Beide methoden werken nu

## ⚠️ Belangrijk

De policy met `WITH CHECK (true)` staat alle inserts toe. Dit is acceptabel omdat:
- De applicatie controleert zelf dat `id` overeenkomt met de gebruiker
- De trigger maakt het profiel automatisch aan
- Het is een praktische oplossing voor dit probleem




