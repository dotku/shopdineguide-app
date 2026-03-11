import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseUrl = url;
const supabaseAnonKey = anon;
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // ← 重要：设为 false
  },
});
