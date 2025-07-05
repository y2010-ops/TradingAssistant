#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up AI Trading Assistant for development...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  let envContent = '';
  
  if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
    console.log('✅ Copied from .env.example');
  } else {
    envContent = `# Supabase Configuration
# Replace these with your actual Supabase credentials from supabase.com
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here

# Server-side Supabase (if needed)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
SUPABASE_DB_URL=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres

# API Keys (optional - for real market data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
FINNHUB_API_KEY=your_finnhub_key_here
POLYGON_API_KEY=your_polygon_key_here

# AI/ML Services (optional)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Redis (optional - for caching)
REDIS_URL=redis://localhost:6379

# JWT Secret (for server-side auth)
JWT_SECRET=your_jwt_secret_here`;
    console.log('✅ Created default .env template');
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('📝 Please edit .env file with your actual credentials\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

console.log('🎯 Development setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env file with your Supabase credentials');
console.log('2. Run "npm run dev" to start development server');
console.log('3. Follow SETUP_INSTRUCTIONS.md for Supabase setup');
console.log('\n🔗 Useful links:');
console.log('- Supabase: https://supabase.com');
console.log('- Vercel: https://vercel.com');
console.log('- Documentation: ./SETUP_INSTRUCTIONS.md');
console.log('- Vercel Deployment: ./VERCEL_DEPLOYMENT.md'); 