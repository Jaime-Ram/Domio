-- ============================================
-- Fix: RLS Policies voor Shifts Tabel
-- ============================================
-- Dit script zorgt ervoor dat werkgevers shifts kunnen aanmaken
-- ============================================

-- Stap 1: Maak de shifts tabel aan (als deze nog niet bestaat)
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 0,
  position TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maak indexes aan (als ze nog niet bestaan)
CREATE INDEX IF NOT EXISTS idx_shifts_employer_id ON public.shifts(employer_id);
CREATE INDEX IF NOT EXISTS idx_shifts_employee_id ON public.shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON public.shifts(date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON public.shifts(status);

-- Stap 2: Verwijder oude policies (als ze bestaan)
DROP POLICY IF EXISTS "Employers can manage shifts" ON public.shifts;
DROP POLICY IF EXISTS "Employees can view own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Employers can insert shifts" ON public.shifts;
DROP POLICY IF EXISTS "Employers can update shifts" ON public.shifts;
DROP POLICY IF EXISTS "Employers can delete shifts" ON public.shifts;

-- Stap 3: Maak nieuwe, meer permissieve policies

-- Policy: Werkgevers kunnen shifts aanmaken
CREATE POLICY "Employers can insert shifts"
  ON public.shifts
  FOR INSERT
  WITH CHECK (
    auth.uid() = employer_id
    AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'employer'
    )
  );

-- Policy: Werkgevers kunnen hun eigen shifts bekijken
CREATE POLICY "Employers can view own shifts"
  ON public.shifts
  FOR SELECT
  USING (auth.uid() = employer_id);

-- Policy: Werkgevers kunnen hun eigen shifts updaten
CREATE POLICY "Employers can update own shifts"
  ON public.shifts
  FOR UPDATE
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

-- Policy: Werkgevers kunnen hun eigen shifts verwijderen
CREATE POLICY "Employers can delete own shifts"
  ON public.shifts
  FOR DELETE
  USING (auth.uid() = employer_id);

-- Policy: Werknemers kunnen hun eigen shifts bekijken
CREATE POLICY "Employees can view own shifts"
  ON public.shifts
  FOR SELECT
  USING (auth.uid() = employee_id);

-- Stap 4: Verifieer dat RLS is ingeschakeld
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Stap 5: Test query (optioneel - voer dit apart uit om te testen)
-- SELECT 
--   tablename,
--   rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename = 'shifts';

