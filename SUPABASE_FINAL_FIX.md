# Finale Fix voor RLS Error

Als je nog steeds een RLS error krijgt, volg deze stappen **in exact deze volgorde**.

## 🔧 Stap 1: Maak de INSERT policy permissiever (TIJDELIJK)

Ga naar Supabase SQL Editor en voer dit uit:

```sql
-- Verwijder de oude INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Maak een permissievere policy (voor testing)
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);
```

**⚠️ BELANGRIJK:** Deze policy staat ALLE inserts toe. Dit is alleen voor testing om te zien of het probleem met de policy te maken heeft.

## 🧪 Stap 2: Test het

1. Log uit in je applicatie
2. Maak een nieuw account aan
3. Check of het werkt

## ✅ Stap 3: Als het werkt, maak de policy veiliger

Als de permissieve policy werkt, betekent het dat het probleem met de `auth.uid() = id` check te maken heeft. In dat geval, gebruik de database trigger (zie hieronder).

## 🔧 Stap 4: Gebruik een Database Trigger (AANBEVOLEN)

De beste oplossing is om een database trigger te gebruiken die automatisch een profiel aanmaakt. Dit omzeilt RLS problemen:

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

-- Verwijder bestaande trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Maak trigger aan
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

Met deze trigger:
- ✅ Het profiel wordt automatisch aangemaakt bij registratie
- ✅ RLS policies worden omzeild (trigger draait met SECURITY DEFINER)
- ✅ De applicatie hoeft het profiel niet handmatig aan te maken

## 🔄 Stap 5: Als je de trigger gebruikt, verwijder de permissieve policy

Als je de trigger gebruikt, kun je de INSERT policy weer veiliger maken:

```sql
-- Verwijder de permissieve policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Maak een veiligere policy (voor handmatige inserts, als nodig)
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

Of verwijder de INSERT policy helemaal als je alleen de trigger gebruikt:

```sql
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
```

## 📝 Samenvatting

**Optie 1: Permissieve Policy (snelste fix, maar minder veilig)**
- Gebruik `WITH CHECK (true)` voor de INSERT policy
- Werkt direct, maar is niet veilig voor productie

**Optie 2: Database Trigger (beste oplossing)**
- Maak een trigger die automatisch profielen aanmaakt
- Veiliger en betrouwbaarder
- Omzeilt RLS problemen

**Optie 3: Combinatie**
- Gebruik de trigger voor automatische aanmaak
- Houd een veilige INSERT policy voor handmatige updates

## ✅ Checklist

- [ ] Permissieve INSERT policy is aangemaakt (`WITH CHECK (true)`)
- [ ] Je hebt getest met een nieuw account
- [ ] Database trigger is aangemaakt (aanbevolen)
- [ ] Je hebt de applicatie getest
- [ ] Geen errors meer bij het aanmaken van een profiel




