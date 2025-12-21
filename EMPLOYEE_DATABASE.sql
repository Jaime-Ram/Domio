-- ============================================
-- Employee Dashboard Database Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. EMPLOYEE AVAILABILITY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS employee_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_employee_availability_employee_id ON employee_availability(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_availability_day ON employee_availability(day_of_week);

ALTER TABLE employee_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees can manage own availability" ON employee_availability;

CREATE POLICY "Employees can manage own availability"
  ON employee_availability FOR ALL
  USING (auth.uid() = employee_id)
  WITH CHECK (auth.uid() = employee_id);

-- ============================================
-- 2. WORK HOURS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS work_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  break_duration_minutes INTEGER DEFAULT 0,
  total_hours DECIMAL(5, 2) GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0 - (break_duration_minutes::DECIMAL / 60.0)
  ) STORED,
  hourly_rate DECIMAL(10, 2),
  total_earnings DECIMAL(10, 2) GENERATED ALWAYS AS (
    (EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0 - (break_duration_minutes::DECIMAL / 60.0)) * COALESCE(hourly_rate, 0)
  ) STORED,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_hours_employee_id ON work_hours(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_employer_id ON work_hours(employer_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_date ON work_hours(date);
CREATE INDEX IF NOT EXISTS idx_work_hours_status ON work_hours(status);

ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees can view own work hours" ON work_hours;
DROP POLICY IF EXISTS "Employers can view employee work hours" ON work_hours;
DROP POLICY IF EXISTS "Employees can insert own work hours" ON work_hours;
DROP POLICY IF EXISTS "Employers can update work hours" ON work_hours;

CREATE POLICY "Employees can view own work hours"
  ON work_hours FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Employers can view employee work hours"
  ON work_hours FOR SELECT
  USING (auth.uid() = employer_id);

CREATE POLICY "Employees can insert own work hours"
  ON work_hours FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Employers can update work hours"
  ON work_hours FOR UPDATE
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

-- ============================================
-- 3. BANK ACCOUNT INFORMATION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS employee_bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_holder_name TEXT NOT NULL,
  iban TEXT NOT NULL,
  bank_name TEXT,
  is_primary BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_bank_accounts_employee_id ON employee_bank_accounts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_bank_accounts_primary ON employee_bank_accounts(employee_id, is_primary) WHERE is_primary = true;

ALTER TABLE employee_bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees can manage own bank accounts" ON employee_bank_accounts;

CREATE POLICY "Employees can manage own bank accounts"
  ON employee_bank_accounts FOR ALL
  USING (auth.uid() = employee_id)
  WITH CHECK (auth.uid() = employee_id);

-- ============================================
-- 4. UPDATE PAYMENTS TABLE (if needed)
-- ============================================

-- Add bank_account_id to payments if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'bank_account_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN bank_account_id UUID REFERENCES employee_bank_accounts(id);
  END IF;
END $$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for employee_availability
DROP TRIGGER IF EXISTS update_employee_availability_updated_at ON employee_availability;
CREATE TRIGGER update_employee_availability_updated_at
  BEFORE UPDATE ON employee_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for work_hours
DROP TRIGGER IF EXISTS update_work_hours_updated_at ON work_hours;
CREATE TRIGGER update_work_hours_updated_at
  BEFORE UPDATE ON work_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for employee_bank_accounts
DROP TRIGGER IF EXISTS update_employee_bank_accounts_updated_at ON employee_bank_accounts;
CREATE TRIGGER update_employee_bank_accounts_updated_at
  BEFORE UPDATE ON employee_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();




