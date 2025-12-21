-- ============================================
-- SIMPLE Fix RLS Policies for user_profiles table
-- ============================================
-- Dit script maakt eenvoudige RLS policies die gegarandeerd werken
-- zonder circulaire dependencies
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

-- Stap 2: Verwijder ook eventuele functies die we hebben gemaakt
DROP FUNCTION IF EXISTS public.is_employer(UUID);
DROP FUNCTION IF EXISTS public.is_admin(UUID);

-- Stap 3: Zorg ervoor dat RLS is ingeschakeld
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BASIS POLICIES (deze moeten altijd werken)
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
-- OPTIONELE POLICIES (voor employers)
-- ============================================
-- Deze policies zijn optioneel en kunnen later worden toegevoegd
-- als je zeker weet dat ze werken. Voor nu houden we het simpel.

-- Policy 4: Employers kunnen hun werknemers zien
-- We gebruiken een SECURITY DEFINER functie om circulaire dependencies te voorkomen
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.user_profiles
    WHERE id = user_id
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE POLICY "Employers can view their employees"
  ON public.user_profiles
  FOR SELECT
  USING (
    -- Als de gebruiker een employer is
    public.get_user_role(auth.uid()) = 'employer'
    -- En het profile dat ze proberen te lezen is een werknemer
    AND role = 'employee'
    -- En de werknemer is gekoppeld aan deze employer
    AND (
      employer_id = auth.uid()
      OR employer_email = (
        SELECT email FROM public.user_profiles
        WHERE id = auth.uid()
        LIMIT 1
      )
    )
  );

-- Policy 5: Employers kunnen hun werknemers updaten
CREATE POLICY "Employers can update their employees"
  ON public.user_profiles
  FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) = 'employer'
    AND role = 'employee'
    AND (
      employer_id = auth.uid()
      OR employer_email = (
        SELECT email FROM public.user_profiles
        WHERE id = auth.uid()
        LIMIT 1
      )
    )
  )
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'employer'
    AND role = 'employee'
    AND (
      employer_id = auth.uid()
      OR employer_email = (
        SELECT email FROM public.user_profiles
        WHERE id = auth.uid()
        LIMIT 1
      )
    )
  );

-- Policy 6: Admins kunnen alle profiles zien
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================
-- Verificatie
-- ============================================
-- Voer deze query uit om te controleren of alle policies correct zijn aangemaakt:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;



