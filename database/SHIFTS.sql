-- ============================================
-- Shifts Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing table if it exists (WARNING: This will delete all existing data!)
-- Uncomment the next line if you want to start fresh:
-- DROP TABLE IF EXISTS shifts CASCADE;

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TEXT NOT NULL, -- Changed to TEXT to avoid TIME parsing issues, can be cast to TIME in queries
  end_time TEXT NOT NULL, -- Changed to TEXT to avoid TIME parsing issues, can be cast to TIME in queries
  break_duration_minutes INTEGER DEFAULT 0,
  position TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If table already exists, add missing columns
DO $$ 
BEGIN
  -- Add employer_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'employer_id') THEN
    ALTER TABLE shifts ADD COLUMN employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add employee_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'employee_id') THEN
    ALTER TABLE shifts ADD COLUMN employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add date if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'date') THEN
    ALTER TABLE shifts ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;
  
  -- Add start_time if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'start_time') THEN
    ALTER TABLE shifts ADD COLUMN start_time TEXT NOT NULL DEFAULT '09:00';
  END IF;
  
  -- Add end_time if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'end_time') THEN
    ALTER TABLE shifts ADD COLUMN end_time TEXT NOT NULL DEFAULT '17:00';
  END IF;
  
  -- Add break_duration_minutes if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'break_duration_minutes') THEN
    ALTER TABLE shifts ADD COLUMN break_duration_minutes INTEGER DEFAULT 0;
  END IF;
  
  -- Add position if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'position') THEN
    ALTER TABLE shifts ADD COLUMN position TEXT;
  END IF;
  
  -- Add notes if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'notes') THEN
    ALTER TABLE shifts ADD COLUMN notes TEXT;
  END IF;
  
  -- Add status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'status') THEN
    ALTER TABLE shifts ADD COLUMN status TEXT NOT NULL DEFAULT 'scheduled';
    -- Add check constraint for status
    ALTER TABLE shifts ADD CONSTRAINT shifts_status_check CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'));
  END IF;
  
  -- Add created_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'created_at') THEN
    ALTER TABLE shifts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'updated_at') THEN
    ALTER TABLE shifts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Modify start_time and end_time to TEXT if they are TIME type
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'start_time' AND data_type = 'time without time zone') THEN
    ALTER TABLE shifts ALTER COLUMN start_time TYPE TEXT USING start_time::TEXT;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'end_time' AND data_type = 'time without time zone') THEN
    ALTER TABLE shifts ALTER COLUMN end_time TYPE TEXT USING end_time::TEXT;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shifts_employer_id ON shifts(employer_id);
CREATE INDEX IF NOT EXISTS idx_shifts_employee_id ON shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_employee_date ON shifts(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_shifts_employer_date ON shifts(employer_id, date);

-- Enable Row Level Security
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Employees can view own shifts" ON shifts;
DROP POLICY IF EXISTS "Employers can view employee shifts" ON shifts;
DROP POLICY IF EXISTS "Employers can insert shifts" ON shifts;
DROP POLICY IF EXISTS "Employers can update shifts" ON shifts;
DROP POLICY IF EXISTS "Employers can delete shifts" ON shifts;
DROP POLICY IF EXISTS "Employees can update own shifts" ON shifts;

-- Policy: Employees can view their own shifts
CREATE POLICY "Employees can view own shifts"
  ON shifts FOR SELECT
  USING (auth.uid() = employee_id);

-- Policy: Employers can view shifts of their employees
CREATE POLICY "Employers can view employee shifts"
  ON shifts FOR SELECT
  USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
      AND user_profiles.id = shifts.employer_id
    )
  );

-- Policy: Employers can insert shifts
CREATE POLICY "Employers can insert shifts"
  ON shifts FOR INSERT
  WITH CHECK (
    auth.uid() = employer_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
    )
  );

-- Policy: Employers can update shifts
CREATE POLICY "Employers can update shifts"
  ON shifts FOR UPDATE
  USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
      AND user_profiles.id = shifts.employer_id
    )
  )
  WITH CHECK (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
      AND user_profiles.id = shifts.employer_id
    )
  );

-- Policy: Employees can update their own shifts (for confirmation, etc.)
CREATE POLICY "Employees can update own shifts"
  ON shifts FOR UPDATE
  USING (auth.uid() = employee_id)
  WITH CHECK (auth.uid() = employee_id);

-- Policy: Employers can delete shifts
CREATE POLICY "Employers can delete shifts"
  ON shifts FOR DELETE
  USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
      AND user_profiles.id = shifts.employer_id
    )
  );

-- Create or replace function to update updated_at column (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON shifts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint for employee relationship
-- Note: The foreign key name 'shifts_employee_id_fkey' is used in the code
-- This should be automatically created by the REFERENCES clause above

