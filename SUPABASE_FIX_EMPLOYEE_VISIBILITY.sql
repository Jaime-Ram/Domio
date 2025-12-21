-- ============================================
-- Fix: Werknemers zichtbaar maken voor werkgevers
-- ============================================
-- Dit script zorgt ervoor dat werknemers die een employer_email hebben
-- maar nog geen employer_id, automatisch worden gekoppeld
-- ============================================

-- Stap 1: Controleer en voeg employer_id kolom toe (als deze nog niet bestaat)
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
    
    CREATE INDEX IF NOT EXISTS idx_user_profiles_employer_id 
      ON public.user_profiles(employer_id) 
      WHERE employer_id IS NOT NULL;
  END IF;
END $$;

-- Stap 2: Update alle bestaande werknemers die een employer_email hebben
-- maar nog geen employer_id, door ze te koppelen aan de juiste werkgever
UPDATE public.user_profiles up_employee
SET employer_id = up_employer.id
FROM public.user_profiles up_employer
WHERE up_employee.role = 'employee'
  AND up_employee.employer_email IS NOT NULL
  AND (up_employee.employer_id IS NULL OR up_employee.employer_id != up_employer.id)
  AND up_employer.role = 'employer'
  AND LOWER(TRIM(up_employee.employer_email)) = LOWER(TRIM(up_employer.email));

-- Stap 3: Zorg ervoor dat de trigger functie bestaat en werkt
CREATE OR REPLACE FUNCTION public.auto_link_employee_to_employer()
RETURNS TRIGGER AS $$
BEGIN
  -- Als dit een employee is met een employer_email maar geen employer_id
  IF NEW.role = 'employee' 
     AND NEW.employer_email IS NOT NULL 
     AND (NEW.employer_id IS NULL OR NEW.employer_id != (
       SELECT id FROM public.user_profiles 
       WHERE email = LOWER(TRIM(NEW.employer_email)) 
       AND role = 'employer' 
       LIMIT 1
     )) THEN
    
    -- Zoek de employer op basis van email (case-insensitive, trimmed)
    SELECT id INTO NEW.employer_id
    FROM public.user_profiles
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.employer_email))
      AND role = 'employer'
    LIMIT 1;
    
    -- Als er geen employer gevonden is, log een waarschuwing
    IF NEW.employer_id IS NULL THEN
      RAISE WARNING 'Geen werkgever gevonden met email: %', NEW.employer_email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Stap 4: Zorg ervoor dat de trigger bestaat
DROP TRIGGER IF EXISTS trigger_auto_link_employee_to_employer ON public.user_profiles;
CREATE TRIGGER trigger_auto_link_employee_to_employer
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_employee_to_employer();

-- Stap 5: Maak indexes voor betere performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_employer_email 
  ON public.user_profiles(LOWER(TRIM(employer_email))) 
  WHERE employer_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_email_lower 
  ON public.user_profiles(LOWER(TRIM(email)));

-- Stap 6: Verifieer de resultaten
-- (Dit is alleen voor informatie, voer dit apart uit om te zien wat er is gekoppeld)
-- SELECT 
--   up_employee.id as employee_id,
--   up_employee.full_name as employee_name,
--   up_employee.email as employee_email,
--   up_employee.employer_email,
--   up_employee.employer_id,
--   up_employer.email as employer_email_match,
--   up_employer.id as employer_id_match
-- FROM public.user_profiles up_employee
-- LEFT JOIN public.user_profiles up_employer ON up_employee.employer_id = up_employer.id
-- WHERE up_employee.role = 'employee'
-- ORDER BY up_employee.created_at DESC;




