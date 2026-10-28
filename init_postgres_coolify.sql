-- ==============================================================================
-- MDTRACKER: SCRIPT MESTRE COMPLETO (35 TABELAS) - POSTGRESQL (COOLIFY / HOSTINGER)
-- 100% DAS TABELAS DO SUPABASE, ÍNDICES MULTI-TENANT, JSONB E CARGA DE DADOS
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
  phone TEXT,
  extension TEXT,
  is_external BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'online',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);

-- 3. EQUIPES & CONTACT CENTER (TEAMS)
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'active_sales',
  color TEXT DEFAULT '#3B82F6',
  distribution_strategy TEXT DEFAULT 'round_robin',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_teams_company ON public.teams(company_id, active);

-- 4. MEMBROS DA EQUIPE (TEAM MEMBERS)
CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  is_external BOOLEAN DEFAULT FALSE,
  phone_number TEXT,
  extension TEXT,
  status TEXT DEFAULT 'online',
  max_concurrent_leads INTEGER DEFAULT 15,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id, active);
CREATE INDEX IF NOT EXISTS idx_team_members_company ON public.team_members(company_id);

-- 5. LINKS DE CAMPANHA & WHATSAPP
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
  assigned_team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  phone_numbers JSONB DEFAULT '[]'::jsonb,
  rotation_mode TEXT DEFAULT 'round_robin',
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

-- 6. LEADS DO CRM
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
  assigned_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  conversion_events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);

-- 7. PRODUTOS & CATÁLOGO
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

-- 8. VENDAS E COMPRAS DE LEADS
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

-- 9. CONFIGURAÇÕES DA EMPRESA
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
  evolution_api_url TEXT,
  evolution_api_key TEXT,
  evolution_instance TEXT,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 465,
  smtp_user TEXT,
  smtp_pass TEXT,
  smtp_from_name TEXT,
  smtp_from_email TEXT,
  smtp_secure BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. LOGS DE WEBHOOK
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id TEXT PRIMARY KEY,
  company_id TEXT,
  payload JSONB,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_company_id ON public.webhook_logs(company_id);

-- 11. MENSAGENS WHATSAPP
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id TEXT PRIMARY KEY,
  company_id TEXT,
  lead_phone TEXT NOT NULL,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'entregue'
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_company ON public.whatsapp_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON public.whatsapp_messages(lead_phone);

