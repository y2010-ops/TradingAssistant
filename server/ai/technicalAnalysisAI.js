import { RSI, MACD, BollingerBands, SMA, EMA, Stochastic, ATR, CCI } from 'technicalindicators';

export class TechnicalAnalysisAI {
  constructor() {
    this.indicators = {
      RSI,
      MACD,
      BollingerBands,
      SMA,
      EMA,
      Stochastic,
      ATR,
      CCI
    };
  }

  analyzeStock(historicalData) {
    if (!historicalData || historicalData.length < 50) {
      throw new Error('Insufficient historical data for analysis');
    }

    const prices = historicalData.map(d => parseFloat(d.close));
    const highs = historicalData.map(d => parseFloat(d.high));
    const lows = historicalData.map(d => parseFloat(d.low));
    const volumes = historicalData.map(d => parseInt(d.volume));

    const analysis = {
      indicators: this.calculateIndicators(prices, highs, lows, volumes),
      signals: [],
      patterns: this.detectPatterns(prices, highs, lows),
      support_resistance: this.findSupportResistance(prices, highs, lows),
      trend: this.analyzeTrend(prices),
      volatility: this.analyzeVolatility(prices),
      volume_analysis: this.analyzeVolume(prices, volumes)
    };

    analysis.signals = this.generateSignals(analysis);
    analysis.overall_score = this.calculateOverallScore(analysis);

    return analysis;
  }

  calculateIndicators(prices, highs, lows, volumes) {
    const currentPrice = prices[prices.length - 1];
    
    // RSI
    const rsi = RSI.calculate({ values: prices, period: 14 });
    const currentRSI = rsi[rsi.length - 1];

    // MACD
    const macd = MACD.calculate({
      values: prices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    });
    const currentMACD = macd[macd.length - 1];

    // Bollinger Bands
    const bb = BollingerBands.calculate({
      period: 20,
      values: prices,
      stdDev: 2
    });
    const currentBB = bb[bb.length - 1];

    // Moving Averages
    const sma20 = SMA.calculate({ period: 20, values: prices });
    const sma50 = SMA.calculate({ period: 50, values: prices });
    const ema12 = EMA.calculate({ period: 12, values: prices });
    const ema26 = EMA.calculate({ period: 26, values: prices });

    // Stochastic
    const stoch = Stochastic.calculate({
      high: highs,
      low: lows,
      close: prices,
      period: 14,
      signalPeriod: 3
    });
    const currentStoch = stoch[stoch.length - 1];

    // ATR (Average True Range)
    const atr = ATR.calculate({
      high: highs,
      low: lows,
      close: prices,
      period: 14
    });
    const currentATR = atr[atr.length - 1];

    return {
      rsi: {
        value: currentRSI,
        signal: this.getRSISignal(currentRSI),
        interpretation: this.interpretRSI(currentRSI)
      },
      macd: {
        value: currentMACD?.MACD || 0,
        signal: currentMACD?.signal || 0,
        histogram: currentMACD?.histogram || 0,
        signal_type: this.getMACDSignal(currentMACD),
        interpretation: this.interpretMACD(currentMACD)
      },
      bollinger_bands: {
        upper: currentBB?.upper || 0,
        middle: currentBB?.middle || 0,
        lower: currentBB?.lower || 0,
        position: this.getBBPosition(currentPrice, currentBB),
        signal: this.getBBSignal(currentPrice, currentBB),
        interpretation: this.interpretBB(currentPrice, currentBB)
      },
      moving_averages: {
        sma20: sma20[sma20.length - 1],
        sma50: sma50[sma50.length - 1],
        ema12: ema12[ema12.length - 1],
        ema26: ema26[ema26.length - 1],
        signal: this.getMASignal(currentPrice, sma20[sma20.length - 1], sma50[sma50.length - 1]),
        interpretation: this.interpretMA(currentPrice, sma20[sma20.length - 1], sma50[sma50.length - 1])
      },
      stochastic: {
        k: currentStoch?.k || 0,
        d: currentStoch?.d || 0,
        signal: this.getStochasticSignal(currentStoch),
        interpretation: this.interpretStochastic(currentStoch)
      },
      atr: {
        value: currentATR,
        interpretation: this.interpretATR(currentATR, currentPrice)
      }
    };
  }

