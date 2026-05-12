-- Vue publique de venue_settings (sans les tokens sensibles)
DROP VIEW IF EXISTS venue_settings_public;
CREATE VIEW venue_settings_public AS
SELECT
  id,
  venue_id,
  venue_name,
  is_active,
  music_platform,
  explicit_content_allowed,
  priority_price,
  max_queue_songs_per_user,
  allowed_playlists,
  subscription_status,
  has_paid
FROM venue_settings;

GRANT SELECT ON venue_settings_public TO anon;
GRANT SELECT ON venue_settings_public TO authenticated;

-- RLS policies pour venue_settings
DROP POLICY IF EXISTS "authenticated_read" ON venue_settings;
DROP POLICY IF EXISTS "authenticated_update" ON venue_settings;
DROP POLICY IF EXISTS "authenticated_insert" ON venue_settings;
DROP POLICY IF EXISTS "public_read" ON venue_settings;

CREATE POLICY "authenticated_read" ON venue_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_update" ON venue_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_insert" ON venue_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "public_read" ON venue_settings FOR SELECT TO anon USING (true);
