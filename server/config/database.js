import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get database URL with fallback and validation
const getDatabaseUrl = () => {
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.warn('⚠️  Database URL not found. Using fallback SQLite database for development.');
    return 'sqlite::memory:';
  }
  
  // Check if it's a placeholder URL
  if (dbUrl.includes('your_password') || dbUrl.includes('placeholder')) {
    console.warn('⚠️  Placeholder database URL detected. Using fallback SQLite database for development.');
    return 'sqlite::memory:';
  }
  
  // Validate URL format for PostgreSQL
  if (dbUrl.startsWith('postgresql://')) {
    try {
      new URL(dbUrl);
      return dbUrl;
    } catch (error) {
      console.warn(`⚠️  Invalid PostgreSQL URL format: ${error.message}. Using fallback SQLite database.`);
      return 'sqlite::memory:';
    }
  }
  
  return dbUrl;
};

// Create Sequelize instance with proper error handling
let sequelize;

try {
  const databaseUrl = getDatabaseUrl();
  
  if (databaseUrl === 'sqlite::memory:') {
    // Use SQLite for development when Supabase is not configured
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    });
    console.log('📦 Using SQLite in-memory database for development');
  } else {
    // Use PostgreSQL/Supabase
    sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
    console.log('🐘 Using PostgreSQL/Supabase database');
  }
} catch (error) {
  console.error('❌ Database configuration error:', error.message);
  console.log('🔄 Falling back to SQLite in-memory database...');
  
  // Fallback to SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
}

export default sequelize;