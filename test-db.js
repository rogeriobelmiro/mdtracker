import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('whatsapp_messages').select('*').order('timestamp', { ascending: false }).limit(5);
  console.log("MESSAGES:", data, error);
  
  const { data: leads, error: e2 } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("LEADS:", leads, e2);
}
run();
