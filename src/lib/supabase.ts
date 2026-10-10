import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const isSupabaseConfigured = Boolean(url && key && !key.startsWith('sb_secret_'));
export const supabase = createClient(url || 'https://unconfigured.supabase.co', isSupabaseConfigured ? key! : 'unconfigured', {
  auth: { ...(Platform.OS !== 'web' ? { storage: secureStorage } : {}), persistSession: true, autoRefreshToken: true, detectSessionInUrl: Platform.OS === 'web', lock: processLock },
});

export function friendlyError(error: unknown): string {
  const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Something went wrong. Please try again.';
  if (message.includes('schema cache') || message.includes('does not exist')) return 'Together is being set up. Please try again shortly.';
  if (/fetch|network|timeout/i.test(message)) return 'Unable to connect. Check your connection and try again.';
  return message;
}
