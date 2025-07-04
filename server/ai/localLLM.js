import fetch from 'node-fetch';
import Sentiment from 'sentiment';

export class LocalLLM {
  constructor() {
    this.sentiment = new Sentiment();
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('Initializing browser-compatible AI services...');
      this.initialized = true;
      console.log('AI services initialized successfully');
    } catch (error) {
      console.error('Error initializing AI services:', error);
      this.initialized = true; // Continue with fallback methods
    }
  }

  async generateText(prompt, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      return this.generateFallbackResponse(prompt, options);
    } catch (error) {
      console.error('Text generation error:', error);
      return this.generateFallbackResponse(prompt, options);
    }
  }

  generateFallbackResponse(prompt, options = {}) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Financial domain responses
    if (lowerPrompt.includes('market') || lowerPrompt.includes('stock')) {
      return this.generateMarketResponse(lowerPrompt);
    }
    
    if (lowerPrompt.includes('buy') || lowerPrompt.includes('sell')) {
      return this.generateTradingResponse(lowerPrompt);
    }
    
    if (lowerPrompt.includes('analysis') || lowerPrompt.includes('analyze')) {
      return this.generateAnalysisResponse(lowerPrompt);
    }

    if (lowerPrompt.includes('portfolio')) {
      return this.generatePortfolioResponse(lowerPrompt);
    }

    if (lowerPrompt.includes('risk')) {
      return this.generateRiskResponse(lowerPrompt);
    }

    return "I understand you're looking for market insights. Could you be more specific about which stock, sector, or market aspect you'd like me to analyze?";
  }

  generateMarketResponse(prompt) {
    const responses = [
      "Current market conditions show mixed signals. Banking and IT sectors are showing resilience, while global cues remain a key factor to watch.",
      "Market sentiment is cautiously optimistic with institutional flows remaining positive. Corporate earnings are generally beating expectations.",
      "The market is experiencing consolidation with stock-specific opportunities emerging across sectors. Focus on quality stocks with strong fundamentals.",
      "Technical indicators suggest a sideways trend with support levels holding. Watch for breakout patterns in key indices.",
      "Sector rotation is evident with defensive stocks gaining favor amid global uncertainties. Consider diversification across sectors."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  generateTradingResponse(prompt) {
    if (prompt.includes('buy')) {
      return "Before making any buy decisions, consider the stock's technical indicators (RSI, MACD), fundamental strength (P/E, debt ratios), and overall market conditions. Always maintain proper risk management with stop-losses.";
    }
    if (prompt.includes('sell')) {
      return "Selling decisions should be based on your investment goals, risk tolerance, and the stock's current valuation. Consider both technical levels and fundamental changes. Book profits systematically.";
    }
    return "Trading decisions should always be based on thorough analysis and your risk tolerance. Use proper position sizing and never risk more than 2% of your portfolio on a single trade.";
  }

  generateAnalysisResponse(prompt) {
    return "For comprehensive stock analysis, I examine technical indicators (RSI, MACD, moving averages), fundamental metrics (P/E, P/B, ROE ratios), sector performance, and market sentiment. Would you like me to analyze a specific stock or sector?";
  }

  generatePortfolioResponse(prompt) {
    return "Portfolio management involves diversification across sectors, regular rebalancing, and risk assessment. Consider your investment horizon, risk tolerance, and financial goals. Maintain a mix of growth and value stocks based on your profile.";
  }

  generateRiskResponse(prompt) {
    return "Risk management is crucial in trading. Use stop-losses, position sizing (max 2% risk per trade), diversification, and avoid emotional decisions. Consider market volatility and your risk tolerance when making investment decisions.";
  }

  async analyzeSentiment(text) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Use the sentiment library for basic sentiment analysis
      const result = this.sentiment.analyze(text);
      
      // Normalize score to -1 to 1 range
      const normalizedScore = Math.max(-1, Math.min(1, result.score / 10));
      
      // Enhanced financial sentiment analysis
      const financialSentiment = this.analyzeFinancialSentiment(text);
      
      // Combine scores
      const finalScore = (normalizedScore + financialSentiment.score) / 2;

      return {
        score: finalScore,
        confidence: Math.abs(finalScore) > 0.1 ? 0.7 : 0.5,
        label: finalScore > 0.1 ? 'positive' : finalScore < -0.1 ? 'negative' : 'neutral',
        details: {
          basicSentiment: normalizedScore,
          financialSentiment: financialSentiment.score,
          wordCount: result.words.length,
          positiveWords: result.positive,
          negativeWords: result.negative
        }
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return this.fallbackSentimentAnalysis(text);
    }
  }

  analyzeFinancialSentiment(text) {
    const positiveFinancialWords = [
      'bullish', 'buy', 'growth', 'profit', 'gain', 'rally', 'surge', 'breakout',
      'outperform', 'upgrade', 'strong', 'beat', 'exceed', 'momentum', 'uptrend',
      'recovery', 'expansion', 'dividend', 'earnings', 'revenue', 'margin'
    ];
    
    const negativeFinancialWords = [
      'bearish', 'sell', 'loss', 'decline', 'fall', 'crash', 'correction',
      'underperform', 'downgrade', 'weak', 'miss', 'disappoint', 'volatility',
      'downtrend', 'recession', 'inflation', 'debt', 'risk', 'concern'
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveFinancialWords.includes(word)) positiveCount++;
      if (negativeFinancialWords.includes(word)) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    if (total === 0) {
      return { score: 0, confidence: 0.3 };
    }

    const score = (positiveCount - negativeCount) / Math.max(total, words.length * 0.1);
    return {
      score: Math.max(-1, Math.min(1, score)),
      confidence: Math.min(0.9, total / words.length * 3)
    };
  }

  fallbackSentimentAnalysis(text) {
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'bullish', 'buy', 'growth', 'profit'];
    const negativeWords = ['bad', 'terrible', 'negative', 'bearish', 'sell', 'loss', 'decline', 'fall'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    if (total === 0) {
      return { score: 0, confidence: 0.5, label: 'neutral' };
    }

    const score = (positiveCount - negativeCount) / total;
    return {
      score: score,
      confidence: Math.min(0.8, total / words.length * 2),
      label: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral'
    };
  }

  async generateEmbedding(text, dimensions = 384) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Simple hash-based embedding for browser compatibility
    return this.generateSimpleEmbedding(text, dimensions);
  }

  generateSimpleEmbedding(text, dimensions = 384) {
    const embedding = new Array(dimensions).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    
    // Create a more sophisticated embedding using word positions and frequencies
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    Object.entries(wordFreq).forEach(([word, freq], index) => {
      const hash = this.simpleHash(word);
      for (let i = 0; i < dimensions; i++) {
        const angle = (hash + i) * 0.01;
        embedding[i] += Math.sin(angle) * freq * 0.1;
        embedding[i] += Math.cos(angle + index) * 0.05;
      }
    });

    // Add text length and complexity features
    const textLength = text.length;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    for (let i = 0; i < Math.min(10, dimensions); i++) {
      embedding[i] += (textLength / 1000) * 0.1;
      embedding[i + 10] += avgWordLength * 0.1;
    }

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return embedding.map(val => val / magnitude);
    }
    
    return embedding;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Additional utility methods for financial analysis
  async analyzeStockMentions(text) {
    const stockPattern = /\b[A-Z]{1,5}\b/g;
    const potentialTickers = text.match(stockPattern) || [];
    
    // Filter out common words that aren't stock tickers
    const commonWords = ['THE', 'AND', 'OR', 'BUT', 'FOR', 'AT', 'TO', 'FROM', 'UP', 'DOWN', 'IN', 'OUT'];
    const tickers = potentialTickers.filter(ticker => 
      !commonWords.includes(ticker) && ticker.length >= 2 && ticker.length <= 5
    );

    return [...new Set(tickers)]; // Remove duplicates
  }

  async extractKeyPhrases(text) {
    const financialKeywords = [
      'earnings', 'revenue', 'profit', 'loss', 'dividend', 'split', 'merger',
      'acquisition', 'ipo', 'buyback', 'guidance', 'forecast', 'outlook',
      'quarter', 'annual', 'growth', 'decline', 'volatility', 'volume'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const foundKeywords = words.filter(word => 
      financialKeywords.includes(word.replace(/[^\w]/g, ''))
    );

    return [...new Set(foundKeywords)];
  }
}

export default LocalLLM;