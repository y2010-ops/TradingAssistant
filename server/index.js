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

// Import route modules
import authRoutes from './routes/auth.js';
import marketRoutes from './routes/market.js';
import portfolioRoutes from './routes/portfolio.js';
import watchlistRoutes from './routes/watchlist.js';
import alertRoutes from './routes/alerts.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Create mock implementations for services
const createMockAIEngine = () => ({
  generateChatResponse: async (message, context) => ({
    message: "I'm currently unavailable. Please try again later.",
    confidence: 0.1,
    timestamp: new Date().toISOString()
  }),
  generateTradingSignal: async (symbol, historical, fundamental) => ({
    symbol,
    action: 'HOLD',
    confidence: 50,
    reasoning: 'AI engine temporarily unavailable'
  })
});

const createMockDataProvider = () => ({
  getRealTimeData: async (symbol) => ({
    symbol,
    price: Math.random() * 1000 + 100,
    change: (Math.random() - 0.5) * 20,
    changePercent: (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 1000000)
  }),
  getHistoricalData: async (symbol, period) => {
    // Generate mock historical data
    const data = [];
    const basePrice = Math.random() * 1000 + 100;
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        open: basePrice + (Math.random() - 0.5) * 20,
        high: basePrice + Math.random() * 30,
        low: basePrice - Math.random() * 30,
        close: basePrice + (Math.random() - 0.5) * 20,
        volume: Math.floor(Math.random() * 1000000)
      });
    }
    return data;
  },
  getNewsData: async (symbol) => [
    {
      title: `${symbol} Shows Strong Performance`,
      summary: 'Market analysis indicates positive trends',
      url: '#',
      publishedAt: new Date().toISOString(),
      source: 'Market News'
    }
  ]
});

const createMockSentimentAnalysis = () => ({
  analyzeStockSentiment: async (symbol) => ({ overall: 0, mentions: 0 }),
  analyzeSocialSentiment: async (symbol, sources) => ({ overall: 0, sources: {} })
});

// Initialize services with fallbacks
const aiEngine = createMockAIEngine();
const dataProvider = createMockDataProvider();
const sentimentAnalysis = createMockSentimentAnalysis();

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'mock',
      ai: 'active',
      websocket: 'running'
    }
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/portfolio', authenticateToken, portfolioRoutes);
app.use('/api/watchlists', authenticateToken, watchlistRoutes);
app.use('/api/alerts', authenticateToken, alertRoutes);

// Get all stocks
app.get('/api/stocks', async (req, res) => {
  try {
    // Mock stock data
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
    
    // Add mock real-time data
    const updatedStocks = stocks.map(stock => ({
      ...stock,
      currentPrice: Math.random() * 1000 + 100,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 1000000),
      marketCap: Math.floor(Math.random() * 1000000000000),
      pe: Math.random() * 30 + 5,
      pb: Math.random() * 5 + 0.5,
      dividend: Math.random() * 5,
      high52w: Math.random() * 1200 + 100,
      low52w: Math.random() * 800 + 50
    }));
    
    res.json(updatedStocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stocks',
      message: 'Using mock data due to service unavailability'
    });
  }
});

// Get specific stock data
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const realTimeData = await dataProvider.getRealTimeData(symbol);
    const stock = {
      symbol: symbol.toUpperCase(),
      name: `${symbol} Company Limited`,
      sector: 'Technology',
      ...realTimeData,
      marketCap: Math.floor(Math.random() * 1000000000000),
      pe: Math.random() * 30 + 5,
      pb: Math.random() * 5 + 0.5,
      dividend: Math.random() * 5,
      high52w: realTimeData.price * (1 + Math.random() * 0.5),
      low52w: realTimeData.price * (1 - Math.random() * 0.3)
    };
    
    res.json(stock);
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
    
    const mockStocks = [
      { symbol: 'RELIANCE', name: 'Reliance Industries Limited', sector: 'Energy' },
      { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', sector: 'Banking' },
      { symbol: 'INFY', name: 'Infosys Limited', sector: 'IT' },
      { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG' }
    ];
    
    const stocks = mockStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, parseInt(limit));
    
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
      const historicalData = await dataProvider.getHistoricalData(symbol, '3m');
      const fundamentalData = await dataProvider.getRealTimeData(symbol);
      const signal = await aiEngine.generateTradingSignal(symbol, historicalData, fundamentalData);
      res.json(signal);
    } else {
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3001;

// Start server with proper error handling
async function startServer() {
  try {
    server.listen(PORT, () => {
      console.log(`🚀 AI Trading Assistant Server running on port ${PORT}`);
      console.log(`📊 WebSocket server ready for real-time connections`);
      console.log(`🤖 AI Engine initialized with mock data`);
      console.log(`📈 Data providers configured for Indian markets`);
      console.log(`💾 Database status: Mock data (development mode)`);
      console.log(`🌐 Frontend can now connect to: http://localhost:${PORT}`);
      console.log(`✅ Server is ready to accept connections`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch((error) => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;