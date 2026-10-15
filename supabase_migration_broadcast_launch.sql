-- ==============================================================================
-- MDTracker - Migração de Banco de Dados: Lançamentos Multicanal & Rastreamento
-- ==============================================================================
-- Instruções:
-- 1. Abra o painel do Supabase do seu projeto (https://supabase.com/dashboard)
-- 2. No menu lateral esquerdo, clique em "SQL Editor"
-- 3. Cole o script abaixo e clique em "Run" (Executar)
-- ==============================================================================

-- 1. Atualizar tabela broadcast_campaigns com suporte a Multicanal, Agendamento e Rastreamento
ALTER TABLE public.broadcast_campaigns
  ADD COLUMN IF NOT EXISTS channels JSONB DEFAULT '["email"]'::jsonb,
  ADD COLUMN IF NOT EXISTS recipients JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cta_url TEXT,
  ADD COLUMN IF NOT EXISTS cta_text TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sms_scheduled_at TIMESTAMPTZ;

-- 2. Garantir coluna de eventos e histórico nos leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS conversion_events JSONB DEFAULT '[]'::jsonb;

-- 3. Índices para performance em buscas e disparos agendados
CREATE INDEX IF NOT EXISTS idx_broadcast_campaigns_status ON public.broadcast_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_broadcast_campaigns_scheduled_at ON public.broadcast_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_broadcast_campaigns_company_id ON public.broadcast_campaigns(company_id);