  getRSISignal(rsi) {
    if (rsi > 70) return 'SELL';
    if (rsi < 30) return 'BUY';
    return 'HOLD';
  }

  interpretRSI(rsi) {
    if (rsi > 80) return 'Extremely overbought - strong sell signal';
    if (rsi > 70) return 'Overbought - consider selling';
    if (rsi < 20) return 'Extremely oversold - strong buy signal';
    if (rsi < 30) return 'Oversold - consider buying';
    return 'Neutral momentum';
  }

  getMACDSignal(macd) {
    if (!macd) return 'HOLD';
    
    if (macd.MACD > macd.signal && macd.histogram > 0) return 'BUY';
    if (macd.MACD < macd.signal && macd.histogram < 0) return 'SELL';
    return 'HOLD';
  }

  interpretMACD(macd) {
    if (!macd) return 'Insufficient data';
    
    if (macd.MACD > macd.signal) {
      return macd.histogram > 0 ? 'Strong bullish momentum' : 'Weakening bullish momentum';
    } else {
      return macd.histogram < 0 ? 'Strong bearish momentum' : 'Weakening bearish momentum';
    }
  }

  getBBPosition(price, bb) {
    if (!bb) return 'unknown';
    
    const range = bb.upper - bb.lower;
    const position = (price - bb.lower) / range;
    
    if (position > 0.8) return 'near_upper';
    if (position < 0.2) return 'near_lower';
    return 'middle';
  }

  getBBSignal(price, bb) {
    if (!bb) return 'HOLD';
    
    if (price >= bb.upper) return 'SELL';
    if (price <= bb.lower) return 'BUY';
    return 'HOLD';
  }

  interpretBB(price, bb) {
    if (!bb) return 'Insufficient data';
    
    const position = this.getBBPosition(price, bb);
    
    switch (position) {
      case 'near_upper':
        return 'Price near upper band - potential reversal down';
      case 'near_lower':
        return 'Price near lower band - potential reversal up';
      default:
        return 'Price within normal range';
    }
  }

  getMASignal(price, sma20, sma50) {
    if (price > sma20 && sma20 > sma50) return 'BUY';
    if (price < sma20 && sma20 < sma50) return 'SELL';
    return 'HOLD';
  }

  interpretMA(price, sma20, sma50) {
    if (price > sma20 && sma20 > sma50) {
      return 'Strong uptrend - price above both moving averages';
    }
    if (price < sma20 && sma20 < sma50) {
      return 'Strong downtrend - price below both moving averages';
    }
    return 'Mixed signals - trend unclear';
  }

  getStochasticSignal(stoch) {
    if (!stoch) return 'HOLD';
    
    if (stoch.k > 80 && stoch.d > 80) return 'SELL';
    if (stoch.k < 20 && stoch.d < 20) return 'BUY';
    return 'HOLD';
  }

  interpretStochastic(stoch) {
    if (!stoch) return 'Insufficient data';
    
    if (stoch.k > 80) return 'Overbought conditions';
    if (stoch.k < 20) return 'Oversold conditions';
    return 'Normal momentum range';
  }

  interpretATR(atr, price) {
    const atrPercent = (atr / price) * 100;
    
    if (atrPercent > 3) return 'High volatility - increased risk';
    if (atrPercent < 1) return 'Low volatility - stable price action';
    return 'Normal volatility levels';
  }

  detectPatterns(prices, highs, lows) {
    const patterns = [];
    
    // Double Top/Bottom
    const doubleTop = this.detectDoubleTop(highs);
    const doubleBottom = this.detectDoubleBottom(lows);
    
    if (doubleTop) patterns.push({ type: 'double_top', signal: 'SELL', confidence: 0.7 });
    if (doubleBottom) patterns.push({ type: 'double_bottom', signal: 'BUY', confidence: 0.7 });
    
    // Head and Shoulders
    const headShoulders = this.detectHeadAndShoulders(highs);
    if (headShoulders) patterns.push({ type: 'head_and_shoulders', signal: 'SELL', confidence: 0.8 });
    
    // Triangle patterns
    const triangle = this.detectTriangle(highs, lows);
    if (triangle) patterns.push({ type: triangle.type, signal: triangle.signal, confidence: 0.6 });
    
    return patterns;
  }

