import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable')
}

// Validate URL format
try {
  const url = new URL(supabaseUrl)
  if (!url.hostname.includes('supabase.co')) {
    throw new Error('Invalid Supabase URL format')
  }
} catch (error) {
  throw new Error(`Invalid SUPABASE_URL: ${error.message}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (url, options = {}) => {
      // Add timeout to all requests
      return fetch(url, {
        ...options,
        signal: options.signal || AbortSignal.timeout(30000) // 30 second timeout
      })
    }
  }
});

export default supabase;