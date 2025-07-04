import { mean, standardDeviation } from 'simple-statistics';

export class TechnicalAnalysis {
  // Simple Moving Average
  static sma(prices, period) {
    const result = [];
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      result.push(mean(slice));
    }
    return result;
  }

  // Exponential Moving Average
  static ema(prices, period) {
    const multiplier = 2 / (period + 1);
    const result = [prices[0]];
    
    for (let i = 1; i < prices.length; i++) {
      const ema = (prices[i] * multiplier) + (result[i - 1] * (1 - multiplier));
      result.push(ema);
    }
    return result;
  }

  // Relative Strength Index
  static rsi(prices, period = 14) {
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = mean(gains.slice(0, period));
    const avgLoss = mean(losses.slice(0, period));
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // MACD
  static macd(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const emaFast = this.ema(prices, fastPeriod);
    const emaSlow = this.ema(prices, slowPeriod);
    
    const macdLine = [];
    const startIndex = Math.max(emaFast.length, emaSlow.length) - Math.min(emaFast.length, emaSlow.length);
    
    for (let i = startIndex; i < Math.min(emaFast.length, emaSlow.length); i++) {
      macdLine.push(emaFast[i] - emaSlow[i]);
    }
    
    const signalLine = this.ema(macdLine, signalPeriod);
    const histogram = macdLine.slice(-signalLine.length).map((val, i) => val - signalLine[i]);
    
    return {
      macd: macdLine[macdLine.length - 1],
      signal: signalLine[signalLine.length - 1],
      histogram: histogram[histogram.length - 1]
    };
  }

  // Bollinger Bands
  static bollingerBands(prices, period = 20, multiplier = 2) {
    const sma = this.sma(prices, period);
    const lastSMA = sma[sma.length - 1];
    const recentPrices = prices.slice(-period);
    const stdDev = standardDeviation(recentPrices);
    
    return {
      upper: lastSMA + (stdDev * multiplier),
      middle: lastSMA,
      lower: lastSMA - (stdDev * multiplier)
    };
  }

  // Generate comprehensive technical analysis
  static analyze(historicalData) {
    const prices = historicalData.map(d => d.close);
    const volumes = historicalData.map(d => d.volume);
    
    const currentPrice = prices[prices.length - 1];
    const rsi = this.rsi(prices);
    const macd = this.macd(prices);
    const bb = this.bollingerBands(prices);
    const sma20 = this.sma(prices, 20);
    const sma50 = this.sma(prices, 50);
    const ema12 = this.ema(prices, 12);
    
    // Generate signals
    const signals = [];
    
    // RSI Signal
    if (rsi < 30) {
      signals.push({ indicator: 'RSI', signal: 'BUY', strength: 0.8, reason: 'Oversold condition' });
    } else if (rsi > 70) {
      signals.push({ indicator: 'RSI', signal: 'SELL', strength: 0.8, reason: 'Overbought condition' });
    } else {
      signals.push({ indicator: 'RSI', signal: 'HOLD', strength: 0.5, reason: 'Neutral momentum' });
    }
    
    // MACD Signal
    if (macd.macd > macd.signal && macd.histogram > 0) {
      signals.push({ indicator: 'MACD', signal: 'BUY', strength: 0.7, reason: 'Bullish crossover' });
    } else if (macd.macd < macd.signal && macd.histogram < 0) {
      signals.push({ indicator: 'MACD', signal: 'SELL', strength: 0.7, reason: 'Bearish crossover' });
    } else {
      signals.push({ indicator: 'MACD', signal: 'HOLD', strength: 0.4, reason: 'Consolidation' });
    }
    
    // Moving Average Signal
    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50[sma50.length - 1];
    
    if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50) {
      signals.push({ indicator: 'MA', signal: 'BUY', strength: 0.6, reason: 'Price above moving averages' });
    } else if (currentPrice < currentSMA20 && currentSMA20 < currentSMA50) {
      signals.push({ indicator: 'MA', signal: 'SELL', strength: 0.6, reason: 'Price below moving averages' });
    } else {
      signals.push({ indicator: 'MA', signal: 'HOLD', strength: 0.3, reason: 'Mixed signals' });
    }
    
    // Bollinger Bands Signal
    if (currentPrice < bb.lower) {
      signals.push({ indicator: 'BB', signal: 'BUY', strength: 0.7, reason: 'Price below lower band' });
    } else if (currentPrice > bb.upper) {
      signals.push({ indicator: 'BB', signal: 'SELL', strength: 0.7, reason: 'Price above upper band' });
    } else {
      signals.push({ indicator: 'BB', signal: 'HOLD', strength: 0.4, reason: 'Price within bands' });
    }
    
    // Volume Analysis
    const avgVolume = mean(volumes.slice(-20));
    const currentVolume = volumes[volumes.length - 1];
    
    if (currentVolume > avgVolume * 1.5) {
      signals.push({ indicator: 'Volume', signal: 'BUY', strength: 0.5, reason: 'High volume confirms trend' });
    } else {
      signals.push({ indicator: 'Volume', signal: 'HOLD', strength: 0.3, reason: 'Normal volume' });
    }
    
    return {
      indicators: {
        rsi: rsi,
        macd: macd,
        bollingerBands: bb,
        sma20: currentSMA20,
        sma50: currentSMA50,
        ema12: ema12[ema12.length - 1]
      },
      signals: signals,
      overallScore: this.calculateOverallScore(signals)
    };
  }
  
  static calculateOverallScore(signals) {
    let buyScore = 0;
    let sellScore = 0;
    let totalWeight = 0;
    
    signals.forEach(signal => {
      totalWeight += signal.strength;
      if (signal.signal === 'BUY') {
        buyScore += signal.strength;
      } else if (signal.signal === 'SELL') {
        sellScore += signal.strength;
      }
    });
    
    const netScore = (buyScore - sellScore) / totalWeight;
    
    if (netScore > 0.3) return { signal: 'BUY', confidence: Math.min(90, 50 + netScore * 100) };
    if (netScore < -0.3) return { signal: 'SELL', confidence: Math.min(90, 50 + Math.abs(netScore) * 100) };
    return { signal: 'HOLD', confidence: 50 + Math.abs(netScore) * 50 };
  }
}