import { createClient } from '@supabase/supabase-js';

// URL and Anon Key are picked up from the environment or hardcoded fallback
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mkeiblxfegxmriyutlbo.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZWlibHhmZWd4bXJpeXV0bGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0ODc3NzYsImV4cCI6MjEwMjA2Mzc3Nn0.4ebo_HAnWPs1BKvxg1WxxPSxDmGAcvg38vHBhAGFSZY';

let offlineUntil = 0;
const SUPABASE_TIMEOUT_MS = 1800;
const OFFLINE_COOLDOWN_MS = 45000;

const resilientFetch: typeof fetch = async (input, init) => {
  const now = Date.now();
  if (now < offlineUntil) {
    return new Response(
      JSON.stringify({ message: 'Supabase temporarily unreachable (circuit breaker active)', code: 'SUPABASE_OFFLINE' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<Response>((_, reject) => {
    timer = setTimeout(() => {
      try { controller.abort(); } catch {}
      reject(new Error('Supabase fetch timeout'));
    }, SUPABASE_TIMEOUT_MS);
  });

  try {
    const res = await Promise.race([
      fetch(input, {
        ...init,
        signal: controller.signal
      }),
      timeoutPromise
    ]);
    if (timer) clearTimeout(timer);

    // Cloudflare 520-526, Gateway 502/503/504, or Proxy 403 means Supabase instance is paused or unreachable.
    // Return 400 so @supabase/supabase-js does not sleep 7s retrying 5xx responses.
    if (res.status >= 500 || res.status === 403) {
      offlineUntil = Date.now() + OFFLINE_COOLDOWN_MS;
      return new Response(
        JSON.stringify({ message: `Supabase HTTP ${res.status}`, code: 'SUPABASE_OFFLINE' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return res;
  } catch (err: any) {
    if (timer) clearTimeout(timer);
    offlineUntil = Date.now() + OFFLINE_COOLDOWN_MS;
    return new Response(
      JSON.stringify({ message: err?.message || 'Supabase fetch timeout', code: 'SUPABASE_OFFLINE' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: resilientFetch
  }
});

