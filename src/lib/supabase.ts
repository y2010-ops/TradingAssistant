import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we're in development mode and environment variables are missing
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const hasValidCredentials = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' && 
  supabaseAnonKey !== 'your_actual_anon_key_here' &&
  supabaseUrl !== '@vite_supabase_url' &&
  supabaseAnonKey !== '@vite_supabase_anon_key';

// Create mock Supabase client
const createMockSupabase = (message: string = 'Supabase not configured') => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message } }),
    signUp: async () => ({ data: { user: null, session: null }, error: { message } }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: { message } }),
    onAuthStateChange: (callback: any) => ({
      data: { subscription: { unsubscribe: () => {} } }
    })
  }
});

let supabase: any;

if (!hasValidCredentials) {
  if (isDevelopment) {
    console.warn('⚠️ Supabase credentials not configured. Using mock client for development.');
    console.warn('📝 To set up Supabase, follow the instructions in SETUP_INSTRUCTIONS.md');
    supabase = createMockSupabase('Supabase not configured');
  } else if (isProduction) {
    console.error('❌ Supabase credentials not configured for production deployment.');
    console.error('📝 Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel environment variables.');
    supabase = createMockSupabase('Authentication service unavailable');
  } else {
    throw new Error('Missing Supabase environment variables');
  }
} else {
  // Validate URL format only if we have valid credentials
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('supabase.co')) {
      throw new Error('Invalid Supabase URL format');
    }
      } catch (error) {
      if (isDevelopment) {
        console.warn('⚠️ Invalid Supabase URL format. Using mock client for development.');
        supabase = createMockSupabase('Supabase not configured');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Invalid SUPABASE_URL: ${errorMessage}`);
      }
    }

  // Create real Supabase client
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
  }
}

export { supabase };
export default supabase;