// Mock Server for AI Trading Assistant
// This provides mock API endpoints when the main server is not running

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load mock data
const loadMockData = (filename) => {
  try {
    const dataPath = join(__dirname, 'mock-data', filename);
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`Error loading mock data (${filename}):`, error);
    return null;
  }
};

// Create mock data directory if it doesn't exist
const mockDataDir = join(__dirname, 'mock-data');
if (!fs.existsSync(mockDataDir)) {
  fs.mkdirSync(mockDataDir, { recursive: true });
}

// Generate mock data if it doesn't exist
const generateMockData = () => {
  // Mock stocks data
  const stocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Limited', sector: 'Energy', currentPrice: 2456.75, change: 45.30, changePercent: 1.88, volume: 12500000, marketCap: 1650000 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', currentPrice: 3234.50, change: -23.45, changePercent: -0.72, volume: 8500000, marketCap: 1200000 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', sector: 'Banking', currentPrice: 1567.25, change: 34.20, changePercent: 2.23, volume: 15000000, marketCap: 850000 },
    { symbol: 'INFY', name: 'Infosys Limited', sector: 'IT', currentPrice: 1432.80, change: -12.65, changePercent: -0.87, volume: 9500000, marketCap: 720000 },
    { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG', currentPrice: 456.90, change: 8.45, changePercent: 1.89, volume: 18000000, marketCap: 580000 },
    { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', currentPrice: 598.75, change: 8.90, changePercent: 1.51, volume: 22000000, marketCap: 520000 },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', currentPrice: 1756.80, change: -15.30, changePercent: -0.86, volume: 4500000, marketCap: 350000 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', sector: 'Telecom', currentPrice: 876.45, change: 12.60, changePercent: 1.46, volume: 8900000, marketCap: 485000 },
    { symbol: 'ASIANPAINT', name: 'Asian Paints Limited', sector: 'Consumer Durables', currentPrice: 3245.60, change: -45.80, changePercent: -1.39, volume: 3200000, marketCap: 310000 },
    { symbol: 'HCLTECH', name: 'HCL Technologies Limited', sector: 'IT', currentPrice: 1234.50, change: 18.75, changePercent: 1.54, volume: 5600000, marketCap: 335000 },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Limited', sector: 'Financial Services', currentPrice: 6845.30, change: -89.50, changePercent: -1.29, volume: 2800000, marketCap: 425000 },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India Limited', sector: 'Automobile', currentPrice: 9876.50, change: 123.45, changePercent: 1.27, volume: 1200000, marketCap: 298000 },
    { symbol: 'TATASTEEL', name: 'Tata Steel Limited', sector: 'Metals', currentPrice: 134.55, change: 2.35, changePercent: 1.78, volume: 25000000, marketCap: 165000 },
    { symbol: 'AXISBANK', name: 'Axis Bank Limited', sector: 'Banking', currentPrice: 987.65, change: -5.45, changePercent: -0.55, volume: 9800000, marketCap: 305000 },
    { symbol: 'WIPRO', name: 'Wipro Limited', sector: 'IT', currentPrice: 432.10, change: 5.60, changePercent: 1.31, volume: 7600000, marketCap: 236000 },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Limited', sector: 'Pharmaceuticals', currentPrice: 1023.45, change: 15.65, changePercent: 1.55, volume: 4300000, marketCap: 245000 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', sector: 'Banking', currentPrice: 945.30, change: 12.40, changePercent: 1.33, volume: 14500000, marketCap: 660000 },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Limited', sector: 'FMCG', currentPrice: 2543.20, change: -23.50, changePercent: -0.91, volume: 2300000, marketCap: 598000 },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Limited', sector: 'Cement', currentPrice: 8765.40, change: 98.70, changePercent: 1.14, volume: 890000, marketCap: 253000 },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', sector: 'Automobile', currentPrice: 654.30, change: 23.45, changePercent: 3.72, volume: 18900000, marketCap: 218000 }
  ];
  
  // Add 80 more stocks with random data
  const sectors = ['IT', 'Banking', 'FMCG', 'Pharma', 'Auto', 'Energy', 'Telecom', 'Metals', 'Cement', 'Real Estate'];
  const additionalStocks = [
    'ADANIENT', 'ADANIPORTS', 'APOLLOHOSP', 'BAJAJFINSV', 'BPCL', 'BRITANNIA', 'CIPLA', 'COALINDIA', 'DIVISLAB', 'DRREDDY',
    'EICHERMOT', 'GRASIM', 'HEROMOTOCO', 'HINDALCO', 'INDUSINDBK', 'JSWSTEEL', 'LTIM', 'M&M', 'NESTLEIND', 'NTPC',
    'ONGC', 'POWERGRID', 'SBILIFE', 'SHREECEM', 'TATACONSUM', 'TECHM', 'TITAN', 'UPL', 'VEDL', 'ZOMATO',
    'ABBOTINDIA', 'ABFRL', 'ADANIGREEN', 'ADANIPOWER', 'ALKEM', 'AMBUJACEM', 'AUROPHARMA', 'BAJAJHLDNG', 'BANKBARODA', 'BERGEPAINT',
    'BIOCON', 'BOSCHLTD', 'CANBK', 'CHOLAFIN', 'COLPAL', 'CONCOR', 'COROMANDEL', 'CUMMINSIND', 'DABUR', 'DALBHARAT',
    'DLF', 'FEDERALBNK', 'GAIL', 'GODREJCP', 'GODREJPROP', 'HAVELLS', 'HDFCAMC', 'HDFCLIFE', 'HONAUT', 'IDFCFIRSTB',
    'INDIAMART', 'INDIGO', 'IOC', 'IRCTC', 'JINDALSTEL', 'JUBLFOOD', 'KOTAKBANK', 'LICI', 'LUPIN', 'MARICO',
    'MCDOWELL-N', 'MOTHERSON', 'MUTHOOTFIN', 'NAUKRI', 'NMDC', 'OBEROIRLTY', 'OFSS', 'PAYTM', 'PGHH', 'PIDILITIND'
  ];
  
  for (let i = 0; i < additionalStocks.length; i++) {
    const randomPrice = Math.floor(Math.random() * 5000) + 100;
    const randomChange = (Math.random() - 0.5) * 50;
    const randomPercent = (randomChange / randomPrice) * 100;
    const randomVolume = Math.floor(Math.random() * 20000000) + 1000000;
    const randomMarketCap = Math.floor(Math.random() * 500000) + 50000;
    
    stocks.push({
      symbol: additionalStocks[i],
      name: `${additionalStocks[i]} Corporation Ltd.`,
      sector: sectors[Math.floor(Math.random() * sectors.length)],
      currentPrice: randomPrice,
      change: randomChange,
      changePercent: randomPercent,
      volume: randomVolume,
      marketCap: randomMarketCap
    });
  }
  
  // Save mock data
  fs.writeFileSync(join(mockDataDir, 'stocks.json'), JSON.stringify(stocks, null, 2));
  
  // Generate market overview data
  const marketOverview = {
    indices: {
      nifty50: {
        symbol: 'NIFTY50',
        name: 'NIFTY 50',
        value: 19674.25,
        change: 234.15,
        changePercent: 1.21,
        timestamp: new Date()
      },
      sensex: {
        symbol: 'SENSEX',
        name: 'BSE SENSEX',
        value: 65995.63,
        change: 789.32,
        changePercent: 1.21,
        timestamp: new Date()
      },
      bankNifty: {
        symbol: 'BANKNIFTY',
        name: 'Bank Nifty',
        value: 44156.85,
        change: -156.25,
        changePercent: -0.35,
        timestamp: new Date()
      },
      niftyIT: {
        symbol: 'NIFTYIT',
        name: 'NIFTY IT',
        value: 28945.30,
        change: -89.45,
        changePercent: -0.31,
        timestamp: new Date()
      }
    },
    marketStatus: {
      status: 'Market Open',
      nextEvent: 'Market Close',
      timeToEvent: {
        hours: 2,
        minutes: 15
      },
      timestamp: new Date(),
      timezone: 'Asia/Kolkata'
    },
    topGainers: stocks.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 5),
    topLosers: stocks.filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 5),
    sectorPerformance: [
      { sector: 'Banking', change: 1.8, stocks: 15 },
      { sector: 'IT', change: -0.5, stocks: 12 },
      { sector: 'Energy', change: 2.1, stocks: 8 },
      { sector: 'FMCG', change: 0.8, stocks: 10 },
      { sector: 'Auto', change: 1.2, stocks: 14 }
    ],
    volumeLeaders: stocks.sort((a, b) => b.volume - a.volume).slice(0, 5)
  };
  
  fs.writeFileSync(join(mockDataDir, 'market-overview.json'), JSON.stringify(marketOverview, null, 2));
  
  // Generate news data
  const news = [
    {
      id: '1',
      title: 'RBI Maintains Repo Rate at 6.5%, Focuses on Inflation Control',
      summary: 'Reserve Bank of India keeps key policy rates unchanged, maintains accommodative stance.',
      sentiment: 'positive',
      source: 'Economic Times',
      publishedAt: new Date(),
      url: 'https://economictimes.indiatimes.com/news/economy/policy/rbi-maintains-repo-rate-at-6-5-focuses-on-inflation-control/articleshow/123456789.cms',
      impact: 'high'
    },
    {
      id: '2',
      title: 'Reliance Industries Reports Strong Q3 Results',
      summary: 'Oil-to-telecom conglomerate beats estimates with 25% growth in net profit.',
      sentiment: 'positive',
      source: 'Business Standard',
      publishedAt: new Date(),
      url: 'https://www.business-standard.com/article/companies/reliance-industries-reports-strong-q3-results-123456789.html',
      impact: 'high'
    },
    {
      id: '3',
      title: 'Indian Markets Hit All-Time High on Strong FII Inflows',
      summary: 'Benchmark indices reach record levels as foreign investors show confidence in Indian economy.',
      sentiment: 'positive',
      source: 'Economic Times',
      publishedAt: new Date(),
      url: 'https://economictimes.indiatimes.com/markets/stocks/news/indian-markets-hit-all-time-high-on-strong-fii-inflows/articleshow/123456789.cms',
      impact: 'high'
    },
    {
      id: '4',
      title: 'IT Sector Faces Headwinds Amid Global Slowdown',
      summary: 'Major IT companies revise guidance downward as client spending remains cautious.',
      sentiment: 'negative',
      source: 'Mint',
      publishedAt: new Date(),
      url: 'https://www.livemint.com/market/stock-market-news/it-sector-faces-headwinds-amid-global-slowdown-123456789.html',
      impact: 'medium'
    },
    {
      id: '5',
      title: 'Banking Sector Shows Resilience with Improved Asset Quality',
      summary: 'PSU banks report significant reduction in NPAs, credit growth remains robust.',
      sentiment: 'positive',
      source: 'Financial Express',
      publishedAt: new Date(),
      url: 'https://www.financialexpress.com/industry/banking-finance/banking-sector-shows-resilience-with-improved-asset-quality/123456789/',
      impact: 'medium'
    }
  ];
  
  fs.writeFileSync(join(mockDataDir, 'news.json'), JSON.stringify(news, null, 2));
  
  // Generate AI chat responses
  const chatResponses = {
    "market sentiment": "Current market sentiment is cautiously optimistic. The NIFTY 50 is showing resilience with banking and IT sectors leading gains. FII flows remain positive, and corporate earnings are beating expectations. However, global cues and inflation concerns are key watchpoints.",
    "reliance": "RELIANCE is showing strong technical momentum. Key levels: Support at ₹2,350, Resistance at ₹2,650. The stock has broken above its 20-day moving average with increasing volumes. Fundamentally, strong refining margins and digital business growth are positive catalysts.",
    "tcs": "TCS is consolidating in a narrow range. Q4 earnings are crucial - watch for revenue guidance and deal wins. Technical indicators suggest sideways movement with support at ₹3,100. The stock offers good dividend yield for long-term investors.",
    "rsi": "RSI (Relative Strength Index) measures momentum on a scale of 0-100. Above 70 indicates overbought conditions (potential sell signal), below 30 indicates oversold conditions (potential buy signal). It's most effective when combined with other indicators.",
    "gainers": "Today's top gainers include banking stocks like KOTAKBANK (+2.1%), HDFCBANK (+1.8%), and metal stocks like TATASTEEL (+3.2%). The banking sector is benefiting from RBI's stable policy stance.",
    "outlook": "Next week's outlook depends on global markets, FII flows, and corporate earnings. Key events: RBI policy commentary, Q4 earnings releases, and US Fed indicators. Sectors to watch: Banking, IT, and Auto."
  };
  
  fs.writeFileSync(join(mockDataDir, 'chat-responses.json'), JSON.stringify(chatResponses, null, 2));
  
  console.log('Mock data generated successfully');
};

