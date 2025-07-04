import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WatchlistItem = sequelize.define('WatchlistItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  watchlistId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'watchlists',
      key: 'id'
    }
  },
  symbol: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  targetPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  stopLoss: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  alertEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'watchlist_items',
  timestamps: true,
  indexes: [
    {
      fields: ['watchlistId']
    },
    {
      fields: ['symbol']
    },
    {
      unique: true,
      fields: ['watchlistId', 'symbol']
    }
  ]
});

export default WatchlistItem;