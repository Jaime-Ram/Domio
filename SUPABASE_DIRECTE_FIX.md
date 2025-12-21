# Directe Fix voor RLS Error

Volg deze stappen **precies in volgorde**.

## 🔧 Stap 1: Reset alle policies

Ga naar Supabase SQL Editor en voer dit **complete script** uit:

```sql
-- Verwijder ALLE policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
```

## 🔧 Stap 2: Maak policies opnieuw aan (VEILIGE VERSIE)

Voer dit uit:

```sql
-- Policy 1: SELECT - Gebruikers kunnen hun eigen profiel lezen
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: UPDATE - Gebruikers kunnen hun eigen profiel updaten
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: INSERT - Gebruikers kunnen hun eigen profiel aanmaken
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## 🧪 Stap 3: Test het

1. Log uit in je applicatie
2. Maak een nieuw account aan
3. Check of het werkt

## ❌ Als het nog steeds niet werkt: Tijdelijke Fix (alleen voor testing!)

Als de bovenstaande fix niet werkt, probeer dan deze **tijdelijke permissieve versie** (alleen om te testen of het probleem met de policy te maken heeft):

```sql
-- Verwijder de INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Tijdelijke permissieve policy (ALLEEN VOOR TESTING!)
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);
```

**⚠️ BELANGRIJK:** Deze policy staat ALLE inserts toe en is NIET veilig voor productie! Gebruik dit alleen om te testen.

Als dit werkt, betekent het dat het probleem met de `auth.uid() = id` check te maken heeft. In dat geval moeten we kijken naar:
1. Of de gebruiker correct is geauthenticeerd
2. Of de `id` correct wordt doorgegeven

## 🔍 Alternatieve Oplossing: Gebruik een Database Trigger

Als de RLS policies niet werken, kunnen we een database trigger gebruiken die automatisch een profiel aanmaakt:

```sql
-- Functie om automatisch een profiel aan te maken
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

-- Drop bestaande trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Maak trigger aan
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

Met deze trigger wordt het profiel automatisch aangemaakt wanneer een gebruiker zich registreert, en hoef je het niet handmatig te doen vanuit de applicatie.

## ✅ Checklist

- [ ] Alle oude policies zijn verwijderd
- [ ] Nieuwe policies zijn aangemaakt
- [ ] Je hebt getest met een nieuw account
- [ ] Als het niet werkt, heb je de tijdelijke permissieve policy geprobeerd
- [ ] Als dat werkt, heb je de trigger geïnstalleerd als alternatief




