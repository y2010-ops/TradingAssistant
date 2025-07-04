import express from 'express';
import { Alert } from '../models/index.js';

const router = express.Router();

// Get user's alerts
router.get('/', async (req, res) => {
  try {
    const { active, symbol } = req.query;
    
    const whereClause = { userId: req.user.userId };
    
    if (active !== undefined) {
      whereClause.isActive = active === 'true';
    }
    
    if (symbol) {
      whereClause.symbol = symbol.toUpperCase();
    }

    const alerts = await Alert.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create new alert
router.post('/', async (req, res) => {
  try {
    const {
      symbol,
      type,
      condition,
      message,
      expiresAt,
      notificationMethod
    } = req.body;

    // Validate alert type
    const validTypes = ['PRICE_ABOVE', 'PRICE_BELOW', 'VOLUME_SPIKE', 'NEWS_SENTIMENT', 'TECHNICAL_SIGNAL'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid alert type' });
    }

    // Validate condition based on type
    if (!condition || typeof condition !== 'object') {
      return res.status(400).json({ error: 'Invalid condition format' });
    }

    const alert = await Alert.create({
      userId: req.user.userId,
      symbol: symbol.toUpperCase(),
      type,
      condition,
      message,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      notificationMethod: notificationMethod || 'IN_APP'
    });

    res.status(201).json({
      message: 'Alert created successfully',
      alert
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Update alert
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      condition,
      message,
      isActive,
      expiresAt,
      notificationMethod
    } = req.body;

    const alert = await Alert.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await alert.update({
      condition: condition || alert.condition,
      message: message || alert.message,
      isActive: isActive !== undefined ? isActive : alert.isActive,
      expiresAt: expiresAt ? new Date(expiresAt) : alert.expiresAt,
      notificationMethod: notificationMethod || alert.notificationMethod
    });

    res.json({
      message: 'Alert updated successfully',
      alert
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Delete alert
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await alert.destroy();

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Trigger alert (for testing)
router.post('/:id/trigger', async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await alert.update({
      isTriggered: true,
      triggeredAt: new Date()
    });

    // Here you would typically send the notification
    // For now, we'll just return success
    res.json({
      message: 'Alert triggered successfully',
      alert
    });
  } catch (error) {
    console.error('Error triggering alert:', error);
    res.status(500).json({ error: 'Failed to trigger alert' });
  }
});

// Get alert statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Alert.findAll({
      where: { userId: req.user.userId },
      attributes: [
        'type',
        'isActive',
        'isTriggered'
      ],
      raw: true
    });

    const summary = {
      total: stats.length,
      active: stats.filter(a => a.isActive).length,
      triggered: stats.filter(a => a.isTriggered).length,
      byType: {}
    };

    // Group by type
    stats.forEach(alert => {
      if (!summary.byType[alert.type]) {
        summary.byType[alert.type] = 0;
      }
      summary.byType[alert.type]++;
    });

    res.json(summary);
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

export default router;