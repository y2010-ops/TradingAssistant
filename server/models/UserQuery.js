import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserQuery = sequelize.define('UserQuery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true // Allow anonymous queries
  },
  query: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sentimentScore: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    validate: {
      min: -1.0000,
      max: 1.0000
    }
  },
  intent: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  confidence: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    validate: {
      min: 0.0000,
      max: 1.0000
    }
  },
  responseTime: {
    type: DataTypes.INTEGER, // Response time in milliseconds
    allowNull: true
  },
  sessionId: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'user_queries',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['intent']
    }
  ]
});

export default UserQuery;