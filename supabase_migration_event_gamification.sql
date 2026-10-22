-- ==============================================================================
-- MDTRACKER EVENT GAMIFICATION & LIVE LEAD CAPTURE MIGRATION
-- Nuvem de Palavras, Múltipla Escolha, Quiz Competitivo, Q&A, Sorteador & Telão
-- ==============================================================================

CREATE TABLE IF NOT EXISTS gamification_events (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    pin_code TEXT NOT NULL,
    description TEXT,
    theme JSONB DEFAULT '{"primaryColor": "#8b5cf6", "backgroundColor": "#1e1b4b", "accentColor": "#06b6d4"}'::jsonb,
    status TEXT NOT NULL DEFAULT 'live', -- 'draft', 'live', 'finished'
    current_activity_id TEXT,
    require_phone BOOLEAN DEFAULT true,
    require_email BOOLEAN DEFAULT false,
    require_company BOOLEAN DEFAULT false,
    require_role BOOLEAN DEFAULT false,
    lead_magnet_url TEXT, -- Link para download de material ou slides após cadastro
    settings JSONB DEFAULT '{"allowAnonymous": false, "showLiveCount": true, "enableSounds": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gamification_events_company_id ON gamification_events(company_id);
CREATE INDEX IF NOT EXISTS idx_gamification_events_pin_code ON gamification_events(pin_code);
CREATE INDEX IF NOT EXISTS idx_gamification_events_slug ON gamification_events(slug);

CREATE TABLE IF NOT EXISTS gamification_activities (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES gamification_events(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'word_cloud', 'multiple_choice', 'quiz', 'qa', 'lucky_draw', 'true_false', 'open_text', 'ranking'
    title TEXT NOT NULL,
    subtitle TEXT,
    options JSONB DEFAULT '[]'::jsonb,
    correct_option_id TEXT,
    time_limit_seconds INT DEFAULT 30,
    points INT DEFAULT 100,
    order_index INT DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'revealed', 'closed'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gamification_activities_event_id ON gamification_activities(event_id);

CREATE TABLE IF NOT EXISTS gamification_participants (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES gamification_events(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_gamification_participants_event_id ON gamification_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_gamification_participants_phone ON gamification_participants(phone);

CREATE TABLE IF NOT EXISTS gamification_responses (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL REFERENCES gamification_activities(id) ON DELETE CASCADE,
    participant_id TEXT NOT NULL REFERENCES gamification_participants(id) ON DELETE CASCADE,
    response_data JSONB NOT NULL,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gamification_responses_activity_id ON gamification_responses(activity_id);
CREATE INDEX IF NOT EXISTS idx_gamification_responses_participant_id ON gamification_responses(participant_id);
