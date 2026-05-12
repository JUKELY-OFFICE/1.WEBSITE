-- ============================================================
-- Jukely - Schéma Supabase (migration depuis Base44)
-- ============================================================

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: venue_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS venue_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id TEXT UNIQUE NOT NULL,
  venue_name TEXT,
  created_by TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE,
  music_platform TEXT DEFAULT 'spotify',
  explicit_content_allowed BOOLEAN DEFAULT FALSE,
  priority_price NUMERIC DEFAULT 1,
  max_queue_songs_per_user INTEGER,
  spotify_access_token TEXT,
  spotify_refresh_token TEXT,
  spotify_token_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  allowed_playlists JSONB DEFAULT '[]',
  last_spotify_queue_push_time TIMESTAMPTZ,
  has_paid BOOLEAN DEFAULT FALSE,
  subscription_status TEXT
);

-- ============================================================
-- TABLE: song_queue
-- ============================================================
CREATE TABLE IF NOT EXISTS song_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id TEXT NOT NULL,
  song_title TEXT,
  artist TEXT,
  platform_song_id TEXT,
  album_cover TEXT,
  status TEXT DEFAULT 'queued', -- queued | playing | played | skipped
  is_priority BOOLEAN DEFAULT FALSE,
  requester_name TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER
);

CREATE INDEX IF NOT EXISTS idx_song_queue_venue_status ON song_queue (venue_id, status);
CREATE INDEX IF NOT EXISTS idx_song_queue_created ON song_queue (created_date);

-- ============================================================
-- TABLE: song_history
-- ============================================================
CREATE TABLE IF NOT EXISTS song_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id TEXT NOT NULL,
  song_title TEXT,
  artist TEXT,
  platform TEXT,
  album_cover TEXT,
  duration_seconds INTEGER,
  is_priority BOOLEAN DEFAULT FALSE,
  requester_name TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_song_history_venue ON song_history (venue_id);
CREATE INDEX IF NOT EXISTS idx_song_history_created ON song_history (created_date DESC);

-- ============================================================
-- TABLE: payment_log
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id TEXT NOT NULL,
  amount NUMERIC,
  song_title TEXT,
  artist TEXT,
  album_cover TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'pending', -- pending | completed | failed
  stripe_payment_intent_id TEXT,
  song_queue_id UUID,
  customer_email TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_log_venue ON payment_log (venue_id);
CREATE INDEX IF NOT EXISTS idx_payment_log_status ON payment_log (status);

-- ============================================================
-- TABLE: user_session
-- ============================================================
CREATE TABLE IF NOT EXISTS user_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  venue_id TEXT NOT NULL,
  searches_count INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_session_venue ON user_session (venue_id);

-- ============================================================
-- TABLE: venue_available_songs
-- ============================================================
CREATE TABLE IF NOT EXISTS venue_available_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id TEXT NOT NULL,
  platform_song_id TEXT,
  song_title TEXT,
  artist TEXT,
  album_cover TEXT,
  duration_seconds INTEGER,
  platform TEXT DEFAULT 'spotify'
);

CREATE INDEX IF NOT EXISTS idx_venue_songs_venue ON venue_available_songs (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_songs_platform_id ON venue_available_songs (platform_song_id);

-- ============================================================
-- TABLE: qr_code_order
-- ============================================================
CREATE TABLE IF NOT EXISTS qr_code_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id TEXT NOT NULL,
  recipient_name TEXT,
  address TEXT,
  formats JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending', -- pending | paid
  amount NUMERIC DEFAULT 25,
  stripe_session_id TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: profiles (utilisateurs Supabase Auth)
-- Stocke les infos supplémentaires liées à auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  paid BOOLEAN DEFAULT FALSE
);

-- Trigger pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- RLS (Row Level Security)
-- Pour commencer : désactivé sur les tables publiques (clients QR, sessions)
-- Les fonctions backend utilisent le service role key (bypass RLS)
-- ============================================================

ALTER TABLE venue_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_available_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_code_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies permissives pour commencer (service role bypass de toute façon)
-- Le frontend utilise anon key avec ces policies :

-- song_queue : lecture publique (les clients peuvent voir la file)
CREATE POLICY "song_queue_read_all" ON song_queue FOR SELECT USING (true);
CREATE POLICY "song_queue_insert_all" ON song_queue FOR INSERT WITH CHECK (true);

-- venue_available_songs : lecture publique (recherche de chansons)
CREATE POLICY "venue_songs_read_all" ON venue_available_songs FOR SELECT USING (true);

-- song_history : lecture publique
CREATE POLICY "song_history_read_all" ON song_history FOR SELECT USING (true);

-- user_session : écriture publique (tracking anonyme)
CREATE POLICY "user_session_all" ON user_session FOR ALL USING (true) WITH CHECK (true);

-- venue_settings : lecture publique (le client a besoin des settings de la venue)
CREATE POLICY "venue_settings_read_all" ON venue_settings FOR SELECT USING (true);

-- profiles : lecture du profil propre uniquement
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);
