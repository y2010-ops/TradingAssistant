import { useState, useEffect } from 'react';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

export const useMarketData = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        const mockData: MarketData[] = [
          {
            symbol: 'NIFTY50',
            price: 19674.25,
            change: 234.15,
            changePercent: 1.21,
            volume: 125000000,
            timestamp: new Date()
          },
          {
            symbol: 'SENSEX',
            price: 65995.63,
            change: 789.32,
            changePercent: 1.21,
            volume: 85000000,
            timestamp: new Date()
          },
          // Add more mock data as needed
        ];

        setMarketData(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch market data');
        console.error('Market data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    
    // Set up real-time updates
    const interval = setInterval(fetchMarketData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return { marketData, loading, error };
};