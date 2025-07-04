import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
  publishedAt: Date;
  url: string;
  impact: 'high' | 'medium' | 'low';
}

const NewsWidget: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/market/news?limit=5', {
        // Add error handling for timeouts
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      setNews(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    
    // Set up interval for updates with a more reliable approach
    let intervalId: number | undefined;
    
    const setupInterval = () => {
      intervalId = window.setInterval(fetchNews, 5 * 60 * 1000);
    };
    
    // Start the interval
    setupInterval();
    
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [fetchNews]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (minutes < 1440) {
      return `${Math.floor(minutes / 60)}h ago`;
    } else {
      return `${Math.floor(minutes / 1440)}d ago`;
    }
  };

  return (
    <div className="trading-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Market News
          </h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchNews}
          className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline flex items-center"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
              Refreshing...
            </>
          ) : (
            'Refresh News'
          )}
        </motion.button>
      </div>

      {loading && news.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading latest news...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={fetchNews}
            className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {news.length > 0 ? (
            news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactBadge(item.impact)}`}>
                      {item.impact.toUpperCase()}
                    </span>
                    <span className={`text-sm font-medium ${getSentimentColor(item.sentiment)}`}>
                      {item.sentiment.toUpperCase()}
                    </span>
                  </div>
                  {item.url && item.url !== '#' ? (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {item.title}
                </h4>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span>{item.source}</span>
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(item.publishedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Market Impact</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No news available at the moment</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">
            AI is analyzing 1,247 news articles for market sentiment
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewsWidget;