import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, Brain, Clock } from 'lucide-react';

interface TradingSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  targetPrice: number;
  currentPrice: number;
  stopLoss: number;
  reasoning: string;
  aiScore: number;
  timeGenerated: Date;
}

const TradingSignals: React.FC = () => {
  const [signals, setSignals] = useState<TradingSignal[]>([
    {
      id: '1',
      symbol: 'RELIANCE',
      action: 'BUY',
      confidence: 87,
      targetPrice: 2650,
      currentPrice: 2456.75,
      stopLoss: 2350,
      reasoning: 'Strong technical breakout with high volume. RSI oversold recovery.',
      aiScore: 8.7,
      timeGenerated: new Date()
    },
    {
      id: '2',
      symbol: 'TCS',
      action: 'HOLD',
      confidence: 65,
      targetPrice: 3400,
      currentPrice: 3234.50,
      stopLoss: 3100,
      reasoning: 'Consolidation phase. Awaiting Q4 earnings results.',
      aiScore: 6.5,
      timeGenerated: new Date()
    },
    {
      id: '3',
      symbol: 'HDFCBANK',
      action: 'BUY',
      confidence: 92,
      targetPrice: 1750,
      currentPrice: 1567.25,
      stopLoss: 1480,
      reasoning: 'Banking sector recovery. Strong fundamentals with improving NPA.',
      aiScore: 9.2,
      timeGenerated: new Date()
    },
    {
      id: '4',
      symbol: 'INFY',
      action: 'SELL',
      confidence: 78,
      targetPrice: 1300,
      currentPrice: 1432.80,
      stopLoss: 1500,
      reasoning: 'Weak guidance and margin pressure. Technical breakdown below support.',
      aiScore: 7.8,
      timeGenerated: new Date()
    }
  ]);

  const getSignalIcon = (action: string) => {
    switch (action) {
      case 'BUY':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'SELL':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'HOLD':
        return <Minus className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'signal-buy';
      case 'SELL':
        return 'signal-sell';
      case 'HOLD':
        return 'signal-hold';
      default:
        return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => prev.map(signal => ({
        ...signal,
        currentPrice: signal.currentPrice + (Math.random() - 0.5) * 10,
        confidence: Math.max(30, Math.min(95, signal.confidence + (Math.random() - 0.5) * 5))
      })));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="trading-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Trading Signals
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">AI Active</span>
        </div>
      </div>

      <div className="space-y-4">
        {signals.map((signal, index) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getSignalColor(signal.action)}`}>
                  {getSignalIcon(signal.action)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {signal.symbol}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ₹{signal.currentPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-medium ${getConfidenceColor(signal.confidence)}`}>
                  {signal.confidence}% Confidence
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  AI Score: {signal.aiScore}/10
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  ₹{signal.targetPrice}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Stop Loss</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  ₹{signal.stopLoss}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Potential</p>
                <p className={`text-sm font-semibold ${
                  signal.targetPrice > signal.currentPrice ? 'text-green-600' : 'text-red-600'
                }`}>
                  {((signal.targetPrice - signal.currentPrice) / signal.currentPrice * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {signal.reasoning}
              </p>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {signal.timeGenerated.toLocaleTimeString()}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
              >
                View Analysis
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
        >
          View All Signals
        </motion.button>
      </div>
    </div>
  );
};

export default TradingSignals;