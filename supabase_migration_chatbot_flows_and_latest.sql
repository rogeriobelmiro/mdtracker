-- ==============================================================================
-- MDTRACKER: SQL DAS ÚLTIMAS IMPLEMENTAÇÕES
-- Chatbot com IA, Construtor de Fluxos Visuais (Decisão & Proativo) e Instagram Follow-Gate
-- ==============================================================================

-- 1. CONFIGURAÇÕES GERAIS (SETTINGS)
-- Armazena o modo ativo ('prompt' ou 'visual_flow') e os múltiplos fluxos visuais completos com nós, links e regras de disparo.
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS chatbot_config JSONB;

-- Armazena as credenciais oficiais da Meta Graph API para Instagram Direct e Comentários.
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS instagram_config JSONB;


-- 2. LEADS (CONTROLE DE ATENDIMENTO E DISPARO PROATIVO POR TEMPO)
-- Controla se o robô responde para o lead ou se foi pausado por intervenção humana (handover)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS bot_active BOOLEAN DEFAULT TRUE;

-- Registra a última interação para permitir disparos proativos (ex: chamar sozinho 2 dias depois)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW();

-- Registra o fluxo ativo e em qual nó da árvore de decisão o lead está no momento
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS active_flow_id TEXT;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS flow_step_node_id TEXT;

-- Data/Hora agendada para o robô chamar o lead proativamente se ele não responder
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS proactive_scheduled_at TIMESTAMPTZ;


-- 3. INSTAGRAM COMMENT AUTOMATION & FOLLOW-GATE
-- Regras de bloqueio de conteúdo até o usuário seguir o perfil (Follow-Gate)
ALTER TABLE public.instagram_comment_automations 
ADD COLUMN IF NOT EXISTS follow_gate_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE public.instagram_comment_automations 
ADD COLUMN IF NOT EXISTS follow_gate_config JSONB;

ALTER TABLE public.instagram_comment_automations 
ADD COLUMN IF NOT EXISTS related_post_promotion JSONB;

ALTER TABLE public.instagram_comment_logs 
ADD COLUMN IF NOT EXISTS error_message TEXT;


-- 4. TABELA OPCIONAL: CHATBOT_FLOWS (FLUXOS VISUAIS INDEPENDENTES)
-- Permite armazenar e versionar múltiplos fluxos visuais relacionais por empresa
CREATE TABLE IF NOT EXISTS public.chatbot_flows (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  trigger_type TEXT DEFAULT 'instant_reply', -- 'instant_reply', 'proactive_time', 'keyword_match'
  trigger_config JSONB DEFAULT '{}'::jsonb,  -- ex: {"delayAmount": 2, "delayUnit": "days"}
  nodes JSONB DEFAULT '[]'::jsonb,           -- Blocos com coordenadas (x, y), links e ações
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.chatbot_flows ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Permitir leitura e escrita em chatbot_flows para usuarios autenticados e anon" 
  ON public.chatbot_flows FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 5. TABELA DE LOGS DE EXECUÇÃO DO CHATBOT (HISTÓRICO DE MENSAGENS E TRANSBORDO)
CREATE TABLE IF NOT EXISTS public.chatbot_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,                     -- 'whatsapp' ou 'direct'
  flow_id TEXT,
  node_id TEXT,
  direction TEXT NOT NULL,                   -- 'incoming' (lead) ou 'outgoing' (bot)
  message_text TEXT,
  link_url TEXT,
  is_proactive BOOLEAN DEFAULT FALSE,
  is_handover BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.chatbot_execution_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Permitir leitura e escrita em chatbot_execution_logs" 
  ON public.chatbot_execution_logs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. ÍNDICES DE DESEMPENHO
CREATE INDEX IF NOT EXISTS idx_leads_proactive_scheduled 
ON public.leads(proactive_scheduled_at) 
WHERE proactive_scheduled_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_bot_active 
ON public.leads(company_id, bot_active);

CREATE INDEX IF NOT EXISTS idx_chatbot_flows_company 
ON public.chatbot_flows(company_id, active);
