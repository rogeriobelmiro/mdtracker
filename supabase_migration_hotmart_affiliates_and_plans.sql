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
-- 6. SEED INICIAL: AFILIADOS E REPRESENTANTES MODELO PELO BRASIL
-- ==============================================================================
INSERT INTO affiliates (
    id, name, email, phone, document, cep, address, neighborhood, complement, city, state,
    commission_monthly, commission_setup, pix_key_type, pix_key, referral_code,
    status, training_status, notes
) VALUES 
(
    'aff-mt-01',
    'Rogério Belmiro',
    'rogerio@crysrios.com.br',
    '5565981150758',
    '53.483.257/0001-08',
    '78000-000',
    'Av. Historiador Rubens de Mendonça, 1500',
    'Bosque da Saúde',
    'Ed. Top Tower, Sala 801',
    'Cuiabá',
    'MT',
    25.00,
    50.00,
    'phone',
    '5565981150758',
    'rogerio-mt',
    'active',
    'completed',
    'Representante Master e Coordenador Técnico Nacional - Centro-Oeste / MT'
),
(
    'aff-sp-01',
    'Carlos Mendes',
    'carlos.mendes@rep-trackermd.com.br',
    '5511998765432',
    '123.456.789-00',
    '01310-100',
    'Av. Paulista, 1842',
    'Bela Vista',
    'Torre Norte, 14º Andar',
    'São Paulo',
    'SP',
    20.00,
    50.00,
    'email',
    'carlos.mendes@rep-trackermd.com.br',
    'carlos-sp',
    'active',
    'completed',
    'Representante Especialista em Automações e CAPI - Grande SP'
),
(
    'aff-rj-01',
    'Mariana Rios',
    'mariana.rio@rep-trackermd.com.br',
    '5521987654321',
    '987.654.321-11',
    '22041-001',
    'Av. Atlântica, 2500',
    'Copacabana',
    'Sala 402',
    'Rio de Janeiro',
    'RJ',
    20.00,
    50.00,
    'cpf',
    '987.654.321-11',
    'mariana-rj',
    'active',
    'completed',
    'Especialista em Gestão de Tráfego e Rastreamento RJ'
),
(
    'aff-mg-01',
    'Felipe Andrade',
    'felipe.mg@rep-trackermd.com.br',
    '5531988887777',
    '321.654.987-22',
    '30130-100',
    'Av. Afonso Pena, 3000',
    'Funcionários',
    'Conjunto 508',
    'Belo Horizonte',
    'MG',
    20.00,
    50.00,
    'email',
    'felipe.mg@rep-trackermd.com.br',
    'felipe-mg',
    'active',
    'completed',
    'Consultor de Implantação e CRM Minas Gerais'
),
(
    'aff-pr-01',
    'Lucas Scherer',
    'lucas.pr@rep-trackermd.com.br',
    '5541999998888',
    '456.789.123-33',
    '80420-000',
    'Rua Comendador Araújo, 499',
    'Batel',
    'Sala 1102',
    'Curitiba',
    'PR',
    20.00,
    50.00,
    'cpf',
    '456.789.123-33',
    'lucas-pr',
    'active',
    'completed',
    'Representante Região Sul e Paraná'
),
(
    'aff-ba-01',
    'Aline Santos',
    'aline.ba@rep-trackermd.com.br',
    '5571991234567',
    '654.321.987-44',
    '41810-011',
    'Av. Tancredo Neves, 1200',
    'Caminho das Árvores',
    'Empresarial Salvador, Sala 601',
    'Salvador',
    'BA',
    20.00,
    50.00,
    'phone',
    '5571991234567',
    'aline-ba',
    'active',
    'completed',
    'Representante Nordeste / Bahia'
),
(
    'aff-df-01',
    'Eduardo Vasconcelos',
    'eduardo.df@rep-trackermd.com.br',
    '5561998877665',
    '789.123.456-55',
    '70070-120',
    'SCN Quadra 2, Bloco D',
    'Asa Norte',
    'Torre B, Sala 304',
    'Brasília',
    'DF',
    20.00,
    50.00,
    'email',
    'eduardo.df@rep-trackermd.com.br',
    'eduardo-df',
    'active',
    'completed',
    'Representante Distrito Federal e Entorno'
),
(
    'aff-rs-01',
    'Juliana Freitas',
    'juliana.rs@rep-trackermd.com.br',
    '5551981122334',
    '852.963.741-66',
    '90010-150',
    'Av. Carlos Gomes, 1111',
    'Auxiliadora',
    'Conjunto 905',
    'Porto Alegre',
    'RS',
    20.00,
    50.00,
    'email',
    'juliana.rs@rep-trackermd.com.br',
    'juliana-rs',
    'active',
    'completed',
    'Representante Rio Grande do Sul e Serra Gaúcha'
),
(
    'aff-pe-01',
    'Thiago Albuquerque',
    'thiago.pe@rep-trackermd.com.br',
    '5581987766554',
    '951.753.357-77',
    '51020-020',
    'Av. Boa Viagem, 3500',
    'Boa Viagem',
    'Edf. Empresarial, Sala 702',
    'Recife',
    'PE',
    20.00,
    50.00,
    'cpf',
    '951.753.357-77',
    'thiago-pe',
    'active',
    'completed',
    'Representante Pernambuco e Região Metropolitana'
),
(
    'aff-go-01',
    'Renata Lima',
    'renata.go@rep-trackermd.com.br',
    '5562994433221',
    '753.159.852-88',
    '74110-010',
    'Av. 85, 1400',
    'Setor Marista',
    'Bloco A, Sala 401',
    'Goiânia',
    'GO',
    20.00,
    50.00,
    'email',
    'renata.go@rep-trackermd.com.br',
    'renata-go',
    'active',
    'completed',
    'Representante Goiás e Centro-Oeste'
),
(
    'aff-am-01',
    'Gabriel Barbosa',
    'gabriel.am@rep-trackermd.com.br',
    '5592981239876',
    '357.951.456-99',
    '69057-002',
    'Av. Djalma Batista, 1661',
    'Chapada',
    'Millennium Center, Torre Business',
    'Manaus',
    'AM',
    20.00,
    50.00,
    'phone',
    '5592981239876',
    'gabriel-am',
    'active',
    'completed',
    'Representante Região Norte e Amazonas'
),
(
    'aff-ce-01',
    'Camila Nogueira',
    'camila.ce@rep-trackermd.com.br',
    '5585996655443',
    '159.357.258-01',
    '60165-121',
    'Av. Beira Mar, 4000',
    'Meireles',
    'Torre Atlântico, Sala 1205',
    'Fortaleza',
    'CE',
    20.00,
    50.00,
    'email',
    'camila.ce@rep-trackermd.com.br',
    'camila-ce',
    'active',
    'completed',
    'Representante Ceará e Litoral Leste'
)
ON CONFLICT (referral_code) DO NOTHING;

