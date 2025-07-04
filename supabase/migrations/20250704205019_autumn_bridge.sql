/*
  # Fix Policy Existence Checks for Trading Assistant Schema

  1. Changes
    - Adds existence checks for policies before creating them
    - Ensures policies are only created if they don't already exist
    - Maintains all the same tables and functionality
  2. Security
    - Properly enables RLS on all tables
    - Creates policies only if they don't exist
  3. Data
    - Preserves initial stock data insertion
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stocks table if it doesn't exist
CREATE TABLE IF NOT EXISTS stocks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol character varying(20) NOT NULL UNIQUE,
  name character varying(200) NOT NULL,
  sector character varying(100),
  current_price numeric(10,2),
  volume bigint,
  market_cap bigint,
  pe numeric(8,2),
  pb numeric(8,2),
  dividend numeric(5,2),
  high_52w numeric(10,2),
  low_52w numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sentiment_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS sentiment_data (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol character varying(20) NOT NULL,
  source character varying(50) NOT NULL,
  sentiment_score numeric(5,4) NOT NULL CHECK (sentiment_score >= -1.0000 AND sentiment_score <= 1.0000),
  content text,
  url character varying(500),
  mentions integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trading_signals table if it doesn't exist
CREATE TABLE IF NOT EXISTS trading_signals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol character varying(20) NOT NULL,
  action character varying(10) NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
  confidence integer NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  target_price numeric(10,2),
  stop_loss numeric(10,2),
  reasoning text,
  technical_score numeric(5,4),
  sentiment_score numeric(5,4),
  fundamental_score numeric(5,4),
  ai_score numeric(3,1),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create price_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol character varying(20) NOT NULL,
  date date NOT NULL,
  open numeric(10,2) NOT NULL,
  high numeric(10,2) NOT NULL,
  low numeric(10,2) NOT NULL,
  close numeric(10,2) NOT NULL,
  volume bigint NOT NULL,
  adjusted_close numeric(10,2),
  dividend_amount numeric(8,4) DEFAULT 0,
  split_coefficient numeric(8,4) DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint for price_history if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'price_history_symbol_date_key' 
    AND table_name = 'price_history'
  ) THEN
    ALTER TABLE price_history ADD CONSTRAINT price_history_symbol_date_key UNIQUE(symbol, date);
  END IF;
END $$;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email character varying(255) NOT NULL UNIQUE,
  password character varying(255) NOT NULL,
  first_name character varying(100),
  last_name character varying(100),
  trading_experience character varying(20) DEFAULT 'beginner' CHECK (trading_experience IN ('beginner', 'intermediate', 'advanced')),
  risk_tolerance character varying(20) DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  preferred_sectors jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  email_verified boolean DEFAULT false,
  subscription_tier character varying(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_queries table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_queries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  query text NOT NULL,
  response text,
  sentiment_score numeric(5,4) CHECK (sentiment_score >= -1.0000 AND sentiment_score <= 1.0000),
  intent character varying(100),
  confidence numeric(5,4) CHECK (confidence >= 0.0000 AND confidence <= 1.0000),
  response_time integer,
  session_id character varying(100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create portfolios table if it doesn't exist
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol character varying(20) NOT NULL,
  quantity integer NOT NULL CHECK (quantity >= 0),
  avg_price numeric(10,2) NOT NULL CHECK (avg_price >= 0),
  total_invested numeric(15,2) NOT NULL CHECK (total_invested >= 0),
  current_value numeric(15,2),
  unrealized_pnl numeric(15,2),
  realized_pnl numeric(15,2) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint for portfolios if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'portfolios_user_id_symbol_key' 
    AND table_name = 'portfolios'
  ) THEN
    ALTER TABLE portfolios ADD CONSTRAINT portfolios_user_id_symbol_key UNIQUE(user_id, symbol);
  END IF;
END $$;

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol character varying(20) NOT NULL,
  type character varying(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity integer NOT NULL CHECK (quantity >= 1),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  total_amount numeric(15,2) NOT NULL,
  fees numeric(10,2) DEFAULT 0,
  taxes numeric(10,2) DEFAULT 0,
  net_amount numeric(15,2) NOT NULL,
  transaction_date timestamptz DEFAULT now(),
  broker character varying(100),
  order_id character varying(100),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create watchlists table if it doesn't exist
CREATE TABLE IF NOT EXISTS watchlists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name character varying(100) NOT NULL DEFAULT 'My Watchlist',
  description text,
  is_default boolean DEFAULT false,
  is_public boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create watchlist_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS watchlist_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id uuid NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  symbol character varying(20) NOT NULL,
  target_price numeric(10,2),
  stop_loss numeric(10,2),
  notes text,
  alert_enabled boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint for watchlist_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'watchlist_items_watchlist_id_symbol_key' 
    AND table_name = 'watchlist_items'
  ) THEN
    ALTER TABLE watchlist_items ADD CONSTRAINT watchlist_items_watchlist_id_symbol_key UNIQUE(watchlist_id, symbol);
  END IF;
END $$;

-- Create alerts table if it doesn't exist
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol character varying(20) NOT NULL,
  type character varying(20) NOT NULL CHECK (type IN ('PRICE_ABOVE', 'PRICE_BELOW', 'VOLUME_SPIKE', 'NEWS_SENTIMENT', 'TECHNICAL_SIGNAL')),
  condition jsonb NOT NULL,
  message text,
  is_active boolean DEFAULT true,
  is_triggered boolean DEFAULT false,
  triggered_at timestamptz,
  expires_at timestamptz,
  notification_method character varying(20) DEFAULT 'IN_APP' CHECK (notification_method IN ('EMAIL', 'PUSH', 'SMS', 'IN_APP')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_sentiment_data_symbol ON sentiment_data(symbol);
CREATE INDEX IF NOT EXISTS idx_sentiment_data_created_at ON sentiment_data(created_at);

CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_signals_created_at ON trading_signals(created_at);

CREATE INDEX IF NOT EXISTS idx_price_history_symbol ON price_history(symbol);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date);

CREATE INDEX IF NOT EXISTS idx_user_queries_user_id ON user_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_queries_created_at ON user_queries(created_at);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);

CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);

CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON alerts(symbol);

-- Enable Row Level Security (RLS) only if not already enabled
DO $$
BEGIN
  -- Enable RLS on users table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'users' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on user_queries table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'user_queries' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on portfolios table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'portfolios' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on transactions table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'transactions' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on watchlists table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'watchlists' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on watchlist_items table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'watchlist_items' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on alerts table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'alerts' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS policies only if they don't exist
DO $$
BEGIN
  -- Users can read their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data" ON users
      FOR SELECT USING (auth.uid() = id);
  END IF;

  -- Users can update their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data" ON users
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Users can read their own queries
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_queries' 
    AND policyname = 'Users can read own queries'
  ) THEN
    CREATE POLICY "Users can read own queries" ON user_queries
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Users can insert their own queries
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_queries' 
    AND policyname = 'Users can insert own queries'
  ) THEN
    CREATE POLICY "Users can insert own queries" ON user_queries
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can manage their own portfolio
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'portfolios' 
    AND policyname = 'Users can manage own portfolio'
  ) THEN
    CREATE POLICY "Users can manage own portfolio" ON portfolios
      FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Users can manage their own transactions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'transactions' 
    AND policyname = 'Users can manage own transactions'
  ) THEN
    CREATE POLICY "Users can manage own transactions" ON transactions
      FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Users can manage their own watchlists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'watchlists' 
    AND policyname = 'Users can manage own watchlists'
  ) THEN
    CREATE POLICY "Users can manage own watchlists" ON watchlists
      FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Users can read public watchlists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'watchlists' 
    AND policyname = 'Users can read public watchlists'
  ) THEN
    CREATE POLICY "Users can read public watchlists" ON watchlists
      FOR SELECT USING (is_public = true);
  END IF;

  -- Users can manage their own watchlist items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'watchlist_items' 
    AND policyname = 'Users can manage own watchlist items'
  ) THEN
    CREATE POLICY "Users can manage own watchlist items" ON watchlist_items
      FOR ALL USING (watchlist_id IN (
        SELECT id FROM watchlists WHERE user_id = auth.uid()
      ));
  END IF;

  -- Users can manage their own alerts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'alerts' 
    AND policyname = 'Users can manage own alerts'
  ) THEN
    CREATE POLICY "Users can manage own alerts" ON alerts
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Insert initial stock data (only if not already present)
INSERT INTO stocks (symbol, name, sector)
VALUES
  ('RELIANCE', 'Reliance Industries Limited', 'Energy'),
  ('TCS', 'Tata Consultancy Services', 'IT'),
  ('HDFCBANK', 'HDFC Bank Limited', 'Banking'),
  ('INFY', 'Infosys Limited', 'IT'),
  ('ITC', 'ITC Limited', 'FMCG'),
  ('SBIN', 'State Bank of India', 'Banking'),
  ('KOTAKBANK', 'Kotak Mahindra Bank', 'Banking'),
  ('BHARTIARTL', 'Bharti Airtel Limited', 'Telecom'),
  ('ASIANPAINT', 'Asian Paints Limited', 'Chemicals'),
  ('HCLTECH', 'HCL Technologies Limited', 'IT'),
  ('BAJFINANCE', 'Bajaj Finance Limited', 'Financial Services'),
  ('WIPRO', 'Wipro Limited', 'IT')
ON CONFLICT (symbol) DO NOTHING;