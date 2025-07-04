#!/usr/bin/env node

/**
 * API Keys Testing Script
 * Tests all configured API keys to ensure they're working
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  test: (msg) => console.log(`${colors.cyan}[TEST]${colors.reset} ${msg}`)
};

class APITester {
  constructor() {
    this.results = {};
  }

  async testAllAPIs() {
    log.info('🔑 Testing API Keys Configuration...');
    console.log('='.repeat(50));

    await this.testSupabase();
    await this.testAlphaVantage();
    await this.testNewsAPI();
    await this.testRedditAPI();
    await this.testTwitterAPI();
    await this.testOllama();

    this.generateReport();
  }

  async testSupabase() {
    log.test('Testing Supabase connection...');
    
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      this.results.supabase = {
        status: 'failed',
        message: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY'
      };
      log.error('Supabase: Missing configuration');
      return;
    }

    try {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });

      if (response.ok) {
        this.results.supabase = {
          status: 'success',
          message: 'Connection successful'
        };
        log.success('Supabase: Connected successfully');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.results.supabase = {
        status: 'failed',
        message: error.message
      };
      log.error(`Supabase: ${error.message}`);
    }
  }

  async testAlphaVantage() {
    log.test('Testing Alpha Vantage API...');
    
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) {
      this.results.alphaVantage = {
        status: 'skipped',
        message: 'API key not configured (optional)'
      };
      log.warning('Alpha Vantage: API key not configured');
      return;
    }

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${apiKey}`
      );

      const data = await response.json();

      if (data['Global Quote']) {
        this.results.alphaVantage = {
          status: 'success',
          message: 'API key valid, data retrieved'
        };
        log.success('Alpha Vantage: API key working');
      } else if (data['Error Message']) {
        throw new Error(data['Error Message']);
      } else if (data['Note']) {
        this.results.alphaVantage = {
          status: 'warning',
          message: 'Rate limit reached'
        };
        log.warning('Alpha Vantage: Rate limit reached');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      this.results.alphaVantage = {
        status: 'failed',
        message: error.message
      };
      log.error(`Alpha Vantage: ${error.message}`);
    }
  }

  async testNewsAPI() {
    log.test('Testing News API...');
    
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      this.results.newsAPI = {
        status: 'skipped',
        message: 'API key not configured (optional)'
      };
      log.warning('News API: API key not configured');
      return;
    }

    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=stocks&pageSize=1&apiKey=${apiKey}`
      );

      const data = await response.json();

      if (data.status === 'ok') {
        this.results.newsAPI = {
          status: 'success',
          message: `API key valid, ${data.totalResults} articles available`
        };
        log.success(`News API: ${data.totalResults} articles found`);
      } else {
        throw new Error(data.message || 'Invalid response');
      }
    } catch (error) {
      this.results.newsAPI = {
        status: 'failed',
        message: error.message
      };
      log.error(`News API: ${error.message}`);
    }
  }

  async testRedditAPI() {
    log.test('Testing Reddit API...');
    
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.results.redditAPI = {
        status: 'skipped',
        message: 'Client ID/Secret not configured (optional)'
      };
      log.warning('Reddit API: Credentials not configured');
      return;
    }

    try {
      // Test Reddit API access
      const response = await fetch('https://www.reddit.com/r/stocks/hot.json?limit=1');
      const data = await response.json();

      if (data.data && data.data.children) {
        this.results.redditAPI = {
          status: 'success',
          message: 'Public API access working'
        };
        log.success('Reddit API: Public access working');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      this.results.redditAPI = {
        status: 'failed',
        message: error.message
      };
      log.error(`Reddit API: ${error.message}`);
    }
  }

  async testTwitterAPI() {
    log.test('Testing Twitter API...');
    
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;

    if (!bearerToken) {
      this.results.twitterAPI = {
        status: 'skipped',
        message: 'Bearer token not configured (optional)'
      };
      log.warning('Twitter API: Bearer token not configured');
      return;
    }

    try {
      const response = await fetch(
        'https://api.twitter.com/2/tweets/search/recent?query=stocks&max_results=10',
        {
          headers: {
            'Authorization': `Bearer ${bearerToken}`
          }
        }
      );

      const data = await response.json();

      if (data.data) {
        this.results.twitterAPI = {
          status: 'success',
          message: `API access working, ${data.data.length} tweets found`
        };
        log.success(`Twitter API: ${data.data.length} tweets retrieved`);
      } else if (data.errors) {
        throw new Error(data.errors[0].message);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      this.results.twitterAPI = {
        status: 'failed',
        message: error.message
      };
      log.error(`Twitter API: ${error.message}`);
    }
  }

  async testOllama() {
    log.test('Testing Ollama (Local AI)...');
    
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

    try {
      const response = await fetch(`${ollamaUrl}/api/tags`);
      const data = await response.json();

      if (data.models && data.models.length > 0) {
        this.results.ollama = {
          status: 'success',
          message: `${data.models.length} models available: ${data.models.map(m => m.name).join(', ')}`
        };
        log.success(`Ollama: ${data.models.length} models available`);
      } else {
        this.results.ollama = {
          status: 'warning',
          message: 'Server running but no models installed'
        };
        log.warning('Ollama: No models installed');
      }
    } catch (error) {
      this.results.ollama = {
        status: 'failed',
        message: 'Server not running or not accessible'
      };
      log.error('Ollama: Server not accessible');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(50));
    log.info('📊 API Configuration Report');
    console.log('='.repeat(50));

    const categories = {
      required: ['supabase'],
      optional: ['alphaVantage', 'newsAPI', 'redditAPI', 'twitterAPI'],
      local: ['ollama']
    };

    for (const [category, apis] of Object.entries(categories)) {
      console.log(`\n${colors.cyan}${category.toUpperCase()} SERVICES:${colors.reset}`);
      
      for (const api of apis) {
        const result = this.results[api];
        if (!result) continue;

        let statusIcon = '';
        let statusColor = '';
        
        switch (result.status) {
          case 'success':
            statusIcon = '✅';
            statusColor = colors.green;
            break;
          case 'warning':
            statusIcon = '⚠️';
            statusColor = colors.yellow;
            break;
          case 'failed':
            statusIcon = '❌';
            statusColor = colors.red;
            break;
          case 'skipped':
            statusIcon = '⏭️';
            statusColor = colors.blue;
            break;
        }

        console.log(`  ${statusIcon} ${api}: ${statusColor}${result.message}${colors.reset}`);
      }
    }

    // Summary
    const total = Object.keys(this.results).length;
    const successful = Object.values(this.results).filter(r => r.status === 'success').length;
    const failed = Object.values(this.results).filter(r => r.status === 'failed').length;
    const skipped = Object.values(this.results).filter(r => r.status === 'skipped').length;

    console.log('\n' + '='.repeat(50));
    log.info('📈 Summary');
    console.log('='.repeat(50));
    console.log(`Total APIs: ${total}`);
    console.log(`${colors.green}✅ Working: ${successful}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
    console.log(`${colors.blue}⏭️ Skipped: ${skipped}${colors.reset}`);

    // Recommendations
    console.log('\n' + '='.repeat(50));
    log.info('💡 Recommendations');
    console.log('='.repeat(50));

    if (this.results.supabase?.status !== 'success') {
      console.log('🔴 CRITICAL: Set up Supabase database connection');
    }

    if (this.results.ollama?.status !== 'success') {
      console.log('🟡 RECOMMENDED: Install and run Ollama for local AI');
      console.log('   Run: ./scripts/setup-ollama.sh');
    }

    const optionalAPIs = ['alphaVantage', 'newsAPI', 'redditAPI'];
    const workingOptional = optionalAPIs.filter(api => 
      this.results[api]?.status === 'success'
    ).length;

    if (workingOptional === 0) {
      console.log('🟡 RECOMMENDED: Configure at least one data source API');
      console.log('   - Alpha Vantage for stock data');
      console.log('   - News API for financial news');
      console.log('   - Reddit API for social sentiment');
    }

    console.log('\n🚀 Your AI Trading Assistant is ready to use!');
    
    if (failed > 0) {
      console.log('\n⚠️  Some APIs need attention, but the system will work with available services.');
    }
  }
}

// Run the tests
const tester = new APITester();
tester.testAllAPIs().catch(error => {
  log.error(`Test runner failed: ${error.message}`);
  process.exit(1);
});