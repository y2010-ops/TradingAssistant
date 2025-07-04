import LocalLLM from '../ai/localLLM.js';
import RAGSystem from '../ai/ragSystem.js';
import TechnicalAnalysisAI from '../ai/technicalAnalysisAI.js';
import SentimentAnalysisAI from '../ai/sentimentAnalysisAI.js';

export class AITradingEngine {
  constructor() {
    this.llm = new LocalLLM();
    this.rag = new RAGSystem();
    this.technicalAI = new TechnicalAnalysisAI();
    this.sentimentAI = new SentimentAnalysisAI();
    
    this.weights = {
      technical: 0.4,
      sentiment: 0.3,
      fundamental: 0.2,
      volume: 0.1
    };
    
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('Initializing AI Trading Engine...');
      
      await Promise.all([
        this.llm.initialize(),
        this.rag.initialize(),
        this.sentimentAI.initialize()
      ]);
      
      this.initialized = true;
      console.log('AI Trading Engine initialized successfully');
    } catch (error) {
      console.error('AI Trading Engine initialization error:', error);
      this.initialized = true; // Continue with limited functionality
    }
  }

  async generateTradingSignal(symbol, historicalData, fundamentalData = null) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log(`Generating trading signal for ${symbol}...`);
      
      // Technical Analysis
      const technicalAnalysis = this.technicalAI.analyzeStock(historicalData);
      
      // Sentiment Analysis
      const sentimentAnalysis = await this.sentimentAI.analyzeStockSentiment(symbol);
      
      // Fundamental Analysis (simplified)
      const fundamentalAnalysis = this.analyzeFundamentals(fundamentalData);
      
      // Volume Analysis
      const volumeAnalysis = this.analyzeVolume(historicalData);
      
      // Combine all analyses
      const signal = this.combineAnalyses({
        symbol,
        technical: technicalAnalysis,
        sentiment: sentimentAnalysis,
        fundamental: fundamentalAnalysis,
        volume: volumeAnalysis,
        currentPrice: historicalData[historicalData.length - 1]?.close || 0
      });
      
      console.log(`Generated signal for ${symbol}: ${signal.action} (${signal.confidence}%)`);
      return signal;
      
    } catch (error) {
      console.error(`Error generating signal for ${symbol}:`, error);
      return this.getDefaultSignal(symbol);
    }
  }

  combineAnalyses(data) {
    const { symbol, technical, sentiment, fundamental, volume, currentPrice } = data;
    
    // Convert technical analysis to score
    const technicalScore = this.convertTechnicalToScore(technical);
    
    // Convert sentiment to score
    const sentimentScore = sentiment.overall_sentiment.score;
    
    // Fundamental score
    const fundamentalScore = fundamental.score;
    
    // Volume score
    const volumeScore = volume.score;
    
    // Weighted combination
    const combinedScore = (
      technicalScore * this.weights.technical +
      sentimentScore * this.weights.sentiment +
      fundamentalScore * this.weights.fundamental +
      volumeScore * this.weights.volume
    );
    
    // Determine action and confidence
    const { action, confidence } = this.scoreToAction(combinedScore);
    
    // Calculate target price and stop loss
    const { targetPrice, stopLoss } = this.calculatePriceTargets(
      currentPrice, 
      action, 
      confidence, 
      technical
    );
    
    // Generate reasoning
    const reasoning = this.generateReasoning({
      technical,
      sentiment,
      fundamental,
      volume,
      action,
      combinedScore
    });
    
    return {
      symbol,
      action,
      confidence: Math.round(confidence),
      targetPrice: Math.round(targetPrice * 100) / 100,
      stopLoss: Math.round(stopLoss * 100) / 100,
      reasoning,
      aiScore: Math.round((combinedScore + 1) * 5 * 10) / 10, // Convert to 0-10 scale
      breakdown: {
        technical: {
          score: technicalScore,
          signal: technical.overall_score.signal,
          confidence: technical.overall_score.confidence
        },
        sentiment: {
          score: sentimentScore,
          label: sentiment.overall_sentiment.label,
          confidence: sentiment.overall_sentiment.confidence
        },
        fundamental: {
          score: fundamentalScore,
          factors: fundamental.factors
        },
        volume: {
          score: volumeScore,
          analysis: volume.analysis
        }
      },
      timestamp: new Date()
    };
  }

  convertTechnicalToScore(technical) {
    const signals = technical.signals || [];
    if (signals.length === 0) return 0;
    
    let buyScore = 0;
    let sellScore = 0;
    let totalWeight = 0;
    
    signals.forEach(signal => {
      const weight = signal.strength || 0.5;
      totalWeight += weight;
      
      if (signal.signal === 'BUY') {
        buyScore += weight;
      } else if (signal.signal === 'SELL') {
        sellScore += weight;
      }
    });
    
    if (totalWeight === 0) return 0;
    
    return (buyScore - sellScore) / totalWeight;
  }

  scoreToAction(score) {
    const absScore = Math.abs(score);
    
    if (score > 0.3) {
      return {
        action: 'BUY',
        confidence: Math.min(95, 60 + absScore * 35)
      };
    } else if (score < -0.3) {
      return {
        action: 'SELL',
        confidence: Math.min(95, 60 + absScore * 35)
      };
    } else {
      return {
        action: 'HOLD',
        confidence: Math.max(50, 70 - absScore * 20)
      };
    }
  }

  calculatePriceTargets(currentPrice, action, confidence, technical) {
    const volatility = technical.volatility?.daily || 0.02;
    const confidenceMultiplier = confidence / 100;
    
    let targetPrice, stopLoss;
    
    if (action === 'BUY') {
      targetPrice = currentPrice * (1 + volatility * 3 * confidenceMultiplier);
      stopLoss = currentPrice * (1 - volatility * 2);
    } else if (action === 'SELL') {
      targetPrice = currentPrice * (1 - volatility * 3 * confidenceMultiplier);
      stopLoss = currentPrice * (1 + volatility * 2);
    } else {
      targetPrice = currentPrice;
      stopLoss = currentPrice * (1 - volatility * 1.5);
    }
    
    // Use support/resistance levels if available
    if (technical.support_resistance) {
      const { support, resistance } = technical.support_resistance;
      
      if (action === 'BUY' && resistance.levels.length > 0) {
        targetPrice = Math.min(targetPrice, resistance.levels[0]);
      }
      
      if (action === 'BUY' && support.levels.length > 0) {
        stopLoss = Math.max(stopLoss, support.levels[0]);
      }
    }
    
    return { targetPrice, stopLoss };
  }

  generateReasoning(data) {
    const { technical, sentiment, fundamental, volume, action, combinedScore } = data;
    const reasons = [];
    
    // Technical reasoning
    if (technical.overall_score) {
      reasons.push(`Technical analysis shows ${technical.overall_score.signal} signal with ${Math.round(technical.overall_score.confidence)}% confidence`);
    }
    
    // Sentiment reasoning
    const sentimentLabel = sentiment.overall_sentiment.label;
    const sentimentScore = Math.round(sentiment.overall_sentiment.score * 100);
    reasons.push(`Market sentiment is ${sentimentLabel} (${sentimentScore}% score)`);
    
    // Volume reasoning
    if (volume.analysis) {
      reasons.push(volume.analysis);
    }
    
    // Pattern reasoning
    if (technical.patterns && technical.patterns.length > 0) {
      const pattern = technical.patterns[0];
      reasons.push(`${pattern.type.replace('_', ' ')} pattern detected with ${Math.round(pattern.confidence * 100)}% confidence`);
    }
    
    // Trend reasoning
    if (technical.trend) {
      const trend = technical.trend.medium_term;
      reasons.push(`Medium-term trend is ${trend.direction} with ${Math.round(trend.strength * 100)}% strength`);
    }
    
    // Overall confidence reasoning
    if (Math.abs(combinedScore) > 0.5) {
      reasons.push('Strong conviction based on multiple confirming factors');
    } else if (Math.abs(combinedScore) < 0.2) {
      reasons.push('Mixed signals suggest cautious approach');
    }
    
    return reasons.join('. ') + '.';
  }

  analyzeFundamentals(fundamentalData) {
    if (!fundamentalData) {
      return { score: 0, factors: ['No fundamental data available'] };
    }

    const factors = [];
    let score = 0;

    // P/E Ratio analysis
    if (fundamentalData.pe) {
      if (fundamentalData.pe < 15) {
        score += 0.3;
        factors.push('Low P/E ratio indicates potential undervaluation');
      } else if (fundamentalData.pe > 30) {
        score -= 0.2;
        factors.push('High P/E ratio suggests premium valuation');
      }
    }

    // P/B Ratio analysis
    if (fundamentalData.pb) {
      if (fundamentalData.pb < 1.5) {
        score += 0.2;
        factors.push('Low P/B ratio indicates good book value');
      } else if (fundamentalData.pb > 3) {
        score -= 0.1;
        factors.push('High P/B ratio suggests premium to book value');
      }
    }

    // Dividend yield
    if (fundamentalData.dividend && fundamentalData.dividend > 2) {
      score += 0.1;
      factors.push('Good dividend yield provides income component');
    }

    // Market cap consideration
    if (fundamentalData.marketCap) {
      if (fundamentalData.marketCap > 100000) {
        score += 0.1;
        factors.push('Large cap stock provides stability');
      }
    }

    return {
      score: Math.max(-1, Math.min(1, score)),
      factors
    };
  }

  analyzeVolume(historicalData) {
    if (!historicalData || historicalData.length < 20) {
      return { score: 0, analysis: 'Insufficient volume data' };
    }

    const volumes = historicalData.map(d => parseInt(d.volume));
    const recentVolume = volumes.slice(-5);
    const avgVolume = volumes.slice(-20, -5).reduce((a, b) => a + b, 0) / 15;
    const currentVolume = volumes[volumes.length - 1];

    let score = 0;
    let analysis = '';

    const volumeRatio = currentVolume / avgVolume;

    if (volumeRatio > 1.5) {
      score = 0.3;
      analysis = 'High volume confirms price movement';
    } else if (volumeRatio > 1.2) {
      score = 0.1;
      analysis = 'Above average volume supports trend';
    } else if (volumeRatio < 0.7) {
      score = -0.1;
      analysis = 'Low volume indicates weak conviction';
    } else {
      score = 0;
      analysis = 'Normal volume levels';
    }

    return { score, analysis, volumeRatio };
  }

  async generateChatResponse(message, context = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Use RAG system for contextual responses
      const ragResponse = await this.rag.query(message, context);
      
      if (ragResponse.confidence > 0.7) {
        return {
          message: ragResponse.answer,
          confidence: ragResponse.confidence,
          sources: ragResponse.sources,
          timestamp: new Date().toISOString()
        };
      }
      
      // Fallback to LLM
      const llmResponse = await this.llm.generateText(message, {
        temperature: 0.7,
        maxTokens: 300
      });
      
      return {
        message: llmResponse,
        confidence: 0.8,
        sources: [],
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Chat response generation error:', error);
      return {
        message: "I apologize, but I encountered an error processing your request. Please try again.",
        confidence: 0.1,
        sources: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  getDefaultSignal(symbol) {
    return {
      symbol: symbol,
      action: 'HOLD',
      confidence: 50,
      targetPrice: 0,
      stopLoss: 0,
      reasoning: 'Unable to generate signal due to insufficient data',
      aiScore: 5.0,
      breakdown: {
        technical: { score: 0, signal: 'HOLD', confidence: 50 },
        sentiment: { score: 0, label: 'neutral', confidence: 0.5 },
        fundamental: { score: 0, factors: [] },
        volume: { score: 0, analysis: 'No data' }
      },
      timestamp: new Date()
    };
  }

  async getSystemStats() {
    const stats = {
      initialized: this.initialized,
      models: {
        llm: this.llm.initialized,
        rag: this.rag.initialized,
        technical: true,
        sentiment: true
      }
    };

    if (this.rag.initialized) {
      stats.knowledge_base = await this.rag.getKnowledgeStats();
    }

    return stats;
  }
}

export default AITradingEngine;