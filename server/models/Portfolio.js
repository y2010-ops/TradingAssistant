import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  symbol: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  avgPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  totalInvested: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currentValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  unrealizedPnL: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  realizedPnL: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'portfolios',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['symbol']
    },
    {
      unique: true,
      fields: ['userId', 'symbol']
    }
  ]
});

export default Portfolio;