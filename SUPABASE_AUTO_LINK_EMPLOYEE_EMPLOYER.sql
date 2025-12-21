-- ============================================
-- Automatisch koppelen van werknemers aan werkgevers
-- ============================================
-- Dit script zorgt ervoor dat wanneer een werknemer zich aanmeldt
-- met een employer_email, deze automatisch wordt gekoppeld aan de
-- juiste werkgever via employer_id
-- ============================================

-- Stap 1: Voeg employer_id kolom toe aan user_profiles (als deze nog niet bestaat)
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
    
    -- Maak een index voor betere performance
    CREATE INDEX IF NOT EXISTS idx_user_profiles_employer_id 
      ON public.user_profiles(employer_id) 
      WHERE employer_id IS NOT NULL;
  END IF;
END $$;

-- Functie om employer_id automatisch te koppelen op basis van employer_email
CREATE OR REPLACE FUNCTION auto_link_employee_to_employer()
RETURNS TRIGGER AS $$
BEGIN
  -- Als dit een employee is met een employer_email maar geen employer_id
  IF NEW.role = 'employee' 
     AND NEW.employer_email IS NOT NULL 
     AND NEW.employer_id IS NULL THEN
    
    -- Zoek de employer op basis van email
    SELECT id INTO NEW.employer_id
    FROM user_profiles
    WHERE email = LOWER(TRIM(NEW.employer_email))
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

-- Trigger die automatisch wordt uitgevoerd VOOR insert of update
DROP TRIGGER IF EXISTS trigger_auto_link_employee_to_employer ON user_profiles;
CREATE TRIGGER trigger_auto_link_employee_to_employer
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_employee_to_employer();

-- ============================================
-- Update bestaande employees die nog geen employer_id hebben
-- ============================================
-- Dit script koppelt bestaande employees die al een employer_email hebben
-- maar nog geen employer_id aan hun werkgever

UPDATE user_profiles up_employee
SET employer_id = up_employer.id
FROM user_profiles up_employer
WHERE up_employee.role = 'employee'
  AND up_employee.employer_email IS NOT NULL
  AND up_employee.employer_id IS NULL
  AND up_employer.role = 'employer'
  AND LOWER(TRIM(up_employee.employer_email)) = LOWER(TRIM(up_employer.email));

-- ============================================
-- Index voor betere performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_employer_email 
  ON user_profiles(employer_email) 
  WHERE employer_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_employer_id 
  ON user_profiles(employer_id) 
  WHERE employer_id IS NOT NULL;

