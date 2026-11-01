-- ==============================================================================
-- TRACKERMD - MIGRATION: PORTAL DO AFILIADO, NOVIDADES & SUPORTE TÉCNICO
-- ==============================================================================

-- 1. TABELA DE NOVIDADES & ROADMAP (Alimentada pelo Super-Admin)
CREATE TABLE IF NOT EXISTS public.product_releases (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    version VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'planned', -- 'released', 'in_progress', 'planned'
    category VARCHAR(50) NOT NULL DEFAULT 'Geral',
    release_date VARCHAR(50),
    description TEXT NOT NULL,
    highlight BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_releases_status ON public.product_releases(status);
CREATE INDEX IF NOT EXISTS idx_product_releases_active ON public.product_releases(active);

-- 2. TABELA DE SUPORTE TÉCNICO, SUGESTÕES E CORREÇÕES DO AFILIADO
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    affiliate_id TEXT,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_phone TEXT,
    type VARCHAR(30) NOT NULL DEFAULT 'support', -- 'support', 'suggestion', 'bug', 'commercial'
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_affiliate_id ON public.support_tickets(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_author_email ON public.support_tickets(author_email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- RLS condicional (somente se as roles Supabase existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        ALTER TABLE public.product_releases ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Permitir leitura publica de releases" ON public.product_releases;
        CREATE POLICY "Permitir leitura publica de releases" ON public.product_releases
            FOR SELECT TO anon, authenticated USING (active = true);

        DROP POLICY IF EXISTS "Permitir super admin gerenciar releases" ON public.product_releases;
        CREATE POLICY "Permitir super admin gerenciar releases" ON public.product_releases
            FOR ALL TO authenticated USING (true) WITH CHECK (true);

        ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Permitir criacao e leitura de chamados" ON public.support_tickets;
        CREATE POLICY "Permitir criacao e leitura de chamados" ON public.support_tickets
            FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 3. SEED INICIAL DE NOVIDADES & LANÇAMENTOS DO SISTEMA
INSERT INTO public.product_releases (
    id, title, version, status, category, release_date, description, highlight, active
) VALUES
(
    'rel-001',
    'Rastreamento Meta Ads CAPI Direto no WhatsApp',
    'v2.4',
    'released',
    'Meta CAPI',
    'Novembro 2026',
    'Envio nativo de conversões (PageView, Lead, Contact, Purchase) para a API de Conversões da Meta direto pelo número do WhatsApp da empresa, sem perda de dados com bloqueadores de cookies.',
    true,
    true
),
(
    'rel-002',
    'Funil Visual 360° com Disparo Multicanal',
    'v2.5',
    'released',
    'CRM & Funis',
    'Novembro 2026',
    'Interface drag-and-drop para desenhar jornadas de clientes completas, integrando WhatsApp, E-mail marketing e SMS Gateway automático.',
    false,
    true
),
(
    'rel-003',
    'Chatbot com Inteligência Artificial Gemini 2.0',
    'v2.6',
    'in_progress',
    'Inteligência Artificial',
    'Dezembro 2026',
    'Atendimento conversacional inteligente capaz de tirar dúvidas, consultar catálogo de produtos e agendar visitas com linguagem humana e natural no WhatsApp.',
    true,
    true
),
(
    'rel-004',
    'Discador Virtual WebRTC e Gravação de Chamadas VoIP',
    'v2.7',
    'planned',
    'Telefonia & VoIP',
    'Janeiro 2027',
    'Ligação direta do navegador com 1 clique para os leads, gravação de áudio, transcrição por IA e resumo automático para os gerentes.',
    false,
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = NOW();
