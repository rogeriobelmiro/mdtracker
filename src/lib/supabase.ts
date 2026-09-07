import { createClient } from '@supabase/supabase-js';

// URL and Anon Key are picked up from the environment or hardcoded fallback
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mkeiblxfegxmriyutlbo.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZWlibHhmZWd4bXJpeXV0bGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0ODc3NzYsImV4cCI6MjEwMjA2Mzc3Nn0.4ebo_HAnWPs1BKvxg1WxxPSxDmGAcvg38vHBhAGFSZY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
