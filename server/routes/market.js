import express from 'express';
import { DataProvider } from '../services/dataProvider.js';
import fetch from 'node-fetch';

const router = express.Router();
const dataProvider = new DataProvider();

// Get market indices (NIFTY, SENSEX, etc.)
router.get('/indices', async (req, res) => {
  try {
    // Try to get real data from Alpha Vantage
    const indices = {};
    
    try {
      // Fetch NIFTY 50 data
      const niftyData = await dataProvider.getRealTimeData('^NSEI');
      if (niftyData) {
        indices.nifty50 = {
          symbol: 'NIFTY50',
          name: 'NIFTY 50',
          value: niftyData.price,
          change: niftyData.change,
          changePercent: niftyData.changePercent,
          timestamp: new Date()
        };
      }
      
      // Fetch SENSEX data
      const sensexData = await dataProvider.getRealTimeData('^BSESN');
      if (sensexData) {
        indices.sensex = {
          symbol: 'SENSEX',
          name: 'BSE SENSEX',
          value: sensexData.price,
          change: sensexData.change,
          changePercent: sensexData.changePercent,
          timestamp: new Date()
        };
      }
      
      // Fetch Bank Nifty data
      const bankNiftyData = await dataProvider.getRealTimeData('^NSEBANK');
      if (bankNiftyData) {
        indices.bankNifty = {
          symbol: 'BANKNIFTY',
          name: 'Bank Nifty',
          value: bankNiftyData.price,
          change: bankNiftyData.change,
          changePercent: bankNiftyData.changePercent,
          timestamp: new Date()
        };
      }
      
      // Fetch NIFTY IT data
      const niftyITData = await dataProvider.getRealTimeData('^CNXIT');
      if (niftyITData) {
        indices.niftyIT = {
          symbol: 'NIFTYIT',
          name: 'NIFTY IT',
          value: niftyITData.price,
          change: niftyITData.change,
          changePercent: niftyITData.changePercent,
          timestamp: new Date()
        };
      }
    } catch (error) {
      console.warn('Error fetching real index data:', error.message);
      // Fallback to mock data if real data fetch fails
      indices.nifty50 = {
        symbol: 'NIFTY50',
        name: 'NIFTY 50',
        value: 19674.25,
        change: 234.15,
        changePercent: 1.21,
        timestamp: new Date()
      };
      indices.sensex = {
        symbol: 'SENSEX',
        name: 'BSE SENSEX',
        value: 65995.63,
        change: 789.32,
        changePercent: 1.21,
        timestamp: new Date()
      };
      indices.bankNifty = {
        symbol: 'BANKNIFTY',
        name: 'Bank Nifty',
        value: 44156.85,
        change: -156.25,
        changePercent: -0.35,
        timestamp: new Date()
      };
      indices.niftyIT = {
        symbol: 'NIFTYIT',
        name: 'NIFTY IT',
        value: 28945.30,
        change: -89.45,
        changePercent: -0.31,
        timestamp: new Date()
      };
    }

    res.json(indices);
  } catch (error) {
    console.error('Error fetching market indices:', error);
    res.status(500).json({ error: 'Failed to fetch market indices' });
  }
});

// Get sector performance
router.get('/sectors', async (req, res) => {
  try {
    const sectors = [
      {
        name: 'Banking',
        change: 1.8,
        changePercent: 2.1,
        stocks: 15,
        marketCap: 2500000,
        topStocks: ['HDFCBANK', 'KOTAKBANK', 'SBIN']
      },
      {
        name: 'Information Technology',
        change: -0.5,
        changePercent: -0.8,
        stocks: 12,
        marketCap: 1800000,
        topStocks: ['TCS', 'INFY', 'WIPRO']
      },
      {
        name: 'Energy',
        change: 2.1,
        changePercent: 3.2,
        stocks: 8,
        marketCap: 1200000,
        topStocks: ['RELIANCE', 'ONGC', 'BPCL']
      },
      {
        name: 'FMCG',
        change: 0.8,
        changePercent: 1.2,
        stocks: 10,
        marketCap: 900000,
        topStocks: ['ITC', 'HINDUNILVR', 'NESTLEIND']
      },
      {
        name: 'Automobile',
        change: 1.2,
        changePercent: 2.8,
        stocks: 14,
        marketCap: 800000,
        topStocks: ['MARUTI', 'TATAMOTORS', 'M&M']
      }
    ];

    res.json(sectors);
  } catch (error) {
    console.error('Error fetching sector performance:', error);
    res.status(500).json({ error: 'Failed to fetch sector performance' });
  }
});

