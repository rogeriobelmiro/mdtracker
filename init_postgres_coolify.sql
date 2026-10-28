-- ==============================================================================
-- MDTRACKER: SCRIPT COMPLETO DE INICIALIZAÇÃO - POSTGRESQL (COOLIFY / HOSTINGER)
-- Todas as tabelas, índices multi-tenant (company_id) e campos JSONB
-- ==============================================================================

-- 1. EMPRESAS (MULTI-TENANT)
CREATE TABLE IF NOT EXISTS public.companies (
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

-- 2. USUÁRIOS
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'attendant',
  avatar_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);

-- 3. LINKS DE CAMPANHA & WHATSAPP
CREATE TABLE IF NOT EXISTS public.campaign_links (
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
  custom_tags JSONB DEFAULT '[]'::jsonb,
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

CREATE INDEX IF NOT EXISTS idx_campaign_links_company_id ON public.campaign_links(company_id);
CREATE INDEX IF NOT EXISTS idx_campaign_links_slug ON public.campaign_links(slug);

-- 4. LEADS DO CRM
CREATE TABLE IF NOT EXISTS public.leads (
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
  link_id TEXT REFERENCES public.campaign_links(id) ON DELETE SET NULL,
  link_title TEXT,
  stage TEXT DEFAULT 'Novo Lead',
  value NUMERIC DEFAULT 0,
  device TEXT,
  browser TEXT,
  notes TEXT,
  score INTEGER DEFAULT 50,
  bot_active BOOLEAN DEFAULT TRUE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  active_flow_id TEXT,
  flow_step_node_id TEXT,
  proactive_scheduled_at TIMESTAMPTZ,
  conversion_events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);

-- 5. PRODUTOS & CATÁLOGO
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);

