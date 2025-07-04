import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Alert = sequelize.define('Alert', {
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
    type: DataTypes.ENUM('PRICE_ABOVE', 'PRICE_BELOW', 'VOLUME_SPIKE', 'NEWS_SENTIMENT', 'TECHNICAL_SIGNAL'),
    allowNull: false
  },
  condition: {
    type: DataTypes.JSON,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isTriggered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  triggeredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notificationMethod: {
    type: DataTypes.ENUM('EMAIL', 'PUSH', 'SMS', 'IN_APP'),
    defaultValue: 'IN_APP'
  }
}, {
  tableName: 'alerts',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['symbol']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isTriggered']
    }
  ]
});

export default Alert;