-- ============================================
-- POS Integrations Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Create pos_integrations table
CREATE TABLE IF NOT EXISTS pos_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('lightspeed', 'toast', 'square', 'untill', 'touchbistro', 'resengo', 'zenchef', 'formitable')),
  api_key TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  location_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sync_settings JSONB DEFAULT '{
    "sync_sales": true,
    "sync_employees": false,
    "sync_products": false,
    "sync_reservations": false,
    "sync_frequency": "15min"
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pos_integrations_user_id ON pos_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_integrations_provider ON pos_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_pos_integrations_is_active ON pos_integrations(is_active);

-- Enable Row Level Security
ALTER TABLE pos_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own POS integrations" ON pos_integrations;
DROP POLICY IF EXISTS "Users can view own POS integrations" ON pos_integrations;

-- Policy: Users can view their own integrations
CREATE POLICY "Users can view own POS integrations"
  ON pos_integrations FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can manage their own integrations
CREATE POLICY "Users can manage own POS integrations"
  ON pos_integrations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_pos_integrations_updated_at ON pos_integrations;
CREATE TRIGGER update_pos_integrations_updated_at
  BEFORE UPDATE ON pos_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sales Data Table (for synced POS data)
-- ============================================

CREATE TABLE IF NOT EXISTS sales_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pos_integration_id UUID REFERENCES pos_integrations(id) ON DELETE CASCADE,
  pos_order_id TEXT NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method TEXT,
  employee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_number TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pos_order_id)
);

-- Create indexes for sales_data
CREATE INDEX IF NOT EXISTS idx_sales_data_user_id ON sales_data(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_data_pos_integration_id ON sales_data(pos_integration_id);
CREATE INDEX IF NOT EXISTS idx_sales_data_sale_date ON sales_data(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_data_employee_id ON sales_data(employee_id);
CREATE INDEX IF NOT EXISTS idx_sales_data_pos_order_id ON sales_data(pos_order_id);

-- Enable Row Level Security
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own sales data" ON sales_data;
DROP POLICY IF EXISTS "Users can manage own sales data" ON sales_data;

-- Policy: Users can view their own sales data
CREATE POLICY "Users can view own sales data"
  ON sales_data FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert sales data (via service role)
-- Note: This requires service role key for server-side operations
-- For now, users can insert their own sales data
CREATE POLICY "Users can manage own sales data"
  ON sales_data FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_sales_data_updated_at ON sales_data;
CREATE TRIGGER update_sales_data_updated_at
  BEFORE UPDATE ON sales_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- POS Integrations Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Create pos_integrations table
CREATE TABLE IF NOT EXISTS pos_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('lightspeed', 'toast', 'square', 'untill', 'touchbistro', 'resengo', 'zenchef', 'formitable')),
  api_key TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  location_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sync_settings JSONB DEFAULT '{
    "sync_sales": true,
    "sync_employees": false,
    "sync_products": false,
    "sync_reservations": false,
    "sync_frequency": "15min"
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pos_integrations_user_id ON pos_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_integrations_provider ON pos_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_pos_integrations_is_active ON pos_integrations(is_active);

-- Enable Row Level Security
ALTER TABLE pos_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own POS integrations" ON pos_integrations;
DROP POLICY IF EXISTS "Users can view own POS integrations" ON pos_integrations;

-- Policy: Users can view their own integrations
CREATE POLICY "Users can view own POS integrations"
  ON pos_integrations FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can manage their own integrations
CREATE POLICY "Users can manage own POS integrations"
  ON pos_integrations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_pos_integrations_updated_at ON pos_integrations;
CREATE TRIGGER update_pos_integrations_updated_at
  BEFORE UPDATE ON pos_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sales Data Table (for synced POS data)
-- ============================================

CREATE TABLE IF NOT EXISTS sales_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pos_integration_id UUID REFERENCES pos_integrations(id) ON DELETE CASCADE,
  pos_order_id TEXT NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method TEXT,
  employee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_number TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pos_order_id)
);

-- Create indexes for sales_data
CREATE INDEX IF NOT EXISTS idx_sales_data_user_id ON sales_data(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_data_pos_integration_id ON sales_data(pos_integration_id);
CREATE INDEX IF NOT EXISTS idx_sales_data_sale_date ON sales_data(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_data_employee_id ON sales_data(employee_id);
CREATE INDEX IF NOT EXISTS idx_sales_data_pos_order_id ON sales_data(pos_order_id);

-- Enable Row Level Security
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own sales data" ON sales_data;
DROP POLICY IF EXISTS "Users can manage own sales data" ON sales_data;

-- Policy: Users can view their own sales data
CREATE POLICY "Users can view own sales data"
  ON sales_data FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert sales data (via service role)
-- Note: This requires service role key for server-side operations
-- For now, users can insert their own sales data
CREATE POLICY "Users can manage own sales data"
  ON sales_data FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_sales_data_updated_at ON sales_data;
CREATE TRIGGER update_sales_data_updated_at
  BEFORE UPDATE ON sales_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();




