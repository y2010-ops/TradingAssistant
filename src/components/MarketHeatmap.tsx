import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface HeatmapData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  sector: string;
}

const MarketHeatmap: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('All');

  // Mock data for the heatmap
  const mockHeatmapData: HeatmapData[] = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.75, change: 45.30, changePercent: 1.88, marketCap: 1650000, sector: 'Energy' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3234.50, change: -23.45, changePercent: -0.72, marketCap: 1200000, sector: 'IT' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1567.25, change: 34.20, changePercent: 2.23, marketCap: 950000, sector: 'Banking' },
    { symbol: 'INFY', name: 'Infosys', price: 1432.80, change: -12.65, changePercent: -0.87, marketCap: 600000, sector: 'IT' },
    { symbol: 'ITC', name: 'ITC Limited', price: 456.90, change: 8.45, changePercent: 1.89, marketCap: 570000, sector: 'FMCG' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 987.60, change: 15.80, changePercent: 1.63, marketCap: 690000, sector: 'Banking' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 876.45, change: -8.90, changePercent: -1.01, marketCap: 480000, sector: 'Telecom' },
    { symbol: 'SBIN', name: 'State Bank of India', price: 623.75, change: 12.30, changePercent: 2.01, marketCap: 560000, sector: 'Banking' },
    { symbol: 'LT', name: 'Larsen & Toubro', price: 2987.40, change: -45.60, changePercent: -1.50, marketCap: 420000, sector: 'Infrastructure' },
    { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1234.90, change: 23.45, changePercent: 1.94, marketCap: 340000, sector: 'IT' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints', price: 3245.60, change: -45.80, changePercent: -1.39, marketCap: 310000, sector: 'Consumer Goods' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki', price: 9876.30, change: 123.45, changePercent: 1.27, marketCap: 300000, sector: 'Automotive' }
  ];

  const sectors = ['All', 'Banking', 'IT', 'Energy', 'FMCG', 'Telecom', 'Infrastructure', 'Consumer Goods', 'Automotive'];

  useEffect(() => {
    // Simulate API call
    const fetchHeatmapData = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHeatmapData(mockHeatmapData);
      setLoading(false);
    };

    fetchHeatmapData();
  }, []);

  const filteredData = selectedSector === 'All' 
    ? heatmapData 
    : heatmapData.filter(stock => stock.sector === selectedSector);

  const getColorIntensity = (changePercent: number) => {
    const intensity = Math.min(Math.abs(changePercent) / 3, 1); // Cap at 3% for full intensity
    if (changePercent > 0) {
      return `rgba(34, 197, 94, ${0.2 + intensity * 0.6})`; // Green with varying opacity
    } else if (changePercent < 0) {
      return `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`; // Red with varying opacity
    }
    return 'rgba(156, 163, 175, 0.2)'; // Neutral gray
  };

  const getBoxSize = (marketCap: number) => {
    const maxCap = Math.max(...heatmapData.map(d => d.marketCap));
    const minSize = 120;
    const maxSize = 200;
    const ratio = marketCap / maxCap;
    return minSize + (maxSize - minSize) * ratio;
  };

  if (loading) {
    return (
      <div className="trading-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Market Heatmap
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="trading-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Market Heatmap
        </h3>
        <div className="flex items-center space-x-2">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 focus:ring-2 focus:ring-blue-500"
          >
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredData.map((stock, index) => {
          const boxSize = getBoxSize(stock.marketCap);
          return (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group cursor-pointer"
              style={{
                backgroundColor: getColorIntensity(stock.changePercent),
                minHeight: `${Math.max(boxSize * 0.6, 80)}px`,
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="p-3 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {stock.symbol}
                    </span>
                    {stock.changePercent > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : stock.changePercent < 0 ? (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    ) : (
                      <Activity className="w-3 h-3 text-gray-500" />
                    )}
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    ₹{stock.price.toLocaleString()}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xs font-medium ${
                    stock.changePercent > 0 ? 'text-green-700 dark:text-green-300' : 
                    stock.changePercent < 0 ? 'text-red-700 dark:text-red-300' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </div>
                  <div className={`text-xs ${
                    stock.changePercent > 0 ? 'text-green-600 dark:text-green-400' : 
                    stock.changePercent < 0 ? 'text-red-600 dark:text-red-400' : 
                    'text-gray-500 dark:text-gray-500'
                  }`}>
                    {stock.change > 0 ? '+' : ''}₹{stock.change.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                <div className="font-medium">{stock.name}</div>
                <div>Market Cap: ₹{(stock.marketCap / 1000).toFixed(0)}K Cr</div>
                <div>Sector: {stock.sector}</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No stocks found for the selected sector.
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center mt-6 space-x-6 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 bg-opacity-60 rounded"></div>
          <span>Gainers</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 bg-opacity-60 rounded"></div>
          <span>Losers</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-400 bg-opacity-40 rounded"></div>
          <span>Neutral</span>
        </div>
        <span className="text-xs">Size = Market Cap</span>
      </div>
    </div>
  );
};

export default MarketHeatmap;