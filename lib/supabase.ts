import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rrmahskolpeylywgwbow.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybWFoc2tvbHBleWx5d2d3Ym93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Mjg4MTUsImV4cCI6MjA3NjUwNDgxNX0.vvaqSGlM5v2xkROuHYgWWFNIorJ9lZ-mwl91MFP6L6o';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
}

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
    },
  });

supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Supabase] Auth state changed:', event, session ? 'Has session' : 'No session');
  if (session) {
    console.log('[Supabase] Session user:', session.user.email);
    console.log('[Supabase] Session expires:', new Date(session.expires_at! * 1000).toISOString());
  }
});