  detectDoubleTop(highs) {
    if (highs.length < 20) return false;
    
    const recent = highs.slice(-20);
    const max1 = Math.max(...recent.slice(0, 10));
    const max2 = Math.max(...recent.slice(10));
    
    return Math.abs(max1 - max2) / max1 < 0.02; // Within 2%
  }

  detectDoubleBottom(lows) {
    if (lows.length < 20) return false;
    
    const recent = lows.slice(-20);
    const min1 = Math.min(...recent.slice(0, 10));
    const min2 = Math.min(...recent.slice(10));
    
    return Math.abs(min1 - min2) / min1 < 0.02; // Within 2%
  }

  detectHeadAndShoulders(highs) {
    if (highs.length < 30) return false;
    
    const recent = highs.slice(-30);
    const third = Math.floor(recent.length / 3);
    
    const leftShoulder = Math.max(...recent.slice(0, third));
    const head = Math.max(...recent.slice(third, 2 * third));
    const rightShoulder = Math.max(...recent.slice(2 * third));
    
    return head > leftShoulder && head > rightShoulder && 
           Math.abs(leftShoulder - rightShoulder) / leftShoulder < 0.05;
  }

  detectTriangle(highs, lows) {
    if (highs.length < 20) return null;
    
    const recentHighs = highs.slice(-20);
    const recentLows = lows.slice(-20);
    
    // Simple ascending/descending triangle detection
    const highTrend = this.calculateTrend(recentHighs);
    const lowTrend = this.calculateTrend(recentLows);
    
    if (highTrend > 0 && Math.abs(lowTrend) < 0.1) {
      return { type: 'ascending_triangle', signal: 'BUY' };
    }
    if (highTrend < 0 && Math.abs(lowTrend) < 0.1) {
      return { type: 'descending_triangle', signal: 'SELL' };
    }
    
    return null;
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    
    return (last - first) / first;
  }

  findSupportResistance(prices, highs, lows) {
    const support = this.findSupport(lows);
    const resistance = this.findResistance(highs);
    
    return {
      support: {
        levels: support,
        strength: this.calculateSupportStrength(lows, support)
      },
      resistance: {
        levels: resistance,
        strength: this.calculateResistanceStrength(highs, resistance)
      }
    };
  }

  findSupport(lows) {
    const recent = lows.slice(-50);
    const levels = [];
    
    // Find local minima
    for (let i = 2; i < recent.length - 2; i++) {
      if (recent[i] < recent[i-1] && recent[i] < recent[i-2] &&
          recent[i] < recent[i+1] && recent[i] < recent[i+2]) {
        levels.push(recent[i]);
      }
    }
    
    // Group similar levels
    return this.groupLevels(levels);
  }

  findResistance(highs) {
    const recent = highs.slice(-50);
    const levels = [];
    
    // Find local maxima
    for (let i = 2; i < recent.length - 2; i++) {
      if (recent[i] > recent[i-1] && recent[i] > recent[i-2] &&
          recent[i] > recent[i+1] && recent[i] > recent[i+2]) {
        levels.push(recent[i]);
      }
    }
    
    // Group similar levels
    return this.groupLevels(levels);
  }

  groupLevels(levels, tolerance = 0.02) {
    if (levels.length === 0) return [];
    
    const grouped = [];
    const sorted = levels.sort((a, b) => a - b);
    
    let currentGroup = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      if (Math.abs(sorted[i] - sorted[i-1]) / sorted[i-1] <= tolerance) {
        currentGroup.push(sorted[i]);
      } else {
        grouped.push(currentGroup.reduce((sum, val) => sum + val, 0) / currentGroup.length);
        currentGroup = [sorted[i]];
      }
    }
    
    grouped.push(currentGroup.reduce((sum, val) => sum + val, 0) / currentGroup.length);
    
