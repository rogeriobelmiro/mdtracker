-- ==============================================================================
-- MIGRATION: CRIADOR DE AGENTES DE IA AUTÔNOMOS & CENTRAL DE ATIVIDADES (HABLLA)
-- ==============================================================================

-- 1. Tabela de Agentes de IA (Configuração, Objetivo, Regras/Guardrails e Tools)
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
  active BOOLEAN DEFAULT true,
  executions_count INTEGER DEFAULT 0,
  goals_achieved_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_agents_company_id ON public.ai_agents(company_id);

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_agents' AND policyname = 'Allow all operations on ai_agents'
  ) THEN
    CREATE POLICY "Allow all operations on ai_agents" ON public.ai_agents FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- 2. Tabela da Central de Atividades dos Agentes (Formato Hablla: Kanban, Tarefas & Logs)
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
  board_column TEXT DEFAULT 'qualifying', -- 'analyzing', 'qualifying', 'scheduled', 'goal_achieved', 'handed_over'
  activity_category TEXT DEFAULT 'qualification', -- 'qualification', 'closing', 'followup', 'support_triage', 'crm_update', 'human_handover'
  task_title TEXT,
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  due_date TIMESTAMPTZ,
  task_completed BOOLEAN DEFAULT false,
  duration_ms INTEGER DEFAULT 1200,
  tags JSONB DEFAULT '[]'::jsonb,
  user_message TEXT,
  agent_reply TEXT,
  steps JSONB DEFAULT '[]'::jsonb,
  actions_taken JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'completed', -- 'completed', 'handed_over', 'blocked_by_rule'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_company_id ON public.ai_agent_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_agent_id ON public.ai_agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_board_column ON public.ai_agent_logs(board_column);

ALTER TABLE public.ai_agent_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_agent_logs' AND policyname = 'Allow all operations on ai_agent_logs'
  ) THEN
    CREATE POLICY "Allow all operations on ai_agent_logs" ON public.ai_agent_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;
