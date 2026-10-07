const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const supabaseUrlMatch = env.match(/VITE_SUPABASE_URL=\"(.*)\"/);
const supabaseKeyMatch = env.match(/VITE_SUPABASE_ANON_KEY=\"(.*)\"/);
const supabase = createClient(supabaseUrlMatch[1], supabaseKeyMatch[1]);

async function run() {
    const { data, error } = await supabase.rpc('get_tables'); // Or just try to get from information_schema via standard rest
    console.log("Checking tables...");
    const { data: q, error: e } = await supabase.from('link_clicks').select('*').limit(1);
    if (e) console.log("No link_clicks table:", e.message); else console.log("link_clicks exists!");
}
run();
