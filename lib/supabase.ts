import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rrmahskolpeylywgwbow.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybWFoc2tvbHBleWx5d2d3Ym93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Mjg4MTUsImV4cCI6MjA3NjUwNDgxNX0.vvaqSGlM5v2xkROuHYgWWFNIorJ9lZ-mwl91MFP6L6o';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] ERROR: Missing Supabase credentials');
  console.error('[Supabase] URL:', supabaseUrl);
  console.error('[Supabase] Key:', supabaseAnonKey ? 'Present' : 'Missing');
}

console.log('[Supabase] Configuration:', {
  url: supabaseUrl,
  platform: Platform.OS,
  hasKey: !!supabaseAnonKey,
});

const AsyncStorageAdapter = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      console.log(`[AsyncStorage] GET ${key}:`, value ? 'Found' : 'Not found');
      return value;
    } catch (error) {
      console.error(`[AsyncStorage] GET error for ${key}:`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      console.log(`[AsyncStorage] SET ${key}: Success`);
    } catch (error) {
      console.error(`[AsyncStorage] SET error for ${key}:`, error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`[AsyncStorage] REMOVE ${key}: Success`);
    } catch (error) {
      console.error(`[AsyncStorage] REMOVE error for ${key}:`, error);
    }
  },
};

console.log('[Supabase] Initializing client...', { 
  url: supabaseUrl, 
  platform: Platform.OS,
  hasKey: !!supabaseAnonKey 
});

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorageAdapter as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: 'supabase.auth.token',
    },
    global: {
      headers: {
        'x-client-platform': Platform.OS,
      },
      fetch: (url, options = {}) => {
        console.log('[Supabase] Making request to:', url);
        console.log('[Supabase] Request timeout: 30 seconds');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('[Supabase] Request timeout reached');
          controller.abort();
        }, 30000);
        
        return fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          clearTimeout(timeoutId);
          console.log('[Supabase] Request completed successfully');
          return response;
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          console.error('[Supabase] Fetch error:', error);
          console.error('[Supabase] URL was:', url);
          console.error('[Supabase] Platform:', Platform.OS);
          
          if (error.name === 'AbortError') {
            throw new Error('Request timeout. The server is taking too long to respond. Please check your internet connection and try again.');
          }
          
          throw new Error(`Network request failed: ${error.message}. Please check your internet connection and try again.`);
        });
      },
    },
  });

supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Supabase] Auth state changed:', event, session ? 'Has session' : 'No session');
  if (session) {
    console.log('[Supabase] Session user:', session.user.email);
    console.log('[Supabase] Session expires:', new Date(session.expires_at! * 1000).toISOString());
  }
});
