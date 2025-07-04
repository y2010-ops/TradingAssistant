import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TradingSignal = sequelize.define('TradingSignal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  symbol: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM('BUY', 'SELL', 'HOLD'),
    allowNull: false
  },
  confidence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  targetPrice: {
    type: DataTypes.DECIMAL(10, 2)
  },
  stopLoss: {
    type: DataTypes.DECIMAL(10, 2)
  },
  reasoning: {
    type: DataTypes.TEXT
  },
  technicalScore: {
    type: DataTypes.DECIMAL(5, 4)
  },
  sentimentScore: {
    type: DataTypes.DECIMAL(5, 4)
  },
  fundamentalScore: {
    type: DataTypes.DECIMAL(5, 4)
  },
  aiScore: {
    type: DataTypes.DECIMAL(3, 1)
  }
}, {
  tableName: 'trading_signals',
  timestamps: true
});

export default TradingSignal;