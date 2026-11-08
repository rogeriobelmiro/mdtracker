-- ==============================================================================
-- MDTRACKER: MIGRAÇÃO - TABELA SETTINGS (SMTP E SMS GATEWAY)
-- ==============================================================================

-- 1. Garantir colunas de SMTP na tabela settings
ALTER TABLE IF EXISTS settings 
ADD COLUMN IF NOT EXISTS smtp_host TEXT,
ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 465,
ADD COLUMN IF NOT EXISTS smtp_user TEXT,
ADD COLUMN IF NOT EXISTS smtp_pass TEXT,
ADD COLUMN IF NOT EXISTS smtp_from_name TEXT,
ADD COLUMN IF NOT EXISTS smtp_from_email TEXT,
ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT TRUE;

-- 2. Garantir colunas de SMS Gateway na tabela settings
ALTER TABLE IF EXISTS settings 
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_provider TEXT DEFAULT 'z_api',
ADD COLUMN IF NOT EXISTS sms_api_key TEXT,
ADD COLUMN IF NOT EXISTS sms_api_url TEXT,
ADD COLUMN IF NOT EXISTS sms_sender_id TEXT;

-- 3. Registro no histórico de migrações (atualiza_bd)
INSERT INTO atualiza_bd (id, versao, descricao, executado_em, created_at, numero) 
VALUES (
  81, 
  '2.1.1', 
  'Adicionadas colunas sms_api_url, sms_sender_id e garantia de integridade nas configurações SMTP e SMS na tabela settings', 
  NOW(), 
  NOW(), 
  '81'
)
ON CONFLICT (id) DO UPDATE 
SET descricao = EXCLUDED.descricao, 
    executado_em = NOW();