    return grouped.slice(0, 3); // Return top 3 levels
  }

  calculateSupportStrength(lows, supportLevels) {
    return supportLevels.map(level => {
      const touches = lows.filter(low => Math.abs(low - level) / level <= 0.01).length;
      return Math.min(touches / 3, 1); // Normalize to 0-1
    });
  }

  calculateResistanceStrength(highs, resistanceLevels) {
    return resistanceLevels.map(level => {
      const touches = highs.filter(high => Math.abs(high - level) / level <= 0.01).length;
      return Math.min(touches / 3, 1); // Normalize to 0-1
    });
  }

  analyzeTrend(prices) {
    const short = this.calculateTrend(prices.slice(-10));
    const medium = this.calculateTrend(prices.slice(-30));
    const long = this.calculateTrend(prices.slice(-60));
    
    return {
      short_term: {
        direction: short > 0.02 ? 'up' : short < -0.02 ? 'down' : 'sideways',
        strength: Math.abs(short),
        value: short
      },
      medium_term: {
        direction: medium > 0.05 ? 'up' : medium < -0.05 ? 'down' : 'sideways',
        strength: Math.abs(medium),
        value: medium
      },
      long_term: {
        direction: long > 0.1 ? 'up' : long < -0.1 ? 'down' : 'sideways',
        strength: Math.abs(long),
        value: long
      }
    };
  }

  analyzeVolatility(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const volatility = this.standardDeviation(returns) * Math.sqrt(252); // Annualized
    
    return {
      daily: this.standardDeviation(returns),
      annualized: volatility,
      level: volatility > 0.3 ? 'high' : volatility > 0.15 ? 'medium' : 'low'
    };
  }

  analyzeVolume(prices, volumes) {
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const recentVolume = volumes.slice(-5).reduce((sum, vol) => sum + vol, 0) / 5;
    
    const volumeRatio = recentVolume / avgVolume;
    
    return {
      average: avgVolume,
      recent: recentVolume,
      ratio: volumeRatio,
      signal: volumeRatio > 1.5 ? 'high' : volumeRatio < 0.7 ? 'low' : 'normal',
      interpretation: this.interpretVolume(volumeRatio)
    };
  }

  interpretVolume(ratio) {
    if (ratio > 2) return 'Extremely high volume - strong interest';
    if (ratio > 1.5) return 'High volume - increased activity';
    if (ratio < 0.5) return 'Low volume - weak interest';
    return 'Normal volume levels';
  }

  standardDeviation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  generateSignals(analysis) {
    const signals = [];
    
    // RSI signals
    if (analysis.indicators.rsi.signal !== 'HOLD') {
      signals.push({
        type: 'RSI',
        signal: analysis.indicators.rsi.signal,
        strength: Math.abs(analysis.indicators.rsi.value - 50) / 50,
        description: analysis.indicators.rsi.interpretation
      });
    }
    
    // MACD signals
    if (analysis.indicators.macd.signal_type !== 'HOLD') {
      signals.push({
        type: 'MACD',
        signal: analysis.indicators.macd.signal_type,
        strength: Math.abs(analysis.indicators.macd.histogram) / 10,
        description: analysis.indicators.macd.interpretation
      });
    }
    
    // Moving Average signals
    if (analysis.indicators.moving_averages.signal !== 'HOLD') {
      signals.push({
        type: 'Moving Averages',
        signal: analysis.indicators.moving_averages.signal,
        strength: 0.7,
        description: analysis.indicators.moving_averages.interpretation
      });
    }
    
    // Pattern signals
    analysis.patterns.forEach(pattern => {
      signals.push({
        type: 'Pattern',
        signal: pattern.signal,
        strength: pattern.confidence,
        description: `${pattern.type.replace('_', ' ')} pattern detected`
      });
    });
    
    return signals;
  }

  calculateOverallScore(analysis) {
    const signals = analysis.signals;
    if (signals.length === 0) return { signal: 'HOLD', confidence: 50 };
    
    let buyScore = 0;
    let sellScore = 0;
    let totalWeight = 0;
    
    signals.forEach(signal => {
      const weight = signal.strength;
      totalWeight += weight;
      
      if (signal.signal === 'BUY') {
        buyScore += weight;
      } else if (signal.signal === 'SELL') {
        sellScore += weight;
      }
    });
    
    const netScore = (buyScore - sellScore) / totalWeight;
    
    if (netScore > 0.3) {
      return { signal: 'BUY', confidence: Math.min(95, 60 + netScore * 35) };
    } else if (netScore < -0.3) {
      return { signal: 'SELL', confidence: Math.min(95, 60 + Math.abs(netScore) * 35) };
    } else {
      return { signal: 'HOLD', confidence: 60 - Math.abs(netScore) * 20 };
    }
  }
}

export default TechnicalAnalysisAI;