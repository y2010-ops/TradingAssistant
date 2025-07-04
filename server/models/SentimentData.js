import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SentimentData = sequelize.define('SentimentData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  symbol: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  sentimentScore: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT
  },
  url: {
    type: DataTypes.STRING(500)
  },
  mentions: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'sentiment_data',
  timestamps: true
});

export default SentimentData;