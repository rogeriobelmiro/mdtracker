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

-- Inserindo Configurações de Exemplo (Settings)
INSERT INTO settings (
  company_id, global_meta_pixel_id, global_meta_token, global_google_ads_id, 
  global_google_ads_label, global_webhook_url, auto_fire_meta_on_lead, 
  auto_fire_meta_on_conversion, auto_fire_google_on_conversion, 
  auto_fire_webhook_on_lead, auto_fire_webhook_on_stage_change, 
  stage_event_mappings, auto_stage_keywords
) VALUES (
  'comp-alfa', '1234567890987654', 'EAAG1234567890abcdef...', 'AW-987654321', 
  'ABc123xYz987', 'https://webhook.site/demo-rastreamento-whatsapp', TRUE, TRUE, TRUE, TRUE, TRUE, 
  '{"Novo Lead":{"stage":"Novo Lead","metaEvent":"Lead","googleLabel":"lead_conversion","enabled":true},"Contatado":{"stage":"Contatado","metaEvent":"Contact","googleLabel":"contact_conversion","enabled":true},"Em Negociação":{"stage":"Em Negociação","metaEvent":"InitiateCheckout","googleLabel":"checkout_conversion","enabled":true},"Convertido":{"stage":"Convertido","metaEvent":"Purchase","googleLabel":"purchase_conversion","enabled":true},"Perdido":{"stage":"Perdido","metaEvent":"LeadLost","googleLabel":"loss_conversion","enabled":false}}',
  '[{"stage":"Contatado","keywords":["oi","olá","boa tarde","bom dia","atendimento","dúvida"],"enabled":true},{"stage":"Em Negociação","keywords":["preço","valor","orçamento","proposta","reunião","agendar","desconto","quanto custa"],"enabled":true},{"stage":"Convertido","keywords":["pix","comprar","pagar","comprovante","fechado","paguei","transferência","cartão"],"enabled":true},{"stage":"Perdido","keywords":["não quero","cancelar","muito caro","sem interesse","desistir","não tenho interesse"],"enabled":true}]'
) ON CONFLICT (company_id) DO UPDATE SET 
  global_meta_pixel_id = EXCLUDED.global_meta_pixel_id,
  global_meta_token = EXCLUDED.global_meta_token,
  global_google_ads_id = EXCLUDED.global_google_ads_id,
  global_google_ads_label = EXCLUDED.global_google_ads_label,
  global_webhook_url = EXCLUDED.global_webhook_url,
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
