-- ==============================================================================
-- MDTRACKER: MIGRAÇÃO PARA MULTI-ATENDIMENTO, EQUIPES E CONTACT CENTER
-- Suporte a múltiplas equipes (Vendas Ativas, Receptivas, Recuperação, Suporte),
-- colaboradores internos e externos, roleta de números e monitoramento de supervisão
-- ==============================================================================

-- 1. TABELA DE EQUIPES / FILAS / DEPARTAMENTOS (TEAMS)
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'active_sales', -- 'active_sales', 'inbound_sales', 'recovery', 'support', 'custom'
  color TEXT DEFAULT '#3B82F6',
  distribution_strategy TEXT DEFAULT 'round_robin', -- 'round_robin', 'workload', 'manual'
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE MEMBROS DA EQUIPE (TEAM MEMBERS)
-- Vincula colaboradores internos ou externos, ramais e números de WhatsApp individuais
CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'leader', 'member'
  is_external BOOLEAN DEFAULT FALSE, -- FALSE = interno (escritório), TRUE = externo (remoto / home office)
  phone_number TEXT, -- WhatsApp ou telefone direto do atendente
  extension TEXT, -- Ramal do Discador WebRTC / VoIP (ex: "101", "102")
  status TEXT DEFAULT 'online', -- 'online', 'busy', 'in_call', 'break', 'offline'
  max_concurrent_leads INTEGER DEFAULT 15,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EXPANSÃO DE CAMPANHAS (CAMPAIGN_LINKS)
-- Associação direta de equipes e suporte a roleta de números de WhatsApp
ALTER TABLE public.campaign_links
ADD COLUMN IF NOT EXISTS assigned_team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL;

ALTER TABLE public.campaign_links
ADD COLUMN IF NOT EXISTS phone_numbers JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.campaign_links
ADD COLUMN IF NOT EXISTS rotation_mode TEXT DEFAULT 'round_robin'; -- 'single', 'round_robin', 'team_rotation'

-- 4. EXPANSÃO DE LEADS (LEADS)
-- Associação do lead ao vendedor e à equipe responsável
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS assigned_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS assigned_team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL;

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- 5. EXPANSÃO DE CHAMADAS (LEAD_CALLS)
-- Associação da chamada à equipe
ALTER TABLE public.lead_calls
ADD COLUMN IF NOT EXISTS team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL;

-- 6. EXPANSÃO DE USUÁRIOS (USERS)
-- Ramal, telefone e flag de colaborador externo
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS extension TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_external BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'online';

-- 7. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Permitir leitura e escrita em teams" 
  ON public.teams FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Permitir leitura e escrita em team_members" 
  ON public.team_members FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 8. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_teams_company 
ON public.teams(company_id, active);

CREATE INDEX IF NOT EXISTS idx_team_members_team 
ON public.team_members(team_id, active);

CREATE INDEX IF NOT EXISTS idx_team_members_user 
ON public.team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_leads_assigned_user 
ON public.leads(company_id, assigned_user_id);

CREATE INDEX IF NOT EXISTS idx_leads_assigned_team 
ON public.leads(company_id, assigned_team_id);

CREATE INDEX IF NOT EXISTS idx_campaign_links_team 
ON public.campaign_links(company_id, assigned_team_id);
