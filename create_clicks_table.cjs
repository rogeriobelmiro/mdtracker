const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const supabaseUrlMatch = env.match(/VITE_SUPABASE_URL=\"(.*)\"/);
const supabaseKeyMatch = env.match(/VITE_SUPABASE_ANON_KEY=\"(.*)\"/);
const supabaseUrl = supabaseUrlMatch[1];
const supabaseKey = supabaseKeyMatch[1];

async function run() {
    console.log("Creating link_clicks table via REST...");
    const resp = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            query: `
            CREATE TABLE IF NOT EXISTS public.link_clicks (
              id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
              link_id text NOT NULL REFERENCES public.campaign_links(id) ON DELETE CASCADE,
              company_id text NOT NULL,
              ip_address text,
              user_agent text,
              created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
            );
            `
        })
    });
    console.log(resp.status, await resp.text());
}
run();
