import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
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
  type: {
    type: DataTypes.ENUM('BUY', 'SELL'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  fees: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  taxes: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  netAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  broker: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  orderId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['symbol']
    },
    {
      fields: ['transactionDate']
    },
    {
      fields: ['type']
    }
  ]
});

export default Transaction;