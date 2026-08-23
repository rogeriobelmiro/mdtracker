import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: leads } = await supabase.from('leads').select('id, name, phone, company_id').order('created_at', { ascending: false }).limit(5);
  console.log("LEADS:", leads);
}
run();