// Generate mock data on startup
generateMockData();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      ai: 'active',
      websocket: 'running'
    }
  });
});

// Get all stocks
app.get('/api/stocks', (req, res) => {
  const stocks = loadMockData('stocks.json') || [];
  res.json(stocks);
});

// Search stocks
app.get('/api/stocks/search/:query', (req, res) => {
  const { query } = req.params;
  const { limit = 10 } = req.query;
  
  const stocks = loadMockData('stocks.json') || [];
  const results = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
    stock.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, parseInt(limit));
  
  res.json(results);
});

// Get specific stock
app.get('/api/stocks/:symbol', (req, res) => {
  const { symbol } = req.params;
  const stocks = loadMockData('stocks.json') || [];
  
  const stock = stocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());
  
  if (stock) {
    res.json(stock);
  } else {
    res.status(404).json({ error: 'Stock not found' });
  }
});

// Get market overview
app.get('/api/market/overview', (req, res) => {
  const overview = loadMockData('market-overview.json') || {};
  res.json(overview);
});

// Get market indices
app.get('/api/market/indices', (req, res) => {
  const overview = loadMockData('market-overview.json') || {};
  res.json(overview.indices || {});
});

// Get market status
app.get('/api/market/status', (req, res) => {
  const overview = loadMockData('market-overview.json') || {};
  res.json(overview.marketStatus || {});
});

