/*
  # Initial Trading Assistant Database Schema

  1. New Tables
    - `users` - User accounts and profiles
    - `stocks` - Stock master data
    - `sentiment_data` - Sentiment analysis results
    - `trading_signals` - AI-generated trading signals
    - `user_queries` - Chat interactions with AI
    - `portfolios` - User portfolio holdings
    - `transactions` - Buy/sell transactions
    - `price_history` - Historical price data
    - `watchlists` - User watchlists
    - `watchlist_items` - Items in watchlists
    - `alerts` - Price and signal alerts

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Secure sensitive operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  trading_experience VARCHAR(20) DEFAULT 'beginner' CHECK (trading_experience IN ('beginner', 'intermediate', 'advanced')),
  risk_tolerance VARCHAR(20) DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  preferred_sectors JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT false,
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stocks table
CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  sector VARCHAR(100),
  current_price DECIMAL(10,2),
  volume BIGINT,
  market_cap BIGINT,
  pe DECIMAL(8,2),
  pb DECIMAL(8,2),
  dividend DECIMAL(5,2),
  high_52w DECIMAL(10,2),
  low_52w DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sentiment data table
CREATE TABLE IF NOT EXISTS sentiment_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(20) NOT NULL,
  source VARCHAR(50) NOT NULL,
  sentiment_score DECIMAL(5,4) NOT NULL CHECK (sentiment_score >= -1.0000 AND sentiment_score <= 1.0000),
  content TEXT,
  url VARCHAR(500),
  mentions INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trading signals table
CREATE TABLE IF NOT EXISTS trading_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(20) NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  target_price DECIMAL(10,2),
  stop_loss DECIMAL(10,2),
  reasoning TEXT,
  technical_score DECIMAL(5,4),
  sentiment_score DECIMAL(5,4),
  fundamental_score DECIMAL(5,4),
  ai_score DECIMAL(3,1),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User queries table
CREATE TABLE IF NOT EXISTS user_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT,
  sentiment_score DECIMAL(5,4) CHECK (sentiment_score >= -1.0000 AND sentiment_score <= 1.0000),
  intent VARCHAR(100),
  confidence DECIMAL(5,4) CHECK (confidence >= 0.0000 AND confidence <= 1.0000),
  response_time INTEGER,
  session_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  avg_price DECIMAL(10,2) NOT NULL CHECK (avg_price >= 0),
  total_invested DECIMAL(15,2) NOT NULL CHECK (total_invested >= 0),
  current_value DECIMAL(15,2),
  unrealized_pnl DECIMAL(15,2),
  realized_pnl DECIMAL(15,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  total_amount DECIMAL(15,2) NOT NULL,
  fees DECIMAL(10,2) DEFAULT 0,
  taxes DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(15,2) NOT NULL,
  transaction_date TIMESTAMPTZ DEFAULT now(),
  broker VARCHAR(100),
  order_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  open DECIMAL(10,2) NOT NULL,
  high DECIMAL(10,2) NOT NULL,
  low DECIMAL(10,2) NOT NULL,
  close DECIMAL(10,2) NOT NULL,
  volume BIGINT NOT NULL,
  adjusted_close DECIMAL(10,2),
  dividend_amount DECIMAL(8,4) DEFAULT 0,
  split_coefficient DECIMAL(8,4) DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(symbol, date)
);

-- Watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL DEFAULT 'My Watchlist',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Watchlist items table
CREATE TABLE IF NOT EXISTS watchlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  target_price DECIMAL(10,2),
  stop_loss DECIMAL(10,2),
  notes TEXT,
  alert_enabled BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(watchlist_id, symbol)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('PRICE_ABOVE', 'PRICE_BELOW', 'VOLUME_SPIKE', 'NEWS_SENTIMENT', 'TECHNICAL_SIGNAL')),
  condition JSONB NOT NULL,
  message TEXT,
  is_active BOOLEAN DEFAULT true,
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  notification_method VARCHAR(20) DEFAULT 'IN_APP' CHECK (notification_method IN ('EMAIL', 'PUSH', 'SMS', 'IN_APP')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sentiment_data_symbol ON sentiment_data(symbol);
CREATE INDEX IF NOT EXISTS idx_sentiment_data_created_at ON sentiment_data(created_at);
CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_signals_created_at ON trading_signals(created_at);
CREATE INDEX IF NOT EXISTS idx_user_queries_user_id ON user_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_queries_created_at ON user_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_price_history_symbol ON price_history(symbol);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON alerts(symbol);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_queries table
CREATE POLICY "Users can read own queries"
  ON user_queries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queries"
  ON user_queries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for portfolios table
CREATE POLICY "Users can manage own portfolio"
  ON portfolios
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for transactions table
CREATE POLICY "Users can manage own transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for watchlists table
CREATE POLICY "Users can manage own watchlists"
  ON watchlists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read public watchlists"
  ON watchlists
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- RLS Policies for watchlist_items table
CREATE POLICY "Users can manage own watchlist items"
  ON watchlist_items
  FOR ALL
  TO authenticated
  USING (
    watchlist_id IN (
      SELECT id FROM watchlists WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for alerts table
CREATE POLICY "Users can manage own alerts"
  ON alerts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Public read access for stocks, sentiment_data, trading_signals, price_history
-- These tables contain public market data

-- Insert initial stock data
INSERT INTO stocks (symbol, name, sector) VALUES
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