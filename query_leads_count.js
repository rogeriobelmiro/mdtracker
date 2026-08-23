import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { count, error } = await supabase.from('leads').select('*', { count: 'exact', head: true });
  console.log('Total leads:', count);
  const { data } = await supabase.from('leads').select('id, phone, created_at').order('created_at', { ascending: false }).limit(2);
  console.log(data);
}
run();
