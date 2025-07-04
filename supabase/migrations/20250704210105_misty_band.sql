/*
  # Add comprehensive stock data for Indian market
  
  1. New Data
    - Adds 100+ Indian stocks from NSE/BSE
    - Covers all major sectors (IT, Banking, Pharma, etc.)
    - Includes large, mid, and small cap stocks
  
  2. Search Optimization
    - Creates text search indexes for fast stock lookup
    - Adds pg_trgm extension for text similarity search
*/

-- Create extension for text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add more comprehensive stock data for Indian market
INSERT INTO stocks (symbol, name, sector)
VALUES
  -- Large Cap Stocks
  ('RELIANCE', 'Reliance Industries Limited', 'Energy'),
  ('TCS', 'Tata Consultancy Services', 'IT'),
  ('HDFCBANK', 'HDFC Bank Limited', 'Banking'),
  ('INFY', 'Infosys Limited', 'IT'),
  ('ICICIBANK', 'ICICI Bank Limited', 'Banking'),
  ('ITC', 'ITC Limited', 'FMCG'),
  ('SBIN', 'State Bank of India', 'Banking'),
  ('KOTAKBANK', 'Kotak Mahindra Bank', 'Banking'),
  ('BHARTIARTL', 'Bharti Airtel Limited', 'Telecom'),
  ('HINDUNILVR', 'Hindustan Unilever Limited', 'FMCG'),
  ('ASIANPAINT', 'Asian Paints Limited', 'Consumer Durables'),
  ('AXISBANK', 'Axis Bank Limited', 'Banking'),
  ('BAJFINANCE', 'Bajaj Finance Limited', 'Financial Services'),
  ('MARUTI', 'Maruti Suzuki India Limited', 'Automobile'),
  ('HCLTECH', 'HCL Technologies Limited', 'IT'),
  ('SUNPHARMA', 'Sun Pharmaceutical Industries Limited', 'Pharmaceuticals'),
  ('TATAMOTORS', 'Tata Motors Limited', 'Automobile'),
  ('WIPRO', 'Wipro Limited', 'IT'),
  ('ULTRACEMCO', 'UltraTech Cement Limited', 'Cement'),
  ('TITAN', 'Titan Company Limited', 'Consumer Durables'),
  
  -- Mid Cap Stocks
  ('HAVELLS', 'Havells India Limited', 'Consumer Durables'),
  ('GODREJCP', 'Godrej Consumer Products Limited', 'FMCG'),
  ('BERGEPAINT', 'Berger Paints India Limited', 'Consumer Durables'),
  ('PIDILITIND', 'Pidilite Industries Limited', 'Chemicals'),
  ('DABUR', 'Dabur India Limited', 'FMCG'),
  ('JUBLFOOD', 'Jubilant FoodWorks Limited', 'Consumer Services'),
  ('MPHASIS', 'Mphasis Limited', 'IT'),
  ('MUTHOOTFIN', 'Muthoot Finance Limited', 'Financial Services'),
  ('INDIGO', 'InterGlobe Aviation Limited', 'Aviation'),
  ('BANDHANBNK', 'Bandhan Bank Limited', 'Banking'),
  
  -- Pharma & Healthcare
  ('DRREDDY', 'Dr. Reddy Laboratories Limited', 'Pharmaceuticals'),
  ('CIPLA', 'Cipla Limited', 'Pharmaceuticals'),
  ('DIVISLAB', 'Divi Laboratories Limited', 'Pharmaceuticals'),
  ('BIOCON', 'Biocon Limited', 'Pharmaceuticals'),
  ('APOLLOHOSP', 'Apollo Hospitals Enterprise Limited', 'Healthcare'),
  ('ALKEM', 'Alkem Laboratories Limited', 'Pharmaceuticals'),
  ('TORNTPHARM', 'Torrent Pharmaceuticals Limited', 'Pharmaceuticals'),
  ('AUROPHARMA', 'Aurobindo Pharma Limited', 'Pharmaceuticals'),
  ('LUPIN', 'Lupin Limited', 'Pharmaceuticals'),
  ('GLAXO', 'GlaxoSmithKline Pharmaceuticals Limited', 'Pharmaceuticals'),
  
  -- IT & Technology
  ('TECHM', 'Tech Mahindra Limited', 'IT'),
  ('LTTS', 'L&T Technology Services Limited', 'IT'),
  ('MINDTREE', 'Mindtree Limited', 'IT'),
  ('PERSISTENT', 'Persistent Systems Limited', 'IT'),
  ('COFORGE', 'Coforge Limited', 'IT'),
  ('OFSS', 'Oracle Financial Services Software Limited', 'IT'),
  ('LTIMINDTREE', 'LTIMindtree Limited', 'IT'),
  ('ZOMATO', 'Zomato Limited', 'Technology'),
  ('NAUKRI', 'Info Edge (India) Limited', 'Technology'),
  ('POLICYBZR', 'PB Fintech Limited', 'Financial Technology'),
  
  -- Banking & Financial Services
  ('FEDERALBNK', 'The Federal Bank Limited', 'Banking'),
  ('BANKBARODA', 'Bank of Baroda', 'Banking'),
  ('CANBK', 'Canara Bank', 'Banking'),
  ('INDUSINDBK', 'IndusInd Bank Limited', 'Banking'),
  ('IDFCFIRSTB', 'IDFC First Bank Limited', 'Banking'),
  ('PNB', 'Punjab National Bank', 'Banking'),
  ('BAJAJFINSV', 'Bajaj Finserv Limited', 'Financial Services'),
  ('CHOLAFIN', 'Cholamandalam Investment and Finance Company Limited', 'Financial Services'),
  ('ICICIGI', 'ICICI Lombard General Insurance Company Limited', 'Insurance'),
  ('HDFCLIFE', 'HDFC Life Insurance Company Limited', 'Insurance'),
  
  -- Energy & Power
  ('ONGC', 'Oil and Natural Gas Corporation Limited', 'Energy'),
  ('NTPC', 'NTPC Limited', 'Power'),
  ('POWERGRID', 'Power Grid Corporation of India Limited', 'Power'),
  ('BPCL', 'Bharat Petroleum Corporation Limited', 'Energy'),
  ('IOC', 'Indian Oil Corporation Limited', 'Energy'),
  ('GAIL', 'GAIL (India) Limited', 'Energy'),
  ('ADANIPOWER', 'Adani Power Limited', 'Power'),
  ('TATAPOWER', 'Tata Power Company Limited', 'Power'),
  ('JSWENERGY', 'JSW Energy Limited', 'Power'),
  ('TORNTPOWER', 'Torrent Power Limited', 'Power'),
  
  -- Metals & Mining
  ('TATASTEEL', 'Tata Steel Limited', 'Metals'),
  ('HINDALCO', 'Hindalco Industries Limited', 'Metals'),
  ('JSWSTEEL', 'JSW Steel Limited', 'Metals'),
  ('SAIL', 'Steel Authority of India Limited', 'Metals'),
  ('COALINDIA', 'Coal India Limited', 'Mining'),
  ('NMDC', 'NMDC Limited', 'Mining'),
  ('VEDL', 'Vedanta Limited', 'Metals'),
  ('HINDZINC', 'Hindustan Zinc Limited', 'Metals'),
  ('NATIONALUM', 'National Aluminium Company Limited', 'Metals'),
  ('JINDALSTEL', 'Jindal Steel & Power Limited', 'Metals'),
  
  -- Automobile & Auto Components
  ('M&M', 'Mahindra & Mahindra Limited', 'Automobile'),
  ('HEROMOTOCO', 'Hero MotoCorp Limited', 'Automobile'),
  ('BAJAJ-AUTO', 'Bajaj Auto Limited', 'Automobile'),
  ('EICHERMOT', 'Eicher Motors Limited', 'Automobile'),
  ('TVSMOTOR', 'TVS Motor Company Limited', 'Automobile'),
  ('ASHOKLEY', 'Ashok Leyland Limited', 'Automobile'),
  ('BOSCHLTD', 'Bosch Limited', 'Auto Components'),
  ('MOTHERSON', 'Motherson Sumi Wiring India Limited', 'Auto Components'),
  ('BALKRISIND', 'Balkrishna Industries Limited', 'Auto Components'),
  ('APOLLOTYRE', 'Apollo Tyres Limited', 'Auto Components'),
  
  -- FMCG & Consumer
  ('NESTLEIND', 'Nestle India Limited', 'FMCG'),
  ('BRITANNIA', 'Britannia Industries Limited', 'FMCG'),
  ('MARICO', 'Marico Limited', 'FMCG'),
  ('COLPAL', 'Colgate-Palmolive (India) Limited', 'FMCG'),
  ('GODREJIND', 'Godrej Industries Limited', 'FMCG'),
  ('EMAMILTD', 'Emami Limited', 'FMCG'),
  ('TATACONSUM', 'Tata Consumer Products Limited', 'FMCG'),
  ('UBL', 'United Breweries Limited', 'FMCG'),
  ('PGHH', 'Procter & Gamble Hygiene and Health Care Limited', 'FMCG'),
  ('VBL', 'Varun Beverages Limited', 'FMCG'),
  
  -- Infrastructure & Real Estate
  ('LT', 'Larsen & Toubro Limited', 'Construction'),
  ('DLF', 'DLF Limited', 'Real Estate'),
  ('GODREJPROP', 'Godrej Properties Limited', 'Real Estate'),
  ('OBEROIRLTY', 'Oberoi Realty Limited', 'Real Estate'),
  ('PRESTIGE', 'Prestige Estates Projects Limited', 'Real Estate'),
  ('BRIGADE', 'Brigade Enterprises Limited', 'Real Estate'),
  ('SOBHA', 'Sobha Limited', 'Real Estate'),
  ('IRCON', 'IRCON International Limited', 'Construction'),
  ('NBCC', 'NBCC (India) Limited', 'Construction'),
  ('GMRINFRA', 'GMR Infrastructure Limited', 'Infrastructure')
ON CONFLICT (symbol) DO NOTHING;

-- Ensure indexes exist for fast search
CREATE INDEX IF NOT EXISTS idx_stocks_symbol_search ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_name_search ON stocks(name);
CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks(sector);