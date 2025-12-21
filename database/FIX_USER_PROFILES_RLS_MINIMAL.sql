-- ============================================
-- MINIMAL Fix RLS Policies for user_profiles table
-- ============================================
-- Dit script maakt alleen de ALLERBELANGRIJKSTE RLS policies
-- zonder enige complexiteit. Dit zou gegarandeerd moeten werken.
-- ============================================

-- Stap 1: Verwijder ALLE bestaande policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.user_profiles';
    END LOOP;
END $$;

-- Stap 2: Verwijder eventuele functies
DROP FUNCTION IF EXISTS public.is_employer(UUID);
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.get_user_role(UUID);

-- Stap 3: Zorg ervoor dat RLS is ingeschakeld
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ALLEEN BASIS POLICIES (geen complexiteit)
-- ============================================

-- Policy 1: Gebruikers kunnen hun eigen profile lezen
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Gebruikers kunnen hun eigen profile updaten
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Gebruikers kunnen hun eigen profile aanmaken
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- DAT IS HET! Geen andere policies.
-- ============================================
-- Deze drie policies zijn voldoende om gebruikers hun eigen profile te laten lezen/updaten/aanmaken.
-- 
-- Als je later employers hun werknemers wilt laten zien, kunnen we dat toevoegen,
-- maar eerst moeten we zeker weten dat deze basis policies werken.
-- ============================================

-- Verificatie
SELECT 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;



