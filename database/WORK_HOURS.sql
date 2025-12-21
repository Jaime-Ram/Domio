-- ============================================
-- Work Hours Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Create work_hours table
CREATE TABLE IF NOT EXISTS work_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  break_duration_minutes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  hourly_rate DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_work_hours_employee_id ON work_hours(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_employer_id ON work_hours(employer_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_date ON work_hours(date);
CREATE INDEX IF NOT EXISTS idx_work_hours_status ON work_hours(status);
CREATE INDEX IF NOT EXISTS idx_work_hours_employee_date ON work_hours(employee_id, date);

-- Enable Row Level Security
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Employees can view own work hours" ON work_hours;
DROP POLICY IF EXISTS "Employers can view employee work hours" ON work_hours;
DROP POLICY IF EXISTS "Employees can insert own work hours" ON work_hours;
DROP POLICY IF EXISTS "Employers can update work hours" ON work_hours;
DROP POLICY IF EXISTS "Employers can delete work hours" ON work_hours;

-- Policy: Employees can view their own work hours
CREATE POLICY "Employees can view own work hours"
  ON work_hours FOR SELECT
  USING (auth.uid() = employee_id);

-- Policy: Employers can view work hours of their employees
CREATE POLICY "Employers can view employee work hours"
  ON work_hours FOR SELECT
  USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
      AND user_profiles.id = work_hours.employer_id
    )
  );

-- Policy: Employees can insert their own work hours
CREATE POLICY "Employees can insert own work hours"
  ON work_hours FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

-- Policy: Employers can update work hours (for approval, rejection, etc.)
CREATE POLICY "Employers can update work hours"
  ON work_hours FOR UPDATE
  USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
      AND user_profiles.id = work_hours.employer_id
    )
  )
  WITH CHECK (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
      AND user_profiles.id = work_hours.employer_id
    )
  );

-- Policy: Employers can delete work hours
CREATE POLICY "Employers can delete work hours"
  ON work_hours FOR DELETE
  USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
      AND user_profiles.id = work_hours.employer_id
    )
  );

-- Create or replace function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_work_hours_updated_at ON work_hours;
CREATE TRIGGER update_work_hours_updated_at
  BEFORE UPDATE ON work_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint for employee relationship (if using user_profiles)
-- Note: This assumes you have a user_profiles table with id matching auth.users(id)
-- If the foreign key name is different, adjust accordingly
-- The foreign key name 'work_hours_employee_id_fkey' is used in the code

-- Work Hours Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Create work_hours table
CREATE TABLE IF NOT EXISTS work_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  break_duration_minutes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  hourly_rate DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_work_hours_employee_id ON work_hours(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_employer_id ON work_hours(employer_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_date ON work_hours(date);
CREATE INDEX IF NOT EXISTS idx_work_hours_status ON work_hours(status);
CREATE INDEX IF NOT EXISTS idx_work_hours_employee_date ON work_hours(employee_id, date);

-- Enable Row Level Security
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Employees can view own work hours" ON work_hours;
DROP POLICY IF EXISTS "Employers can view employee work hours" ON work_hours;
DROP POLICY IF EXISTS "Employees can insert own work hours" ON work_hours;
DROP POLICY IF EXISTS "Employers can update work hours" ON work_hours;
DROP POLICY IF EXISTS "Employers can delete work hours" ON work_hours;

-- Policy: Employees can view their own work hours
CREATE POLICY "Employees can view own work hours"
  ON work_hours FOR SELECT
  USING (auth.uid() = employee_id);

-- Policy: Employers can view work hours of their employees
CREATE POLICY "Employers can view employee work hours"
  ON work_hours FOR SELECT
  USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
      AND user_profiles.id = work_hours.employer_id
    )
  );

-- Policy: Employees can insert their own work hours
CREATE POLICY "Employees can insert own work hours"
  ON work_hours FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

-- Policy: Employers can update work hours (for approval, rejection, etc.)
CREATE POLICY "Employers can update work hours"
  ON work_hours FOR UPDATE
  USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
      AND user_profiles.id = work_hours.employer_id
    )
  )
  WITH CHECK (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
      AND user_profiles.id = work_hours.employer_id
    )
  );

-- Policy: Employers can delete work hours
CREATE POLICY "Employers can delete work hours"
  ON work_hours FOR DELETE
  USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'employer'
      AND user_profiles.id = work_hours.employer_id
    )
  );

-- Create or replace function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_work_hours_updated_at ON work_hours;
CREATE TRIGGER update_work_hours_updated_at
  BEFORE UPDATE ON work_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint for employee relationship (if using user_profiles)
-- Note: This assumes you have a user_profiles table with id matching auth.users(id)
-- If the foreign key name is different, adjust accordingly
-- The foreign key name 'work_hours_employee_id_fkey' is used in the code




