import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Stock = sequelize.define('Stock', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  symbol: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  sector: {
    type: DataTypes.STRING(100)
  },
  currentPrice: {
    type: DataTypes.DECIMAL(10, 2)
  },
  volume: {
    type: DataTypes.BIGINT
  },
  marketCap: {
    type: DataTypes.BIGINT
  },
  pe: {
    type: DataTypes.DECIMAL(8, 2)
  },
  pb: {
    type: DataTypes.DECIMAL(8, 2)
  },
  dividend: {
    type: DataTypes.DECIMAL(5, 2)
  },
  high52w: {
    type: DataTypes.DECIMAL(10, 2)
  },
  low52w: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  tableName: 'stocks',
  timestamps: true
});

export default Stock;