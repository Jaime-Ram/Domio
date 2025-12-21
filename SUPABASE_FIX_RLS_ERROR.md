# Fix: "new row violates row-level security policy" of "Profile creation error: {}"

Deze error betekent dat de INSERT policy niet correct werkt. Volg deze stappen om het op te lossen.

## 🔧 Snelle Fix (Probeer dit eerst!)

Ga naar Supabase SQL Editor en voer dit **complete script** uit:

```sql
-- Stap 1: Verwijder alle bestaande policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Stap 2: Zorg dat RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Stap 3: Maak alle policies opnieuw aan
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

**Belangrijk:** Voer het hele script in één keer uit, niet stukje voor stukje!

## 🔍 Verifieer dat het werkt

Voer dit uit om te checken of de policy correct is:

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles' 
AND cmd = 'INSERT';
```

Je zou moeten zien:
- `policyname`: "Users can insert own profile"
- `cmd`: "INSERT"
- `with_check`: `(auth.uid() = id)`

## 🧪 Test het

1. **Log uit** in je applicatie
2. **Maak een nieuw account aan** via de signup pagina
3. Het profiel zou nu automatisch moeten worden aangemaakt zonder errors

## 🔄 Alternatieve Fix (als bovenstaande niet werkt)

Als de error blijft, probeer dan deze meer permissieve policy (alleen voor testing):

```sql
-- Verwijder oude policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Maak een meer permissieve policy (alleen voor testing!)
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);  -- Dit staat alle inserts toe (alleen voor testing!)

-- BELANGRIJK: Vervang dit later met de veiligere versie:
-- WITH CHECK (auth.uid() = id)
```

**Let op:** De policy met `WITH CHECK (true)` is niet veilig voor productie! Gebruik dit alleen om te testen, en vervang het daarna met de veiligere versie.

## 🎯 Volledige Policy Reset (als niets werkt)

Als je nog steeds problemen hebt, reset alle policies:

```sql
-- Verwijder alle policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Maak alle policies opnieuw aan
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Optioneel: Admin policy
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

## 📝 Belangrijke Notities

1. **WITH CHECK vs USING:**
   - `USING` = controleert of je bestaande rijen kunt lezen/updaten
   - `WITH CHECK` = controleert of je nieuwe rijen kunt aanmaken of updaten
   - Voor INSERT policies gebruik je alleen `WITH CHECK`
   - Voor UPDATE policies gebruik je beide

2. **auth.uid()** moet overeenkomen met de `id` kolom in de tabel

3. **Test altijd** na het aanpassen van policies door een nieuw account aan te maken

## ✅ Checklist

Na het uitvoeren van de fix:

- [ ] INSERT policy is aangemaakt met `WITH CHECK (auth.uid() = id)`
- [ ] Je hebt de policy geverifieerd met de SELECT query
- [ ] Je hebt een nieuw account aangemaakt om te testen
- [ ] Geen errors meer bij het aanmaken van een profiel

