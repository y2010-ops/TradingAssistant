/*
  # Fix database schema and policies

  1. New Tables
    - No new tables created
  2. Security
    - Fix policy creation by using IF NOT EXISTS
    - Ensure all tables have RLS enabled
  3. Changes
    - Ensure all tables and indexes exist
    - Avoid duplicate policy creation
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with IF NOT EXISTS to avoid duplicates
DO $$
BEGIN
    -- Users policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read own data'
    ) THEN
        CREATE POLICY "Users can read own data" ON users
          FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own data'
    ) THEN
        CREATE POLICY "Users can update own data" ON users
          FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- User queries policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_queries' AND policyname = 'Users can read own queries'
    ) THEN
        CREATE POLICY "Users can read own queries" ON user_queries
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_queries' AND policyname = 'Users can insert own queries'
    ) THEN
        CREATE POLICY "Users can insert own queries" ON user_queries
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Portfolios policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'portfolios' AND policyname = 'Users can manage own portfolio'
    ) THEN
        CREATE POLICY "Users can manage own portfolio" ON portfolios
          FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Transactions policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can manage own transactions'
    ) THEN
        CREATE POLICY "Users can manage own transactions" ON transactions
          FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Watchlists policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'watchlists' AND policyname = 'Users can manage own watchlists'
    ) THEN
        CREATE POLICY "Users can manage own watchlists" ON watchlists
          FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'watchlists' AND policyname = 'Users can read public watchlists'
    ) THEN
        CREATE POLICY "Users can read public watchlists" ON watchlists
          FOR SELECT USING (is_public = true);
    END IF;

    -- Watchlist items policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'watchlist_items' AND policyname = 'Users can manage own watchlist items'
    ) THEN
        CREATE POLICY "Users can manage own watchlist items" ON watchlist_items
          FOR ALL USING (watchlist_id IN (
            SELECT id FROM watchlists WHERE user_id = auth.uid()
          ));
    END IF;

    -- Alerts policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'alerts' AND policyname = 'Users can manage own alerts'
    ) THEN
        CREATE POLICY "Users can manage own alerts" ON alerts
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Ensure indexes exist for better performance
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

-- Create text search indexes for stock search
CREATE INDEX IF NOT EXISTS idx_stocks_symbol_search ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_name_search ON stocks(name);
CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks(sector);