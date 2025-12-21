-- ============================================
-- Fix Shifts Table - Convert TIME to TEXT
-- Run this in Supabase SQL Editor if you're getting
-- "The string did not match the expected pattern" errors
-- ============================================

-- First, check the current column types
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'shifts' 
  AND column_name IN ('start_time', 'end_time');

-- If the columns are TIME type, convert them to TEXT
-- This will preserve existing data by converting TIME to TEXT format
DO $$ 
BEGIN
  -- Check if start_time is TIME type and convert to TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shifts' 
    AND column_name = 'start_time' 
    AND data_type = 'time without time zone'
  ) THEN
    ALTER TABLE shifts 
      ALTER COLUMN start_time TYPE TEXT 
      USING start_time::TEXT;
    
    RAISE NOTICE 'Converted start_time from TIME to TEXT';
  END IF;
  
  -- Check if end_time is TIME type and convert to TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shifts' 
    AND column_name = 'end_time' 
    AND data_type = 'time without time zone'
  ) THEN
    ALTER TABLE shifts 
      ALTER COLUMN end_time TYPE TEXT 
      USING end_time::TEXT;
    
    RAISE NOTICE 'Converted end_time from TIME to TEXT';
  END IF;
  
  -- If columns don't exist, add them
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shifts' 
    AND column_name = 'start_time'
  ) THEN
    ALTER TABLE shifts ADD COLUMN start_time TEXT;
    RAISE NOTICE 'Added start_time column as TEXT';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shifts' 
    AND column_name = 'end_time'
  ) THEN
    ALTER TABLE shifts ADD COLUMN end_time TEXT;
    RAISE NOTICE 'Added end_time column as TEXT';
  END IF;
END $$;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'shifts' 
  AND column_name IN ('start_time', 'end_time');



