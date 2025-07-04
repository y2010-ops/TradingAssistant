import yahooFinance from 'yahoo-finance2';
import fetch from 'node-fetch';

export class DataProvider {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.newsApiKey = process.env.NEWS_API_KEY;
  }

  // Get real-time stock data
  async getRealTimeData(symbol) {
    const cacheKey = `realtime_${symbol}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Using cached data for ${symbol}`);
      return cached.data;
    }

    try {
      console.log(`Fetching real-time data for ${symbol}`);

      // Try Alpha Vantage first if API key is available
      if (this.alphaVantageKey) {
        try {
          console.log(`Trying Alpha Vantage for ${symbol}`);
          const alphaData = await this.getAlphaVantageData(symbol);
          if (alphaData && alphaData.price > 0) {
            console.log(`Alpha Vantage data received for ${symbol}`);
            this.cache.set(cacheKey, { data: alphaData, timestamp: Date.now() });
            return alphaData;
          }
        } catch (alphaError) {
          console.warn(`Alpha Vantage failed for ${symbol}:`, alphaError.message);
        }
      }

      // Fallback to Yahoo Finance if Alpha Vantage fails or is not configured
      console.log(`Trying Yahoo Finance for ${symbol}`);
      const yahooSymbol = this.convertToYahooSymbol(symbol);

      try {
        const quote = await yahooFinance.quote(yahooSymbol);
        console.log(`Yahoo Finance data received for ${symbol}`);

        const data = {
          symbol: symbol,
          name: quote.longName || quote.shortName || symbol,
          price: quote.regularMarketPrice || quote.previousClose || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          volume: quote.regularMarketVolume || 0,
          marketCap: quote.marketCap || 0,
          pe: quote.trailingPE || 0,
          pb: quote.priceToBook || 0,
          dividend: quote.dividendYield || 0,
          high52w: quote.fiftyTwoWeekHigh || 0,
          low52w: quote.fiftyTwoWeekLow || 0,
          timestamp: new Date()
        };

        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      } catch (yahooError) {
        console.warn(`Yahoo Finance failed for ${symbol}:`, yahooError.message);

        // If both fail, use mock data with warning
        console.warn(`Using mock data for ${symbol} - all data sources failed`);
        return this.getMockData(symbol);
      }
    } catch (error) {
      console.error(`Error fetching real-time data for ${symbol}:`, error);
      return this.getMockData(symbol);
    }
  }

  // Get data from Alpha Vantage
  async getAlphaVantageData(symbol) {
    if (!this.alphaVantageKey) {
      throw new Error('Alpha Vantage API key not configured in .env file');
    }

    // Determine if it's an index or a stock
    const isIndex = symbol.startsWith('^');
    
    // Format symbol appropriately
    const formattedSymbol = isIndex ? symbol : `${symbol}.BSE`;
    
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${formattedSymbol}&apikey=${this.alphaVantageKey}`;
    console.log(`Alpha Vantage URL: ${url}`);
    
    const response = await fetch(url);

    const data = await response.json();

    if (data['Error Message']) {
      console.error('Alpha Vantage error:', data['Error Message']);
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      console.warn('Alpha Vantage rate limit:', data['Note']);
      throw new Error('API rate limit exceeded');
    }

    const quote = data['Global Quote'];
    if (!quote) {
      console.error('Alpha Vantage no data:', data);
      throw new Error('No data available');
    }

    return {
      symbol: symbol,
      name: symbol,
      price: parseFloat(quote['05. price']) || 0,
      change: parseFloat(quote['09. change']) || 0,
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')) || 0,
      volume: parseInt(quote['06. volume']) || 0,
      marketCap: 0, // Not available in this endpoint
      pe: 0, // Not available in this endpoint
      pb: 0, // Not available in this endpoint
      dividend: 0, // Not available in this endpoint
      high52w: parseFloat(quote['03. high']) || 0,
      low52w: parseFloat(quote['04. low']) || 0,
      timestamp: new Date()
    };
  }

  // Get historical data
  async getHistoricalData(symbol, period = '1y') {
    const cacheKey = `historical_${symbol}_${period}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout * 12) { // 1 hour cache
      console.log(`Using cached historical data for ${symbol}`);
      return cached.data;
    }

    try {
      const yahooSymbol = this.convertToYahooSymbol(symbol);
      const endDate = new Date();
      const startDate = new Date();
      console.log(`Fetching historical data for ${symbol} (${yahooSymbol})`);
      
      // Set start date based on period
      switch (period) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '5d':
          startDate.setDate(endDate.getDate() - 5);
          break;
        case '1m':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3m':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case '5y':
          startDate.setFullYear(endDate.getFullYear() - 5);
          break;
        default:
          startDate.setFullYear(endDate.getFullYear() - 1);
      }

      const historical = await yahooFinance.historical(yahooSymbol, {
        period1: startDate,
        period2: endDate,
        interval: period === '1d' ? '5m' : period === '5d' ? '15m' : '1d'
      });

      console.log(`Historical data received for ${symbol}: ${historical.length} data points`);
      const data = historical.map(item => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      }));

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      console.log(`Using mock historical data for ${symbol}`);
      return this.getMockHistoricalData(symbol, period);
    }
  }

  // Convert Indian stock symbols to Yahoo Finance format
  convertToYahooSymbol(symbol) {
    const indianStocks = {
      // Indices
      '^NSEI': '^NSEI',  // NIFTY 50
      '^BSESN': '^BSESN', // SENSEX
      '^NSEBANK': '^NSEBANK', // Bank NIFTY
      '^CNXIT': '^CNXIT',  // NIFTY IT
      
      // Stocks
      'RELIANCE': 'RELIANCE.NS',
      'TCS': 'TCS.NS',
      'HDFCBANK': 'HDFCBANK.NS',
      'INFY': 'INFY.NS',
      'ITC': 'ITC.NS',
      'SBIN': 'SBIN.NS',
      'KOTAKBANK': 'KOTAKBANK.NS',
      'BHARTIARTL': 'BHARTIARTL.NS',
      'ASIANPAINT': 'ASIANPAINT.NS',
      'HCLTECH': 'HCLTECH.NS',
      'BAJFINANCE': 'BAJFINANCE.NS',
      'WIPRO': 'WIPRO.NS'
    };

    // If it's already an index (starts with ^), return as is
    if (symbol.startsWith('^')) {
      return symbol;
    }
    
    // Otherwise, return the mapped symbol or append .NS
    return indianStocks[symbol] || `${symbol}.NS`;
  }

  // Mock data fallback
  getMockData(symbol) {
    const mockPrices = {
      'RELIANCE': 2456.75,
      'TCS': 3234.50,
      'HDFCBANK': 1567.25,
      'INFY': 1432.80,
      'ITC': 456.90,
      'SBIN': 598.75,
      'KOTAKBANK': 1756.80,
      'BHARTIARTL': 876.45
    };

    const basePrice = mockPrices[symbol] || 1000;
    console.log(`Generating mock data for ${symbol} with base price ${basePrice}`);
    const change = (Math.random() - 0.5) * 50;
    
    return {
      symbol: symbol,
      price: basePrice + change,
      change: change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 20000000) + 5000000,
      marketCap: Math.floor(Math.random() * 1000000) + 100000,
      pe: Math.random() * 30 + 10,
      pb: Math.random() * 3 + 0.5,
      dividend: Math.random() * 3,
      high52w: basePrice * 1.3,
      low52w: basePrice * 0.7,
      timestamp: new Date()
    };
  }

  // Mock historical data
  getMockHistoricalData(symbol, period) {
    const data = [];
    console.log(`Generating mock historical data for ${symbol} with period ${period}`);
    const basePrice = 2000;
    let currentPrice = basePrice;
    
    const days = period === '1d' ? 1 : period === '5d' ? 5 : period === '1m' ? 30 : 
                 period === '3m' ? 90 : period === '6m' ? 180 : 365;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      currentPrice += change;
      
      const high = currentPrice * (1 + Math.random() * 0.02);
      const low = currentPrice * (1 - Math.random() * 0.02);
      const open = low + Math.random() * (high - low);
      
      data.push({
        date: date,
        open: open,
        high: high,
        low: low,
        close: currentPrice,
        volume: Math.floor(Math.random() * 10000000) + 1000000
      });
    }
    
    return data;
  }

  // Get news data
  async getNewsData(symbol = null) {
    try {
      console.log(`Fetching news data for ${symbol || 'market'}`);
      // Try News API if key is available
      if (this.newsApiKey) {
        const query = symbol ? `${symbol} stock` : 'indian stock market';
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${this.newsApiKey}`
        );

        const data = await response.json();
        console.log(`News API response status: ${data.status}, articles: ${data.articles?.length || 0}`);

        if (data.status === 'ok' && data.articles) {
          return data.articles.map((article, index) => ({
            id: index.toString(),
            title: article.title,
            summary: article.description || article.content?.substring(0, 200) + '...',
            sentiment: this.analyzeSentiment(article.title + ' ' + article.description),
            source: article.source.name,
            publishedAt: new Date(article.publishedAt),
            url: article.url,
            impact: this.calculateImpact(article.title)
          }));
        }
      } else {
        console.warn('News API key not configured, using mock data');
      }
    } catch (error) {
      console.warn(`News API failed for ${symbol || 'market'}:`, error.message);
    }

    // Fallback to mock news data
    return this.getMockNewsData(symbol);
  }

  getMockNewsData(symbol) {
    const mockNews = [
      // Generate more relevant mock news based on the symbol
      {
        id: '1',
        title: 'RBI Maintains Repo Rate at 6.5%, Focuses on Inflation Control',
        summary: 'Reserve Bank of India keeps key policy rates unchanged, maintains accommodative stance.',
        sentiment: 'positive',
        source: 'Economic Times',
        publishedAt: new Date(),
        url: '#',
        impact: 'high'
      },
      symbol ? {
        id: '2',
        title: `${symbol || 'Reliance'} Industries Reports Strong Q3 Results`,
        summary: 'Oil-to-telecom conglomerate beats estimates with 25% growth in net profit.',
        sentiment: 'positive',
        source: 'Business Standard',
        publishedAt: new Date(),
        url: '#',
        impact: 'high' 
      } : {
        id: '2',
        title: 'Indian Markets Hit All-Time High on Strong FII Inflows',
        summary: 'Benchmark indices reach record levels as foreign investors show confidence in Indian economy.',
        sentiment: 'positive',
        source: 'Economic Times',
        publishedAt: new Date(),
        impact: 'high'
      },
      {
        id: '3',
        title: 'IT Sector Faces Headwinds Amid Global Slowdown',
        summary: 'Major IT companies revise guidance downward as client spending remains cautious.',
        sentiment: 'negative',
        source: 'Mint',
        publishedAt: new Date(),
        url: '#',
        impact: 'medium'
      },
      {
        id: '4',
        title: 'Banking Sector Shows Resilience with Improved Asset Quality',
        summary: 'PSU banks report significant reduction in NPAs, credit growth remains robust.',
        sentiment: 'positive',
        source: 'Financial Express',
        publishedAt: new Date(),
        url: '#',
        impact: 'medium'
      },
      {
        id: '5',
        title: 'Global Cues Mixed as Fed Signals Rate Cut Delay',
        summary: 'US Federal Reserve indicates patience on rate cuts, impacting global market sentiment.',
        sentiment: 'neutral',
        source: 'Mint',
        publishedAt: new Date(),
        impact: 'high'
      }
    ];

    return symbol ? mockNews.filter(news => 
      news.title.toLowerCase().includes(symbol.toLowerCase())
    ) : mockNews;
  }


  analyzeSentiment(text) {
    const positiveWords = ['strong', 'growth', 'beats', 'positive', 'upgrade', 'bullish', 'gains'];
    const negativeWords = ['weak', 'decline', 'miss', 'negative', 'downgrade', 'bearish', 'losses'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  calculateImpact(title) {
    const highImpactWords = ['rbi', 'rate', 'policy', 'earnings', 'results', 'merger', 'acquisition'];
    const mediumImpactWords = ['upgrade', 'downgrade', 'target', 'guidance', 'outlook'];
    
    const lowerTitle = title.toLowerCase();
    
    if (highImpactWords.some(word => lowerTitle.includes(word))) return 'high';
    if (mediumImpactWords.some(word => lowerTitle.includes(word))) return 'medium';
    return 'low';
  }
}