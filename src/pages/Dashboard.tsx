import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import StockTicker from '../components/StockTicker';
import MarketHeatmap from '../components/MarketHeatmap';
import TradingSignals from '../components/TradingSignals';
import QuickStats from '../components/QuickStats';
import NewsWidget from '../components/NewsWidget';
import { useMarketData } from '../hooks/useMarketData';

const Dashboard: React.FC = () => {
  const { marketData, loading, error } = useMarketData();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [marketOverview, setMarketOverview] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const timeframes = ['1D', '5D', '1M', '3M', '6M', '1Y'];

  const fetchMarketOverview = useCallback(async () => {
    try {
      setLoadingOverview(true);
      const response = await fetch('/api/market/overview');
      
      if (!response.ok) {
        throw new Error('Failed to fetch market overview');
      }
      
      const data = await response.json();
      setMarketOverview(data);
      setOverviewError(null);
    } catch (err) {
      console.error('Error fetching market overview:', err);
      setOverviewError('Failed to load market data');
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketOverview();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketOverview, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchMarketOverview]);

  // Generate stats cards from market overview data
  const getStatsCards = () => {
    if (!marketOverview || !marketOverview.indices) {
      return [
        {
          title: 'NIFTY 50',
          value: '19,674.25',
          change: '+234.15',
          changePercent: '+1.21%',
          positive: true,
          icon: TrendingUp,
          color: 'blue'
        },
        {
          title: 'SENSEX',
          value: '65,995.63',
          change: '+789.32',
          changePercent: '+1.21%',
          positive: true,
          icon: BarChart3,
          color: 'green'
        },
        {
          title: 'Bank Nifty',
          value: '44,156.85',
          change: '-156.25',
          changePercent: '-0.35%',
          positive: false,
          icon: TrendingDown,
          color: 'red'
        },
        {
          title: 'India VIX',
          value: '13.25',
          change: '+0.89',
          changePercent: '+7.21%',
          positive: true,
          icon: Activity,
          color: 'yellow'
        }
      ];
    }
    
    const { nifty50, sensex, bankNifty } = marketOverview.indices;
    
    return [
      {
        title: 'NIFTY 50',
        value: nifty50.value.toLocaleString(),
        change: nifty50.change > 0 ? `+${nifty50.change.toFixed(2)}` : nifty50.change.toFixed(2),
        changePercent: nifty50.changePercent > 0 ? `+${nifty50.changePercent.toFixed(2)}%` : `${nifty50.changePercent.toFixed(2)}%`,
        positive: nifty50.changePercent > 0,
        icon: nifty50.changePercent > 0 ? TrendingUp : TrendingDown,
        color: nifty50.changePercent > 0 ? 'blue' : 'red'
      },
      {
        title: 'SENSEX',
        value: sensex.value.toLocaleString(),
        change: sensex.change > 0 ? `+${sensex.change.toFixed(2)}` : sensex.change.toFixed(2),
        changePercent: sensex.changePercent > 0 ? `+${sensex.changePercent.toFixed(2)}%` : `${sensex.changePercent.toFixed(2)}%`,
        positive: sensex.changePercent > 0,
        icon: sensex.changePercent > 0 ? TrendingUp : TrendingDown,
        color: sensex.changePercent > 0 ? 'green' : 'red'
      },
      {
        title: 'Bank Nifty',
        value: bankNifty.value.toLocaleString(),
        change: bankNifty.change > 0 ? `+${bankNifty.change.toFixed(2)}` : bankNifty.change.toFixed(2),
        changePercent: bankNifty.changePercent > 0 ? `+${bankNifty.changePercent.toFixed(2)}%` : `${bankNifty.changePercent.toFixed(2)}%`,
        positive: bankNifty.changePercent > 0,
        icon: bankNifty.changePercent > 0 ? TrendingUp : TrendingDown,
        color: bankNifty.changePercent > 0 ? 'green' : 'red'
      },
      {
        title: 'Market Status',
        value: marketOverview.marketStatus?.status || 'OPEN',
        change: marketOverview.marketStatus?.nextEvent || 'Market Close',
        changePercent: '',
        positive: marketOverview.marketStatus?.status === 'OPEN',
        icon: Activity,
        color: 'yellow'
      }
    ];
  };

  // Get top movers from market overview
  const getTopMovers = () => {
    if (!marketOverview || (!marketOverview.topGainers && !marketOverview.topLosers)) {
      return [
        { symbol: 'RELIANCE', price: 2456.75, change: 45.30, changePercent: 1.88 },
        { symbol: 'TCS', price: 3234.50, change: -23.45, changePercent: -0.72 },
        { symbol: 'HDFCBANK', price: 1567.25, change: 34.20, changePercent: 2.23 },
        { symbol: 'INFY', price: 1432.80, change: -12.65, changePercent: -0.87 },
        { symbol: 'ITC', price: 456.90, change: 8.45, changePercent: 1.89 }
      ];
    }
    
    // Combine gainers and losers
    const movers = [
      ...(marketOverview.topGainers || []),
      ...(marketOverview.topLosers || [])
    ].slice(0, 5);
    
    return movers;
  };

  const statsCards = getStatsCards();
  const topMovers = getTopMovers();

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
            Market Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time market data and AI-powered insights
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stock Ticker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StockTicker />
      </motion.div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="trading-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${card.color}-100 dark:bg-${card.color}-900/20`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
                </div>
                <div className={`flex items-center space-x-1 ${
                  card.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.changePercent && (
                    <>
                      {card.positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      <span className="text-sm font-medium">{card.changePercent}</span>
                    </>
                  )}
                </div>
              </div>
              
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {card.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {card.value}
              </p>
              <p className={`text-sm ${
                card.positive ? 'text-green-600' : card.title === 'Market Status' ? 'text-gray-600 dark:text-gray-400' : 'text-red-600'
              }`}>
                {card.change}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Heatmap */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <MarketHeatmap />
        </motion.div>

        {/* Top Movers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="trading-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Movers
          </h3>
          <div className="space-y-3">
            {topMovers.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {stock.symbol}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{stock.price}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    stock.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {`${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`}
                  </p>
                  <p className={`text-xs ${
                    stock.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {`${stock.change > 0 ? '+' : ''}₹${stock.change.toFixed(2)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Trading Signals and News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TradingSignals />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <NewsWidget />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;