-- 6. VENDAS E COMPRAS DE LEADS
CREATE TABLE IF NOT EXISTS public.lead_purchases (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  product_id TEXT,
  company_id TEXT NOT NULL,
  value NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'completed',
  payment_method TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_purchases_company_id ON public.lead_purchases(company_id);
CREATE INDEX IF NOT EXISTS idx_lead_purchases_lead_id ON public.lead_purchases(lead_id);

-- 7. CONFIGURAÇÕES DA EMPRESA
CREATE TABLE IF NOT EXISTS public.settings (
  company_id TEXT PRIMARY KEY,
  meta_pixel_id TEXT,
  google_analytics_id TEXT,
  google_tag_manager_id TEXT,
  google_ads_conversion_id TEXT,
  tiktok_pixel_id TEXT,
  webhook_url TEXT,
  api_key TEXT,
  chatbot_config JSONB,
  instagram_config JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LOGS DE WEBHOOK
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id TEXT PRIMARY KEY,
  company_id TEXT,
  payload JSONB,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_company_id ON public.webhook_logs(company_id);

-- 9. AGENTES DE IA AUTÔNOMOS
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role_title TEXT,
  avatar TEXT DEFAULT '🤖',
  description_prompt TEXT,
  goal TEXT NOT NULL,
  persona_and_context TEXT,
  rules JSONB DEFAULT '[]'::jsonb,
  autonomy_mode TEXT DEFAULT 'autonomous',
  triggers JSONB DEFAULT '["whatsapp_message"]'::jsonb,
  enabled_tools JSONB DEFAULT '[]'::jsonb,
  room_id TEXT,
  active BOOLEAN DEFAULT true,
  executions_count INTEGER DEFAULT 0,
  goals_achieved_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_agents_company_id ON public.ai_agents(company_id);

-- 10. CENTRAL DE ATIVIDADES DOS AGENTES (HABLLA STYLE)
CREATE TABLE IF NOT EXISTS public.ai_agent_logs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_avatar TEXT DEFAULT '🤖',
  company_id TEXT NOT NULL,
  lead_id TEXT,
  lead_name TEXT,
  lead_phone TEXT,
  lead_stage TEXT,
  lead_score INTEGER DEFAULT 50,
  channel TEXT DEFAULT 'whatsapp',
  trigger_type TEXT DEFAULT 'whatsapp_message',
  board_column TEXT DEFAULT 'qualifying',
  activity_category TEXT DEFAULT 'qualification',
  task_title TEXT,
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  task_completed BOOLEAN DEFAULT false,
  duration_ms INTEGER DEFAULT 1200,
  tags JSONB DEFAULT '[]'::jsonb,
  user_message TEXT,
  agent_reply TEXT,
  steps JSONB DEFAULT '[]'::jsonb,
  actions_taken JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_company_id ON public.ai_agent_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_agent_id ON public.ai_agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_board_column ON public.ai_agent_logs(board_column);

-- 11. SALAS DO ESCRITÓRIO VIRTUAL HABBLAUD
CREATE TABLE IF NOT EXISTS public.ai_agent_rooms (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT,
  color TEXT DEFAULT 'sky',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_rooms_company_id ON public.ai_agent_rooms(company_id);

-- 12. PESQUISAS E FORMULÁRIOS DE QUALIFICAÇÃO (SURVEYS)
CREATE TABLE IF NOT EXISTS public.surveys (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  theme JSONB DEFAULT '{"primaryColor": "#2563eb", "backgroundColor": "white", "fontFamily": "Inter", "buttonStyle": "rounded-xl"}'::jsonb,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  thank_you JSONB DEFAULT '{"title": "🎉 Muito obrigado!", "subtitle": "Dados gravados.", "ctaButtonText": "Concluir"}'::jsonb,
  responses_count INTEGER DEFAULT 0,
  average_nps NUMERIC(4,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_surveys_company_id ON public.surveys(company_id);
CREATE INDEX IF NOT EXISTS idx_surveys_slug ON public.surveys(slug);

-- 13. RESPOSTAS DAS PESQUISAS
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  lead_id TEXT,
  lead_name TEXT,
  lead_phone TEXT,
  lead_email TEXT,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC(4,2),
  completed BOOLEAN DEFAULT TRUE,
  utm_source TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_company_id ON public.survey_responses(company_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);

-- 14. LANDING PAGES
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  blocks JSONB DEFAULT '[]'::jsonb,
  thank_you_page JSONB DEFAULT '{"enabled": true, "title": "🎉 Cadastro Confirmado!", "showCheckmark": true}'::jsonb,
  custom_domain TEXT,
  published BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_pages_company_id ON public.landing_pages(company_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON public.landing_pages(slug);

-- 15. DOMÍNIOS PERSONALIZADOS
CREATE TABLE IF NOT EXISTS public.custom_domains (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending_dns',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_company_id ON public.custom_domains(company_id);

-- 16. GAMIFICAÇÃO & EVENTOS DE CONVERSÃO
CREATE TABLE IF NOT EXISTS public.event_gamification (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  title TEXT NOT NULL,
  points INTEGER DEFAULT 10,
  badge_icon TEXT DEFAULT '🏆',
  reward_condition TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_gamification_company_id ON public.event_gamification(company_id);

-- 17. AUTOMAÇÃO DE INSTAGRAM
CREATE TABLE IF NOT EXISTS public.instagram_comment_automations (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  post_id TEXT,
  keyword TEXT,
  reply_text TEXT,
  direct_message_text TEXT,
  follow_gate_enabled BOOLEAN DEFAULT FALSE,
  follow_gate_config JSONB,
  related_post_promotion JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.instagram_comment_logs (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  automation_id TEXT,
  comment_id TEXT,
  username TEXT,
  text TEXT,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================

-- ==============================================================================
-- CARGA DE DADOS DE TESTE E HISTÓRICO COMPLETO (MULTI-TENANT)
-- Empresas, Usuários, Links, Leads, Agentes IA, Salas e Configurações
-- ==============================================================================

-- 1. EMPRESAS
INSERT INTO public.companies (id, name, cnpj, plan, active, logo_url, responsible_name, phone, address, created_at)
VALUES ('comp-1786498560971', 'Muda Digital Agência de IA', '09503474850', 'starter', TRUE, '', 'Rogério Belmiro', '(65) 99216-7725', 'Rua Campo Grande, 510 - Centro Norte - Cuiabá MT', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, plan = EXCLUDED.plan, phone = EXCLUDED.phone, cnpj = EXCLUDED.cnpj;
INSERT INTO public.companies (id, name, cnpj, plan, active, logo_url, responsible_name, phone, address, created_at)
VALUES ('comp-alfa', 'Empresa Alfa Marketing', '12.345.678/0001-90', 'pro', TRUE, '', NULL, NULL, NULL, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, plan = EXCLUDED.plan, phone = EXCLUDED.phone, cnpj = EXCLUDED.cnpj;
INSERT INTO public.companies (id, name, cnpj, plan, active, logo_url, responsible_name, phone, address, created_at)
VALUES ('comp-beta', 'TechSolutions Beta Consultoria', '98.765.432/0001-10', 'enterprise', TRUE, '', NULL, NULL, NULL, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, plan = EXCLUDED.plan, phone = EXCLUDED.phone, cnpj = EXCLUDED.cnpj;
INSERT INTO public.companies (id, name, cnpj, plan, active, logo_url, responsible_name, phone, address, created_at)
VALUES ('comp-1791985025979', 'Abdalla Quality Service', '04.176.760/0001-05', 'starter', TRUE, '', 'Marcelo Abdalla', '(65) 99692-8565', ' Rua K, 1200, Quadra 06 Lotes 18 a 22, Cuiabá - MT, CEP 78.098-370', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, plan = EXCLUDED.plan, phone = EXCLUDED.phone, cnpj = EXCLUDED.cnpj;
INSERT INTO public.companies (id, name, cnpj, plan, active, logo_url, responsible_name, phone, address, created_at)
VALUES ('comp-1788784548541', 'Fachinetti & Abdalla', '61.239.050/0001-10', 'starter', TRUE, '', NULL, '556599975171', '', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, plan = EXCLUDED.plan, phone = EXCLUDED.phone, cnpj = EXCLUDED.cnpj;
INSERT INTO public.companies (id, name, cnpj, plan, active, logo_url, responsible_name, phone, address, created_at)
VALUES ('comp-fachinettiabdalla', 'Fachinetti Abdalla', '', 'pro', TRUE, '', NULL, NULL, NULL, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, plan = EXCLUDED.plan, phone = EXCLUDED.phone, cnpj = EXCLUDED.cnpj;

-- 2. USUÁRIOS
INSERT INTO public.users (id, company_id, name, email, password, role, active, created_at)
VALUES ('usr-1786498561135', 'comp-1786498560971', 'Rogério Belmiro', 'rogerio@mudadigital.com.br', '$2b$10$c/hvpINpSMOlaEB/8gy7Q.J7.Ou9yP1LvMdmarOpIgr9h6AdG3.eG', 'admin', TRUE, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password, role = EXCLUDED.role;
INSERT INTO public.users (id, company_id, name, email, password, role, active, created_at)
VALUES ('usr-1', 'comp-alfa', 'Ana Cláudia (Administrador)', 'admin@alfa.com', '123', 'admin', TRUE, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password, role = EXCLUDED.role;
INSERT INTO public.users (id, company_id, name, email, password, role, active, created_at)
VALUES ('usr-2', 'comp-alfa', 'Rodrigo Gerente (Gerente de Vendas)', 'gerente@alfa.com', '123', 'manager', TRUE, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password, role = EXCLUDED.role;
INSERT INTO public.users (id, company_id, name, email, password, role, active, created_at)
VALUES ('usr-3', 'comp-alfa', 'Lucas Atendente (Atendimento Comercial)', 'atendente@alfa.com', '123', 'attendant', TRUE, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password, role = EXCLUDED.role;
INSERT INTO public.users (id, company_id, name, email, password, role, active, created_at)
VALUES ('usr-4', 'comp-beta', 'Juliana Torres (Admin Beta)', 'admin@beta.com', '123', 'admin', TRUE, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password, role = EXCLUDED.role;
INSERT INTO public.users (id, company_id, name, email, password, role, active, created_at)
VALUES ('usr-5', 'comp-beta', 'Marcos Vendedor (Atendente Beta)', 'atendente@beta.com', '123', 'attendant', TRUE, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password, role = EXCLUDED.role;
INSERT INTO public.users (id, company_id, name, email, password, role, active, created_at)
VALUES ('usr-1788784655993', 'comp-1788784548541', 'Rogerio', 'rogerio@fachinettiabdalla.com.br', '$2b$10$nlHs18Jr87CGJVSbQQ2D0.4iNUqwvD1OTvRzc/BGR.rlYf.aDasii', 'admin', TRUE, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password, role = EXCLUDED.role;

-- 3. CONFIGURAÇÕES DAS EMPRESAS
INSERT INTO public.settings (company_id, meta_pixel_id, google_ads_conversion_id, webhook_url, updated_at)
VALUES ('comp-1788784548541', '1234567890987654', 'AW-987654321', 'https://webhook.site/demo-rastreamento-whatsapp', NOW())
ON CONFLICT (company_id) DO NOTHING;
INSERT INTO public.settings (company_id, meta_pixel_id, google_ads_conversion_id, webhook_url, updated_at)
VALUES ('comp-1786498560971', '1234567890987654', 'AW-987654321', 'https://webhook.site/demo-rastreamento-whatsapp', NOW())
ON CONFLICT (company_id) DO NOTHING;
INSERT INTO public.settings (company_id, meta_pixel_id, google_ads_conversion_id, webhook_url, updated_at)
VALUES ('comp-fachinettiabdalla', '1234567890987654', 'AW-987654321', 'https://webhook.site/demo-rastreamento-whatsapp', NOW())
ON CONFLICT (company_id) DO NOTHING;
INSERT INTO public.settings (company_id, meta_pixel_id, google_ads_conversion_id, webhook_url, updated_at)
VALUES ('comp-alfa', '1234567890987654', 'AW-987654321', 'https://webhook.site/demo-rastreamento-whatsapp', NOW())
ON CONFLICT (company_id) DO NOTHING;
INSERT INTO public.settings (company_id, meta_pixel_id, google_ads_conversion_id, webhook_url, updated_at)
VALUES ('comp-beta', '1234567890987654', 'AW-987654321', 'https://webhook.site/demo-rastreamento-whatsapp', NOW())
ON CONFLICT (company_id) DO NOTHING;

-- 4. LINKS DE CAMPANHA & WHATSAPP
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-1-1788784548541', 'comp-1788784548541', 'Campanha Meta Ads - Oferta VIP Black Friday', '5511987654321', 'Olá! Vi a oferta no Instagram ({utm_campaign}) e quero garantir meu desconto VIP.', 'vip-blackfriday-1788784548541', 'meta_ads', 'cpc', 'black_friday_2026', 'carrossel_v2', 'desconto_exclusivo', 142, 89, 28, TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-2-1788784548541', 'comp-1788784548541', 'Google Ads - Pesquisa Fundo de Funil', '5511987654321', 'Olá, encontrei seu site no Google! Gostaria de um orçamento personalizado para a minha empresa.', 'orcamento-google-1788784548541', 'google_ads', 'search', 'fundo_funil_servicos', 'anuncio_texto_01', 'sistema_rastreamento_whatsapp', 98, 61, 19, FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-3-1788784548541', 'comp-1788784548541', 'Instagram Bio - Tráfego Orgânico', '5511987654321', 'Olá! Cheguei pelo link da Bio do Instagram e quero tirar dúvidas sobre os planos.', 'bio-instagram-1788784548541', 'instagram', 'organico_bio', 'geral_instabio', 'linkinbio', NULL, 215, 112, 14, FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-4-1788784548541', 'comp-1788784548541', 'Disparo WhatsApp - Reativação de Base', '5511987654321', 'Oi! Recebi a mensagem de reativação da lista VIP e quero saber mais das novidades!', 'reativacao-vip-1788784548541', 'whatsapp', 'direct_msg', 'reativacao_agosto_2026', 'cupom_20off', NULL, 76, 54, 22, FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-1-1786498560971', 'comp-1786498560971', 'Campanha Meta Ads - Oferta VIP Black Friday', '5511987654321', 'Olá! Vi a oferta no Instagram ({utm_campaign}) e quero garantir meu desconto VIP.', 'vip-blackfriday-1786498560971', 'meta_ads', 'cpc', 'black_friday_2026', 'carrossel_v2', 'desconto_exclusivo', 142, 89, 28, TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-2-1786498560971', 'comp-1786498560971', 'Google Ads - Pesquisa Fundo de Funil', '5511987654321', 'Olá, encontrei seu site no Google! Gostaria de um orçamento personalizado para a minha empresa.', 'orcamento-google-1786498560971', 'google_ads', 'search', 'fundo_funil_servicos', 'anuncio_texto_01', 'sistema_rastreamento_whatsapp', 98, 61, 19, FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-3-1786498560971', 'comp-1786498560971', 'Instagram Bio - Tráfego Orgânico', '5511987654321', 'Olá! Cheguei pelo link da Bio do Instagram e quero tirar dúvidas sobre os planos.', 'bio-instagram-1786498560971', 'instagram', 'organico_bio', 'geral_instabio', 'linkinbio', NULL, 215, 112, 14, FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-4-1786498560971', 'comp-1786498560971', 'Disparo WhatsApp - Reativação de Base', '5511987654321', 'Oi! Recebi a mensagem de reativação da lista VIP e quero saber mais das novidades!', 'reativacao-vip-1786498560971', 'whatsapp', 'direct_msg', 'reativacao_agosto_2026', 'cupom_20off', NULL, 76, 54, 22, FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-1', 'comp-alfa', 'Campanha Meta Ads - Oferta VIP Black Friday', '5511987654321', 'Olá! Vi a oferta no Instagram ({utm_campaign}) e quero garantir meu desconto VIP.', 'vip-blackfriday', 'meta_ads', 'cpc', 'black_friday_2026', 'carrossel_v2', 'desconto_exclusivo', 142, 89, 28, TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-2', 'comp-alfa', 'Google Ads - Pesquisa Fundo de Funil', '5511987654321', 'Olá, encontrei seu site no Google! Gostaria de um orçamento personalizado para a minha empresa.', 'orcamento-google', 'google_ads', 'search', 'fundo_funil_servicos', 'anuncio_texto_01', 'sistema_rastreamento_whatsapp', 98, 61, 19, FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-3', 'comp-alfa', 'Instagram Bio - Tráfego Orgânico', '5511987654321', 'Olá! Cheguei pelo link da Bio do Instagram e quero tirar dúvidas sobre os planos.', 'bio-instagram', 'instagram', 'organico_bio', 'geral_instabio', 'linkinbio', NULL, 215, 112, 14, FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-4', 'comp-alfa', 'Disparo WhatsApp - Reativação de Base', '5511987654321', 'Oi! Recebi a mensagem de reativação da lista VIP e quero saber mais das novidades!', 'reativacao-vip', 'whatsapp', 'direct_msg', 'reativacao_agosto_2026', 'cupom_20off', NULL, 76, 54, 22, FALSE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_links (id, company_id, title, phone, message, slug, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicks_count, leads_count, conversions_count, capture_lead_form, created_at)
VALUES ('link-beta-1', 'comp-beta', 'TechSolutions - Consultoria de Software Enterprise', '5521998877665', 'Olá TechSolutions! Quero agendar uma demonstração de software.', 'consultoria-beta', 'linkedin', 'cpc', 'b2b_enterprise_2026', 'video_cases', 'gestao_empresarial', 52, 18, 5, TRUE, NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. LEADS DO CRM
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-101-1788784548541', 'comp-1788784548541', 'Carlos Eduardo Silva', '5511991234567', 'carlos.silva@empresa.com.br', '{"city":"São Paulo","state":"SP","country":"Brasil","ip":"177.138.45.12"}'::jsonb, 'Meta Ads', 'meta_ads', 'cpc', 'black_friday_2026', 'carrossel_v2', 'desconto_exclusivo', 'Campanha Meta Ads - Oferta VIP Black Friday', 'Convertido', 1490, 'Mobile (iPhone 14 Pro)', 'Safari 17.4', 50, '[{"id":"evt-1","type":"meta_pixel","eventName":"Lead","status":"sucesso","timestamp":"2026-08-10T09:12:05.000Z","details":"Pixel Meta disparado com sucesso no clique do link"},{"id":"evt-2","type":"meta_capi","eventName":"Purchase","status":"sucesso","timestamp":"2026-08-10T11:20:00.000Z","details":"Conversão de R$ 1.490,00 enviada via Conversion API"},{"id":"evt-3","type":"webhook","eventName":"lead_converted","status":"sucesso","timestamp":"2026-08-10T11:20:01.000Z","details":"Webhook enviado para CRM externo (HTTP 200 OK)"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-102-1788784548541', 'comp-1788784548541', 'Mariana Fontes', '5521988776655', 'mariana.fontes@gmail.com', '{"city":"Rio de Janeiro","state":"RJ","country":"Brasil","ip":"201.86.112.90"}'::jsonb, 'Google Ads', 'google_ads', 'search', 'fundo_funil_servicos', 'anuncio_texto_01', 'sistema_rastreamento_whatsapp', 'Google Ads - Pesquisa Fundo de Funil', 'Em Negociação', 890, 'Desktop (Windows 11)', 'Chrome 127', 50, '[{"id":"evt-4","type":"google_ads","eventName":"Conversion_Lead","status":"sucesso","timestamp":"2026-08-10T08:45:02.000Z","details":"Google Ads conversion label AW-987654321 disparado"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-103-1788784548541', 'comp-1788784548541', 'Rodrigo Alcantara', '5531976543210', 'rodrigo.mkt@agenciaprime.com', '{"city":"Belo Horizonte","state":"MG","country":"Brasil","ip":"189.23.14.77"}'::jsonb, 'Instagram', 'instagram', 'organico_bio', 'geral_instabio', 'linkinbio', NULL, 'Instagram Bio - Tráfego Orgânico', 'Contatado', 490, 'Mobile (Samsung Galaxy S24)', 'Chrome Mobile', 50, '[{"id":"evt-5","type":"webhook","eventName":"lead_created","status":"sucesso","timestamp":"2026-08-10T07:10:01.000Z","details":"Webhook de novo lead disparado"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-104-1788784548541', 'comp-1788784548541', 'Patricia Lima', '5541998811223', 'patricia@consultoria.com.br', '{"city":"Curitiba","state":"PR","country":"Brasil","ip":"177.92.203.11"}'::jsonb, 'Meta Ads', 'meta_ads', 'cpc', 'black_friday_2026', 'carrossel_v2', 'desconto_exclusivo', 'Campanha Meta Ads - Oferta VIP Black Friday', 'Novo Lead', 0, 'Mobile (iPhone 13)', 'Instagram In-App Browser', 50, '[{"id":"evt-6","type":"meta_pixel","eventName":"Lead","status":"sucesso","timestamp":"2026-08-10T10:05:01.000Z","details":"Meta Pixel Lead disparado"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-105-1788784548541', 'comp-1788784548541', 'Gabriel Portugal Costa', '351912345678', 'gabriel.costa@tech.pt', '{"city":"Lisboa","state":"Lisboa","country":"Portugal","ip":"193.136.2.100"}'::jsonb, 'WhatsApp', 'whatsapp', 'direct_msg', 'reativacao_agosto_2026', 'cupom_20off', NULL, 'Disparo WhatsApp - Reativação de Base', 'Convertido', 2190, 'Desktop (Macintosh)', 'Safari 17.5', 50, '[{"id":"evt-7","type":"meta_capi","eventName":"Purchase","status":"sucesso","timestamp":"2026-08-10T09:00:01.000Z","details":"Purchase CAPI event sent successfully"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-106-1788784548541', 'comp-1788784548541', 'Juliana Mendes', '5581987112233', 'juliana.mendes@loja.com.br', '{"city":"Recife","state":"PE","country":"Brasil","ip":"179.108.64.12"}'::jsonb, 'Google Ads', 'google_ads', 'search', 'fundo_funil_servicos', NULL, NULL, 'Google Ads - Pesquisa Fundo de Funil', 'Perdido', 0, 'Mobile (Android)', 'Chrome Mobile', 50, '[]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-beta-201-1788784548541', 'comp-1788784548541', 'Roberto Vianna (TechSolutions Beta Client)', '5521998877665', 'roberto@multinacional.com', '{"city":"Rio de Janeiro","state":"RJ","country":"Brasil","ip":"200.150.10.5"}'::jsonb, 'LinkedIn', 'linkedin', 'cpc', 'b2b_enterprise_2026', 'video_cases', 'gestao_empresarial', 'TechSolutions - Consultoria de Software Enterprise', 'Em Negociação', 12500, 'Desktop (Windows 11)', 'Edge 125', 50, '[]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-101-1786498560971', 'comp-1786498560971', 'Carlos Eduardo Silva', '5511991234567', 'carlos.silva@empresa.com.br', '{"city":"São Paulo","state":"SP","country":"Brasil","ip":"177.138.45.12"}'::jsonb, 'Meta Ads', 'meta_ads', 'cpc', 'black_friday_2026', 'carrossel_v2', 'desconto_exclusivo', 'Campanha Meta Ads - Oferta VIP Black Friday', 'Convertido', 1490, 'Mobile (iPhone 14 Pro)', 'Safari 17.4', 50, '[{"id":"evt-1","type":"meta_pixel","eventName":"Lead","status":"sucesso","timestamp":"2026-08-10T09:12:05.000Z","details":"Pixel Meta disparado com sucesso no clique do link"},{"id":"evt-2","type":"meta_capi","eventName":"Purchase","status":"sucesso","timestamp":"2026-08-10T11:20:00.000Z","details":"Conversão de R$ 1.490,00 enviada via Conversion API"},{"id":"evt-3","type":"webhook","eventName":"lead_converted","status":"sucesso","timestamp":"2026-08-10T11:20:01.000Z","details":"Webhook enviado para CRM externo (HTTP 200 OK)"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-102-1786498560971', 'comp-1786498560971', 'Mariana Fontes', '5521988776655', 'mariana.fontes@gmail.com', '{"city":"Rio de Janeiro","state":"RJ","country":"Brasil","ip":"201.86.112.90"}'::jsonb, 'Google Ads', 'google_ads', 'search', 'fundo_funil_servicos', 'anuncio_texto_01', 'sistema_rastreamento_whatsapp', 'Google Ads - Pesquisa Fundo de Funil', 'Em Negociação', 890, 'Desktop (Windows 11)', 'Chrome 127', 50, '[{"id":"evt-4","type":"google_ads","eventName":"Conversion_Lead","status":"sucesso","timestamp":"2026-08-10T08:45:02.000Z","details":"Google Ads conversion label AW-987654321 disparado"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-103-1786498560971', 'comp-1786498560971', 'Rodrigo Alcantara', '5531976543210', 'rodrigo.mkt@agenciaprime.com', '{"city":"Belo Horizonte","state":"MG","country":"Brasil","ip":"189.23.14.77"}'::jsonb, 'Instagram', 'instagram', 'organico_bio', 'geral_instabio', 'linkinbio', NULL, 'Instagram Bio - Tráfego Orgânico', 'Contatado', 490, 'Mobile (Samsung Galaxy S24)', 'Chrome Mobile', 50, '[{"id":"evt-5","type":"webhook","eventName":"lead_created","status":"sucesso","timestamp":"2026-08-10T07:10:01.000Z","details":"Webhook de novo lead disparado"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-104-1786498560971', 'comp-1786498560971', 'Patricia Lima', '5541998811223', 'patricia@consultoria.com.br', '{"city":"Curitiba","state":"PR","country":"Brasil","ip":"177.92.203.11"}'::jsonb, 'Meta Ads', 'meta_ads', 'cpc', 'black_friday_2026', 'carrossel_v2', 'desconto_exclusivo', 'Campanha Meta Ads - Oferta VIP Black Friday', 'Novo Lead', 0, 'Mobile (iPhone 13)', 'Instagram In-App Browser', 50, '[{"id":"evt-6","type":"meta_pixel","eventName":"Lead","status":"sucesso","timestamp":"2026-08-10T10:05:01.000Z","details":"Meta Pixel Lead disparado"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-105-1786498560971', 'comp-1786498560971', 'Gabriel Portugal Costa', '351912345678', 'gabriel.costa@tech.pt', '{"city":"Lisboa","state":"Lisboa","country":"Portugal","ip":"193.136.2.100"}'::jsonb, 'WhatsApp', 'whatsapp', 'direct_msg', 'reativacao_agosto_2026', 'cupom_20off', NULL, 'Disparo WhatsApp - Reativação de Base', 'Convertido', 2190, 'Desktop (Macintosh)', 'Safari 17.5', 50, '[{"id":"evt-7","type":"meta_capi","eventName":"Purchase","status":"sucesso","timestamp":"2026-08-10T09:00:01.000Z","details":"Purchase CAPI event sent successfully"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-106-1786498560971', 'comp-1786498560971', 'Juliana Mendes', '5581987112233', 'juliana.mendes@loja.com.br', '{"city":"Recife","state":"PE","country":"Brasil","ip":"179.108.64.12"}'::jsonb, 'Google Ads', 'google_ads', 'search', 'fundo_funil_servicos', NULL, NULL, 'Google Ads - Pesquisa Fundo de Funil', 'Perdido', 0, 'Mobile (Android)', 'Chrome Mobile', 50, '[]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-beta-201-1786498560971', 'comp-1786498560971', 'Roberto Vianna (TechSolutions Beta Client)', '5521998877665', 'roberto@multinacional.com', '{"city":"Rio de Janeiro","state":"RJ","country":"Brasil","ip":"200.150.10.5"}'::jsonb, 'LinkedIn', 'linkedin', 'cpc', 'b2b_enterprise_2026', 'video_cases', 'gestao_empresarial', 'TechSolutions - Consultoria de Software Enterprise', 'Em Negociação', 12500, 'Desktop (Windows 11)', 'Edge 125', 50, '[]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-101', 'comp-alfa', 'Carlos Eduardo Silva', '5511991234567', 'carlos.silva@empresa.com.br', '{"city":"São Paulo","state":"SP","country":"Brasil","ip":"177.138.45.12"}'::jsonb, 'Meta Ads', 'meta_ads', 'cpc', 'black_friday_2026', 'carrossel_v2', 'desconto_exclusivo', 'Campanha Meta Ads - Oferta VIP Black Friday', 'Convertido', 1490, 'Mobile (iPhone 14 Pro)', 'Safari 17.4', 50, '[{"id":"evt-1","type":"meta_pixel","eventName":"Lead","status":"sucesso","timestamp":"2026-08-10T09:12:05.000Z","details":"Pixel Meta disparado com sucesso no clique do link"},{"id":"evt-2","type":"meta_capi","eventName":"Purchase","status":"sucesso","timestamp":"2026-08-10T11:20:00.000Z","details":"Conversão de R$ 1.490,00 enviada via Conversion API"},{"id":"evt-3","type":"webhook","eventName":"lead_converted","status":"sucesso","timestamp":"2026-08-10T11:20:01.000Z","details":"Webhook enviado para CRM externo (HTTP 200 OK)"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-102', 'comp-alfa', 'Mariana Fontes', '5521988776655', 'mariana.fontes@gmail.com', '{"city":"Rio de Janeiro","state":"RJ","country":"Brasil","ip":"201.86.112.90"}'::jsonb, 'Google Ads', 'google_ads', 'search', 'fundo_funil_servicos', 'anuncio_texto_01', 'sistema_rastreamento_whatsapp', 'Google Ads - Pesquisa Fundo de Funil', 'Em Negociação', 890, 'Desktop (Windows 11)', 'Chrome 127', 50, '[{"id":"evt-4","type":"google_ads","eventName":"Conversion_Lead","status":"sucesso","timestamp":"2026-08-10T08:45:02.000Z","details":"Google Ads conversion label AW-987654321 disparado"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-103', 'comp-alfa', 'Rodrigo Alcantara', '5531976543210', 'rodrigo.mkt@agenciaprime.com', '{"city":"Belo Horizonte","state":"MG","country":"Brasil","ip":"189.23.14.77"}'::jsonb, 'Instagram', 'instagram', 'organico_bio', 'geral_instabio', 'linkinbio', NULL, 'Instagram Bio - Tráfego Orgânico', 'Contatado', 490, 'Mobile (Samsung Galaxy S24)', 'Chrome Mobile', 50, '[{"id":"evt-5","type":"webhook","eventName":"lead_created","status":"sucesso","timestamp":"2026-08-10T07:10:01.000Z","details":"Webhook de novo lead disparado"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-104', 'comp-alfa', 'Patricia Lima', '5541998811223', 'patricia@consultoria.com.br', '{"city":"Curitiba","state":"PR","country":"Brasil","ip":"177.92.203.11"}'::jsonb, 'Meta Ads', 'meta_ads', 'cpc', 'black_friday_2026', 'carrossel_v2', 'desconto_exclusivo', 'Campanha Meta Ads - Oferta VIP Black Friday', 'Novo Lead', 0, 'Mobile (iPhone 13)', 'Instagram In-App Browser', 50, '[{"id":"evt-6","type":"meta_pixel","eventName":"Lead","status":"sucesso","timestamp":"2026-08-10T10:05:01.000Z","details":"Meta Pixel Lead disparado"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-105', 'comp-alfa', 'Gabriel Portugal Costa', '351912345678', 'gabriel.costa@tech.pt', '{"city":"Lisboa","state":"Lisboa","country":"Portugal","ip":"193.136.2.100"}'::jsonb, 'WhatsApp', 'whatsapp', 'direct_msg', 'reativacao_agosto_2026', 'cupom_20off', NULL, 'Disparo WhatsApp - Reativação de Base', 'Convertido', 2190, 'Desktop (Macintosh)', 'Safari 17.5', 50, '[{"id":"evt-7","type":"meta_capi","eventName":"Purchase","status":"sucesso","timestamp":"2026-08-10T09:00:01.000Z","details":"Purchase CAPI event sent successfully"}]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-106', 'comp-alfa', 'Juliana Mendes', '5581987112233', 'juliana.mendes@loja.com.br', '{"city":"Recife","state":"PE","country":"Brasil","ip":"179.108.64.12"}'::jsonb, 'Google Ads', 'google_ads', 'search', 'fundo_funil_servicos', NULL, NULL, 'Google Ads - Pesquisa Fundo de Funil', 'Perdido', 0, 'Mobile (Android)', 'Chrome Mobile', 50, '[]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.leads (id, company_id, name, phone, email, location, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, link_title, stage, value, device, browser, score, conversion_events, created_at)
VALUES ('lead-beta-201', 'comp-alfa', 'Roberto Vianna (TechSolutions Beta Client)', '5521998877665', 'roberto@multinacional.com', '{"city":"Rio de Janeiro","state":"RJ","country":"Brasil","ip":"200.150.10.5"}'::jsonb, 'LinkedIn', 'linkedin', 'cpc', 'b2b_enterprise_2026', 'video_cases', 'gestao_empresarial', 'TechSolutions - Consultoria de Software Enterprise', 'Em Negociação', 12500, 'Desktop (Windows 11)', 'Edge 125', 50, '[]'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. SALAS DO ESCRITÓRIO VIRTUAL HABBLAUD
INSERT INTO public.ai_agent_rooms (id, company_id, name, slug, color, description, created_at)
VALUES ('squad-sdr-qualificacao-comp-1788784548541', 'comp-1788784548541', 'SQUAD SDR & TRIAGEM', 'squad-sdr-qualificacao', 'amber', 'Recepção, triagem de leads e catálogo', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_rooms (id, company_id, name, slug, color, description, created_at)
VALUES ('squad-closer-vendas-comp-1788784548541', 'comp-1788784548541', 'SQUAD CLOSER & FECHAMENTO', 'squad-closer-vendas', 'emerald', 'Quebra de objeções e envio de links de pagamento', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_rooms (id, company_id, name, slug, color, description, created_at)
VALUES ('sala-roberto-comp-1788784548541', 'comp-1788784548541', 'SALA ROBERTO', 'sala-roberto', 'purple', 'Sala gerencial de atendimento', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_rooms (id, company_id, name, slug, color, description, created_at)
VALUES ('sala-maya-comp-1788784548541', 'comp-1788784548541', 'SALA MAYA', 'sala-maya', 'purple', 'Sala de qualificação autônoma', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_rooms (id, company_id, name, slug, color, description, created_at)
VALUES ('squad-sdr-qualificacao-comp-1786498560971', 'comp-1786498560971', 'SQUAD SDR & TRIAGEM', 'squad-sdr-qualificacao', 'amber', 'Recepção, triagem de leads e catálogo', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_rooms (id, company_id, name, slug, color, description, created_at)
VALUES ('squad-closer-vendas-comp-1786498560971', 'comp-1786498560971', 'SQUAD CLOSER & FECHAMENTO', 'squad-closer-vendas', 'emerald', 'Quebra de objeções e envio de links de pagamento', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_rooms (id, company_id, name, slug, color, description, created_at)
VALUES ('sala-roberto-comp-1786498560971', 'comp-1786498560971', 'SALA ROBERTO', 'sala-roberto', 'purple', 'Sala gerencial de atendimento', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_rooms (id, company_id, name, slug, color, description, created_at)
VALUES ('sala-maya-comp-1786498560971', 'comp-1786498560971', 'SALA MAYA', 'sala-maya', 'purple', 'Sala de qualificação autônoma', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_rooms (id, company_id, name, slug, color, description, created_at)
VALUES ('squad-sdr-qualificacao-comp-alfa', 'comp-alfa', 'SQUAD SDR & TRIAGEM', 'squad-sdr-qualificacao', 'amber', 'Recepção, triagem de leads e catálogo', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_rooms (id, company_id, name, slug, color, description, created_at)
VALUES ('squad-closer-vendas-comp-alfa', 'comp-alfa', 'SQUAD CLOSER & FECHAMENTO', 'squad-closer-vendas', 'emerald', 'Quebra de objeções e envio de links de pagamento', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_rooms (id, company_id, name, slug, color, description, created_at)
VALUES ('sala-roberto-comp-alfa', 'comp-alfa', 'SALA ROBERTO', 'sala-roberto', 'purple', 'Sala gerencial de atendimento', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_rooms (id, company_id, name, slug, color, description, created_at)
VALUES ('sala-maya-comp-alfa', 'comp-alfa', 'SALA MAYA', 'sala-maya', 'purple', 'Sala de qualificação autônoma', NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. AGENTES DE IA AUTÔNOMOS
INSERT INTO public.ai_agents (id, company_id, name, role_title, avatar, goal, persona_and_context, rules, autonomy_mode, enabled_tools, room_id, executions_count, goals_achieved_count, active, created_at)
VALUES ('agent-maya-comp-1788784548541', 'comp-1788784548541', 'Maya', 'SDR & Qualificação de Leads', '🤖', 'Descobrir o orçamento e necessidade do lead e avançar para Em Negociação.', 'Consultora de pré-vendas simpática, ágil e focada em valor.', '["Nunca inventar produtos fora do catálogo.","Não dar mais de 10% de desconto sem aprovação humana."]'::jsonb, 'autonomous', '["get_lead_profile","search_products","update_lead_stage","add_lead_note"]'::jsonb, 'squad-sdr-qualificacao-comp-1788784548541', 48, 19, TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agents (id, company_id, name, role_title, avatar, goal, persona_and_context, rules, autonomy_mode, enabled_tools, room_id, executions_count, goals_achieved_count, active, created_at)
VALUES ('agent-lucas-comp-1788784548541', 'comp-1788784548541', 'Lucas', 'Closer & Fechamento de Vendas', '⚡', 'Converter leads indecisos contornando objeções de preço e prazo.', 'Especialista em fechamento consultivo e argumentos de ROI.', '["Consultar histórico de compras antes de ofertar.","Enviar link rastreável."]'::jsonb, 'autonomous', '["get_lead_profile","search_products","get_campaign_links","update_lead_stage"]'::jsonb, 'squad-closer-vendas-comp-1788784548541', 31, 12, TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agents (id, company_id, name, role_title, avatar, goal, persona_and_context, rules, autonomy_mode, enabled_tools, room_id, executions_count, goals_achieved_count, active, created_at)
VALUES ('agent-maya-comp-1786498560971', 'comp-1786498560971', 'Maya', 'SDR & Qualificação de Leads', '🤖', 'Descobrir o orçamento e necessidade do lead e avançar para Em Negociação.', 'Consultora de pré-vendas simpática, ágil e focada em valor.', '["Nunca inventar produtos fora do catálogo.","Não dar mais de 10% de desconto sem aprovação humana."]'::jsonb, 'autonomous', '["get_lead_profile","search_products","update_lead_stage","add_lead_note"]'::jsonb, 'squad-sdr-qualificacao-comp-1786498560971', 48, 19, TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agents (id, company_id, name, role_title, avatar, goal, persona_and_context, rules, autonomy_mode, enabled_tools, room_id, executions_count, goals_achieved_count, active, created_at)
VALUES ('agent-lucas-comp-1786498560971', 'comp-1786498560971', 'Lucas', 'Closer & Fechamento de Vendas', '⚡', 'Converter leads indecisos contornando objeções de preço e prazo.', 'Especialista em fechamento consultivo e argumentos de ROI.', '["Consultar histórico de compras antes de ofertar.","Enviar link rastreável."]'::jsonb, 'autonomous', '["get_lead_profile","search_products","get_campaign_links","update_lead_stage"]'::jsonb, 'squad-closer-vendas-comp-1786498560971', 31, 12, TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agents (id, company_id, name, role_title, avatar, goal, persona_and_context, rules, autonomy_mode, enabled_tools, room_id, executions_count, goals_achieved_count, active, created_at)
VALUES ('agent-maya-comp-alfa', 'comp-alfa', 'Maya', 'SDR & Qualificação de Leads', '🤖', 'Descobrir o orçamento e necessidade do lead e avançar para Em Negociação.', 'Consultora de pré-vendas simpática, ágil e focada em valor.', '["Nunca inventar produtos fora do catálogo.","Não dar mais de 10% de desconto sem aprovação humana."]'::jsonb, 'autonomous', '["get_lead_profile","search_products","update_lead_stage","add_lead_note"]'::jsonb, 'squad-sdr-qualificacao-comp-alfa', 48, 19, TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agents (id, company_id, name, role_title, avatar, goal, persona_and_context, rules, autonomy_mode, enabled_tools, room_id, executions_count, goals_achieved_count, active, created_at)
VALUES ('agent-lucas-comp-alfa', 'comp-alfa', 'Lucas', 'Closer & Fechamento de Vendas', '⚡', 'Converter leads indecisos contornando objeções de preço e prazo.', 'Especialista em fechamento consultivo e argumentos de ROI.', '["Consultar histórico de compras antes de ofertar.","Enviar link rastreável."]'::jsonb, 'autonomous', '["get_lead_profile","search_products","get_campaign_links","update_lead_stage"]'::jsonb, 'squad-closer-vendas-comp-alfa', 31, 12, TRUE, NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. CENTRAL DE ATIVIDADES DOS AGENTES (HABLLA FORMAT)
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-1-comp-1788784548541', 'agent-maya-comp-1788784548541', 'Maya', '🤖', 'comp-1788784548541', 'Percepção de Contexto & Intenção BANT', 'Identifiquei que o lead busca automação de WhatsApp para o setor imobiliário.', 'qualification', 'qualifying', 'completed', NOW() - interval '2 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-2-comp-1788784548541', 'agent-maya-comp-1788784548541', 'Maya', '🤖', 'comp-1788784548541', 'search_products: Consulta ao Catálogo de Soluções', 'Consultei plano Pro com 5 agentes integrados.', 'qualification', 'qualifying', 'completed', NOW() - interval '4 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-3-comp-1788784548541', 'agent-maya-comp-1788784548541', 'Maya', '🤖', 'comp-1788784548541', 'Validação de Regras (Guardrails de Negócio)', 'Verificação de conformidade: desconto dentro do limite permitido de 10%.', 'qualification', 'analyzing', 'completed', NOW() - interval '6 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-4-comp-1788784548541', 'agent-maya-comp-1788784548541', 'Maya', '🤖', 'comp-1788784548541', 'update_lead_stage: Ação no CRM -> Em Negociação', 'Lead qualificado com score 85 e movido para Em Negociação.', 'qualification', 'goal_achieved', 'completed', NOW() - interval '8 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-5-comp-1788784548541', 'agent-maya-comp-1788784548541', 'Maya', '🤖', 'comp-1788784548541', 'Escrevendo a resposta com gatilho de fechamento', 'Olá! Preparei uma proposta especial com o plano Pro para a sua equipe.', 'closing', 'goal_achieved', 'completed', NOW() - interval '10 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-6-comp-1786498560971', 'agent-maya-comp-1786498560971', 'Maya', '🤖', 'comp-1786498560971', 'Percepção de Contexto & Intenção BANT', 'Identifiquei que o lead busca automação de WhatsApp para o setor imobiliário.', 'qualification', 'qualifying', 'completed', NOW() - interval '12 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-7-comp-1786498560971', 'agent-maya-comp-1786498560971', 'Maya', '🤖', 'comp-1786498560971', 'search_products: Consulta ao Catálogo de Soluções', 'Consultei plano Pro com 5 agentes integrados.', 'qualification', 'qualifying', 'completed', NOW() - interval '14 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-8-comp-1786498560971', 'agent-maya-comp-1786498560971', 'Maya', '🤖', 'comp-1786498560971', 'Validação de Regras (Guardrails de Negócio)', 'Verificação de conformidade: desconto dentro do limite permitido de 10%.', 'qualification', 'analyzing', 'completed', NOW() - interval '16 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-9-comp-1786498560971', 'agent-maya-comp-1786498560971', 'Maya', '🤖', 'comp-1786498560971', 'update_lead_stage: Ação no CRM -> Em Negociação', 'Lead qualificado com score 85 e movido para Em Negociação.', 'qualification', 'goal_achieved', 'completed', NOW() - interval '18 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-10-comp-1786498560971', 'agent-maya-comp-1786498560971', 'Maya', '🤖', 'comp-1786498560971', 'Escrevendo a resposta com gatilho de fechamento', 'Olá! Preparei uma proposta especial com o plano Pro para a sua equipe.', 'closing', 'goal_achieved', 'completed', NOW() - interval '20 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-11-comp-alfa', 'agent-maya-comp-alfa', 'Maya', '🤖', 'comp-alfa', 'Percepção de Contexto & Intenção BANT', 'Identifiquei que o lead busca automação de WhatsApp para o setor imobiliário.', 'qualification', 'qualifying', 'completed', NOW() - interval '22 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-12-comp-alfa', 'agent-maya-comp-alfa', 'Maya', '🤖', 'comp-alfa', 'search_products: Consulta ao Catálogo de Soluções', 'Consultei plano Pro com 5 agentes integrados.', 'qualification', 'qualifying', 'completed', NOW() - interval '24 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-13-comp-alfa', 'agent-maya-comp-alfa', 'Maya', '🤖', 'comp-alfa', 'Validação de Regras (Guardrails de Negócio)', 'Verificação de conformidade: desconto dentro do limite permitido de 10%.', 'qualification', 'analyzing', 'completed', NOW() - interval '26 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-14-comp-alfa', 'agent-maya-comp-alfa', 'Maya', '🤖', 'comp-alfa', 'update_lead_stage: Ação no CRM -> Em Negociação', 'Lead qualificado com score 85 e movido para Em Negociação.', 'qualification', 'goal_achieved', 'completed', NOW() - interval '28 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.ai_agent_logs (id, agent_id, agent_name, agent_avatar, company_id, task_title, agent_reply, activity_category, board_column, status, created_at)
VALUES ('log-15-comp-alfa', 'agent-maya-comp-alfa', 'Maya', '🤖', 'comp-alfa', 'Escrevendo a resposta com gatilho de fechamento', 'Olá! Preparei uma proposta especial com o plano Pro para a sua equipe.', 'closing', 'goal_achieved', 'completed', NOW() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

