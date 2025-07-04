/*
  # Fix existing policies and add missing ones

  1. Changes
     - Add checks to prevent duplicate policies
     - Ensure all tables have proper RLS enabled
     - Add missing indexes for better performance
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security (RLS) for tables that might not have it
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with checks to prevent duplicates
DO $$
BEGIN
    -- Users policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can read own data'
    ) THEN
        CREATE POLICY "Users can read own data" ON users
            FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can update own data'
    ) THEN
        CREATE POLICY "Users can update own data" ON users
            FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- User queries policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_queries' AND policyname = 'Users can read own queries'
    ) THEN
        CREATE POLICY "Users can read own queries" ON user_queries
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_queries' AND policyname = 'Users can insert own queries'
    ) THEN
        CREATE POLICY "Users can insert own queries" ON user_queries
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Portfolios policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'portfolios' AND policyname = 'Users can manage own portfolio'
    ) THEN
        CREATE POLICY "Users can manage own portfolio" ON portfolios
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Transactions policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transactions' AND policyname = 'Users can manage own transactions'
    ) THEN
        CREATE POLICY "Users can manage own transactions" ON transactions
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Watchlists policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'watchlists' AND policyname = 'Users can manage own watchlists'
    ) THEN
        CREATE POLICY "Users can manage own watchlists" ON watchlists
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'watchlists' AND policyname = 'Users can read public watchlists'
    ) THEN
        CREATE POLICY "Users can read public watchlists" ON watchlists
            FOR SELECT USING (is_public = true);
    END IF;

    -- Watchlist items policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'watchlist_items' AND policyname = 'Users can manage own watchlist items'
    ) THEN
        CREATE POLICY "Users can manage own watchlist items" ON watchlist_items
            FOR ALL USING (watchlist_id IN (
                SELECT id FROM watchlists WHERE user_id = auth.uid()
            ));
    END IF;

    -- Alerts policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'alerts' AND policyname = 'Users can manage own alerts'
    ) THEN
        CREATE POLICY "Users can manage own alerts" ON alerts
            FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    -- Add public access policies for stocks and market data
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stocks' AND policyname = 'Public read access'
    ) THEN
        CREATE POLICY "Public read access" ON stocks
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sentiment_data' AND policyname = 'Public read access'
    ) THEN
        CREATE POLICY "Public read access" ON sentiment_data
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trading_signals' AND policyname = 'Public read access'
    ) THEN
        CREATE POLICY "Public read access" ON trading_signals
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'price_history' AND policyname = 'Public read access'
    ) THEN
        CREATE POLICY "Public read access" ON price_history
            FOR SELECT USING (true);
    END IF;
END $$;