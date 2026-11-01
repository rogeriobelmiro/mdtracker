-- ==============================================================================
-- TRACKERMD - MIGRATION: AFILIADOS, REPRESENTANTES BRASIL, HOTMART & ASSINATURAS
-- ==============================================================================

-- 1. TABELA DE AFILIADOS E REPRESENTANTES REGIONAIS
CREATE TABLE IF NOT EXISTS affiliates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    document TEXT, -- CPF ou CNPJ
    
    -- Endereço Completo
    cep VARCHAR(9),
    address TEXT, -- Logradouro / Rua e Número
    neighborhood TEXT, -- Bairro
    complement TEXT, -- Complemento / Bloco / Sala
    city TEXT NOT NULL,
    state VARCHAR(2) NOT NULL DEFAULT 'SP', -- UF (MT, SP, RJ, etc.)
    
    -- Regras Comerciais & Repasse PIX
    commission_monthly NUMERIC(5, 2) NOT NULL DEFAULT 20.00, -- % Recorrente Mensalidade (Padrão: 20%)
    commission_setup NUMERIC(5, 2) NOT NULL DEFAULT 50.00,   -- % Taxa de Setup/Treinamento (Padrão: 50%)
    pix_key_type VARCHAR(20) NOT NULL DEFAULT 'cpf',         -- 'cpf', 'cnpj', 'email', 'phone', 'random'
    pix_key TEXT NOT NULL,
    
    -- Link Único & Status
    referral_code TEXT NOT NULL UNIQUE,                     -- Slug do link (?ref=slug)
    status VARCHAR(20) NOT NULL DEFAULT 'active',            -- 'active', 'inactive'
    training_status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'scheduled', 'completed'
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_state ON affiliates(state);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_training_status ON affiliates(training_status);

-- ==============================================================================
-- 2. VINCULAÇÃO DE AFILIADOS E GESTÃO DE PLANOS NA TABELA COMPANIES
-- ==============================================================================
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS affiliate_id TEXT REFERENCES affiliates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS affiliate_code TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter', -- 'starter', 'pro', 'enterprise'
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',  -- 'trial', 'active', 'expired', 'canceled'
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paid_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS hotmart_subscriber_code TEXT,
ADD COLUMN IF NOT EXISTS training_completed BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_companies_affiliate_id ON companies(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_companies_affiliate_code ON companies(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_status ON companies(subscription_status);

-- ==============================================================================
-- 3. TABELA DE CONFIGURAÇÕES DA HOTMART E PLANOS DE PREÇOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS hotmart_config (
    id TEXT PRIMARY KEY DEFAULT 'global_hotmart_config',
    hottok TEXT,
    checkout_url TEXT,
    product_id TEXT,
    trial_days INT DEFAULT 1,
    webhook_url TEXT,
    plans JSONB DEFAULT '[
        {
            "id": "starter",
            "name": "Plano Starter / Ativação",
            "price": 197,
            "period": "mensal",
            "checkoutUrl": "",
            "description": "Ideal para empresas validando o fluxo de aquisição e atendimento.",
            "features": ["Até 3 Usuários", "1 Conexão WhatsApp", "5.000 Disparos/mês", "Meta CAPI Básico"],
            "active": true
        },
        {
            "id": "pro",
            "name": "Plano Pro / Crescimento",
            "price": 397,
            "period": "mensal",
            "checkoutUrl": "",
            "description": "Aceleração completa com automações ilimitadas e funil 360°.",
            "features": ["Até 10 Usuários", "3 Conexões WhatsApp", "25.000 Disparos/mês", "Funil Visual 360°", "Automações Ilimitadas"],
            "highlight": true,
            "active": true
        },
        {
            "id": "enterprise",
            "name": "Plano Enterprise / Escala VIP",
            "price": 697,
            "period": "mensal",
            "checkoutUrl": "",
            "description": "Máxima potência, multi-instância e disparos em massa.",
            "features": ["Usuários Ilimitados", "Múltiplas Conexões WhatsApp", "Disparo SMS Gateway", "Meta Ads CAPI Alta Freq.", "Gerente de Sucesso"],
            "active": true
        }
    ]'::jsonb,
    setup_training JSONB DEFAULT '{
        "enabled": true,
        "title": "Taxa de Implantação, Configuração Técnica e Treinamento VIP",
        "price": 997,
        "description": "Serviço completo onde configuramos DNS, Meta CAPI, WhatsApp e treinamos a equipe ao vivo.",
        "checkoutUrl": "",
        "features": [
            "Configuração de DNS, domínios e SSL",
            "Validação técnica do Meta CAPI",
            "Conexão de instâncias WhatsApp",
            "Treinamento prático ao vivo de 2h com a equipe",
            "Acompanhamento assistido nas primeiras campanhas"
        ]
    }'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. LOG DE EVENTOS E WEBHOOKS DA HOTMART
-- ==============================================================================
CREATE TABLE IF NOT EXISTS hotmart_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,          -- 'PURCHASE_APPROVED', 'SUBSCRIPTION_CANCELED', etc.
    hottok TEXT,
    buyer_name TEXT,
    buyer_email TEXT,
    company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
    plan_id TEXT,
    amount NUMERIC(10, 2),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotmart_events_buyer_email ON hotmart_events(buyer_email);
CREATE INDEX IF NOT EXISTS idx_hotmart_events_company_id ON hotmart_events(company_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_events_event_type ON hotmart_events(event_type);

-- ==============================================================================
-- 5. SUPORTE A DISPARO DE SMS NAS CONFIGURAÇÕES DE INTEGRAÇÃO
-- ==============================================================================
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_provider TEXT DEFAULT 'zenvia',
ADD COLUMN IF NOT EXISTS sms_api_key TEXT;

-- ==============================================================================
-- 6. SEED INICIAL: REPRESENTANTE MATO GROSSO (Rogério Belmiro)
-- ==============================================================================
INSERT INTO affiliates (
    id, name, email, phone, document, cep, address, neighborhood, city, state,
    commission_monthly, commission_setup, pix_key_type, pix_key, referral_code,
    status, training_status, notes
) VALUES (
    'aff-rogerio-mt',
    'Rogério Belmiro',
    'rogerio@mudadigital.com.br',
    '5565981150758',
    '000.000.000-00',
    '78000-000',
    'Av. Historiador Rubens de Mendonça',
    'Bosque da Saúde',
    'Cuiabá',
    'MT',
    20.00,
    50.00,
    'phone',
    '5565981150758',
    'rogerio-mt',
    'active',
    'completed',
    'Representante Master e Coordenador Técnico Nacional'
) ON CONFLICT (referral_code) DO NOTHING;
