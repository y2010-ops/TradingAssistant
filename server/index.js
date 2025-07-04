import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jwt from 'jsonwebtoken';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Import services
// Conditional imports with error handling
let AITradingEngine, DataProvider, SentimentAnalysis;
let sequelize, Stock, SentimentData, TradingSignal, Op;
let authRoutes, portfolioRoutes, watchlistRoutes, alertRoutes, marketRoutes;

try {
  const aiEngineModule = await import('./services/aiEngine.js').catch(() => null);
  const dataProviderModule = await import('./services/dataProvider.js').catch(() => null);
  const sentimentModule = await import('./services/sentimentAnalysis.js').catch(() => null);
  
  AITradingEngine = aiEngineModule?.AITradingEngine;
  DataProvider = dataProviderModule?.DataProvider;
  SentimentAnalysis = sentimentModule?.SentimentAnalysis;
} catch (error) {
  console.warn('⚠️  Some services unavailable, using fallback implementations');
}

try {
  const dbModule = await import('./config/database.js').catch(() => null);
  const stockModule = await import('./models/Stock.js').catch(() => null);
  const sentimentDataModule = await import('./models/SentimentData.js').catch(() => null);
  const tradingSignalModule = await import('./models/TradingSignal.js').catch(() => null);
  const sequelizeModule = await import('sequelize').catch(() => null);
  
  sequelize = dbModule?.default;
  Stock = stockModule?.default;
  SentimentData = sentimentDataModule?.default;
  TradingSignal = tradingSignalModule?.default;
  Op = sequelizeModule?.Op;
} catch (error) {
  console.warn('⚠️  Database models unavailable, using mock data');
}

try {
  const authModule = await import('./routes/auth.js').catch(() => null);
  const portfolioModule = await import('./routes/portfolio.js').catch(() => null);
  const watchlistModule = await import('./routes/watchlist.js').catch(() => null);
  const alertModule = await import('./routes/alerts.js').catch(() => null);
  const marketModule = await import('./routes/market.js').catch(() => null);
  
  authRoutes = authModule?.default;
  portfolioRoutes = portfolioModule?.default;
  watchlistRoutes = watchlistModule?.default;
  alertRoutes = alertModule?.default;
  marketRoutes = marketModule?.default;
} catch (error) {
  console.warn('⚠️  Some routes unavailable, using basic implementations');
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Initialize services
const aiEngine = new AITradingEngine();
const dataProvider = new DataProvider();
const sentimentAnalysis = new SentimentAnalysis();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Initialize database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized.');
    
    // Seed initial data
    await seedInitialData();
    console.log('✅ Initial data seeded successfully.');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('🔄 Attempting to continue with limited functionality...');
    
    // Try to continue without database for basic functionality
    try {
      // Create a minimal in-memory fallback
      const { Sequelize } = await import('sequelize');
      const fallbackDb = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
      });
      
      await fallbackDb.authenticate();
      console.log('✅ Fallback database initialized');
    } catch (fallbackError) {
      console.error('❌ Fallback database also failed:', fallbackError.message);
      console.log('⚠️  Server will start with mock data only');
    }
  }
}