-- 12. POPUPS DE CAPTURA
CREATE TABLE IF NOT EXISTS public.popups (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  trigger_type TEXT DEFAULT 'exit_intent',
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
  action_type TEXT DEFAULT 'whatsapp_redirect',
  whatsapp_phone TEXT,
  whatsapp_message TEXT,
  redirect_url TEXT,
  success_message TEXT DEFAULT 'Obrigado! Recebemos suas informações.',
  target_stage TEXT DEFAULT 'Novo Lead',
  tags JSONB DEFAULT '[]'::jsonb,
  link_id TEXT REFERENCES public.campaign_links(id) ON DELETE SET NULL,
  impressions_count INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  workflow_id TEXT,
  auto_trigger_whatsapp BOOLEAN DEFAULT FALSE,
  whatsapp_template TEXT,
  auto_trigger_email BOOLEAN DEFAULT FALSE,
  email_subject TEXT,
  email_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_popups_company_id ON public.popups(company_id);

-- 13. FLUXOS DE MARKETING (WORKFLOWS)
CREATE TABLE IF NOT EXISTS public.marketing_workflows (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  trigger_type TEXT DEFAULT 'lead_created',
  trigger_config JSONB DEFAULT '{}'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  enrolled_count INTEGER DEFAULT 0,
  executed_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_marketing_workflows_company ON public.marketing_workflows(company_id);

-- 14. LOGS DOS FLUXOS DE MARKETING
CREATE TABLE IF NOT EXISTS public.workflow_logs (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  workflow_id TEXT REFERENCES public.marketing_workflows(id) ON DELETE CASCADE,
  workflow_name TEXT NOT NULL,
  lead_id TEXT,
  lead_name TEXT,
  lead_phone TEXT,
  action_type TEXT NOT NULL,
  status TEXT DEFAULT 'success',
  detail TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_company ON public.workflow_logs(company_id);

-- 15. DISPAROS EM MASSA (BROADCAST CAMPAIGNS)
CREATE TABLE IF NOT EXISTS public.broadcast_campaigns (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT DEFAULT 'email',
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
  status TEXT DEFAULT 'rascunho',
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
CREATE INDEX IF NOT EXISTS idx_broadcast_campaigns_company ON public.broadcast_campaigns(company_id);

-- 16. LIGAÇÕES DO CRM (LEAD CALLS)
CREATE TABLE IF NOT EXISTS public.lead_calls (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
  team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  lead_name TEXT NOT NULL,
  lead_phone TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  outcome TEXT DEFAULT 'atendeu_positivo',
  notes TEXT,
  recording_url TEXT,
  transcript_summary TEXT,
  sentiment TEXT DEFAULT 'neutro',
  next_steps TEXT,
  caller_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lead_calls_company ON public.lead_calls(company_id);

-- 17. LISTAS INTELIGENTES (SMART LISTS)
CREATE TABLE IF NOT EXISTS public.smart_lists (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#2563eb',
  conditions JSONB DEFAULT '[]'::jsonb,
  match_type TEXT DEFAULT 'all',
  leads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_smart_lists_company ON public.smart_lists(company_id);

-- 18. AGENTES DE IA AUTÔNOMOS
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

-- 19. CENTRAL DE ATIVIDADES DOS AGENTES
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
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_board_column ON public.ai_agent_logs(board_column);

-- 20. SALAS DO ESCRITÓRIO VIRTUAL HABBLAUD
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

-- 21. PROJETOS DE CHATBOT
CREATE TABLE IF NOT EXISTS public.chatbot_projects (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'blue',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chatbot_projects_company ON public.chatbot_projects(company_id);

-- 22. FLUXOS DE CHATBOT (FLOWS)
CREATE TABLE IF NOT EXISTS public.chatbot_flows (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  trigger_type TEXT DEFAULT 'instant_reply',
  trigger_config JSONB DEFAULT '{}'::jsonb,
  nodes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chatbot_flows_company ON public.chatbot_flows(company_id, active);

-- 23. LOGS DE EXECUÇÃO DO CHATBOT
CREATE TABLE IF NOT EXISTS public.chatbot_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  flow_id TEXT,
  node_id TEXT,
  direction TEXT NOT NULL,
  message_text TEXT,
  link_url TEXT,
  is_proactive BOOLEAN DEFAULT FALSE,
  is_handover BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_company ON public.chatbot_execution_logs(company_id);

-- 24. PESQUISAS E FORMULÁRIOS (SURVEYS)
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
  workflow_id TEXT,
  auto_trigger_whatsapp BOOLEAN DEFAULT FALSE,
  whatsapp_template TEXT,
  auto_trigger_email BOOLEAN DEFAULT FALSE,
  email_subject TEXT,
  email_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_surveys_company_id ON public.surveys(company_id);
CREATE INDEX IF NOT EXISTS idx_surveys_slug ON public.surveys(slug);

-- 25. RESPOSTAS DAS PESQUISAS
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

-- 26. LANDING PAGES
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

-- 27. DOMÍNIOS PERSONALIZADOS
CREATE TABLE IF NOT EXISTS public.custom_domains (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending_dns',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_custom_domains_company_id ON public.custom_domains(company_id);

-- 28. EVENTOS DE GAMIFICAÇÃO AO VIVO
CREATE TABLE IF NOT EXISTS public.gamification_events (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  pin_code TEXT NOT NULL,
  description TEXT,
  theme JSONB DEFAULT '{"primaryColor": "#8b5cf6", "backgroundColor": "#1e1b4b", "accentColor": "#06b6d4"}'::jsonb,
  status TEXT NOT NULL DEFAULT 'live',
  current_activity_id TEXT,
  require_phone BOOLEAN DEFAULT true,
  require_email BOOLEAN DEFAULT false,
  require_company BOOLEAN DEFAULT false,
  require_role BOOLEAN DEFAULT false,
  lead_magnet_url TEXT,
  settings JSONB DEFAULT '{"allowAnonymous": false, "showLiveCount": true, "enableSounds": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gamification_events_company_id ON public.gamification_events(company_id);

-- 29. ATIVIDADES DA GAMIFICAÇÃO
CREATE TABLE IF NOT EXISTS public.gamification_activities (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.gamification_events(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  options JSONB DEFAULT '[]'::jsonb,
  correct_option_id TEXT,
  time_limit_seconds INT DEFAULT 30,
  points INT DEFAULT 100,
  order_index INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gamification_activities_event_id ON public.gamification_activities(event_id);

-- 30. PARTICIPANTES DA GAMIFICAÇÃO
CREATE TABLE IF NOT EXISTS public.gamification_participants (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.gamification_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  role TEXT,
  avatar TEXT,
  score INT DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  device_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gamification_participants_event_id ON public.gamification_participants(event_id);

-- 31. RESPOSTAS DA GAMIFICAÇÃO
CREATE TABLE IF NOT EXISTS public.gamification_responses (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES public.gamification_activities(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL REFERENCES public.gamification_participants(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gamification_responses_activity_id ON public.gamification_responses(activity_id);

-- 32. GAMIFICAÇÃO DE EVENTOS SIMPLES
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

-- 33. AUTOMAÇÃO DE COMENTÁRIOS DO INSTAGRAM
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
CREATE INDEX IF NOT EXISTS idx_insta_comment_company ON public.instagram_comment_automations(company_id);

-- 34. LOGS DE COMENTÁRIOS DO INSTAGRAM
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
CREATE INDEX IF NOT EXISTS idx_insta_comment_logs_company ON public.instagram_comment_logs(company_id);

-- 35. CLIQUES DE LINK DE CAMPANHA (LINK CLICKS)
CREATE TABLE IF NOT EXISTS public.link_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id TEXT NOT NULL REFERENCES public.campaign_links(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON public.link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_company_id ON public.link_clicks(company_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_created_at ON public.link_clicks(created_at);

-- 36. CRÉDITOS DE USUÁRIO (USER CREDITS)
CREATE TABLE IF NOT EXISTS public.user_credits (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS company_id TEXT;
CREATE INDEX IF NOT EXISTS idx_user_credits_company ON public.user_credits(company_id);

-- 37. TABELA DE CONTROLE DE ATUALIZAÇÃO
CREATE TABLE IF NOT EXISTS public.atualiza_bd (
  id SERIAL PRIMARY KEY,
  versao TEXT DEFAULT '1.0.0',
  descricao TEXT,
  executado_em TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.atualiza_bd (versao, descricao) VALUES ('1.0.0', 'Migração completa de 35 tabelas para PostgreSQL Coolify/Hostinger') ON CONFLICT DO NOTHING;

-- ==============================================================================
-- CARGA DE DADOS DE TESTE E HISTÓRICO COMPLETO (MULTI-TENANT)
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

-- 3. EQUIPES DE ATENDIMENTO
INSERT INTO public.teams (id, company_id, name, description, type, color, distribution_strategy, active, created_at)
VALUES ('team-vendas-comp-1788784548541', 'comp-1788784548541', 'Vendas & Fechamento', 'Equipe de closers e SDRs de alta conversão', 'active_sales', '#10B981', 'round_robin', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.teams (id, company_id, name, description, type, color, distribution_strategy, active, created_at)
VALUES ('team-vendas-comp-1786498560971', 'comp-1786498560971', 'Vendas & Fechamento', 'Equipe de closers e SDRs de alta conversão', 'active_sales', '#10B981', 'round_robin', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.teams (id, company_id, name, description, type, color, distribution_strategy, active, created_at)
VALUES ('team-vendas-comp-alfa', 'comp-alfa', 'Vendas & Fechamento', 'Equipe de closers e SDRs de alta conversão', 'active_sales', '#10B981', 'round_robin', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. CONFIGURAÇÕES DAS EMPRESAS
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

-- 5. LINKS DE CAMPANHA & WHATSAPP
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

-- 6. LEADS DO CRM
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

-- 7. SALAS DO ESCRITÓRIO VIRTUAL HABBLAUD
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

-- 8. AGENTES DE IA AUTÔNOMOS
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

-- 9. CENTRAL DE ATIVIDADES DOS AGENTES (HABLLA FORMAT)
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

-- 10. PROJETOS E FLUXOS DO CHATBOT
INSERT INTO public.chatbot_projects (id, company_id, name, description, color, active, created_at)
VALUES ('proj-vendas-comp-1788784548541', 'comp-1788784548541', 'Fluxo Comercial Principal', 'Funil de recepção, qualificação e direcionamento de vendas', 'blue', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.chatbot_flows (id, company_id, project_id, name, description, active, trigger_type, created_at)
VALUES ('flow-triagem-comp-1788784548541', 'comp-1788784548541', 'proj-vendas-comp-1788784548541', 'Triagem Inteligente WhatsApp', 'Qualifica o lead e descobre o interesse', TRUE, 'instant_reply', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.chatbot_projects (id, company_id, name, description, color, active, created_at)
VALUES ('proj-vendas-comp-1786498560971', 'comp-1786498560971', 'Fluxo Comercial Principal', 'Funil de recepção, qualificação e direcionamento de vendas', 'blue', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.chatbot_flows (id, company_id, project_id, name, description, active, trigger_type, created_at)
VALUES ('flow-triagem-comp-1786498560971', 'comp-1786498560971', 'proj-vendas-comp-1786498560971', 'Triagem Inteligente WhatsApp', 'Qualifica o lead e descobre o interesse', TRUE, 'instant_reply', NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.chatbot_projects (id, company_id, name, description, color, active, created_at)
VALUES ('proj-vendas-comp-alfa', 'comp-alfa', 'Fluxo Comercial Principal', 'Funil de recepção, qualificação e direcionamento de vendas', 'blue', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.chatbot_flows (id, company_id, project_id, name, description, active, trigger_type, created_at)
VALUES ('flow-triagem-comp-alfa', 'comp-alfa', 'proj-vendas-comp-alfa', 'Triagem Inteligente WhatsApp', 'Qualifica o lead e descobre o interesse', TRUE, 'instant_reply', NOW())
ON CONFLICT (id) DO NOTHING;

