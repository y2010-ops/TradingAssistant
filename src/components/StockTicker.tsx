import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const StockTicker: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stocks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }
      
      const data = await response.json();
      
      // Format the data to match our StockData interface
      const formattedData = data.map((stock: any) => ({
        symbol: stock.symbol,
        price: stock.currentPrice || stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
      }));
      
      setStocks(formattedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError('Failed to load stock data');
      
      // Fallback to mock data if API fails
      if (stocks.length === 0) {
        setStocks([
          { symbol: 'RELIANCE', price: 2456.75, change: 45.30, changePercent: 1.88 },
          { symbol: 'TCS', price: 3234.50, change: -23.45, changePercent: -0.72 },
          { symbol: 'HDFCBANK', price: 1567.25, change: 34.20, changePercent: 2.23 },
          { symbol: 'INFY', price: 1432.80, change: -12.65, changePercent: -0.87 },
          { symbol: 'ITC', price: 456.90, change: 8.45, changePercent: 1.89 },
          { symbol: 'WIPRO', price: 389.50, change: 5.75, changePercent: 1.50 },
          { symbol: 'KOTAKBANK', price: 1756.80, change: -15.30, changePercent: -0.86 },
          { symbol: 'BHARTIARTL', price: 876.45, change: 12.60, changePercent: 1.46 },
          { symbol: 'SBIN', price: 598.75, change: 8.90, changePercent: 1.51 },
          { symbol: 'ASIANPAINT', price: 3245.60, change: -45.80, changePercent: -1.39 }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [stocks.length]);

  useEffect(() => {
    // Initial fetch
    fetchStocks();
    
    // Set up interval for updates
    const interval = setInterval(fetchStocks, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [fetchStocks]);

  return (
    <div className="trading-card p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Live Market Ticker
        </h3>
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Updating...</span>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Offline</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
          </div>
        )}
      </div>
      
      {loading && stocks.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading stock data...</p>
        </div>
      ) : (
        <div className="relative">
          <motion.div
            className="flex space-x-8 ticker-scroll"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {stocks.concat(stocks).map((stock, index) => (
              <div 
                key={`${stock.symbol}-${index}`}
                className="flex-shrink-0 flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {stock.symbol}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{stock.price?.toFixed(2) || '0.00'}
                  </span>
                </div>
                
                <div className={`flex items-center space-x-1 ${
                  stock.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stock.changePercent > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {stock.changePercent > 0 ? '+' : ''}{stock.changePercent?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StockTicker;