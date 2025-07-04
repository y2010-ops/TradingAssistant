import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface HeatmapData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

const MarketHeatmap: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stocks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }
      
      const data = await response.json();
      
      // Format the data to match our HeatmapData interface
      const formattedData = data.map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.currentPrice || stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
        marketCap: stock.marketCap
      }));
      
      setHeatmapData(formattedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching stocks for heatmap:', err);
      setError('Failed to load stock data');
      
      // Fallback to mock data if API fails
      if (heatmapData.length === 0) {
        setHeatmapData([
          { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.75, change: 45.30, changePercent: 1.88, volume: 12500000, marketCap: 1650000 },
          { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3234.50, change: -23.45, changePercent: -0.72, volume: 8500000, marketCap: 1200000 },
          { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1567.25, change: 34.20, changePercent: 2.23, volume: 15000000, marketCap: 850000 },
          { symbol: 'INFY', name: 'Infosys', price: 1432.80, change: -12.65, changePercent: -0.87, volume: 9500000, marketCap: 720000 },
          { symbol: 'ITC', name: 'ITC Limited', price: 456.90, change: 8.45, changePercent: 1.89, volume: 18000000, marketCap: 580000 },
          { symbol: 'WIPRO', name: 'Wipro Limited', price: 389.50, change: 5.75, changePercent: 1.50, volume: 6500000, marketCap: 210000 },
          { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1756.80, change: -15.30, changePercent: -0.86, volume: 4500000, marketCap: 350000 },
          { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 876.45, change: 12.60, changePercent: 1.46, volume: 8900000, marketCap: 485000 },
          { symbol: 'SBIN', name: 'State Bank of India', price: 598.75, change: 8.90, changePercent: 1.51, volume: 22000000, marketCap: 520000 },
          { symbol: 'ASIANPAINT', name: 'Asian Paints', price: 3245.60, change: -45.80, changePercent: -1.39, volume: 3200000, marketCap: 310000 },
          { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1234.50, change: 18.75, changePercent: 1.54, volume: 5600000, marketCap: 335000 },
          { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 6845.30, change: -89.50, changePercent: -1.29, volume: 2800000, marketCap: 425000 }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [heatmapData.length]);

  const getColorIntensity = (changePercent: number) => {
    const intensity = Math.min(Math.abs(changePercent) / 3, 1);
    return changePercent > 0 ? 
      `rgba(16, 185, 129, ${0.3 + intensity * 0.5})` : 
      `rgba(239, 68, 68, ${0.3 + intensity * 0.5})`;
  };

  const getBoxSize = (marketCap: number) => {
    const maxCap = Math.max(...heatmapData.map(d => d.marketCap));
    const ratio = marketCap / maxCap;
    return {
      width: Math.max(120, 180 * ratio),
      height: Math.max(80, 120 * ratio)
    };
  };

  useEffect(() => {
    // Initial fetch
    fetchStockData();
    
    // Set up interval for updates
    const interval = setInterval(fetchStockData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [fetchStockData]);

  return (
    <div className="trading-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Market Heatmap
        </h3>
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Updating...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Gains</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Losses</span>
            </div>
          </div>
        )}
      </div>

      {loading && heatmapData.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading market data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={fetchStockData}
            className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {heatmapData.map((stock, index) => {
            const boxSize = getBoxSize(stock.marketCap);
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative rounded-lg p-3 border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: getColorIntensity(stock.changePercent),
                  minHeight: '80px'
                }}
              >
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      {stock.symbol}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {stock.name}
                    </p>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{stock.price?.toFixed(2) || '0.00'}
                    </p>
                    <p className={`text-xs font-medium ${
                      stock.changePercent > 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {stock.changePercent > 0 ? '+' : ''}{stock.changePercent?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Size represents market capitalization • Color intensity represents price change
      </div>
    </div>
  );
};

export default MarketHeatmap;