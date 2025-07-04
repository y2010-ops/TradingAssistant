import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PriceHistory = sequelize.define('PriceHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  symbol: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  open: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  high: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  low: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  close: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  volume: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  adjustedClose: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  dividendAmount: {
    type: DataTypes.DECIMAL(8, 4),
    defaultValue: 0
  },
  splitCoefficient: {
    type: DataTypes.DECIMAL(8, 4),
    defaultValue: 1
  }
}, {
  tableName: 'price_history',
  timestamps: true,
  indexes: [
    {
      fields: ['symbol']
    },
    {
      fields: ['date']
    },
    {
      unique: true,
      fields: ['symbol', 'date']
    }
  ]
});

export default PriceHistory;