// Get top gainers and losers
router.get('/movers', async (req, res) => {
  try {
    const { type = 'both', limit = 10 } = req.query;
    
    const stocks = [
      { symbol: 'RELIANCE', price: 2456.75, change: 45.30, changePercent: 1.88, volume: 12500000 },
      { symbol: 'TCS', price: 3234.50, change: -23.45, changePercent: -0.72, volume: 8500000 },
      { symbol: 'HDFCBANK', price: 1567.25, change: 34.20, changePercent: 2.23, volume: 15000000 },
      { symbol: 'INFY', price: 1432.80, change: -12.65, changePercent: -0.87, volume: 9500000 },
      { symbol: 'ITC', price: 456.90, change: 8.45, changePercent: 1.89, volume: 18000000 },
      { symbol: 'WIPRO', price: 389.50, change: 5.75, changePercent: 1.50, volume: 6500000 },
      { symbol: 'KOTAKBANK', price: 1756.80, change: -15.30, changePercent: -0.86, volume: 4500000 },
      { symbol: 'BHARTIARTL', price: 876.45, change: 12.60, changePercent: 1.46, volume: 8900000 },
      { symbol: 'SBIN', price: 598.75, change: 8.90, changePercent: 1.51, volume: 22000000 },
      { symbol: 'ASIANPAINT', price: 3245.60, change: -45.80, changePercent: -1.39, volume: 3200000 }
    ];

    let result = {};

    if (type === 'gainers' || type === 'both') {
      result.gainers = stocks
        .filter(stock => stock.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, parseInt(limit));
    }

    if (type === 'losers' || type === 'both') {
      result.losers = stocks
        .filter(stock => stock.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, parseInt(limit));
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching market movers:', error);
    res.status(500).json({ error: 'Failed to fetch market movers' });
  }
});

// Get volume leaders
router.get('/volume', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const volumeLeaders = [
      { symbol: 'SBIN', volume: 22000000, avgVolume: 18000000, ratio: 1.22, price: 598.75, changePercent: 1.51 },
      { symbol: 'ITC', volume: 18000000, avgVolume: 15000000, ratio: 1.20, price: 456.90, changePercent: 1.89 },
      { symbol: 'HDFCBANK', volume: 15000000, avgVolume: 12000000, ratio: 1.25, price: 1567.25, changePercent: 2.23 },
      { symbol: 'RELIANCE', volume: 12500000, avgVolume: 10000000, ratio: 1.25, price: 2456.75, changePercent: 1.88 },
      { symbol: 'INFY', volume: 9500000, avgVolume: 8000000, ratio: 1.19, price: 1432.80, changePercent: -0.87 },
      { symbol: 'BHARTIARTL', volume: 8900000, avgVolume: 7500000, ratio: 1.19, price: 876.45, changePercent: 1.46 },
      { symbol: 'TCS', volume: 8500000, avgVolume: 7000000, ratio: 1.21, price: 3234.50, changePercent: -0.72 },
      { symbol: 'WIPRO', volume: 6500000, avgVolume: 5500000, ratio: 1.18, price: 389.50, changePercent: 1.50 },
      { symbol: 'KOTAKBANK', volume: 4500000, avgVolume: 3800000, ratio: 1.18, price: 1756.80, changePercent: -0.86 },
      { symbol: 'ASIANPAINT', volume: 3200000, avgVolume: 2800000, ratio: 1.14, price: 3245.60, changePercent: -1.39 }
    ];

    const result = volumeLeaders
      .sort((a, b) => b.volume - a.volume)
      .slice(0, parseInt(limit));

    res.json(result);
  } catch (error) {
    console.error('Error fetching volume leaders:', error);
    res.status(500).json({ error: 'Failed to fetch volume leaders' });
  }
});

// Get market status
router.get('/status', async (req, res) => {
  try {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;
    
    const marketOpen = 9 * 60 + 15; // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM
    const preMarketStart = 9 * 60; // 9:00 AM

    let status, nextEvent, timeToEvent;

    if (currentTime >= preMarketStart && currentTime < marketOpen) {
      status = 'PRE_MARKET';
      nextEvent = 'Market Open';
      timeToEvent = marketOpen - currentTime;
    } else if (currentTime >= marketOpen && currentTime < marketClose) {
      status = 'OPEN';
      nextEvent = 'Market Close';
      timeToEvent = marketClose - currentTime;
    } else {
      status = 'CLOSED';
      nextEvent = 'Market Open';
      timeToEvent = currentTime < preMarketStart ? 
        preMarketStart - currentTime : 
        (24 * 60) - currentTime + preMarketStart;
    }

    res.json({
      status,
      nextEvent,
      timeToEvent: {
        hours: Math.floor(timeToEvent / 60),
        minutes: timeToEvent % 60
      },
      timestamp: now,
      timezone: 'Asia/Kolkata'
    });
  } catch (error) {
    console.error('Error fetching market status:', error);
    res.status(500).json({ error: 'Failed to fetch market status' });
  }
});

// Get market overview
router.get('/overview', async (req, res) => {
  try {
    // Get indices data
    const indicesResponse = await fetch(`${req.protocol}://${req.get('host')}/api/market/indices`);
    const indices = await indicesResponse.json();
    
    // Get market status
    const statusResponse = await fetch(`${req.protocol}://${req.get('host')}/api/market/status`);
    const marketStatus = await statusResponse.json();
    
    // Get top movers
    const moversResponse = await fetch(`${req.protocol}://${req.get('host')}/api/market/movers?type=both&limit=3`);
    const movers = await moversResponse.json();
    
    // Get sector performance
    const sectorsResponse = await fetch(`${req.protocol}://${req.get('host')}/api/market/sectors`);
    const sectors = await sectorsResponse.json();
    
    // Get volume leaders
    const volumeResponse = await fetch(`${req.protocol}://${req.get('host')}/api/market/volume?limit=3`);
    const volumeLeaders = await volumeResponse.json();
    
    // Combine all data
    const overview = {
      indices,
      marketStatus,
      topGainers: movers.gainers || [],
      topLosers: movers.losers || [],
      sectorPerformance: sectors.map(s => ({ sector: s.name, change: s.changePercent })) || [],
      volumeLeaders: volumeLeaders || []
    };

    res.json(overview);
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({ error: 'Failed to fetch market overview' });
  }
});

// Get news for market or specific stock
router.get('/news', async (req, res) => {
  try {
    const { symbol, limit = 10 } = req.query;
    
    // Use the dataProvider to get news
    const news = await dataProvider.getNewsData(symbol);
    
    // Limit the results
    const limitedNews = news.slice(0, parseInt(limit as string));
    
    res.json(limitedNews);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

export default router;