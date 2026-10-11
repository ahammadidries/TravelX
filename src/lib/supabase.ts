import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const isSupabaseConfigured = Boolean(url && key && !key.startsWith('sb_secret_'));

// Only the public catalog is read. Never restore or refresh an old user session.
export const supabase = createClient(
  url || 'https://unconfigured.supabase.co',
  isSupabaseConfigured ? key! : 'unconfigured',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);