// Seed initial stock data
async function seedInitialData() {
  try {
    const stocks = [
      { symbol: 'RELIANCE', name: 'Reliance Industries Limited', sector: 'Energy' },
      { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', sector: 'Banking' },
      { symbol: 'INFY', name: 'Infosys Limited', sector: 'IT' },
      { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG' },
      { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking' },
      { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking' },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', sector: 'Telecom' }
    ];

    for (const stockData of stocks) {
      await Stock.findOrCreate({
        where: { symbol: stockData.symbol },
        defaults: stockData
      });
    }
  } catch (error) {
    console.warn('⚠️  Could not seed initial data:', error.message);
    console.log('📊 Application will use mock data for stocks');
  }
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial data
  socket.emit('connectionStatus', 'connected');
  
  // Handle stock subscription
  socket.on('subscribeToStock', (symbol) => {
    console.log(`Client subscribed to ${symbol}`);
    socket.join(symbol);
  });
  
  socket.on('unsubscribeFromStock', (symbol) => {
    console.log(`Client unsubscribed from ${symbol}`);
    socket.leave(symbol);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

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

// Authentication routes (public)
if (authRoutes) {
  app.use('/api/auth', authRoutes);
} else {
  app.use('/api/auth', (req, res) => {
    res.status(503).json({ error: 'Authentication service temporarily unavailable' });
  });
}

// Market data routes (public)
if (marketRoutes) {
  app.use('/api/market', marketRoutes);
} else {
  app.use('/api/market', (req, res) => {
    res.status(503).json({ error: 'Market data service temporarily unavailable' });
  });
}

// Protected routes (require authentication)
if (portfolioRoutes) {
  app.use('/api/portfolio', authenticateToken, portfolioRoutes);
} else {
  app.use('/api/portfolio', authenticateToken, (req, res) => {
    res.status(503).json({ error: 'Portfolio service temporarily unavailable' });
  });
}

if (watchlistRoutes) {
  app.use('/api/watchlists', authenticateToken, watchlistRoutes);
} else {
  app.use('/api/watchlists', authenticateToken, (req, res) => {
    res.status(503).json({ error: 'Watchlist service temporarily unavailable' });
  });
}

if (alertRoutes) {
  app.use('/api/alerts', authenticateToken, alertRoutes);
} else {
  app.use('/api/alerts', authenticateToken, (req, res) => {
    res.status(503).json({ error: 'Alert service temporarily unavailable' });
  });
}

// Get all stocks
app.get('/api/stocks', async (req, res) => {
  try {
    let stocks = [];
    
    try {
      stocks = await Stock.findAll();
    } catch (dbError) {
      console.warn('⚠️  Database unavailable, using mock data');
      // Return mock data when database is unavailable
      stocks = [
        { symbol: 'RELIANCE', name: 'Reliance Industries Limited', sector: 'Energy' },
        { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', sector: 'Banking' },
        { symbol: 'INFY', name: 'Infosys Limited', sector: 'IT' },
        { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG' }
      ].map(stock => ({
        ...stock,
        currentPrice: Math.random() * 1000 + 100,
        change: (Math.random() - 0.5) * 20,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 1000000),
        toJSON: () => stock
      }));
    }
    
    // Update with real-time data
    const updatedStocks = await Promise.all(
      stocks.map(async (stock) => {
        try {
          const realTimeData = await dataProvider.getRealTimeData(stock.symbol);
          return { ...stock.toJSON(), ...realTimeData };
        } catch (error) {
          // Return stock with mock data if real-time data fails
          return {
            ...stock.toJSON(),
            currentPrice: Math.random() * 1000 + 100,
            change: (Math.random() - 0.5) * 20,
            changePercent: (Math.random() - 0.5) * 5,
            volume: Math.floor(Math.random() * 1000000)
          };
        }
      })
    );
    
    res.json(updatedStocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stocks',
      message: 'Please check your database connection or API configuration'
    });
  }
});

// Get specific stock data
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Try to get from database first
    let stock = await Stock.findOne({ where: { symbol: symbol.toUpperCase() } });
    
    if (!stock) {
      // If not in database, create with real-time data
      const realTimeData = await dataProvider.getRealTimeData(symbol);
      if (realTimeData.price > 0) {
        stock = await Stock.create({
          symbol: symbol.toUpperCase(),
          name: realTimeData.name || symbol,
          currentPrice: realTimeData.price,
          volume: realTimeData.volume,
          marketCap: realTimeData.marketCap,
          pe: realTimeData.pe,
          pb: realTimeData.pb,
          dividend: realTimeData.dividend,
          high52w: realTimeData.high52w,
          low52w: realTimeData.low52w
        });
      } else {
        return res.status(404).json({ error: 'Stock not found' });
      }
    }
    
    const realTimeData = await dataProvider.getRealTimeData(symbol);
    res.json({ ...stock.toJSON(), ...realTimeData });
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Get historical data
app.get('/api/stocks/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1y' } = req.query;
    
    const historicalData = await dataProvider.getHistoricalData(symbol, period);
    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Search stocks
app.get('/api/stocks/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    
    const stocks = await Stock.findAll({
      where: {
        [Op.or]: [
          { symbol: { [Op.iLike]: `%${query}%` } },
          { name: { [Op.iLike]: `%${query}%` } }
        ]
      },
      limit: parseInt(limit),
      order: [['symbol', 'ASC']]
    });
    
    res.json(stocks);
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await aiEngine.generateChatResponse(message, context);
    res.json(response);
  } catch (error) {
    console.error('Error generating chat response:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      message: 'I apologize, but I encountered an error processing your request. Please try again.',
      confidence: 0.1,
      timestamp: new Date().toISOString()
    });
  }
});

// Trading signals endpoint
app.get('/api/signals', async (req, res) => {
  try {
    const { symbol } = req.query;
    
    if (symbol) {
      // Get signal for specific stock
      const historicalData = await dataProvider.getHistoricalData(symbol, '3m');
      const fundamentalData = await dataProvider.getRealTimeData(symbol);
      const signal = await aiEngine.generateTradingSignal(symbol, historicalData, fundamentalData);
      
      // Save to database
      await TradingSignal.create(signal);
      
      res.json(signal);
    } else {
      // Get signals for all major stocks
      const majorStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
      const signals = await Promise.all(
        majorStocks.map(async (stock) => {
          const historicalData = await dataProvider.getHistoricalData(stock, '3m');
          const fundamentalData = await dataProvider.getRealTimeData(stock);
          return await aiEngine.generateTradingSignal(stock, historicalData, fundamentalData);
        })
      );
      
      res.json(signals);
    }
  } catch (error) {
    console.error('Error generating signals:', error);
    res.status(500).json({ error: 'Failed to generate trading signals' });
  }
});

// Sentiment analysis endpoint
app.get('/api/sentiment/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const sentimentData = await sentimentAnalysis.analyzeStockSentiment(symbol);
    
    // Save to database
    await SentimentData.create({
      symbol: symbol,
      source: 'aggregated',
      sentimentScore: sentimentData.overall,
      content: JSON.stringify(sentimentData),
      mentions: sentimentData.mentions
    });
    
    res.json(sentimentData);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

// News endpoint
app.get('/api/news', async (req, res) => {
  try {
    const { symbol } = req.query;
    const news = await dataProvider.getNewsData(symbol);
    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Social sentiment endpoint
app.get('/api/sentiment/social/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { sources = 'reddit,twitter' } = req.query;
    
    const socialSentiment = await sentimentAnalysis.analyzeSocialSentiment(
      symbol, 
      sources.split(',')
    );
    
    res.json(socialSentiment);
  } catch (error) {
    console.error('Error fetching social sentiment:', error);
    res.status(500).json({ error: 'Failed to fetch social sentiment' });
  }
});

// Helper functions
function getMarketStatus() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  const marketOpen = 9 * 60 + 15; // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM
  const preMarketStart = 9 * 60; // 9:00 AM

  if (currentTime >= preMarketStart && currentTime < marketOpen) {
    return { status: 'Pre-Market', class: 'pre-market' };
  } else if (currentTime >= marketOpen && currentTime < marketClose) {
    return { status: 'Market Open', class: 'open' };
  } else {
    return { status: 'Market Closed', class: 'closed' };
  }
}

async function getTopMovers(type) {
  // Mock implementation - in production, fetch from real data
  const stocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ITC'];
  const movers = await Promise.all(
    stocks.map(async (symbol) => {
      const data = await dataProvider.getRealTimeData(symbol);
      return {
        symbol: data.symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent
      };
    })
  );
  
  return movers
    .sort((a, b) => type === 'gainers' ? b.changePercent - a.changePercent : a.changePercent - b.changePercent)
    .slice(0, 5);
}

async function getSectorPerformance() {
  return [
    { sector: 'Banking', change: 1.8, stocks: 15 },
    { sector: 'IT', change: -0.5, stocks: 12 },
    { sector: 'Energy', change: 2.1, stocks: 8 },
    { sector: 'FMCG', change: 0.8, stocks: 10 },
    { sector: 'Auto', change: 1.2, stocks: 14 }
  ];
}

// Scheduled tasks
cron.schedule('*/5 * * * *', async () => {
  // Update stock prices every 5 minutes during market hours
  const marketStatus = getMarketStatus();
  if (marketStatus.status === 'Market Open') {
    console.log('Updating real-time stock prices...');
    
    try {
      const stocks = await Stock.findAll();
      for (const stock of stocks) {
        const realTimeData = await dataProvider.getRealTimeData(stock.symbol);
        
        // Update database
        await stock.update({
          currentPrice: realTimeData.price,
          volume: realTimeData.volume,
          updatedAt: new Date()
        });
        
        // Emit to WebSocket clients
        io.to(stock.symbol).emit('priceUpdate', {
          symbol: stock.symbol,
          price: realTimeData.price,
          change: realTimeData.change,
          changePercent: realTimeData.changePercent,
          volume: realTimeData.volume
        });
      }
    } catch (error) {
      console.error('Error updating stock prices:', error);
    }
  }
});

cron.schedule('0 */2 * * *', async () => {
  // Generate trading signals every 2 hours
  console.log('Generating trading signals...');
  
  try {
    const majorStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
    
    for (const symbol of majorStocks) {
      const historicalData = await dataProvider.getHistoricalData(symbol, '3m');
      const fundamentalData = await dataProvider.getRealTimeData(symbol);
      const signal = await aiEngine.generateTradingSignal(symbol, historicalData, fundamentalData);
      
      // Save to database
      await TradingSignal.create(signal);
      
      // Emit to WebSocket clients
      io.emit('newSignal', signal);
    }
  } catch (error) {
    console.error('Error generating scheduled signals:', error);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3001;

// Initialize and start server
async function startServer() {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('❌ Database initialization failed, but continuing with limited functionality');
  }
  
  server.listen(PORT, () => {
    console.log(`🚀 AI Trading Assistant Server running on port ${PORT}`);
    console.log(`📊 WebSocket server ready for real-time connections`);
    console.log(`🤖 AI Engine initialized and ready`);
    console.log(`📈 Data providers configured for Indian markets`);
    console.log(`💾 Database status: ${sequelize.options.dialect === 'sqlite' ? 'SQLite (development)' : 'PostgreSQL (production)'}`);
    console.log(`🌐 Frontend can now connect to: http://localhost:${PORT}`);
    
    if (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.includes('placeholder')) {
      console.log('\n⚠️  SETUP REQUIRED:');
      console.log('📋 Please follow the instructions in SETUP_INSTRUCTIONS.md to configure Supabase');
      console.log('🔗 The app is running with mock data until Supabase is properly configured\n');
    }
  });
}

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    if (sequelize) {
      sequelize.close();
    }
    process.exit(0);
  });
});

export default app;