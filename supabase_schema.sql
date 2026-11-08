-- Script de inicialização do banco de dados Supabase

-- Tabela: companies
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT,
  plan TEXT DEFAULT 'starter',
  active BOOLEAN DEFAULT TRUE,
  logo_url TEXT,
  responsible_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'attendant',
  avatar_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserindo Empresas de Exemplo
INSERT INTO companies (id, name, cnpj, plan, active, created_at) VALUES
('comp-alfa', 'Empresa Alfa Marketing', '12.345.678/0001-90', 'pro', TRUE, '2026-01-15T00:00:00.000Z'),
('comp-beta', 'TechSolutions Beta Consultoria', '98.765.432/0001-10', 'enterprise', TRUE, '2026-03-20T00:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Inserindo Usuários de Exemplo
INSERT INTO users (id, company_id, name, email, password, role, active, created_at) VALUES
('usr-1', 'comp-alfa', 'Ana Cláudia (Administrador)', 'admin@alfa.com', '123', 'admin', TRUE, '2026-01-15T10:00:00.000Z'),
('usr-2', 'comp-alfa', 'Rodrigo Gerente (Gerente de Vendas)', 'gerente@alfa.com', '123', 'manager', TRUE, '2026-02-01T10:00:00.000Z'),
('usr-3', 'comp-alfa', 'Lucas Atendente (Atendimento Comercial)', 'atendente@alfa.com', '123', 'attendant', TRUE, '2026-02-10T10:00:00.000Z'),
('usr-4', 'comp-beta', 'Juliana Torres (Admin Beta)', 'admin@beta.com', '123', 'admin', TRUE, '2026-03-20T10:00:00.000Z'),
('usr-5', 'comp-beta', 'Marcos Vendedor (Atendente Beta)', 'atendente@beta.com', '123', 'attendant', TRUE, '2026-04-05T10:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Tabela: campaign_links
CREATE TABLE IF NOT EXISTS campaign_links (
  id TEXT PRIMARY KEY,
  company_id TEXT,
  title TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  custom_tags JSONB,
  capture_lead_form BOOLEAN DEFAULT FALSE,
  meta_pixel_id TEXT,
  meta_event_name TEXT,
  google_ads_conversion_id TEXT,
  google_ads_label TEXT,
  webhook_url TEXT,
  clicks_count INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: leads
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  company_id TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  location JSONB,
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  link_id TEXT REFERENCES campaign_links(id) ON DELETE SET NULL,
  link_title TEXT,
  stage TEXT DEFAULT 'Novo Lead',
  value NUMERIC DEFAULT 0,
  device TEXT,
  browser TEXT,
  notes TEXT,
  conversion_events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: webhook_logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id TEXT PRIMARY KEY,
  company_id TEXT,
  url TEXT NOT NULL,
  event TEXT,
  status INTEGER,
  payload JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  lead_name TEXT
);

-- Tabela: settings
CREATE TABLE IF NOT EXISTS settings (
  company_id TEXT PRIMARY KEY DEFAULT 'comp-alfa',
  global_meta_pixel_id TEXT,
  global_meta_token TEXT,
  global_google_ads_id TEXT,
  global_google_ads_label TEXT,
  global_webhook_url TEXT,
  evolution_instance TEXT,
  evolution_api_url TEXT,
  evolution_api_key TEXT,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 465,
  smtp_user TEXT,
  smtp_pass TEXT,
  smtp_from_name TEXT,
  smtp_from_email TEXT,
  smtp_secure BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  sms_provider TEXT DEFAULT 'z_api',
  sms_api_key TEXT,
  sms_api_url TEXT,
  sms_sender_id TEXT,
  chatbot_config JSONB,
  hotmart_hottok TEXT,
  hotmart_checkout_url TEXT,
  hotmart_product_id TEXT,
  trial_days INTEGER DEFAULT 1,
  superadmin_email TEXT DEFAULT 'rogerio@mudadigital.com.br',
  auto_fire_meta_on_lead BOOLEAN DEFAULT FALSE,
  auto_fire_meta_on_conversion BOOLEAN DEFAULT FALSE,
  auto_fire_google_on_conversion BOOLEAN DEFAULT FALSE,
  auto_fire_webhook_on_lead BOOLEAN DEFAULT FALSE,
  auto_fire_webhook_on_stage_change BOOLEAN DEFAULT FALSE,
  stage_event_mappings JSONB,
  auto_stage_keywords JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS settings ADD COLUMN IF NOT EXISTS smtp_host TEXT;
ALTER TABLE IF EXISTS settings ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 465;
ALTER TABLE IF EXISTS settings ADD COLUMN IF NOT EXISTS smtp_user TEXT;
ALTER TABLE IF EXISTS settings ADD COLUMN IF NOT EXISTS smtp_pass TEXT;
ALTER TABLE IF EXISTS settings ADD COLUMN IF NOT EXISTS smtp_from_name TEXT;
ALTER TABLE IF EXISTS settings ADD COLUMN IF NOT EXISTS smtp_from_email TEXT;
ALTER TABLE IF EXISTS settings ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS settings ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS settings ADD COLUMN IF NOT EXISTS sms_provider TEXT DEFAULT 'z_api';
ALTER TABLE IF EXISTS settings ADD COLUMN IF NOT EXISTS sms_api_key TEXT;
ALTER TABLE IF EXISTS settings ADD COLUMN IF NOT EXISTS sms_api_url TEXT;
ALTER TABLE IF EXISTS settings ADD COLUMN IF NOT EXISTS sms_sender_id TEXT;

-- Inserindo Configurações de Exemplo (Settings)
INSERT INTO settings (
  company_id, global_meta_pixel_id, global_meta_token, global_google_ads_id, 
  global_google_ads_label, global_webhook_url, evolution_instance, evolution_api_url, evolution_api_key, auto_fire_meta_on_lead, 
  auto_fire_meta_on_conversion, auto_fire_google_on_conversion, 
  auto_fire_webhook_on_lead, auto_fire_webhook_on_stage_change, 
  stage_event_mappings, auto_stage_keywords
) VALUES (
  'comp-alfa', '1234567890987654', 'EAAG1234567890abcdef...', 'AW-987654321', 
  'ABc123xYz987', 'https://webhook.site/demo-rastreamento-whatsapp', 
  'MudaDigital', 'https://evolution.mudadigital.net', 'sk_8f80f8a4ff97c60a4f9c478b4329597faa57abbbd7f1c3b2',
  TRUE, TRUE, TRUE, TRUE, TRUE, 
  '{"Novo Lead":{"stage":"Novo Lead","metaEvent":"Lead","googleLabel":"lead_conversion","enabled":true},"Contatado":{"stage":"Contatado","metaEvent":"Contact","googleLabel":"contact_conversion","enabled":true},"Em Negociação":{"stage":"Em Negociação","metaEvent":"InitiateCheckout","googleLabel":"checkout_conversion","enabled":true},"Convertido":{"stage":"Convertido","metaEvent":"Purchase","googleLabel":"purchase_conversion","enabled":true},"Perdido":{"stage":"Perdido","metaEvent":"LeadLost","googleLabel":"loss_conversion","enabled":false}}',
  '[{"stage":"Contatado","keywords":["oi","olá","boa tarde","bom dia","atendimento","dúvida"],"enabled":true},{"stage":"Em Negociação","keywords":["preço","valor","orçamento","proposta","reunião","agendar","desconto","quanto custa"],"enabled":true},{"stage":"Convertido","keywords":["pix","comprar","pagar","comprovante","fechado","paguei","transferência","cartão"],"enabled":true},{"stage":"Perdido","keywords":["não quero","cancelar","muito caro","sem interesse","desistir","não tenho interesse"],"enabled":true}]'
) ON CONFLICT (company_id) DO UPDATE SET 
  global_meta_pixel_id = EXCLUDED.global_meta_pixel_id,
  global_meta_token = EXCLUDED.global_meta_token,
  global_google_ads_id = EXCLUDED.global_google_ads_id,
  global_google_ads_label = EXCLUDED.global_google_ads_label,
  global_webhook_url = EXCLUDED.global_webhook_url,
  evolution_instance = EXCLUDED.evolution_instance,
  evolution_api_url = EXCLUDED.evolution_api_url,
  evolution_api_key = EXCLUDED.evolution_api_key,
  auto_fire_meta_on_lead = EXCLUDED.auto_fire_meta_on_lead,
  auto_fire_meta_on_conversion = EXCLUDED.auto_fire_meta_on_conversion,
  auto_fire_google_on_conversion = EXCLUDED.auto_fire_google_on_conversion,
  auto_fire_webhook_on_lead = EXCLUDED.auto_fire_webhook_on_lead,
  auto_fire_webhook_on_stage_change = EXCLUDED.auto_fire_webhook_on_stage_change,
  stage_event_mappings = EXCLUDED.stage_event_mappings,
  auto_stage_keywords = EXCLUDED.auto_stage_keywords;

-- Inserindo Links de Exemplo (Campaign Links)
INSERT INTO campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, capture_lead_form, clicks_count, leads_count, conversions_count, created_at, updated_at) VALUES
('link-1', 'comp-alfa', 'Campanha Meta Ads - Oferta VIP Black Friday', '5511987654321', 'Olá! Vi a oferta no Instagram ({utm_campaign}) e quero garantir meu desconto VIP.', 'vip-blackfriday', 'meta_ads', 'cpc', 'black_friday_2026', 'carrossel_v2', 'desconto_exclusivo', TRUE, 142, 89, 28, '2026-08-01T10:00:00.000Z', '2026-08-10T11:00:00.000Z'),
('link-2', 'comp-alfa', 'Google Ads - Pesquisa Fundo de Funil', '5511987654321', 'Olá, encontrei seu site no Google! Gostaria de um orçamento personalizado para a minha empresa.', 'orcamento-google', 'google_ads', 'search', 'fundo_funil_servicos', 'anuncio_texto_01', 'sistema_rastreamento_whatsapp', FALSE, 98, 61, 19, '2026-08-03T14:30:00.000Z', '2026-08-10T09:15:00.000Z'),
('link-beta-1', 'comp-beta', 'TechSolutions - Consultoria de Software Enterprise', '5521998877665', 'Olá TechSolutions! Quero agendar uma demonstração de software.', 'consultoria-beta', 'linkedin', 'cpc', 'b2b_enterprise_2026', 'video_cases', 'gestao_empresarial', TRUE, 52, 18, 5, '2026-08-02T09:00:00.000Z', '2026-08-10T08:00:00.000Z'),
('link-3', 'comp-alfa', 'Instagram Bio - Tráfego Orgânico', '5511987654321', 'Olá! Cheguei pelo link da Bio do Instagram e quero tirar dúvidas sobre os planos.', 'bio-instagram', 'instagram', 'organico_bio', 'geral_instabio', 'linkinbio', NULL, FALSE, 215, 112, 14, '2026-07-20T08:00:00.000Z', '2026-08-09T18:20:00.000Z'),
('link-4', 'comp-alfa', 'Disparo WhatsApp - Reativação de Base', '5511987654321', 'Oi! Recebi a mensagem de reativação da lista VIP e quero saber mais das novidades!', 'reativacao-vip', 'whatsapp', 'direct_msg', 'reativacao_agosto_2026', 'cupom_20off', NULL, FALSE, 76, 54, 22, '2026-08-05T11:00:00.000Z', '2026-08-10T10:45:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Inserindo Leads de Exemplo
INSERT INTO leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_id, link_title, stage, value, device, browser, notes, conversion_events, created_at, updated_at) VALUES
('lead-101', 'comp-alfa', 'Carlos Eduardo Silva', '5511991234567', 'carlos.silva@empresa.com.br', '{"city":"São Paulo","state":"SP","country":"Brasil","ip":"177.138.45.12"}', 'Meta Ads', 'meta_ads', 'cpc', 'black_friday_2026', 'carrossel_v2', 'desconto_exclusivo', 'link-1', 'Campanha Meta Ads - Oferta VIP Black Friday', 'Convertido', 1490.00, 'Mobile (iPhone 14 Pro)', 'Safari 17.4', 'Cliente comprou o plano anual. Solicitou nota fiscal emitida no CNPJ.', '[{"id":"evt-1","type":"meta_pixel","eventName":"Lead","status":"sucesso","timestamp":"2026-08-10T09:12:05.000Z","details":"Pixel Meta disparado com sucesso no clique do link"},{"id":"evt-2","type":"meta_capi","eventName":"Purchase","status":"sucesso","timestamp":"2026-08-10T11:20:00.000Z","details":"Conversão de R$ 1.490,00 enviada via Conversion API"},{"id":"evt-3","type":"webhook","eventName":"lead_converted","status":"sucesso","timestamp":"2026-08-10T11:20:01.000Z","details":"Webhook enviado para CRM externo (HTTP 200 OK)"}]', '2026-08-10T09:12:00.000Z', '2026-08-10T11:20:00.000Z'),
('lead-102', 'comp-alfa', 'Mariana Fontes', '5521988776655', 'mariana.fontes@gmail.com', '{"city":"Rio de Janeiro","state":"RJ","country":"Brasil","ip":"201.86.112.90"}', 'Google Ads', 'google_ads', 'search', 'fundo_funil_servicos', 'anuncio_texto_01', 'sistema_rastreamento_whatsapp', 'link-2', 'Google Ads - Pesquisa Fundo de Funil', 'Em Negociação', 890.00, 'Desktop (Windows 11)', 'Chrome 127', 'Apresentação enviada por WhatsApp. Aguardando aprovação da diretoria.', '[{"id":"evt-4","type":"google_ads","eventName":"Conversion_Lead","status":"sucesso","timestamp":"2026-08-10T08:45:02.000Z","details":"Google Ads conversion label AW-987654321 disparado"}]', '2026-08-10T08:45:00.000Z', '2026-08-10T10:30:00.000Z'),
('lead-103', 'comp-alfa', 'Rodrigo Alcantara', '5531976543210', 'rodrigo.mkt@agenciaprime.com', '{"city":"Belo Horizonte","state":"MG","country":"Brasil","ip":"189.23.14.77"}', 'Instagram', 'instagram', 'organico_bio', 'geral_instabio', 'linkinbio', NULL, 'link-3', 'Instagram Bio - Tráfego Orgânico', 'Contatado', 490.00, 'Mobile (Samsung Galaxy S24)', 'Chrome Mobile', 'Agência com 15 contas de clientes querendo testar o sistema.', '[{"id":"evt-5","type":"webhook","eventName":"lead_created","status":"sucesso","timestamp":"2026-08-10T07:10:01.000Z","details":"Webhook de novo lead disparado"}]', '2026-08-10T07:10:00.000Z', '2026-08-10T08:00:00.000Z'),
('lead-104', 'comp-alfa', 'Patricia Lima', '5541998811223', 'patricia@consultoria.com.br', '{"city":"Curitiba","state":"PR","country":"Brasil","ip":"177.92.203.11"}', 'Meta Ads', 'meta_ads', 'cpc', 'black_friday_2026', 'carrossel_v2', 'desconto_exclusivo', 'link-1', 'Campanha Meta Ads - Oferta VIP Black Friday', 'Novo Lead', 0, 'Mobile (iPhone 13)', 'Instagram In-App Browser', 'Clicou no link e preencheu nome no formulário de captura.', '[{"id":"evt-6","type":"meta_pixel","eventName":"Lead","status":"sucesso","timestamp":"2026-08-10T10:05:01.000Z","details":"Meta Pixel Lead disparado"}]', '2026-08-10T10:05:00.000Z', '2026-08-10T10:05:00.000Z'),
('lead-105', 'comp-alfa', 'Gabriel Portugal Costa', '351912345678', 'gabriel.costa@tech.pt', '{"city":"Lisboa","state":"Lisboa","country":"Portugal","ip":"193.136.2.100"}', 'WhatsApp', 'whatsapp', 'direct_msg', 'reativacao_agosto_2026', 'cupom_20off', NULL, 'link-4', 'Disparo WhatsApp - Reativação de Base', 'Convertido', 2190.00, 'Desktop (Macintosh)', 'Safari 17.5', 'Cliente internacional comprou licença corporativa via Cartão de Crédito.', '[{"id":"evt-7","type":"meta_capi","eventName":"Purchase","status":"sucesso","timestamp":"2026-08-10T09:00:01.000Z","details":"Purchase CAPI event sent successfully"}]', '2026-08-09T16:20:00.000Z', '2026-08-10T09:00:00.000Z'),
('lead-106', 'comp-alfa', 'Juliana Mendes', '5581987112233', 'juliana.mendes@loja.com.br', '{"city":"Recife","state":"PE","country":"Brasil","ip":"179.108.64.12"}', 'Google Ads', 'google_ads', 'search', 'fundo_funil_servicos', NULL, NULL, 'link-2', 'Google Ads - Pesquisa Fundo de Funil', 'Perdido', 0, 'Mobile (Android)', 'Chrome Mobile', 'Procurava um software grátis e sem suporte.', '[]', '2026-08-08T12:00:00.000Z', '2026-08-09T15:00:00.000Z'),
('lead-beta-201', 'comp-beta', 'Roberto Vianna (TechSolutions Beta Client)', '5521998877665', 'roberto@multinacional.com', '{"city":"Rio de Janeiro","state":"RJ","country":"Brasil","ip":"200.150.10.5"}', 'LinkedIn', 'linkedin', 'cpc', 'b2b_enterprise_2026', 'video_cases', 'gestao_empresarial', 'link-beta-1', 'TechSolutions - Consultoria de Software Enterprise', 'Em Negociação', 12500.00, 'Desktop (Windows 11)', 'Edge 125', 'Reunião de escopo marcada para quinta-feira com CTO.', '[]', '2026-08-10T09:00:00.000Z', '2026-08-10T10:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Inserindo Logs de Webhook de Exemplo
INSERT INTO webhook_logs (id, company_id, url, event, status, payload, timestamp, lead_name) VALUES
('log-1', 'comp-alfa', 'https://webhook.site/demo-rastreamento-whatsapp', 'lead_created', 200, '{"event":"lead_created","lead":{"id":"lead-104","name":"Patricia Lima","source":"meta_ads","campaign":"black_friday_2026"}}', '2026-08-10T10:05:01.000Z', 'Patricia Lima'),
('log-2', 'comp-alfa', 'https://webhook.site/demo-rastreamento-whatsapp', 'lead_stage_updated', 200, '{"event":"lead_stage_updated","lead_id":"lead-101","old_stage":"Em Negociação","new_stage":"Convertido","value":1490.00}', '2026-08-10T11:20:01.000Z', 'Carlos Eduardo Silva')
ON CONFLICT (id) DO NOTHING;

-- Políticas de RLS (Row Level Security) para permitir cadastro
-- Se preferir não usar RLS por enquanto, você pode desativar com:
-- ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir all anonimo em companies" ON companies FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir all anonimo em users" ON users FOR ALL TO anon USING (true) WITH CHECK (true);

-- Políticas RLS adicionais para tabelas de aplicação
CREATE POLICY "Permitir all anonimo em campaign_links" ON campaign_links FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir all anonimo em leads" ON leads FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir all anonimo em webhook_logs" ON webhook_logs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir all anonimo em settings" ON settings FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabela de Histórico de Mensagens do WhatsApp
CREATE TABLE public.whatsapp_messages (
    id TEXT PRIMARY KEY,
    lead_phone TEXT NOT NULL,
    sender TEXT NOT NULL, -- 'lead', 'attendant', 'system'
    text TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'entregue'
);

-- Habilitar RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Acesso total mensagens WhatsApp" ON public.whatsapp_messages FOR ALL USING (true);

-- Tabela: products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price NUMERIC NOT NULL,
  recurrence_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: lead_purchases
CREATE TABLE IF NOT EXISTS lead_purchases (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS para products e lead_purchases (Caso o RLS esteja ativo)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir all anonimo em products" ON products FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir all anonimo em lead_purchases" ON lead_purchases FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabela: popups (Formulários & Pop-ups Inteligentes estilo RD Station)
CREATE TABLE IF NOT EXISTS popups (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  trigger_type TEXT DEFAULT 'exit_intent', -- 'exit_intent', 'scroll', 'timed_delay', 'floating_button'
  trigger_value INTEGER DEFAULT 0,
  show_once_per_user BOOLEAN DEFAULT TRUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge_text TEXT,
  cta_text TEXT DEFAULT 'Quero Aproveitar',
  fields JSONB DEFAULT '[]'::jsonb,
  theme_color TEXT DEFAULT '#2563eb',
  background_color TEXT DEFAULT 'light',
  button_color TEXT DEFAULT '#2563eb',
  button_text_color TEXT DEFAULT '#ffffff',
  border_radius TEXT DEFAULT 'md',
  action_type TEXT DEFAULT 'whatsapp_redirect', -- 'whatsapp_redirect', 'thank_you_message', 'custom_url'
  whatsapp_phone TEXT,
  whatsapp_message TEXT,
  redirect_url TEXT,
  success_message TEXT DEFAULT 'Obrigado! Recebemos suas informações.',
  target_stage TEXT DEFAULT 'Novo Lead',
  tags JSONB DEFAULT '[]'::jsonb,
  link_id TEXT REFERENCES campaign_links(id) ON DELETE SET NULL,
  impressions_count INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE popups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir all anonimo em popups" ON popups FOR ALL TO anon USING (true) WITH CHECK (true);

-- Suporte ao Chatbot com IA (WhatsApp e Direct)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS chatbot_config JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_active BOOLEAN DEFAULT TRUE;

-- Tabela: marketing_workflows (Automação de Marketing & Nutrição estilo RD Station)
CREATE TABLE IF NOT EXISTS marketing_workflows (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  trigger_type TEXT DEFAULT 'lead_created', -- 'lead_created', 'stage_changed', 'product_purchased', 'popup_submitted', 'tag_added'
  trigger_config JSONB DEFAULT '{}'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  enrolled_count INTEGER DEFAULT 0,
  executed_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: workflow_logs (Auditoria de execuções de fluxos de automação)
CREATE TABLE IF NOT EXISTS workflow_logs (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
  workflow_id TEXT REFERENCES marketing_workflows(id) ON DELETE CASCADE,
  workflow_name TEXT NOT NULL,
  lead_id TEXT,
  lead_name TEXT,
  lead_phone TEXT,
  action_type TEXT NOT NULL,
  status TEXT DEFAULT 'success', -- 'success', 'failed', 'scheduled'
  detail TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE marketing_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir all anonimo em marketing_workflows" ON marketing_workflows FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir all anonimo em workflow_logs" ON workflow_logs FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabela: landing_pages (Criador de Landing Pages estilo RD Station com VSL Pitch Delay e Player Blindado)
CREATE TABLE IF NOT EXISTS landing_pages (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'published', -- 'published', 'draft', 'archived'
  category TEXT DEFAULT 'lead_magnet', -- 'lead_magnet', 'product_launch', 'service_consulting', 'event_webinar'
  theme JSONB DEFAULT '{}'::jsonb,
  hero JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  social_proof JSONB DEFAULT '{}'::jsonb,
  countdown JSONB DEFAULT '{}'::jsonb,
  pitch_delay JSONB DEFAULT '{}'::jsonb,
  thank_you_page JSONB DEFAULT '{}'::jsonb,
  custom_domain TEXT,
  blocks JSONB DEFAULT '[]'::jsonb,
  form JSONB DEFAULT '{}'::jsonb,
  faq JSONB DEFAULT '{}'::jsonb,
  footer JSONB DEFAULT '{}'::jsonb,
  published BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS landing_pages ADD COLUMN IF NOT EXISTS pitch_delay JSONB DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS landing_pages ADD COLUMN IF NOT EXISTS thank_you_page JSONB DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS landing_pages ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE IF EXISTS landing_pages ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS landing_pages ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;

ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir all anonimo em landing_pages" ON landing_pages FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabela: broadcast_campaigns (Disparos em massa Multicanal: E-mail, SMS e WhatsApp)
CREATE TABLE IF NOT EXISTS broadcast_campaigns (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT DEFAULT 'email', -- 'email', 'sms', 'whatsapp', 'multichannel'
  channels JSONB DEFAULT '["email"]'::jsonb,
  target_stage TEXT DEFAULT 'Todos',
  target_source TEXT DEFAULT 'Todas',
  target_tag TEXT DEFAULT 'Todas',
  message_template TEXT,
  whatsapp_scheduled_at TIMESTAMPTZ,
  email_subject TEXT,
  email_preheader TEXT,
  email_sender_name TEXT,
  email_sender_email TEXT,
  email_body_html TEXT,
  email_scheduled_at TIMESTAMPTZ,
  sms_text TEXT,
  sms_scheduled_at TIMESTAMPTZ,
  tracking_link_id TEXT,
  cta_url TEXT,
  cta_text TEXT,
  status TEXT DEFAULT 'rascunho', -- 'rascunho', 'agendado', 'em_andamento', 'concluido'
  total_leads INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  provider TEXT DEFAULT 'simulado',
  delay_seconds INTEGER DEFAULT 5,
  scheduled_at TIMESTAMPTZ,
  recipients JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE broadcast_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir all anonimo em broadcast_campaigns" ON broadcast_campaigns FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabela: lead_calls (Telefonia Virtual & VoIP no CRM)
CREATE TABLE IF NOT EXISTS public.lead_calls (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
  lead_name TEXT NOT NULL,
  lead_phone TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  outcome TEXT DEFAULT 'atendeu_positivo', -- 'atendeu_positivo', 'atendeu_objecao', 'retornar_depois', 'nao_atendeu', 'ocupado', 'caixa_postal', 'invalido'
  notes TEXT,
  recording_url TEXT,
  transcript_summary TEXT,
  sentiment TEXT DEFAULT 'neutro', -- 'positivo', 'neutro', 'negativo'
  next_steps TEXT,
  caller_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lead_calls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir all anonimo em lead_calls" ON public.lead_calls;
CREATE POLICY "Permitir all anonimo em lead_calls" ON public.lead_calls FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lead_calls_lead_id ON public.lead_calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_calls_company_id ON public.lead_calls(company_id);

-- ==============================================================================
-- PASSO 5: LISTAS INTELIGENTES & LEAD SCORING COM IA (ESTILO RD STATION)
-- ==============================================================================

-- Colunas de Pontuação na tabela leads
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 20,
  ADD COLUMN IF NOT EXISTS qualification_level TEXT DEFAULT 'Lead',
  ADD COLUMN IF NOT EXISTS fit_grade TEXT DEFAULT 'B',
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '[]'::jsonb;

-- Tabela: smart_lists (Listas Inteligentes de Segmentação estilo RD Station)
CREATE TABLE IF NOT EXISTS public.smart_lists (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#2563eb',
  conditions JSONB DEFAULT '[]'::jsonb,
  match_type TEXT DEFAULT 'all', -- 'all', 'any'
  leads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.smart_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir all anonimo em smart_lists" ON public.smart_lists;
CREATE POLICY "Permitir all anonimo em smart_lists" ON public.smart_lists FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_smart_lists_company_id ON public.smart_lists(company_id);

-- Configurações Globais Adicionais (Settings)
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS lead_scoring_config JSONB;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS chatbot_config JSONB;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS virtual_phone_settings JSONB;

-- ==============================================================================
-- INSTAGRAM AUTO-DM & COMMENT GROWTH TOOL (MANYCHAT STYLE)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.instagram_comment_automations (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'paused'
  post_type TEXT DEFAULT 'any_post', -- 'any_post', 'specific_post'
  post_url TEXT,
  post_id TEXT,
  post_thumbnail TEXT,
  post_caption_snippet TEXT,
  trigger_type TEXT DEFAULT 'keywords', -- 'keywords', 'all_comments'
  keywords JSONB DEFAULT '[]'::jsonb,
  excluded_keywords JSONB DEFAULT '[]'::jsonb,
  auto_like_comment BOOLEAN DEFAULT TRUE,
  public_replies JSONB DEFAULT '[]'::jsonb,
  direct_message TEXT NOT NULL,
  cta_button JSONB,
  create_lead_in_crm BOOLEAN DEFAULT TRUE,
  stats JSONB DEFAULT '{"commentsProcessed":0,"dmsSent":0,"leadsCaptured":0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.instagram_comment_automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir all anonimo em instagram_comment_automations" ON public.instagram_comment_automations;
CREATE POLICY "Permitir all anonimo em instagram_comment_automations" ON public.instagram_comment_automations FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_insta_automations_company_id ON public.instagram_comment_automations(company_id);

CREATE TABLE IF NOT EXISTS public.instagram_comment_logs (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  rule_id TEXT REFERENCES public.instagram_comment_automations(id) ON DELETE SET NULL,
  rule_name TEXT,
  instagram_username TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  post_id TEXT,
  post_snippet TEXT,
  public_reply_given TEXT,
  dm_sent_text TEXT,
  lead_id TEXT REFERENCES public.leads(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'delivered',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.instagram_comment_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir all anonimo em instagram_comment_logs" ON public.instagram_comment_logs;
CREATE POLICY "Permitir all anonimo em instagram_comment_logs" ON public.instagram_comment_logs FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_insta_logs_company_id ON public.instagram_comment_logs(company_id);

-- ==============================================================================
-- MIGRAÇÃO: LANÇAMENTOS MULTICANAL, AGENDAMENTO & RASTREAMENTO DE ABERTURAS/CLIQUES
-- ==============================================================================
ALTER TABLE public.broadcast_campaigns
  ADD COLUMN IF NOT EXISTS channels JSONB DEFAULT '["email"]'::jsonb,
  ADD COLUMN IF NOT EXISTS recipients JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cta_url TEXT,
  ADD COLUMN IF NOT EXISTS cta_text TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sms_scheduled_at TIMESTAMPTZ;

-- Histórico de conversão e cliques nos leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS conversion_events JSONB DEFAULT '[]'::jsonb;

-- Follow-Gate & Conexão Instagram Oficial
ALTER TABLE public.instagram_comment_automations
  ADD COLUMN IF NOT EXISTS follow_gate_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS follow_gate_config JSONB,
  ADD COLUMN IF NOT EXISTS related_post_promotion JSONB;

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS instagram_config JSONB;

ALTER TABLE public.instagram_comment_logs
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- ==============================================================================
-- TRACKERMD - AFILIADOS, REPRESENTANTES BRASIL, HOTMART & ASSINATURAS
-- ==============================================================================

-- 1. TABELA DE AFILIADOS E REPRESENTANTES REGIONAIS
CREATE TABLE IF NOT EXISTS public.affiliates (
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
    target_sales_monthly INTEGER DEFAULT 10,                 -- Meta mensal de novas vendas/clientes
    target_trainings_monthly INTEGER DEFAULT 3,              -- Meta mensal de treinamentos VIP realizados
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON public.affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_state ON public.affiliates(state);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON public.affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_training_status ON public.affiliates(training_status);

-- RLS para affiliates
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura publica de afiliados ativos" ON public.affiliates;
CREATE POLICY "Permitir leitura publica de afiliados ativos" ON public.affiliates
    FOR SELECT TO anon, authenticated USING (status = 'active');

DROP POLICY IF EXISTS "Permitir criacao publica de afiliados" ON public.affiliates;
CREATE POLICY "Permitir criacao publica de afiliados" ON public.affiliates
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir controle total para administradores em affiliates" ON public.affiliates;
CREATE POLICY "Permitir controle total para administradores em affiliates" ON public.affiliates
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. VINCULAÇÃO DE AFILIADOS E GESTÃO DE PLANOS NA TABELA COMPANIES
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS affiliate_id TEXT REFERENCES public.affiliates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS affiliate_code TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paid_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS hotmart_subscriber_code TEXT,
ADD COLUMN IF NOT EXISTS training_completed BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_companies_affiliate_id ON public.companies(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_companies_affiliate_code ON public.companies(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_status ON public.companies(subscription_status);

-- 3. TABELA DE CONFIGURAÇÕES DA HOTMART E PLANOS DE PREÇOS
CREATE TABLE IF NOT EXISTS public.hotmart_config (
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
            "features": ["Até 2 Usuários Colaboradores", "1 Conexão WhatsApp", "5.000 Disparos/mês", "Meta CAPI Básico"],
            "active": true
        },
        {
            "id": "pro",
            "name": "Plano Pro / Crescimento",
            "price": 397,
            "period": "mensal",
            "checkoutUrl": "",
            "description": "Aceleração completa com automações ilimitadas e funil 360°.",
            "features": ["Até 5 Usuários Colaboradores", "3 Conexões WhatsApp", "25.000 Disparos/mês", "Funil Visual 360°", "Automações Ilimitadas"],
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
            "features": ["Até 10 Usuários Colaboradores", "Múltiplas Conexões WhatsApp", "Disparo SMS Gateway", "Meta Ads CAPI Alta Freq.", "Gerente de Sucesso"],
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
    affiliate_plan JSONB DEFAULT '{
        "enabled": true,
        "title": "Credenciamento & Formação de Representante Oficial",
        "price": 497,
        "period": "anual",
        "description": "Taxa de habilitação oficial de representante, acesso à plataforma para demonstrações, material de vendas e capacitação técnica.",
        "checkoutUrl": "https://pay.hotmart.com/CREDENCIAMENTO_AFILIADO",
        "features": [
            "50% de comissão imediata sobre taxas de treinamento e implantação",
            "20% de comissão recorrente mensal em todas as assinaturas ativas",
            "Acesso ao painel TrackerMD para demonstrações a clientes",
            "Kit oficial de vendas, scripts de abordagem e criativos",
            "Treinamento ao vivo com coordenação técnica",
            "Certificação oficial de representante regional"
        ]
    }'::jsonb,
    affiliate_goals JSONB DEFAULT '{
        "enabled": true,
        "defaultSalesTargetMonthly": 10,
        "defaultTrainingsTargetMonthly": 3,
        "bonusRewardAmount": 1000,
        "salesCommissionBonusPct": 5,
        "bonusRewardDescription": "Bônus especial pago via PIX para o representante que atingir ou superar as duas metas no mês vigente."
    }'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para hotmart_config
ALTER TABLE public.hotmart_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura publica de planos Hotmart" ON public.hotmart_config;
CREATE POLICY "Permitir leitura publica de planos Hotmart" ON public.hotmart_config
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permitir admin editar configuracoes da Hotmart" ON public.hotmart_config;
CREATE POLICY "Permitir admin editar configuracoes da Hotmart" ON public.hotmart_config
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Registro padrão
INSERT INTO public.hotmart_config (id, hottok, checkout_url, trial_days, webhook_url)
VALUES ('global_hotmart_config', '', 'https://pay.hotmart.com', 1, 'https://trackermd.mudadigital.com.br/api/webhooks/hotmart')
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 4. LOG DE EVENTOS E WEBHOOKS DA HOTMART
CREATE TABLE IF NOT EXISTS public.hotmart_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    hottok TEXT,
    buyer_name TEXT,
    buyer_email TEXT,
    company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
    plan_id TEXT,
    amount NUMERIC(10, 2),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotmart_events_buyer_email ON public.hotmart_events(buyer_email);
CREATE INDEX IF NOT EXISTS idx_hotmart_events_company_id ON public.hotmart_events(company_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_events_event_type ON public.hotmart_events(event_type);

ALTER TABLE public.hotmart_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir admin gerenciar eventos hotmart" ON public.hotmart_events;
CREATE POLICY "Permitir admin gerenciar eventos hotmart" ON public.hotmart_events
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. SUPORTE A DISPARO DE SMS NAS CONFIGURAÇÕES DE INTEGRAÇÃO
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_provider TEXT DEFAULT 'zenvia',
ADD COLUMN IF NOT EXISTS sms_api_key TEXT;

-- ==============================================================================
-- 6. NOVIDADES & ROADMAP (Alimentada pelo Super-Admin)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_releases (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    version VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'planned',
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

-- ==============================================================================
-- 7. SUPORTE TÉCNICO, SUGESTÕES E CORREÇÕES DO AFILIADO
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    affiliate_id TEXT,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_phone TEXT,
    type VARCHAR(30) NOT NULL DEFAULT 'support',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_affiliate_id ON public.support_tickets(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_author_email ON public.support_tickets(author_email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- ==============================================================================
-- 8. LOGS DE ATIVIDADE DO SISTEMA & AUDITORIA (CLIENTE + REPRESENTANTE)
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

-- ==============================================================================
-- 9. VÍDEOS DE TREINAMENTO & CAPACITAÇÃO DE AFILIADOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.training_videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    duration VARCHAR(50) DEFAULT '10:00 min',
    module VARCHAR(100) NOT NULL DEFAULT 'Módulo 1: Apresentação & Vendas',
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    download_url TEXT,
    active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_videos_module ON public.training_videos(module);
CREATE INDEX IF NOT EXISTS idx_training_videos_active ON public.training_videos(active);
CREATE INDEX IF NOT EXISTS idx_training_videos_order ON public.training_videos(order_index ASC);

