-- ==============================================================================
-- TRACKERMD - MIGRATION: LOGS DE ATIVIDADE DO SISTEMA & AUDITORIA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.system_activity_logs (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id TEXT,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_role TEXT DEFAULT 'admin',
    is_affiliate_support BOOLEAN DEFAULT false,
    affiliate_name TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    action VARCHAR(100) NOT NULL,
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_company_id ON public.system_activity_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category ON public.system_activity_logs(category);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.system_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_is_affiliate_support ON public.system_activity_logs(is_affiliate_support);

-- Seed inicial de logs de atividades para empresas de demonstração
INSERT INTO public.system_activity_logs (
    id, company_id, user_id, user_name, user_email, user_role, is_affiliate_support, affiliate_name,
    category, action, title, details, created_at
) VALUES 
(
    'act-001',
    'comp-alfa',
    'usr-mt-01',
    'Rogério Belmiro (Representante Master)',
    'rogerio@mudadigital.com.br',
    'affiliate',
    true,
    'Rogério Belmiro',
    'support_access',
    'support_access_started',
    'Acesso de Suporte Assistido Iniciado',
    'O representante Rogério Belmiro acessou o ambiente da empresa para configuração do Meta Ads CAPI e treinamento da equipe.',
    NOW() - INTERVAL '2 days'
),
(
    'act-002',
    'comp-alfa',
    'usr-mt-01',
    'Rogério Belmiro (Representante Master)',
    'rogerio@mudadigital.com.br',
    'affiliate',
    true,
    'Rogério Belmiro',
    'meta_capi',
    'capi_configured',
    'Validação do Token Permanente Meta CAPI',
    'Configurado e testado com sucesso o envio de eventos de Purchase e Lead via servidor para o Pixel 1234567890.',
    NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'
),
(
    'act-003',
    'comp-alfa',
    'usr-1',
    'Ana Cláudia (Administrador)',
    'admin@alfa.com',
    'admin',
    false,
    NULL,
    'link',
    'link_created',
    'Novo Link de Campanha Criado',
    'Criado o link de rastreamento "Black Friday WhatsApp - Anúncios Instagram" (slug: bf-whats).',
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;
