/*
  # Trading Assistant Database Schema

  1. New Tables
    - `stocks` - Stock information
    - `sentiment_data` - Sentiment analysis data
    - `trading_signals` - AI-generated trading signals
    - `price_history` - Historical price data
    - `users` - User accounts
    - `user_queries` - Chat history and queries
    - `portfolios` - User portfolio holdings
    - `transactions` - Trading transaction history
    - `watchlists` - User watchlists
    - `watchlist_items` - Items in watchlists
    - `alerts` - Price and event alerts

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Set up public/private data separation
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stocks table
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

-- Create sentiment_data table
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

-- Create trading_signals table
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

-- Create price_history table
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
  updated_at timestamptz DEFAULT now(),
  UNIQUE(symbol, date)
);

-- Create users table
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

-- Create user_queries table
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

-- Create portfolios table
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
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Create transactions table
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

-- Create watchlists table
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

-- Create watchlist_items table
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
  updated_at timestamptz DEFAULT now(),
  UNIQUE(watchlist_id, symbol)
);

-- Create alerts table
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

-- Create indexes for better performance
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

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can read their own queries
CREATE POLICY "Users can read own queries" ON user_queries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own queries
CREATE POLICY "Users can insert own queries" ON user_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can manage their own portfolio
CREATE POLICY "Users can manage own portfolio" ON portfolios
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own transactions
CREATE POLICY "Users can manage own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own watchlists
CREATE POLICY "Users can manage own watchlists" ON watchlists
  FOR ALL USING (auth.uid() = user_id);

-- Users can read public watchlists
CREATE POLICY "Users can read public watchlists" ON watchlists
  FOR SELECT USING (is_public = true);

-- Users can manage their own watchlist items
CREATE POLICY "Users can manage own watchlist items" ON watchlist_items
  FOR ALL USING (watchlist_id IN (
    SELECT id FROM watchlists WHERE user_id = auth.uid()
  ));

-- Users can manage their own alerts
CREATE POLICY "Users can manage own alerts" ON alerts
  FOR ALL USING (auth.uid() = user_id);

-- Insert initial stock data
INSERT INTO stocks (symbol, name, sector)
VALUES
  ('RELIANCE', 'Reliance Industries Limited', 'Energy'),
  ('TCS', 'Tata Consultancy Services', 'IT'),
  ('HDFCBANK', 'HDFC Bank Limited', 'Banking'),
  ('INFY', 'Infosys Limited', 'IT'),
  ('ITC', 'ITC Limited', 'FMCG'),
  ('SBIN', 'State Bank of India', 'Banking'),
  ('KOTAKBANK', 'Kotak Mahindra Bank', 'Banking'),
  ('BHARTIARTL', 'Bharti Airtel Limited', 'Telecom')
ON CONFLICT (symbol) DO NOTHING;