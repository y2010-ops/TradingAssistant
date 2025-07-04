import Sentiment from 'sentiment';
import natural from 'natural';
import LocalLLM from './localLLM.js';

export class SentimentAnalysisAI {
  constructor() {
    this.sentiment = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.llm = new LocalLLM();
    
    // Financial sentiment lexicon
    this.financialLexicon = {
      // Positive financial terms
      'bullish': 3,
      'rally': 2,
      'surge': 2,
      'breakout': 2,
      'outperform': 2,
      'upgrade': 3,
      'beat': 2,
      'exceed': 2,
      'strong': 2,
      'robust': 2,
      'growth': 2,
      'profit': 2,
      'earnings': 1,
      'revenue': 1,
      'dividend': 1,
      'buy': 2,
      'accumulate': 2,
      'overweight': 2,
      
      // Negative financial terms
      'bearish': -3,
      'crash': -3,
      'plunge': -3,
      'collapse': -3,
      'underperform': -2,
      'downgrade': -3,
      'miss': -2,
      'disappoint': -2,
      'weak': -2,
      'decline': -2,
      'loss': -2,
      'deficit': -2,
      'sell': -2,
      'reduce': -2,
      'underweight': -2,
      'volatile': -1,
      'uncertainty': -1,
      'risk': -1
    };
    
    // Add financial terms to sentiment analyzer
    this.sentiment.registerLanguage('en', {
      labels: this.financialLexicon
    });
  }

  async initialize() {
    await this.llm.initialize();
  }

  async analyzeText(text, options = {}) {
    if (!text || typeof text !== 'string') {
      return this.getDefaultSentiment();
    }

    try {
      // Use local LLM for advanced sentiment analysis
      const llmSentiment = await this.llm.analyzeSentiment(text);
      
      // Use rule-based sentiment as backup
      const ruleSentiment = this.analyzeWithRules(text);
      
      // Combine results with weights
      const combinedScore = (llmSentiment.score * 0.7) + (ruleSentiment.score * 0.3);
      const combinedConfidence = Math.max(llmSentiment.confidence, ruleSentiment.confidence);
      
      return {
        score: this.normalizeScore(combinedScore),
        confidence: combinedConfidence,
        label: this.getLabel(combinedScore),
        breakdown: {
          llm: llmSentiment,
          rules: ruleSentiment,
          financial_terms: this.extractFinancialTerms(text)
        },
        text_length: text.length,
        word_count: this.tokenizer.tokenize(text).length
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return this.analyzeWithRules(text);
    }
  }

  analyzeWithRules(text) {
    // Basic sentiment analysis
    const result = this.sentiment.analyze(text);
    
    // Tokenize and analyze
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    
    // Financial context analysis
    const financialScore = this.calculateFinancialSentiment(tokens);
    
    // Combine scores
    const combinedScore = result.score + (financialScore * 0.5);
    const normalizedScore = this.normalizeScore(combinedScore / Math.max(1, tokens.length));
    
    return {
      score: normalizedScore,
      confidence: Math.min(0.8, Math.abs(normalizedScore) + 0.3),
      label: this.getLabel(normalizedScore),
      details: {
        base_score: result.score,
        financial_score: financialScore,
        positive_words: result.positive,
        negative_words: result.negative,
        tokens: tokens.length
      }
    };
  }

  calculateFinancialSentiment(tokens) {
    let score = 0;
    let count = 0;
    
    tokens.forEach(token => {
      const stemmed = this.stemmer.stem(token);
      
      // Check exact match first
      if (this.financialLexicon[token]) {
        score += this.financialLexicon[token];
        count++;
      }
      // Check stemmed version
      else if (this.financialLexicon[stemmed]) {
        score += this.financialLexicon[stemmed];
        count++;
      }
    });
    
    return count > 0 ? score / count : 0;
  }

  extractFinancialTerms(text) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const financialTerms = [];
    
    tokens.forEach(token => {
      if (this.financialLexicon[token]) {
        financialTerms.push({
          term: token,
          score: this.financialLexicon[token],
          type: this.financialLexicon[token] > 0 ? 'positive' : 'negative'
        });
      }
    });
    
    return financialTerms;
  }

