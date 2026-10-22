-- ==============================================================================
-- MDTRACKER: MIGRAÇÃO PARA PÁGINAS DE OBRIGADO, PESQUISAS & DOMÍNIOS PRÓPRIOS
-- ==============================================================================

-- 1. Ampliação da tabela de Landing Pages com Página de Obrigado e Domínio Próprio
ALTER TABLE IF EXISTS landing_pages 
ADD COLUMN IF NOT EXISTS thank_you_page JSONB DEFAULT '{
  "enabled": true,
  "title": "🎉 Cadastro Confirmado com Sucesso!",
  "subtitle": "Parabéns por dar este passo importante. Veja os próximos passos abaixo:",
  "badge": "Acesso Liberado",
  "showCheckmark": true,
  "messageCardTitle": "Instruções Importantes",
  "messageCardText": "Verifique também sua caixa de entrada e spam. Seu acesso já foi registrado em nosso sistema.",
  "buttons": []
}'::jsonb;

ALTER TABLE IF EXISTS landing_pages 
ADD COLUMN IF NOT EXISTS custom_domain TEXT;

ALTER TABLE IF EXISTS landing_pages 
ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]'::jsonb;

-- 2. Tabela de Pesquisas & Formulários de Qualificação (Surveys)
CREATE TABLE IF NOT EXISTS surveys (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'published', -- 'published', 'draft', 'archived'
    theme JSONB DEFAULT '{
        "primaryColor": "#2563eb",
        "backgroundColor": "white",
        "fontFamily": "Inter",
        "buttonStyle": "rounded-xl"
    }'::jsonb,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    thank_you JSONB DEFAULT '{
        "title": "🎉 Muito obrigado pela sua resposta!",
        "subtitle": "Seus dados e opiniões foram gravados com sucesso.",
        "ctaButtonText": "Concluir"
    }'::jsonb,
    responses_count INTEGER DEFAULT 0,
    average_nps NUMERIC(4,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_surveys_company_id ON surveys(company_id);
CREATE INDEX IF NOT EXISTS idx_surveys_slug ON surveys(slug);

-- 3. Tabela de Respostas das Pesquisas
CREATE TABLE IF NOT EXISTS survey_responses (
    id TEXT PRIMARY KEY,
    survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL,
    lead_id TEXT,
    lead_name TEXT,
    lead_phone TEXT,
    lead_email TEXT,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    nps_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_company_id ON survey_responses(company_id);

-- 4. Tabela de Domínios Próprios & Configuração DNS (Custom Domains)
CREATE TABLE IF NOT EXISTS custom_domains (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'all', -- 'landing_pages', 'tracking_links', 'all'
    status TEXT NOT NULL DEFAULT 'pending_verification', -- 'active', 'pending_verification', 'dns_propagating', 'error'
    ssl_active BOOLEAN DEFAULT false,
    dns_records JSONB NOT NULL DEFAULT '[]'::jsonb,
    verified_at TIMESTAMPTZ,
    default_landing_page_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_company_id ON custom_domains(company_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
