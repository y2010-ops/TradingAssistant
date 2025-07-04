/*
  # Fix Policy Existence Checks

  1. New Tables
    - No new tables are created in this migration
  2. Security
    - Adds existence checks for policies before creating them
    - Ensures policies are only created if they don't already exist
  3. Changes
    - Fixes the "policy already exists" error by checking before creation
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Insert additional stock data if not already present
INSERT INTO stocks (symbol, name, sector)
VALUES
  ('ASIANPAINT', 'Asian Paints Limited', 'Chemicals'),
  ('HCLTECH', 'HCL Technologies Limited', 'IT'),
  ('BAJFINANCE', 'Bajaj Finance Limited', 'Financial Services'),
  ('WIPRO', 'Wipro Limited', 'IT')
ON CONFLICT (symbol) DO NOTHING;