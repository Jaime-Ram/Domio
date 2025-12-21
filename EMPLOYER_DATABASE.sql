-- ============================================
-- Restaurant Owner / Employer Database Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. SHIFTS / ROOSTER TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS shifts (
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

CREATE INDEX IF NOT EXISTS idx_shifts_employer_id ON shifts(employer_id);
CREATE INDEX IF NOT EXISTS idx_shifts_employee_id ON shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employers can manage shifts" ON shifts;
DROP POLICY IF EXISTS "Employees can view own shifts" ON shifts;

CREATE POLICY "Employers can manage shifts"
  ON shifts FOR ALL
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employees can view own shifts"
  ON shifts FOR SELECT
  USING (auth.uid() = employee_id);

-- ============================================
-- 2. RESTAURANT SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS restaurant_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  restaurant_name TEXT,
  restaurant_address TEXT,
  restaurant_phone TEXT,
  restaurant_email TEXT,
  opening_hours JSONB DEFAULT '{}',
  timezone TEXT DEFAULT 'Europe/Amsterdam',
  currency TEXT DEFAULT 'EUR',
  tax_rate DECIMAL(5, 2) DEFAULT 21.00,
  default_hourly_rate DECIMAL(10, 2),
  payment_schedule TEXT DEFAULT 'weekly' CHECK (payment_schedule IN ('daily', 'weekly', 'biweekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_settings_employer_id ON restaurant_settings(employer_id);

ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employers can manage restaurant settings" ON restaurant_settings;

CREATE POLICY "Employers can manage restaurant settings"
  ON restaurant_settings FOR ALL
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

-- ============================================
-- 3. EMPLOYEE DETAILS / EXTENDED INFO
-- ============================================

-- Add columns to user_profiles if they don't exist
DO $$ 
BEGIN
  -- Employee specific fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'hourly_rate') THEN
    ALTER TABLE user_profiles ADD COLUMN hourly_rate DECIMAL(10, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'position') THEN
    ALTER TABLE user_profiles ADD COLUMN position TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'hire_date') THEN
    ALTER TABLE user_profiles ADD COLUMN hire_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'phone_number') THEN
    ALTER TABLE user_profiles ADD COLUMN phone_number TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_active') THEN
    ALTER TABLE user_profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ============================================
-- 4. FINANCIAL REPORTS / ANALYTICS
-- ============================================

-- This will be calculated on-the-fly, but we can add a cache table if needed
CREATE TABLE IF NOT EXISTS financial_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  total_payments DECIMAL(12, 2) DEFAULT 0,
  total_hours DECIMAL(10, 2) DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employer_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_financial_summaries_employer_id ON financial_summaries(employer_id);
CREATE INDEX IF NOT EXISTS idx_financial_summaries_period ON financial_summaries(period_start, period_end);

ALTER TABLE financial_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employers can view own financial summaries" ON financial_summaries;

CREATE POLICY "Employers can view own financial summaries"
  ON financial_summaries FOR SELECT
  USING (auth.uid() = employer_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for shifts
DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON shifts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for restaurant_settings
DROP TRIGGER IF EXISTS update_restaurant_settings_updated_at ON restaurant_settings;
CREATE TRIGGER update_restaurant_settings_updated_at
  BEFORE UPDATE ON restaurant_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for financial_summaries
DROP TRIGGER IF EXISTS update_financial_summaries_updated_at ON financial_summaries;
CREATE TRIGGER update_financial_summaries_updated_at
  BEFORE UPDATE ON financial_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();




