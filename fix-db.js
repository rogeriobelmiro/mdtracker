import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const targetId = 'comp-1786498560971';
  
  // Update settings
  const { error: e1 } = await supabase.from('settings').update({ company_id: targetId }).eq('company_id', 'comp-alfa');
  console.log("Settings update:", e1);
  
  // Update leads
  const { error: e2 } = await supabase.from('leads').update({ company_id: targetId }).eq('company_id', 'comp-alfa');
  console.log("Leads update:", e2);
  
  // Update users
  const { error: e3 } = await supabase.from('users').update({ company_id: targetId }).eq('company_id', 'comp-alfa');
  console.log("Users update:", e3);
}
run();
