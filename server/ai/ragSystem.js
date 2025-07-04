import LocalLLM from './localLLM.js';
import VectorStore from './vectorStore.js';

export class RAGSystem {
  constructor() {
    this.llm = new LocalLLM();
    this.vectorStore = new VectorStore();
    this.knowledgeBase = new Map();
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('Initializing RAG system...');
      
      await Promise.all([
        this.llm.initialize(),
        this.vectorStore.initialize()
      ]);

      await this.loadFinancialKnowledge();
      
      this.initialized = true;
      console.log('RAG system initialized successfully');
    } catch (error) {
      console.error('RAG system initialization error:', error);
    }
  }

  async loadFinancialKnowledge() {
    const knowledgeItems = [
      {
        id: 'rsi_indicator',
        text: 'RSI (Relative Strength Index) is a momentum oscillator that measures the speed and change of price movements. RSI oscillates between 0 and 100. Values above 70 indicate overbought conditions, while values below 30 indicate oversold conditions.',
        category: 'technical_analysis',
        tags: ['rsi', 'momentum', 'overbought', 'oversold']
      },
      {
        id: 'macd_indicator',
        text: 'MACD (Moving Average Convergence Divergence) is a trend-following momentum indicator. It shows the relationship between two moving averages of a security\'s price. A bullish crossover occurs when MACD crosses above the signal line.',
        category: 'technical_analysis',
        tags: ['macd', 'moving average', 'trend', 'momentum']
      },
      {
        id: 'bollinger_bands',
        text: 'Bollinger Bands consist of a middle band (moving average) and two outer bands (standard deviations). When price touches the upper band, it may indicate overbought conditions. When price touches the lower band, it may indicate oversold conditions.',
        category: 'technical_analysis',
        tags: ['bollinger bands', 'volatility', 'moving average']
      },
      {
        id: 'pe_ratio',
        text: 'Price-to-Earnings (P/E) ratio measures a company\'s current share price relative to its per-share earnings. A high P/E ratio could mean the stock is overvalued, while a low P/E might indicate undervaluation.',
        category: 'fundamental_analysis',
        tags: ['pe ratio', 'valuation', 'earnings']
      },
      {
        id: 'market_cap',
        text: 'Market capitalization is the total value of a company\'s shares. Large-cap stocks (>₹20,000 crores) are generally more stable, while small-cap stocks (<₹5,000 crores) offer higher growth potential but with increased risk.',
        category: 'fundamental_analysis',
        tags: ['market cap', 'valuation', 'company size']
      },
      {
        id: 'dividend_yield',
        text: 'Dividend yield is the annual dividend payment divided by the stock price. A higher dividend yield may indicate a good income investment, but very high yields might signal financial distress.',
        category: 'fundamental_analysis',
        tags: ['dividend', 'yield', 'income']
      },
      {
        id: 'bull_market',
        text: 'A bull market is characterized by rising stock prices, investor confidence, and economic growth. Bull markets typically last longer than bear markets and are driven by strong economic fundamentals.',
        category: 'market_conditions',
        tags: ['bull market', 'rising prices', 'optimism']
      },
      {
        id: 'bear_market',
        text: 'A bear market is defined by falling stock prices (typically 20% or more decline), pessimism, and economic contraction. Bear markets are usually shorter but more volatile than bull markets.',
        category: 'market_conditions',
        tags: ['bear market', 'falling prices', 'pessimism']
      },
      {
        id: 'nse_trading_hours',
        text: 'NSE (National Stock Exchange) trading hours are 9:15 AM to 3:30 PM IST on weekdays. Pre-market session runs from 9:00 AM to 9:15 AM. After-market session runs from 3:40 PM to 4:00 PM.',
        category: 'market_basics',
        tags: ['nse', 'trading hours', 'market timing']
      },
      {
        id: 'risk_management',
        text: 'Risk management in trading involves setting stop-losses, position sizing, diversification, and never risking more than you can afford to lose. A common rule is to risk no more than 2% of your capital on a single trade.',
        category: 'trading_strategy',
        tags: ['risk management', 'stop loss', 'position sizing']
      }
    ];

    for (const item of knowledgeItems) {
      const embedding = await this.llm.generateEmbedding(item.text);
      await this.vectorStore.addDocument(item.id, item.text, embedding, {
        category: item.category,
        tags: item.tags
      });
      this.knowledgeBase.set(item.id, item);
    }

    console.log(`Loaded ${knowledgeItems.length} knowledge items into RAG system`);
  }

  async query(question, context = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Generate embedding for the question
      const questionEmbedding = await this.llm.generateEmbedding(question);
      
      // Search for relevant documents
      const relevantDocs = await this.vectorStore.search(questionEmbedding, 3, 0.6);
      
      // Build context from retrieved documents
      const retrievedContext = relevantDocs
        .map(doc => doc.metadata.text)
        .join('\n\n');

      // Generate response using LLM with context
      const prompt = this.buildPrompt(question, retrievedContext, context);
      const response = await this.llm.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 300
      });

      return {
        answer: response,
        sources: relevantDocs.map(doc => ({
          id: doc.id,
          similarity: doc.similarity,
          category: doc.metadata.category
        })),
        confidence: this.calculateConfidence(relevantDocs)
      };
    } catch (error) {
      console.error('RAG query error:', error);
      return {
        answer: "I apologize, but I encountered an error processing your question. Please try rephrasing your question.",
        sources: [],
        confidence: 0.1
      };
    }
  }

  buildPrompt(question, context, additionalContext = {}) {
    const systemPrompt = `You are an AI trading assistant specializing in Indian stock markets. Use the provided context to answer questions accurately and concisely.

Context:
${context}

Additional Context:
${JSON.stringify(additionalContext, null, 2)}

Question: ${question}

Instructions:
- Provide accurate, helpful information based on the context
- If the context doesn't contain enough information, say so
- Focus on Indian stock markets (NSE/BSE)
- Include specific examples when relevant
- Keep responses concise but informative
- Always mention that this is not financial advice

Answer:`;

    return systemPrompt;
  }

  calculateConfidence(relevantDocs) {
    if (relevantDocs.length === 0) return 0.1;
    
    const avgSimilarity = relevantDocs.reduce((sum, doc) => sum + doc.similarity, 0) / relevantDocs.length;
    const docCount = Math.min(relevantDocs.length / 3, 1); // Normalize by expected doc count
    
    return Math.min(0.95, avgSimilarity * docCount);
  }

  async addKnowledge(id, text, category, tags = []) {
    const embedding = await this.llm.generateEmbedding(text);
    await this.vectorStore.addDocument(id, text, embedding, {
      category,
      tags,
      timestamp: new Date().toISOString()
    });
    
    this.knowledgeBase.set(id, { id, text, category, tags });
  }

  async getKnowledgeStats() {
    const docCount = await this.vectorStore.getDocumentCount();
    const categories = new Set();
    
    for (const item of this.knowledgeBase.values()) {
      categories.add(item.category);
    }

    return {
      totalDocuments: docCount,
      categories: Array.from(categories),
      knowledgeBaseSize: this.knowledgeBase.size
    };
  }
}

export default RAGSystem;