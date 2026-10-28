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
