-- ============================================
-- Complete Fix: Werknemers automatisch koppelen aan werkgevers
-- ============================================
-- Dit script zorgt ervoor dat:
-- 1. De employer_id kolom bestaat
-- 2. Alle bestaande werknemers worden gekoppeld aan hun werkgever
-- 3. Nieuwe werknemers automatisch worden gekoppeld via een trigger
-- ============================================

-- Stap 1: Voeg employer_id kolom toe (als deze nog niet bestaat)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'employer_id'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN employer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'employer_id kolom toegevoegd aan user_profiles';
  ELSE
    RAISE NOTICE 'employer_id kolom bestaat al';
  END IF;
END $$;

-- Stap 2: Maak indexes voor betere performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_employer_id 
  ON public.user_profiles(employer_id) 
  WHERE employer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_employer_email_lower 
  ON public.user_profiles(LOWER(TRIM(employer_email))) 
  WHERE employer_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_email_lower 
  ON public.user_profiles(LOWER(TRIM(email)));

-- Stap 3: Functie om employer_id automatisch te koppelen
CREATE OR REPLACE FUNCTION public.auto_link_employee_to_employer()
RETURNS TRIGGER AS $$
DECLARE
  employer_user_id UUID;
BEGIN
  -- Alleen voor employees met employer_email maar zonder employer_id
  IF NEW.role = 'employee' 
     AND NEW.employer_email IS NOT NULL 
     AND (NEW.employer_id IS NULL OR NEW.employer_id != (
       SELECT id FROM public.user_profiles 
       WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.employer_email)) 
       AND role = 'employer' 
       LIMIT 1
     )) THEN
    
    -- Zoek de employer op basis van email (case-insensitive, trimmed)
    SELECT id INTO employer_user_id
    FROM public.user_profiles
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.employer_email))
      AND role = 'employer'
    LIMIT 1;
    
    -- Als er een employer gevonden is, koppel deze
    IF employer_user_id IS NOT NULL THEN
      NEW.employer_id := employer_user_id;
      RAISE NOTICE 'Werknemer % gekoppeld aan werkgever % (email: %)', NEW.id, employer_user_id, NEW.employer_email;
    ELSE
      RAISE WARNING 'Geen werkgever gevonden met email: %', NEW.employer_email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Stap 4: Maak de trigger aan
DROP TRIGGER IF EXISTS trigger_auto_link_employee_to_employer ON public.user_profiles;
CREATE TRIGGER trigger_auto_link_employee_to_employer
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_employee_to_employer();

-- Stap 5: Update ALLE bestaande employees die een employer_email hebben
-- maar nog geen employer_id (of een verkeerde employer_id)
UPDATE public.user_profiles up_employee
SET employer_id = up_employer.id
FROM public.user_profiles up_employer
WHERE up_employee.role = 'employee'
  AND up_employee.employer_email IS NOT NULL
  AND LOWER(TRIM(up_employee.employer_email)) = LOWER(TRIM(up_employer.email))
  AND up_employer.role = 'employer'
  AND (up_employee.employer_id IS NULL OR up_employee.employer_id != up_employer.id);

-- Stap 6: Verifieer de resultaten (optioneel - voer dit apart uit om te zien)
-- SELECT 
--   up_employee.id as employee_id,
--   up_employee.full_name as employee_name,
--   up_employee.email as employee_email,
--   up_employee.employer_email,
--   up_employee.employer_id,
--   up_employer.email as employer_email_match,
--   up_employer.id as employer_id_match,
--   CASE 
--     WHEN up_employee.employer_id = up_employer.id THEN '✓ Gekoppeld'
--     WHEN up_employee.employer_email IS NOT NULL AND up_employer.id IS NULL THEN '✗ Geen werkgever gevonden'
--     WHEN up_employee.employer_id IS NULL THEN '✗ Geen employer_id'
--     ELSE '? Onbekend'
--   END as status
-- FROM public.user_profiles up_employee
-- LEFT JOIN public.user_profiles up_employer ON up_employee.employer_id = up_employer.id
-- WHERE up_employee.role = 'employee'
-- ORDER BY up_employee.created_at DESC;




