-- ============================================
-- Fix RLS Policies for user_profiles table
-- ============================================
-- Dit script herstelt de RLS policies voor user_profiles
-- zodat gebruikers hun eigen profile kunnen lezen/updaten
-- en employers hun werknemers kunnen zien
-- ============================================

-- Stap 1: Verwijder ALLE bestaande policies om conflicten te voorkomen
-- Dit verwijdert alle policies voor user_profiles, ongeacht de naam
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.user_profiles';
    END LOOP;
END $$;

-- Stap 1b: Verwijder ook policies met bekende namen (voor de zekerheid)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Employers can view their employees" ON public.user_profiles;
DROP POLICY IF EXISTS "Employers can update their employees" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow email check for validation" ON public.user_profiles;

-- Stap 2: Zorg ervoor dat RLS is ingeschakeld
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Stap 3: Policy 1 - Gebruikers kunnen hun eigen profile lezen
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Stap 4: Policy 2 - Gebruikers kunnen hun eigen profile updaten
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Stap 5: Policy 3 - Gebruikers kunnen hun eigen profile aanmaken
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Stap 6: Policy 4 - Employers kunnen hun werknemers zien
-- Dit is belangrijk zodat employers hun werknemers kunnen beheren
-- Let op: We gebruiken een functie om circulaire dependencies te voorkomen
CREATE OR REPLACE FUNCTION public.is_employer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = user_id AND role = 'employer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Employers can view their employees"
  ON public.user_profiles
  FOR SELECT
  USING (
    -- Als de gebruiker een employer is (gebruik functie om circulaire dependency te voorkomen)
    public.is_employer(auth.uid())
    -- En het profile dat ze proberen te lezen is een werknemer
    AND role = 'employee'
    -- En de werknemer is gekoppeld aan deze employer
    AND (
      employer_id = auth.uid()
      OR employer_email IN (
        SELECT email FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'employer'
      )
    )
  );

-- Stap 7: Policy 5 - Employers kunnen hun werknemers updaten
CREATE POLICY "Employers can update their employees"
  ON public.user_profiles
  FOR UPDATE
  USING (
    -- Als de gebruiker een employer is (gebruik functie)
    public.is_employer(auth.uid())
    -- En het profile dat ze proberen te updaten is een werknemer
    AND role = 'employee'
    -- En de werknemer is gekoppeld aan deze employer
    AND (
      employer_id = auth.uid()
      OR employer_email IN (
        SELECT email FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'employer'
      )
    )
  )
  WITH CHECK (
    -- Zelfde check voor WITH CHECK
    public.is_employer(auth.uid())
    AND role = 'employee'
    AND (
      employer_id = auth.uid()
      OR employer_email IN (
        SELECT email FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'employer'
      )
    )
  );

-- Stap 8: Policy 6 - Admins kunnen alle profiles zien
-- Gebruik ook een functie om circulaire dependency te voorkomen
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Stap 9: Policy 7 - Email validatie (voor registratie)
-- Dit maakt het mogelijk om te checken of een email al bestaat
-- Let op: Deze policy geeft toegang tot alle rows, maar alleen voor SELECT
-- Dit is nodig voor email validatie tijdens registratie
-- Als je dit niet nodig hebt, kun je deze policy weglaten
-- CREATE POLICY "Allow email check for validation"
--   ON public.user_profiles
--   FOR SELECT
--   USING (true);

-- ============================================
-- Verificatie
-- ============================================
-- Voer deze query uit om te controleren of alle policies correct zijn aangemaakt:
-- SELECT 
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies 
-- WHERE tablename = 'user_profiles'
-- ORDER BY policyname;

-- ============================================
-- Test queries (optioneel)
-- ============================================
-- Test 1: Controleer of je je eigen profile kunt lezen
-- SELECT * FROM public.user_profiles WHERE id = auth.uid();

-- Test 2: Controleer of employers hun werknemers kunnen zien
-- SELECT * FROM public.user_profiles 
-- WHERE role = 'employee' 
-- AND (employer_id = auth.uid() OR employer_email IN (
--   SELECT email FROM public.user_profiles WHERE id = auth.uid() AND role = 'employer'
-- ));

