import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Heart, TrendingUp, TrendingDown, MessageSquare, Twitter, Globe, AlertCircle } from 'lucide-react';

interface SentimentData {
  source: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

interface TrendingStock {
  symbol: string;
  name: string;
  sentiment: number;
  mentions: number;
  change: number;
  volume: number;
}

const Sentiment: React.FC = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([
    { source: 'News', positive: 45, negative: 25, neutral: 30, total: 1240 },
    { source: 'Twitter', positive: 38, negative: 35, neutral: 27, total: 8950 },
    { source: 'Reddit', positive: 52, negative: 18, neutral: 30, total: 450 },
    { source: 'Forums', positive: 41, negative: 29, neutral: 30, total: 680 }
  ]);

  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([
    { symbol: 'RELIANCE', name: 'Reliance Industries', sentiment: 0.75, mentions: 1200, change: 1.88, volume: 12500000 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', sentiment: 0.32, mentions: 890, change: -0.72, volume: 8500000 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', sentiment: 0.68, mentions: 1450, change: 2.23, volume: 15000000 },
    { symbol: 'INFY', name: 'Infosys', sentiment: 0.15, mentions: 750, change: -0.87, volume: 9500000 },
    { symbol: 'ITC', name: 'ITC Limited', sentiment: 0.82, mentions: 650, change: 1.89, volume: 18000000 }
  ]);

  const [marketSentiment, setMarketSentiment] = useState([
    { time: '09:00', sentiment: 0.45, volume: 150000 },
    { time: '10:00', sentiment: 0.52, volume: 180000 },
    { time: '11:00', sentiment: 0.48, volume: 160000 },
    { time: '12:00', sentiment: 0.58, volume: 190000 },
    { time: '13:00', sentiment: 0.62, volume: 200000 },
    { time: '14:00', sentiment: 0.55, volume: 175000 },
    { time: '15:00', sentiment: 0.60, volume: 185000 }
  ]);

  const pieColors = ['#10b981', '#ef4444', '#6b7280'];

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.6) return 'text-green-600';
    if (sentiment > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.6) return 'Positive';
    if (sentiment > 0.4) return 'Neutral';
    return 'Negative';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.6) return <TrendingUp className="w-4 h-4" />;
    if (sentiment > 0.4) return <Heart className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const overallSentiment = sentimentData.reduce((acc, curr) => {
    const total = acc.total + curr.total;
    const positive = acc.positive + (curr.positive * curr.total / 100);
    const negative = acc.negative + (curr.negative * curr.total / 100);
    return {
      positive: positive / total * 100,
      negative: negative / total * 100,
      neutral: 100 - (positive + negative) / total * 100,
      total
    };
  }, { positive: 0, negative: 0, neutral: 0, total: 0 });

  const sentimentScore = overallSentiment.positive / 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setSentimentData(prev => prev.map(item => ({
        ...item,
        positive: Math.max(0, Math.min(100, item.positive + (Math.random() - 0.5) * 5)),
        negative: Math.max(0, Math.min(100, item.negative + (Math.random() - 0.5) * 5)),
        neutral: Math.max(0, Math.min(100, item.neutral + (Math.random() - 0.5) * 5))
      })));

      setMarketSentiment(prev => [
        ...prev.slice(1),
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sentiment: Math.max(0, Math.min(1, sentimentScore + (Math.random() - 0.5) * 0.1)),
          volume: Math.floor(Math.random() * 50000) + 150000
        }
      ]);
    }, 10000);

    return () => clearInterval(interval);
  }, [sentimentScore]);

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
            Market Sentiment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time sentiment analysis from news, social media, and forums
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Live Tracking</span>
          </div>
        </div>
      </motion.div>

      {/* Overall Sentiment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="trading-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Overall Market Sentiment
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${getSentimentColor(sentimentScore)}`}>
              {getSentimentIcon(sentimentScore)}
              <span className="font-semibold">
                {getSentimentLabel(sentimentScore)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {overallSentiment.positive.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Positive</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {overallSentiment.negative.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Negative</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {overallSentiment.neutral.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Neutral</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {overallSentiment.total.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Mentions</div>
          </div>
        </div>
      </motion.div>

      {/* Sentiment by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="trading-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sentiment Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Positive', value: overallSentiment.positive },
                  { name: 'Negative', value: overallSentiment.negative },
                  { name: 'Neutral', value: overallSentiment.neutral }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieColors.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Source Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="trading-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sentiment by Source
          </h3>
          <div className="space-y-4">
            {sentimentData.map((source, index) => (
              <div key={source.source} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {source.source === 'Twitter' && <Twitter className="w-5 h-5 text-blue-500" />}
                    {source.source === 'News' && <Globe className="w-5 h-5 text-green-500" />}
                    {source.source === 'Reddit' && <MessageSquare className="w-5 h-5 text-orange-500" />}
                    {source.source === 'Forums' && <MessageSquare className="w-5 h-5 text-purple-500" />}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {source.source}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {source.total.toLocaleString()} mentions
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{source.positive}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>{source.negative}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>{source.neutral}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Trending Stocks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="trading-card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Trending Stocks by Sentiment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingStocks.map((stock, index) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {stock.symbol}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stock.name}
                  </p>
                </div>
                <div className={`flex items-center space-x-1 ${getSentimentColor(stock.sentiment)}`}>
                  {getSentimentIcon(stock.sentiment)}
                  <span className="text-sm font-medium">
                    {getSentimentLabel(stock.sentiment)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Mentions</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {stock.mentions.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Price Change</p>
                  <p className={`font-semibold ${
                    stock.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${stock.sentiment * 100}%` }}
                ></div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sentiment Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="trading-card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sentiment Timeline
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={marketSentiment}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 1]} />
            <Tooltip 
              formatter={(value) => [`${(value as number * 100).toFixed(1)}%`, 'Sentiment']}
            />
            <Line 
              type="monotone" 
              dataKey="sentiment" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="trading-card p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
      >
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              Sentiment Alert
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              RELIANCE sentiment has improved by 15% in the last hour due to positive earnings news.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Sentiment;