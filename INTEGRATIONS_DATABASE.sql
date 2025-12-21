-- ============================================
-- POS Integraties Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Create pos_integrations table
CREATE TABLE IF NOT EXISTS pos_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('lightspeed', 'touchbistro', 'square', 'resengo', 'zenchef', 'formitable')),
  api_key TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  location_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sync_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pos_integrations_user_id ON pos_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_integrations_provider ON pos_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_pos_integrations_active ON pos_integrations(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE pos_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own integrations" ON pos_integrations;
DROP POLICY IF EXISTS "Users can insert own integrations" ON pos_integrations;
DROP POLICY IF EXISTS "Users can update own integrations" ON pos_integrations;
DROP POLICY IF EXISTS "Users can delete own integrations" ON pos_integrations;

-- Policy: Users can read their own integrations
CREATE POLICY "Users can view own integrations"
  ON pos_integrations FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own integrations
CREATE POLICY "Users can insert own integrations"
  ON pos_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own integrations
CREATE POLICY "Users can update own integrations"
  ON pos_integrations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own integrations
CREATE POLICY "Users can delete own integrations"
  ON pos_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_pos_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pos_integrations_updated_at
  BEFORE UPDATE ON pos_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_pos_integrations_updated_at();




