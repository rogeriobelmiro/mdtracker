import { createClient } from '@supabase/supabase-js';
import { createPostgresClient, getPgPool } from './postgresAdapter.js';

// URL and Anon Key are picked up from the environment or hardcoded fallback
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mkeiblxfegxmriyutlbo.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZWlibHhmZWd4bXJpeXV0bGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0ODc3NzYsImV4cCI6MjEwMjA2Mzc3Nn0.4ebo_HAnWPs1BKvxg1WxxPSxDmGAcvg38vHBhAGFSZY';

let offlineUntil = 0;
let supabaseVerifiedOnline = false;
let probePromise: Promise<boolean> | null = null;

const SUPABASE_TIMEOUT_MS = 5000;
const OFFLINE_COOLDOWN_MS = 120000; // 120s (> 62s Envoy upstream retry window to let connection pool drain)

function makeOfflineResponse(reason: string): Response {
  return new Response(
    JSON.stringify({ message: reason, code: 'SUPABASE_OFFLINE' }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
}

async function executeTimedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
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

    if (res.status >= 500 || res.status === 403) {
      supabaseVerifiedOnline = false;
      offlineUntil = Date.now() + OFFLINE_COOLDOWN_MS;
      return makeOfflineResponse(`Supabase HTTP ${res.status}`);
    }

    supabaseVerifiedOnline = true;
    offlineUntil = 0;
    return res;
  } catch (err: any) {
    if (timer) clearTimeout(timer);
    supabaseVerifiedOnline = false;
    offlineUntil = Date.now() + OFFLINE_COOLDOWN_MS;
    return makeOfflineResponse(err?.message || 'Supabase fetch timeout');
  }
}

const resilientFetch: typeof fetch = async (input, init) => {
  const now = Date.now();
  if (now < offlineUntil) {
    return makeOfflineResponse('Supabase temporarily unreachable (circuit breaker active)');
  }

  // Single-flight gate: when not yet verified online, only allow 1 request to probe Supabase
  // so Promise.all() bursts never flood PostgREST's connection pool (PGRST003).
  if (!supabaseVerifiedOnline) {
    if (probePromise) {
      const isOnline = await probePromise;
      if (!isOnline || Date.now() < offlineUntil) {
        return makeOfflineResponse('Supabase temporarily unreachable (probe failed)');
      }
    } else {
      let resolveProbe!: (ok: boolean) => void;
      probePromise = new Promise<boolean>((r) => { resolveProbe = r; });
      try {
        const res = await executeTimedFetch(input, init);
        const ok = supabaseVerifiedOnline;
        resolveProbe(ok);
        return res;
      } finally {
        probePromise = null;
      }
    }
  }

  return executeTimedFetch(input, init);
};

const rawSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: resilientFetch
  }
});

const postgresClient = createPostgresClient();

// Seamless proxy: If DATABASE_URL is set (Hostinger/Coolify PostgreSQL), route queries directly to PostgreSQL.
// Otherwise, transparently route to Supabase.
export const supabase: any = new Proxy(rawSupabase, {
  get(target, prop, receiver) {
    if (prop === 'from') {
      if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
        return (table: string) => postgresClient.from(table);
      }
      return target.from.bind(target);
    }
    return Reflect.get(target, prop, receiver);
  }
});

export { getPgPool, createPostgresClient };
