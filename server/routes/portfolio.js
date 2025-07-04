import express from 'express';
import { Portfolio, Transaction, Stock } from '../models/index.js';
import { DataProvider } from '../services/dataProvider.js';

const router = express.Router();
const dataProvider = new DataProvider();

// Get user's portfolio
router.get('/', async (req, res) => {
  try {
    const portfolios = await Portfolio.findAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: Stock,
          as: 'stock',
          attributes: ['name', 'sector']
        }
      ]
    });

    // Update current values with real-time data
    const updatedPortfolios = await Promise.all(
      portfolios.map(async (portfolio) => {
        const realTimeData = await dataProvider.getRealTimeData(portfolio.symbol);
        const currentValue = portfolio.quantity * realTimeData.price;
        const unrealizedPnL = currentValue - portfolio.totalInvested;

        await portfolio.update({
          currentValue,
          unrealizedPnL,
          lastUpdated: new Date()
        });

        return {
          ...portfolio.toJSON(),
          currentPrice: realTimeData.price,
          change: realTimeData.change,
          changePercent: realTimeData.changePercent
        };
      })
    );

    // Calculate portfolio summary
    const summary = {
      totalInvested: updatedPortfolios.reduce((sum, p) => sum + parseFloat(p.totalInvested), 0),
      currentValue: updatedPortfolios.reduce((sum, p) => sum + parseFloat(p.currentValue), 0),
      totalPnL: updatedPortfolios.reduce((sum, p) => sum + parseFloat(p.unrealizedPnL), 0),
      totalRealizedPnL: updatedPortfolios.reduce((sum, p) => sum + parseFloat(p.realizedPnL), 0)
    };

    summary.totalPnLPercent = (summary.totalPnL / summary.totalInvested) * 100;

    res.json({
      portfolios: updatedPortfolios,
      summary
    });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Add stock to portfolio
router.post('/add', async (req, res) => {
  try {
    const { symbol, quantity, price, notes } = req.body;
    const totalInvested = quantity * price;

    // Check if stock already exists in portfolio
    const existingPortfolio = await Portfolio.findOne({
      where: { userId: req.user.userId, symbol }
    });

    if (existingPortfolio) {
      // Update existing position
      const newQuantity = existingPortfolio.quantity + quantity;
      const newTotalInvested = existingPortfolio.totalInvested + totalInvested;
      const newAvgPrice = newTotalInvested / newQuantity;

      await existingPortfolio.update({
        quantity: newQuantity,
        avgPrice: newAvgPrice,
        totalInvested: newTotalInvested,
        notes
      });

      // Record transaction
      await Transaction.create({
        userId: req.user.userId,
        symbol,
        type: 'BUY',
        quantity,
        price,
        totalAmount: totalInvested,
        netAmount: totalInvested,
        notes
      });

      res.json({
        message: 'Position updated successfully',
        portfolio: existingPortfolio
      });
    } else {
      // Create new position
      const portfolio = await Portfolio.create({
        userId: req.user.userId,
        symbol,
        quantity,
        avgPrice: price,
        totalInvested,
        notes
      });

      // Record transaction
      await Transaction.create({
        userId: req.user.userId,
        symbol,
        type: 'BUY',
        quantity,
        price,
        totalAmount: totalInvested,
        netAmount: totalInvested,
        notes
      });

      res.status(201).json({
        message: 'Stock added to portfolio successfully',
        portfolio
      });
    }
  } catch (error) {
    console.error('Add to portfolio error:', error);
    res.status(500).json({ error: 'Failed to add stock to portfolio' });
  }
});

// Sell stock from portfolio
router.post('/sell', async (req, res) => {
  try {
    const { symbol, quantity, price, notes } = req.body;

    const portfolio = await Portfolio.findOne({
      where: { userId: req.user.userId, symbol }
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Stock not found in portfolio' });
    }

    if (portfolio.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity to sell' });
    }

    const sellAmount = quantity * price;
    const costBasis = (portfolio.avgPrice * quantity);
    const realizedPnL = sellAmount - costBasis;

    // Update portfolio
    const newQuantity = portfolio.quantity - quantity;
    const newTotalInvested = portfolio.totalInvested - costBasis;

    if (newQuantity === 0) {
      // Remove from portfolio if all shares sold
      await portfolio.destroy();
    } else {
      await portfolio.update({
        quantity: newQuantity,
        totalInvested: newTotalInvested,
        realizedPnL: portfolio.realizedPnL + realizedPnL
      });
    }

    // Record transaction
    await Transaction.create({
      userId: req.user.userId,
      symbol,
      type: 'SELL',
      quantity,
      price,
      totalAmount: sellAmount,
      netAmount: sellAmount,
      notes
    });

    res.json({
      message: 'Stock sold successfully',
      realizedPnL,
      portfolio: newQuantity > 0 ? portfolio : null
    });
  } catch (error) {
    console.error('Sell from portfolio error:', error);
    res.status(500).json({ error: 'Failed to sell stock from portfolio' });
  }
});

// Get transaction history
router.get('/transactions', async (req, res) => {
  try {
    const { symbol, type, limit = 50, offset = 0 } = req.query;

    const whereClause = { userId: req.user.userId };
    if (symbol) whereClause.symbol = symbol;
    if (type) whereClause.type = type;

    const transactions = await Transaction.findAndCountAll({
      where: whereClause,
      order: [['transactionDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(transactions);
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

export default router;