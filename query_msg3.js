import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('whatsapp_messages').select('*').order('timestamp', { ascending: false }).limit(5);
  console.log(JSON.stringify(data, null, 2));
}
run();
