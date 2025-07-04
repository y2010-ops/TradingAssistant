import Sentiment from 'sentiment';
import natural from 'natural';

export class SentimentAnalysis {
  constructor() {
    this.sentiment = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
    
    // Financial keywords with weights
    this.financialKeywords = {
      positive: {
        'bullish': 3, 'buy': 2, 'growth': 2, 'profit': 2, 'earnings': 2,
        'revenue': 2, 'strong': 2, 'outperform': 3, 'upgrade': 3, 'beat': 2,
        'exceed': 2, 'positive': 1, 'good': 1, 'excellent': 2, 'impressive': 2
      },
      negative: {
        'bearish': -3, 'sell': -2, 'loss': -2, 'decline': -2, 'fall': -2,
        'drop': -2, 'weak': -2, 'underperform': -3, 'downgrade': -3, 'miss': -2,
        'disappointing': -2, 'negative': -1, 'bad': -1, 'poor': -2, 'terrible': -3
      }
    };
  }

  // Analyze text sentiment with financial context
  analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
      return { score: 0, comparative: 0, tokens: [], words: [], positive: [], negative: [] };
    }

    // Basic sentiment analysis
    const result = this.sentiment.analyze(text);
    
    // Apply financial keyword weighting
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    let financialScore = 0;
    const financialWords = [];
    
    tokens.forEach(token => {
      if (this.financialKeywords.positive[token]) {
        financialScore += this.financialKeywords.positive[token];
        financialWords.push({ word: token, score: this.financialKeywords.positive[token] });
      } else if (this.financialKeywords.negative[token]) {
        financialScore += this.financialKeywords.negative[token];
        financialWords.push({ word: token, score: this.financialKeywords.negative[token] });
      }
    });
    
    // Combine scores with financial weighting
    const combinedScore = result.score + (financialScore * 0.5);
    const normalizedScore = Math.max(-1, Math.min(1, combinedScore / Math.max(1, tokens.length)));
    
    return {
      score: combinedScore,
      comparative: normalizedScore,
      tokens: tokens,
      words: result.words,
      positive: result.positive,
      negative: result.negative,
      financialWords: financialWords,
      financialScore: financialScore
    };
  }

  // Analyze sentiment for a specific stock from multiple sources
  async analyzeStockSentiment(symbol, sources = ['news', 'social']) {
    const sentimentData = {
      symbol: symbol,
      overall: 0,
      sources: {},
      mentions: 0,
      timestamp: new Date()
    };

    for (const source of sources) {
      try {
        let sourceData;
        
        // Use real data for news if available
        if (source === 'news' && process.env.NEWS_API_KEY) {
          sourceData = await this.getNewsSentiment(symbol);
        } else {
          sourceData = await this.getSourceSentiment(symbol, source);
        }
        
        sentimentData.sources[source] = sourceData;
        sentimentData.mentions += sourceData.mentions;
      } catch (error) {
        console.error(`Error analyzing ${source} sentiment for ${symbol}:`, error);
        sentimentData.sources[source] = { score: 0, mentions: 0, confidence: 0 };
      }
    }

    // Calculate weighted overall sentiment
    let totalScore = 0;
    let totalWeight = 0;

    Object.values(sentimentData.sources).forEach(source => {
      const weight = Math.log(source.mentions + 1); // Log scale for mentions
      totalScore += source.score * weight;
      totalWeight += weight;
    });

    sentimentData.overall = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    return sentimentData;
  }

  // Get sentiment from news articles
  async getNewsSentiment(symbol) {
    try {
      // Use the DataProvider to get real news
      const DataProvider = (await import('../services/dataProvider.js')).DataProvider;
      const dataProvider = new DataProvider();
      
      const news = await dataProvider.getNewsData(symbol);
      
      if (!news || news.length === 0) {
        return { score: 0.5, mentions: 0, confidence: 0 };
      }
      
      // Analyze sentiment of each news article
      let totalScore = 0;
      let totalConfidence = 0;
      
      for (const article of news) {
        const text = `${article.title} ${article.summary || ''}`;
        const sentiment = this.analyzeSentiment(text);
        
        // Convert sentiment to numeric score (-1 to 1)
        let score = 0;
        if (article.sentiment === 'positive' || sentiment.comparative > 0) {
          score = Math.max(0.3, sentiment.comparative);
        } else if (article.sentiment === 'negative' || sentiment.comparative < 0) {
          score = Math.min(-0.3, sentiment.comparative);
        }
        
        totalScore += score;
        totalConfidence += Math.abs(score);
      }
      
      const avgScore = news.length > 0 ? totalScore / news.length : 0;
      const avgConfidence = news.length > 0 ? totalConfidence / news.length + 0.3 : 0.5;
      
      return {
        score: avgScore,
        mentions: news.length,
        confidence: Math.min(0.9, avgConfidence)
      };
    } catch (error) {
      console.error('Error getting news sentiment:', error);
      return { score: 0.5, mentions: 0, confidence: 0.5 };
    }
  }

  // Mock function to get sentiment from different sources
  async getSourceSentiment(symbol, source) {
    // In a real implementation, this would fetch from actual APIs
    const mockData = {
      news: {
        score: Math.random() * 0.6 + 0.2, // 0.2 to 0.8
        mentions: Math.floor(Math.random() * 100) + 50,
        confidence: 0.8
      },
      social: {
        score: Math.random() * 0.8 + 0.1, // 0.1 to 0.9
        mentions: Math.floor(Math.random() * 500) + 100,
        confidence: 0.6
      },
      reddit: {
        score: Math.random() * 0.7 + 0.15, // 0.15 to 0.85
        mentions: Math.floor(Math.random() * 50) + 10,
        confidence: 0.7
      },
      forums: {
        score: Math.random() * 0.6 + 0.2, // 0.2 to 0.8
        mentions: Math.floor(Math.random() * 30) + 5,
        confidence: 0.5
      }
    };

    return mockData[source] || { score: 0.5, mentions: 0, confidence: 0 };
  }

  // Analyze social media sentiment
  async analyzeSocialSentiment(symbol, sources = ['reddit', 'twitter']) {
    try {
      const results = {};
      let totalMentions = 0;
      let totalScore = 0;
      let totalWeight = 0;
      
      for (const source of sources) {
        const sourceData = await this.getSourceSentiment(symbol, source);
        results[source] = sourceData;
        
        totalMentions += sourceData.mentions;
        totalScore += sourceData.score * sourceData.mentions;
        totalWeight += sourceData.mentions;
      }
      
      const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
      
      return {
        symbol,
        overall: overallScore,
        sources: results,
        mentions: totalMentions,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error analyzing social sentiment:', error);
      return {
        symbol,
        overall: 0,
        sources: {},
        mentions: 0,
        timestamp: new Date()
      };
    }
  }

  // Analyze news headlines for market sentiment
  analyzeNewsHeadlines(headlines) {
    if (!headlines || headlines.length === 0) {
      return { overall: 0.5, individual: [], summary: 'No headlines to analyze' };
    }

    const results = headlines.map(headline => {
      const sentiment = this.analyzeSentiment(headline.title || headline);
      return {
        text: headline.title || headline,
        sentiment: sentiment.comparative,
        score: sentiment.score,
        financialWords: sentiment.financialWords
      };
    });

    const overallSentiment = results.reduce((sum, result) => sum + result.sentiment, 0) / results.length;
    const normalizedSentiment = (overallSentiment + 1) / 2; // Convert from [-1,1] to [0,1]

    return {
      overall: normalizedSentiment,
      individual: results,
      summary: this.generateSentimentSummary(normalizedSentiment, results.length)
    };
  }

  generateSentimentSummary(sentiment, count) {
    if (sentiment > 0.7) {
      return `Very positive sentiment across ${count} sources. Strong bullish indicators.`;
    } else if (sentiment > 0.6) {
      return `Positive sentiment detected. Market optimism is evident.`;
    } else if (sentiment > 0.4) {
      return `Neutral to slightly positive sentiment. Mixed signals in the market.`;
    } else if (sentiment > 0.3) {
      return `Slightly negative sentiment. Some concerns in the market.`;
    } else {
      return `Negative sentiment detected. Bearish indicators are prominent.`;
    }
  }

  // Real-time sentiment tracking
  trackSentimentTrend(historicalData) {
    if (!historicalData || historicalData.length < 2) {
      return { trend: 'stable', change: 0, direction: 'neutral' };
    }

    const recent = historicalData.slice(-5); // Last 5 data points
    const older = historicalData.slice(-10, -5); // Previous 5 data points

    const recentAvg = recent.reduce((sum, item) => sum + item.sentimentScore, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, item) => sum + item.sentimentScore, 0) / older.length : recentAvg;

    const change = recentAvg - olderAvg;
    const changePercent = Math.abs(change) / olderAvg * 100;

    let trend = 'stable';
    let direction = 'neutral';

    if (changePercent > 10) {
      trend = change > 0 ? 'improving' : 'declining';
      direction = change > 0 ? 'positive' : 'negative';
    }

    return {
      trend,
      change: change,
      changePercent: changePercent,
      direction,
      current: recentAvg,
      previous: olderAvg
    };
  }
}