// Get top movers
app.get('/api/market/movers', (req, res) => {
  const { type = 'both', limit = 10 } = req.query;
  const overview = loadMockData('market-overview.json') || {};
  
  const result = {};
  
  if (type === 'gainers' || type === 'both') {
    result.gainers = overview.topGainers || [];
  }
  
  if (type === 'losers' || type === 'both') {
    result.losers = overview.topLosers || [];
  }
  
  res.json(result);
});

// Get news
app.get('/api/market/news', (req, res) => {
  const { symbol, limit = 10 } = req.query;
  const news = loadMockData('news.json') || [];
  
  let filteredNews = news;
  if (symbol) {
    filteredNews = news.filter(item => 
      item.title.toLowerCase().includes(symbol.toLowerCase()) ||
      item.summary.toLowerCase().includes(symbol.toLowerCase())
    );
  }
  
  res.json(filteredNews.slice(0, parseInt(limit)));
});

// AI Chat endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  const chatResponses = loadMockData('chat-responses.json') || {};
  
  // Find the most relevant response
  let response = "I understand you're looking for market insights. Could you be more specific about which stock, sector, or market aspect you'd like me to analyze?";
  
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(chatResponses)) {
    if (lowerMessage.includes(key)) {
      response = value;
      break;
    }
  }
  
  // Simulate processing time
  setTimeout(() => {
    res.json({
      message: response,
      confidence: 0.85,
      sources: [],
      timestamp: new Date().toISOString()
    });
  }, 500);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock Server running on port ${PORT}`);
  console.log(`📊 Providing mock data for AI Trading Assistant`);
});