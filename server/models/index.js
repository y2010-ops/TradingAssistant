import sequelize from '../config/database.js';
import User from './User.js';
import Stock from './Stock.js';
import SentimentData from './SentimentData.js';
import TradingSignal from './TradingSignal.js';
import UserQuery from './UserQuery.js';
import Portfolio from './Portfolio.js';
import Transaction from './Transaction.js';
import PriceHistory from './PriceHistory.js';
import Watchlist from './Watchlist.js';
import WatchlistItem from './WatchlistItem.js';
import Alert from './Alert.js';

// Define associations
User.hasMany(UserQuery, { foreignKey: 'userId', as: 'queries' });
UserQuery.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Portfolio, { foreignKey: 'userId', as: 'portfolios' });
Portfolio.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Watchlist, { foreignKey: 'userId', as: 'watchlists' });
Watchlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Watchlist.hasMany(WatchlistItem, { foreignKey: 'watchlistId', as: 'items' });
WatchlistItem.belongsTo(Watchlist, { foreignKey: 'watchlistId', as: 'watchlist' });

User.hasMany(Alert, { foreignKey: 'userId', as: 'alerts' });
Alert.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Stock.hasMany(SentimentData, { foreignKey: 'symbol', sourceKey: 'symbol', as: 'sentiments' });
SentimentData.belongsTo(Stock, { foreignKey: 'symbol', targetKey: 'symbol', as: 'stock' });

Stock.hasMany(TradingSignal, { foreignKey: 'symbol', sourceKey: 'symbol', as: 'signals' });
TradingSignal.belongsTo(Stock, { foreignKey: 'symbol', targetKey: 'symbol', as: 'stock' });

Stock.hasMany(PriceHistory, { foreignKey: 'symbol', sourceKey: 'symbol', as: 'priceHistory' });
PriceHistory.belongsTo(Stock, { foreignKey: 'symbol', targetKey: 'symbol', as: 'stock' });

export {
  sequelize,
  User,
  Stock,
  SentimentData,
  TradingSignal,
  UserQuery,
  Portfolio,
  Transaction,
  PriceHistory,
  Watchlist,
  WatchlistItem,
  Alert
};

export default {
  sequelize,
  User,
  Stock,
  SentimentData,
  TradingSignal,
  UserQuery,
  Portfolio,
  Transaction,
  PriceHistory,
  Watchlist,
  WatchlistItem,
  Alert
};