-- ==============================================================================
-- MDTRACKER: MIGRAÇÃO - VSL PITCH DELAY & PLAYER BLINDADO (SIMULAR HOSPEDAGEM PRÓPRIA)
-- ==============================================================================

-- 1. Ampliação da tabela de Landing Pages com pitch_delay, blocks, thank_you_page, custom_domain e published
ALTER TABLE IF EXISTS landing_pages 
ADD COLUMN IF NOT EXISTS pitch_delay JSONB DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS landing_pages 
ADD COLUMN IF NOT EXISTS thank_you_page JSONB DEFAULT '{
  "enabled": true,
  "title": "🎉 Cadastro Confirmado!",
  "subtitle": "Veja os próximos passos abaixo:",
  "badge": "Acesso Liberado",
  "showCheckmark": true,
  "buttons": []
}'::jsonb;

ALTER TABLE IF EXISTS landing_pages 
ADD COLUMN IF NOT EXISTS custom_domain TEXT;

ALTER TABLE IF EXISTS landing_pages 
ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]'::jsonb;

ALTER TABLE IF EXISTS landing_pages 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;

-- 2. Garantir índices de performance para consultas por empresa e slug
CREATE INDEX IF NOT EXISTS idx_landing_pages_company_id ON landing_pages(company_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);

-- 3. Registro no histórico de migrações (atualiza_bd)
INSERT INTO atualiza_bd (id, versao, descricao, executado_em, created_at, numero) 
VALUES (
  80, 
  '2.1.0', 
  'Atualização de Landing Pages: suporte a VSL Pitch Delay, Player Blindado Anti-Fuga, Autoplay e Ocultação de Controles', 
  NOW(), 
  NOW(), 
  '80'
)
ON CONFLICT (id) DO UPDATE 
SET descricao = EXCLUDED.descricao, 
    executado_em = NOW();
