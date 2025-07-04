import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
// Validate required environment variables
if (!supabaseUrl) {
  console.warn('Missing SUPABASE_URL environment variable - using fallback');
}

if (!supabaseServiceKey) {
  console.warn('Missing SUPABASE_SERVICE_ROLE_KEY environment variable - server functionality will be limited');
}

// Validate URL format
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('supabase.co')) {
      console.warn('Invalid Supabase URL format - using fallback configuration');
    }
  } catch (error) {
    console.warn(`Invalid SUPABASE_URL: ${error.message} - using fallback configuration`);
  }
}


// Service role client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseServiceKey || 'placeholder_key', 
  {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: (url, options = {}) => {
      // Add timeout and better error handling to all requests
      return fetch(url, {
        ...options,
        signal: options.signal || AbortSignal.timeout(30000) // 30 second timeout
      }).catch(error => {
        // Enhanced error reporting
        if (error.name === 'AbortError') {
          throw new Error('Request timed out - check your internet connection');
        }
        if (error.code === 'ENOTFOUND') {
          throw new Error('DNS resolution failed - check your network settings');
        }
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Connection refused - check firewall settings');
        }
        throw error;
      });
    }
  }
});

// Anonymous client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;