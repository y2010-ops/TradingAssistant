# AI Trading Assistant

A comprehensive AI-powered trading assistant for Indian stock markets using free and open-source AI models.

## Features

### 🤖 AI Models (100% Free & Open Source)
- **Local LLMs**: Llama 3.2, Mistral 7B, Gemma 2B via Ollama
- **Sentiment Analysis**: FinBERT, VADER, custom financial lexicon
- **RAG System**: ChromaDB/FAISS vector store with financial knowledge base
- **Technical Analysis**: 15+ indicators using TA-Lib and custom algorithms

### 📊 Market Analysis
- Real-time stock data from NSE/BSE
- Technical indicators (RSI, MACD, Bollinger Bands, etc.)
- Pattern recognition (Double Top/Bottom, Head & Shoulders, Triangles)
- Support/Resistance level detection
- Volume analysis and trend identification

### 💬 AI Chat Assistant
- Natural language queries about stocks and markets
- Contextual responses using RAG (Retrieval Augmented Generation)
- Financial knowledge base with 100+ trading concepts
- Multi-source sentiment analysis

### 📈 Trading Signals
- AI-generated BUY/SELL/HOLD recommendations
- Confidence scoring and risk assessment
- Target price and stop-loss calculations
- Multi-factor analysis combining technical, sentiment, and fundamental data

### 🎯 Portfolio Management
- Track holdings and performance
- Transaction history and P&L analysis
- Watchlists with custom alerts
- Risk management tools

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for data visualization
- Zustand for state management

### Backend
- Node.js with Express
- WebSocket for real-time data
- Supabase PostgreSQL database
- JWT authentication
- Rate limiting and security

### AI/ML Stack (Free & Open Source)
- **@xenova/transformers**: Browser-based AI models
- **Ollama**: Local LLM deployment
- **FAISS/ChromaDB**: Vector similarity search
- **TA-Lib**: Technical analysis indicators
- **VADER Sentiment**: Rule-based sentiment analysis
- **Natural**: NLP processing

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)
- Ollama (optional, for local LLMs)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-trading-assistant
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database Setup**
- Create a Supabase project at https://supabase.com
- Copy your project URL and API keys to `.env`
- Run the migration in Supabase SQL editor

5. **Optional: Install Ollama for Local LLMs**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model (e.g., Llama 3.2 3B)
ollama pull llama3.2:3b
```

6. **Start the application**
```bash
npm run dev
```

## AI Models Configuration

### Local LLM Options
- **Llama 3.2 (3B)**: Best balance of performance and resource usage
- **Mistral 7B**: Excellent for financial analysis
- **Gemma 2B**: Lightweight option for lower-end hardware
- **Phi-3 Mini**: Microsoft's efficient small model

### Sentiment Analysis Models
- **FinBERT**: Specialized for financial text
- **VADER**: Rule-based, works offline
- **Custom Financial Lexicon**: 200+ financial terms with sentiment scores

### Technical Analysis
- **15+ Indicators**: RSI, MACD, Bollinger Bands, Stochastic, ATR, CCI
- **Pattern Recognition**: Double tops/bottoms, head & shoulders, triangles
- **Support/Resistance**: Automatic level detection
- **Trend Analysis**: Multi-timeframe trend identification

## API Endpoints

### Stock Data
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/:symbol` - Get specific stock data
- `GET /api/stocks/:symbol/history` - Get historical data

### AI Services
- `POST /api/chat` - AI chat assistant
- `GET /api/signals` - Trading signals
- `GET /api/sentiment/:symbol` - Sentiment analysis

### Portfolio
- `GET /api/portfolio` - User portfolio
- `POST /api/portfolio/add` - Add stock to portfolio
- `POST /api/portfolio/sell` - Sell stock from portfolio

## Free Data Sources

### Stock Data
- Yahoo Finance API (free tier)
- Alpha Vantage (free tier: 5 calls/minute)
- NSE/BSE official APIs

### News & Sentiment
- NewsAPI (free tier: 1000 requests/day)
- Reddit API (free)
- RSS feeds from financial publications

### AI Models
- Hugging Face (free tier: 30,000 characters/month)
- Ollama (completely free, runs locally)
- Transformers.js (browser-based, free)

## Performance Optimization

### Local AI Models
- Models run on CPU by default
- GPU acceleration available with CUDA
- Model quantization for reduced memory usage
- Caching for frequently used embeddings

### Database
- Indexed queries for fast data retrieval
- Connection pooling
- Query optimization for large datasets

### Frontend
- Code splitting and lazy loading
- Optimized re-renders with React.memo
- Efficient state management with Zustand

## Security Features

- JWT authentication
- Rate limiting (100 requests/15 minutes)
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- Row Level Security (RLS) in Supabase

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This application is for educational and informational purposes only. It does not constitute financial advice. Always do your own research and consult with qualified financial advisors before making investment decisions.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the FAQ section

---

**Built with ❤️ using 100% free and open-source AI models**