  normalizeScore(score) {
    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, score));
  }

  getLabel(score) {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  getDefaultSentiment() {
    return {
      score: 0,
      confidence: 0.1,
      label: 'neutral',
      breakdown: null,
      text_length: 0,
      word_count: 0
    };
  }

  async analyzeMultipleSources(sources) {
    const results = [];
    
    for (const source of sources) {
      try {
        const sentiment = await this.analyzeText(source.text, {
          source: source.type,
          weight: source.weight || 1
        });
        
        results.push({
          ...sentiment,
          source: source.type,
          weight: source.weight || 1,
          timestamp: source.timestamp || new Date()
        });
      } catch (error) {
        console.error(`Error analyzing ${source.type}:`, error);
      }
    }
    
    return this.aggregateResults(results);
  }

  aggregateResults(results) {
    if (results.length === 0) {
      return this.getDefaultSentiment();
    }
    
    let totalScore = 0;
    let totalWeight = 0;
    let totalConfidence = 0;
    
    const sourceBreakdown = {};
    
    results.forEach(result => {
      const weight = result.weight;
      totalScore += result.score * weight;
      totalWeight += weight;
      totalConfidence += result.confidence * weight;
      
      sourceBreakdown[result.source] = {
        score: result.score,
        confidence: result.confidence,
        label: result.label
      };
    });
    
    const aggregatedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const aggregatedConfidence = totalWeight > 0 ? totalConfidence / totalWeight : 0;
    
    return {
      score: aggregatedScore,
      confidence: aggregatedConfidence,
      label: this.getLabel(aggregatedScore),
      source_count: results.length,
      sources: sourceBreakdown,
      timestamp: new Date()
    };
  }

  async analyzeStockSentiment(symbol, timeframe = '24h') {
    try {
      // Mock data - in production, this would fetch from real sources
      const mockSources = [
        {
          type: 'news',
          text: `${symbol} reports strong quarterly earnings beating analyst expectations. Revenue growth of 15% year-over-year shows robust business performance.`,
          weight: 1.5,
          timestamp: new Date()
        },
        {
          type: 'social',
          text: `Bullish on ${symbol}! Great fundamentals and technical breakout. This stock is going to the moon! 🚀`,
          weight: 0.8,
          timestamp: new Date()
        },
        {
          type: 'analyst',
          text: `${symbol} upgraded to BUY with target price increased. Strong balance sheet and improving margins make this an attractive investment.`,
          weight: 2.0,
          timestamp: new Date()
        }
      ];
      
      const sentiment = await this.analyzeMultipleSources(mockSources);
      
      return {
        symbol: symbol,
        timeframe: timeframe,
        overall_sentiment: sentiment,
        trend: this.calculateSentimentTrend(symbol),
        volume: this.calculateMentionVolume(symbol),
        key_themes: this.extractKeyThemes(mockSources),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Stock sentiment analysis error:', error);
      return this.getDefaultStockSentiment(symbol);
    }
  }

  calculateSentimentTrend(symbol) {
    // Mock trend calculation
    const trend = Math.random() * 0.4 - 0.2; // -0.2 to 0.2
    
    return {
      direction: trend > 0.05 ? 'improving' : trend < -0.05 ? 'declining' : 'stable',
      magnitude: Math.abs(trend),
      confidence: 0.7
    };
  }

  calculateMentionVolume(symbol) {
    // Mock mention volume
    return {
      total: Math.floor(Math.random() * 1000) + 100,
      news: Math.floor(Math.random() * 50) + 10,
      social: Math.floor(Math.random() * 800) + 50,
      analyst: Math.floor(Math.random() * 20) + 5,
      change_24h: (Math.random() - 0.5) * 0.5 // -25% to +25%
    };
  }

  extractKeyThemes(sources) {
    const themes = new Map();
    
    sources.forEach(source => {
      const tokens = this.tokenizer.tokenize(source.text.toLowerCase());
      
      // Extract financial themes
      const financialThemes = [
        'earnings', 'revenue', 'profit', 'growth', 'margin',
        'upgrade', 'downgrade', 'target', 'buy', 'sell',
        'bullish', 'bearish', 'breakout', 'support', 'resistance'
      ];
      
      tokens.forEach(token => {
        if (financialThemes.includes(token)) {
          themes.set(token, (themes.get(token) || 0) + 1);
        }
      });
    });
    
    // Return top themes
    return Array.from(themes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, mentions: count }));
  }

  getDefaultStockSentiment(symbol) {
    return {
      symbol: symbol,
      timeframe: '24h',
      overall_sentiment: this.getDefaultSentiment(),
      trend: { direction: 'stable', magnitude: 0, confidence: 0.1 },
      volume: { total: 0, news: 0, social: 0, analyst: 0, change_24h: 0 },
      key_themes: [],
      timestamp: new Date()
    };
  }

  async analyzeBatchTexts(texts, options = {}) {
    const results = [];
    
    for (const text of texts) {
      try {
        const sentiment = await this.analyzeText(text, options);
        results.push(sentiment);
      } catch (error) {
        console.error('Batch sentiment analysis error:', error);
        results.push(this.getDefaultSentiment());
      }
    }
    
    return results;
  }

  getSentimentSummary(sentiments) {
    if (sentiments.length === 0) {
      return { positive: 0, negative: 0, neutral: 0, average: 0 };
    }
    
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    let totalScore = 0;
    
    sentiments.forEach(sentiment => {
      totalScore += sentiment.score;
      
      if (sentiment.label === 'positive') positive++;
      else if (sentiment.label === 'negative') negative++;
      else neutral++;
    });
    
    return {
      positive: (positive / sentiments.length) * 100,
      negative: (negative / sentiments.length) * 100,
      neutral: (neutral / sentiments.length) * 100,
      average: totalScore / sentiments.length,
      total_analyzed: sentiments.length
    };
  }
}

export default SentimentAnalysisAI;