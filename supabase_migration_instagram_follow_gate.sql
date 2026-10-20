-- ==============================================================================
-- MDTRACKER: Migração para Follow-Gate & Post Relacionado no Instagram Auto-DM
-- ==============================================================================

ALTER TABLE public.instagram_comment_automations 
ADD COLUMN IF NOT EXISTS follow_gate_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE public.instagram_comment_automations 
ADD COLUMN IF NOT EXISTS follow_gate_config JSONB;

ALTER TABLE public.instagram_comment_automations 
ADD COLUMN IF NOT EXISTS related_post_promotion JSONB;

-- ==============================================================================
-- MDTRACKER: Configurações de Conexão com o Instagram Oficial (Meta Graph API)
-- ==============================================================================

ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS instagram_config JSONB;

ALTER TABLE public.instagram_comment_logs
ADD COLUMN IF NOT EXISTS error_message TEXT;
