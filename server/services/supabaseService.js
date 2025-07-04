import { supabaseAdmin } from '../config/supabase.js';

export class SupabaseService {
  constructor() {
    this.client = supabaseAdmin;
  }

  // Stock operations
  async getStocks() {
    const { data, error } = await this.client
      .from('stocks')
      .select('*')
      .order('symbol');
    
    if (error) throw error;
    return data;
  }

  async getStock(symbol) {
    const { data, error } = await this.client
      .from('stocks')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateStockPrice(symbol, priceData) {
    const { data, error } = await this.client
      .from('stocks')
      .update({
        current_price: priceData.price,
        volume: priceData.volume,
        updated_at: new Date().toISOString()
      })
      .eq('symbol', symbol)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Sentiment data operations
  async saveSentimentData(sentimentData) {
    const { data, error } = await this.client
      .from('sentiment_data')
      .insert({
        symbol: sentimentData.symbol,
        source: sentimentData.source,
        sentiment_score: sentimentData.sentimentScore,
        content: sentimentData.content,
        mentions: sentimentData.mentions
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getSentimentData(symbol, limit = 100) {
    const { data, error } = await this.client
      .from('sentiment_data')
      .select('*')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  // Trading signals operations
  async saveTradingSignal(signal) {
    const { data, error } = await this.client
      .from('trading_signals')
      .insert({
        symbol: signal.symbol,
        action: signal.action,
        confidence: signal.confidence,
        target_price: signal.targetPrice,
        stop_loss: signal.stopLoss,
        reasoning: signal.reasoning,
        technical_score: signal.breakdown?.technical?.confidence / 100,
        sentiment_score: signal.breakdown?.sentiment,
        fundamental_score: signal.breakdown?.fundamental,
        ai_score: signal.aiScore
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getTradingSignals(symbol = null, limit = 50) {
    let query = this.client
      .from('trading_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (symbol) {
      query = query.eq('symbol', symbol);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // User queries operations
  async saveUserQuery(userId, query, response, metadata = {}) {
    const { data, error } = await this.client
      .from('user_queries')
      .insert({
        user_id: userId,
        query: query,
        response: response.message,
        sentiment_score: metadata.sentimentScore,
        intent: metadata.intent,
        confidence: response.confidence,
        response_time: metadata.responseTime,
        session_id: metadata.sessionId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserQueries(userId, limit = 50) {
    const { data, error } = await this.client
      .from('user_queries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  // Price history operations
  async savePriceHistory(symbol, priceData) {
    const { data, error } = await this.client
      .from('price_history')
      .upsert({
        symbol: symbol,
        date: priceData.date,
        open: priceData.open,
        high: priceData.high,
        low: priceData.low,
        close: priceData.close,
        volume: priceData.volume,
        adjusted_close: priceData.adjustedClose,
        dividend_amount: priceData.dividendAmount || 0,
        split_coefficient: priceData.splitCoefficient || 1
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getPriceHistory(symbol, startDate, endDate) {
    const { data, error } = await this.client
      .from('price_history')
      .select('*')
      .eq('symbol', symbol)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // Portfolio operations (user-specific)
  async getUserPortfolio(userId) {
    const { data, error } = await this.client
      .from('portfolios')
      .select(`
        *,
        stocks (
          name,
          sector,
          current_price
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }

  async addToPortfolio(userId, portfolioData) {
    const { data, error } = await this.client
      .from('portfolios')
      .upsert({
        user_id: userId,
        symbol: portfolioData.symbol,
        quantity: portfolioData.quantity,
        avg_price: portfolioData.avgPrice,
        total_invested: portfolioData.totalInvested,
        notes: portfolioData.notes
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Transaction operations
  async saveTransaction(userId, transactionData) {
    const { data, error } = await this.client
      .from('transactions')
      .insert({
        user_id: userId,
        symbol: transactionData.symbol,
        type: transactionData.type,
        quantity: transactionData.quantity,
        price: transactionData.price,
        total_amount: transactionData.totalAmount,
        fees: transactionData.fees || 0,
        taxes: transactionData.taxes || 0,
        net_amount: transactionData.netAmount,
        transaction_date: transactionData.transactionDate || new Date().toISOString(),
        broker: transactionData.broker,
        order_id: transactionData.orderId,
        notes: transactionData.notes
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserTransactions(userId, filters = {}) {
    let query = this.client
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });
    
    if (filters.symbol) {
      query = query.eq('symbol', filters.symbol);
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Watchlist operations
  async getUserWatchlists(userId) {
    const { data, error } = await this.client
      .from('watchlists')
      .select(`
        *,
        watchlist_items (
          *,
          stocks (
            name,
            current_price,
            sector
          )
        )
      `)
      .eq('user_id', userId)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  }

  async createWatchlist(userId, watchlistData) {
    const { data, error } = await this.client
      .from('watchlists')
      .insert({
        user_id: userId,
        name: watchlistData.name,
        description: watchlistData.description,
        is_default: watchlistData.isDefault || false,
        is_public: watchlistData.isPublic || false
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async addToWatchlist(watchlistId, itemData) {
    const { data, error } = await this.client
      .from('watchlist_items')
      .insert({
        watchlist_id: watchlistId,
        symbol: itemData.symbol,
        target_price: itemData.targetPrice,
        stop_loss: itemData.stopLoss,
        notes: itemData.notes,
        alert_enabled: itemData.alertEnabled || false
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Alert operations
  async getUserAlerts(userId) {
    const { data, error } = await this.client
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createAlert(userId, alertData) {
    const { data, error } = await this.client
      .from('alerts')
      .insert({
        user_id: userId,
        symbol: alertData.symbol,
        type: alertData.type,
        condition: alertData.condition,
        message: alertData.message,
        expires_at: alertData.expiresAt,
        notification_method: alertData.notificationMethod || 'IN_APP'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async triggerAlert(alertId) {
    const { data, error } = await this.client
      .from('alerts')
      .update({
        is_triggered: true,
        triggered_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

export default SupabaseService;