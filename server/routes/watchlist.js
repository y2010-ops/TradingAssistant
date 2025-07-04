import express from 'express';
import { Watchlist, WatchlistItem, Stock } from '../models/index.js';

const router = express.Router();

// Get user's watchlists
router.get('/', async (req, res) => {
  try {
    const watchlists = await Watchlist.findAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: WatchlistItem,
          as: 'items',
          include: [
            {
              model: Stock,
              as: 'stock',
              attributes: ['name', 'currentPrice', 'sector']
            }
          ]
        }
      ],
      order: [['sortOrder', 'ASC']]
    });

    res.json(watchlists);
  } catch (error) {
    console.error('Error fetching watchlists:', error);
    res.status(500).json({ error: 'Failed to fetch watchlists' });
  }
});

// Create new watchlist
router.post('/', async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const watchlist = await Watchlist.create({
      userId: req.user.userId,
      name,
      description,
      isPublic: isPublic || false
    });

    res.status(201).json({
      message: 'Watchlist created successfully',
      watchlist
    });
  } catch (error) {
    console.error('Error creating watchlist:', error);
    res.status(500).json({ error: 'Failed to create watchlist' });
  }
});

// Update watchlist
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;

    const watchlist = await Watchlist.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    await watchlist.update({
      name,
      description,
      isPublic
    });

    res.json({
      message: 'Watchlist updated successfully',
      watchlist
    });
  } catch (error) {
    console.error('Error updating watchlist:', error);
    res.status(500).json({ error: 'Failed to update watchlist' });
  }
});

// Delete watchlist
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const watchlist = await Watchlist.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    await watchlist.destroy();

    res.json({ message: 'Watchlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting watchlist:', error);
    res.status(500).json({ error: 'Failed to delete watchlist' });
  }
});

// Add stock to watchlist
router.post('/:id/stocks', async (req, res) => {
  try {
    const { id } = req.params;
    const { symbol, targetPrice, stopLoss, notes } = req.body;

    // Verify watchlist ownership
    const watchlist = await Watchlist.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    // Check if stock already exists in watchlist
    const existingItem = await WatchlistItem.findOne({
      where: { watchlistId: id, symbol }
    });

    if (existingItem) {
      return res.status(400).json({ error: 'Stock already in watchlist' });
    }

    const watchlistItem = await WatchlistItem.create({
      watchlistId: id,
      symbol,
      targetPrice,
      stopLoss,
      notes
    });

    res.status(201).json({
      message: 'Stock added to watchlist successfully',
      item: watchlistItem
    });
  } catch (error) {
    console.error('Error adding stock to watchlist:', error);
    res.status(500).json({ error: 'Failed to add stock to watchlist' });
  }
});

// Remove stock from watchlist
router.delete('/:id/stocks/:itemId', async (req, res) => {
  try {
    const { id, itemId } = req.params;

    // Verify watchlist ownership
    const watchlist = await Watchlist.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    const watchlistItem = await WatchlistItem.findOne({
      where: { id: itemId, watchlistId: id }
    });

    if (!watchlistItem) {
      return res.status(404).json({ error: 'Stock not found in watchlist' });
    }

    await watchlistItem.destroy();

    res.json({ message: 'Stock removed from watchlist successfully' });
  } catch (error) {
    console.error('Error removing stock from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove stock from watchlist' });
  }
});

// Update watchlist item
router.put('/:id/stocks/:itemId', async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { targetPrice, stopLoss, notes, alertEnabled } = req.body;

    // Verify watchlist ownership
    const watchlist = await Watchlist.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    const watchlistItem = await WatchlistItem.findOne({
      where: { id: itemId, watchlistId: id }
    });

    if (!watchlistItem) {
      return res.status(404).json({ error: 'Stock not found in watchlist' });
    }

    await watchlistItem.update({
      targetPrice,
      stopLoss,
      notes,
      alertEnabled
    });

    res.json({
      message: 'Watchlist item updated successfully',
      item: watchlistItem
    });
  } catch (error) {
    console.error('Error updating watchlist item:', error);
    res.status(500).json({ error: 'Failed to update watchlist item' });
  }
});

export default router;