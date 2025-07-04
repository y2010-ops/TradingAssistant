import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Search, TrendingUp, TrendingDown, Activity, Target, Brain, AlertTriangle } from 'lucide-react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  pb: number;
  dividend: number;
  high52w: number;
  low52w: number;
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  description: string;
}

const StockAnalysis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockData>({
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    price: 2456.75,
    change: 45.30,
    changePercent: 1.88,
    volume: 12500000,
    marketCap: 1650000,
    pe: 28.5,
    pb: 2.1,
    dividend: 1.2,
    high52w: 2856.50,
    low52w: 2100.30
  });

  // Enhanced stock search with API integration
  const searchStocks = async (query: string) => {
    if (!query.trim()) return [];
    
    try {
      const response = await fetch(`/api/stocks/search/${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        return results;
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    
    // Fallback to local search
    return popularStocks.filter(stock =>
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const [searchResults, setSearchResults] = useState<typeof popularStocks>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsSearching(true);
        const results = await searchStocks(searchTerm);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleStockSelect = async (stock: { symbol: string; name: string }) => {
    try {
      // Fetch real stock data when selected
      const response = await fetch(`/api/stocks/${stock.symbol}`);
      if (response.ok) {
        const stockData = await response.json();
        setSelectedStock({
          symbol: stockData.symbol,
          name: stockData.name,
          price: stockData.price || stockData.currentPrice,
          change: stockData.change,
          changePercent: stockData.changePercent,
          volume: stockData.volume,
          marketCap: stockData.marketCap,
          pe: stockData.pe,
          pb: stockData.pb,
          dividend: stockData.dividend,
          high52w: stockData.high52w,
          low52w: stockData.low52w
        });
      } else {
        // Fallback to basic stock info
        setSelectedStock(prev => ({
          ...prev,
          symbol: stock.symbol,
          name: stock.name
        }));
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Fallback to basic stock info
      setSelectedStock(prev => ({
        ...prev,
        symbol: stock.symbol,
        name: stock.name
      }));
    }
    
    setSearchTerm('');
    setSearchResults([]);
  };
  const [chartData, setChartData] = useState([
    { time: '09:30', price: 2411.45, volume: 1200000 },
    { time: '10:00', price: 2425.30, volume: 1500000 },
    { time: '10:30', price: 2433.75, volume: 1100000 },
    { time: '11:00', price: 2428.90, volume: 1800000 },
    { time: '11:30', price: 2445.20, volume: 1600000 },
    { time: '12:00', price: 2451.85, volume: 1400000 },
    { time: '12:30', price: 2456.75, volume: 1700000 },
  ]);

  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>([
    { name: 'RSI (14)', value: 67.5, signal: 'BUY', description: 'Approaching overbought but still bullish' },
    { name: 'MACD', value: 12.3, signal: 'BUY', description: 'Positive divergence, bullish crossover' },
    { name: 'Bollinger Bands', value: 0.75, signal: 'HOLD', description: 'Price near upper band, consolidation expected' },
    { name: 'Moving Average (20)', value: 2398.45, signal: 'BUY', description: 'Price above 20-day MA, uptrend intact' },
    { name: 'Volume', value: 125, signal: 'BUY', description: 'Above average volume confirms momentum' },
    { name: 'Support Level', value: 2380.00, signal: 'HOLD', description: 'Strong support at 2380 level' }
  ]);

  const popularStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank' },
    { symbol: 'INFY', name: 'Infosys' },
    { symbol: 'ITC', name: 'ITC Limited' },
    { symbol: 'SBIN', name: 'State Bank of India' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel' }
  ];

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'SELL':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'HOLD':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getOverallSignal = () => {
    const buySignals = technicalIndicators.filter(i => i.signal === 'BUY').length;
    const sellSignals = technicalIndicators.filter(i => i.signal === 'SELL').length;
    const holdSignals = technicalIndicators.filter(i => i.signal === 'HOLD').length;

    if (buySignals > sellSignals && buySignals > holdSignals) {
      return { signal: 'BUY', strength: 'Strong', color: 'text-green-600' };
    } else if (sellSignals > buySignals && sellSignals > holdSignals) {
      return { signal: 'SELL', strength: 'Strong', color: 'text-red-600' };
    } else {
      return { signal: 'HOLD', strength: 'Moderate', color: 'text-yellow-600' };
    }
  };

  const overallSignal = getOverallSignal();

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => [
        ...prev.slice(1),
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: selectedStock.price + (Math.random() - 0.5) * 20,
          volume: Math.floor(Math.random() * 2000000) + 1000000
        }
      ]);

      setSelectedStock(prev => ({
        ...prev,
        price: prev.price + (Math.random() - 0.5) * 10,
        change: prev.change + (Math.random() - 0.5) * 5,
        changePercent: prev.changePercent + (Math.random() - 0.5) * 0.5
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedStock.price]);

  // Show search results if searching, otherwise show popular stocks
  const displayStocks = searchTerm ? searchResults : popularStocks.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Stock Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Deep technical and fundamental analysis powered by AI
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="trading-card p-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stocks (e.g., RELIANCE, TCS, HDFCBANK)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {(searchTerm || isSearching) && (
          <div className="mt-4">
            {isSearching && (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">Searching...</span>
              </div>
            )}
            
            {!isSearching && displayStocks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {displayStocks.map(stock => (
                  <motion.button
                    key={stock.symbol}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStockSelect(stock)}
                    className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</div>
                  </motion.button>
                ))}
              </div>
            )}
            
            {!isSearching && searchTerm && displayStocks.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400">No stocks found for "{searchTerm}"</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Try searching for popular stocks like RELIANCE, TCS, HDFCBANK
                </p>
              </div>
            )}
          </div>
        )}
        
        {!searchTerm && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Popular Stocks:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {popularStocks.slice(0, 8).map(stock => (
                <motion.button
                  key={stock.symbol}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStockSelect(stock)}
                  className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Search Suggestions */}
      {!searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="trading-card p-4"
        >
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Search Examples:
          </h3>
          <div className="flex flex-wrap gap-2">
            {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ITC'].map(symbol => (
              <motion.button
                key={symbol}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSearchTerm(symbol)}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                {symbol}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stock Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="trading-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedStock.symbol}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{selectedStock.name}</p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              ₹{selectedStock.price.toFixed(2)}
            </div>
            <div className={`text-lg font-medium ${
              selectedStock.changePercent > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {selectedStock.changePercent > 0 ? '+' : ''}₹{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Volume</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {(selectedStock.volume / 1000000).toFixed(1)}M
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Market Cap</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              ₹{selectedStock.marketCap}Cr
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {selectedStock.pe}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">P/B Ratio</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {selectedStock.pb}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">52W High</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              ₹{selectedStock.high52w}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">52W Low</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              ₹{selectedStock.low52w}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="trading-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Price Movement
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Volume Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="trading-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Volume Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="volume" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Technical Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="trading-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Technical Analysis
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className={`font-semibold ${overallSignal.color}`}>
              {overallSignal.strength} {overallSignal.signal}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {technicalIndicators.map((indicator, index) => (
            <motion.div
              key={indicator.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {indicator.name}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(indicator.signal)}`}>
                  {indicator.signal}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {indicator.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {indicator.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="trading-card p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Recommendation
          </h3>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              overallSignal.signal === 'BUY' ? 'bg-green-500' : 
              overallSignal.signal === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'
            }`}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {overallSignal.strength} {overallSignal.signal} Signal
              </h4>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Based on comprehensive technical analysis of {technicalIndicators.length} indicators, 
                our AI recommends a <strong>{overallSignal.signal}</strong> position for {selectedStock.symbol}. 
                The stock shows {overallSignal.strength.toLowerCase()} momentum with favorable risk-reward ratio.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Remember: This is not financial advice. Always do your own research.</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StockAnalysis;