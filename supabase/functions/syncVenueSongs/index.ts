import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const { venueId } = await req.json();

    const { data: venues } = await supabase
      .from('venue_settings')
      .select('*')
      .eq('venue_id', venueId);

    if (!venues || venues.length === 0) {
      return Response.json({ error: 'Venue not found' }, { status: 404, headers: corsHeaders });
    }
    const venue = venues[0];

    await supabase.from('venue_available_songs').delete().eq('venue_id', venueId);

    if (!venue.allowed_playlists || venue.allowed_playlists.length === 0) {
      return Response.json({
        success: true,
        message: 'All music mode enabled - no songs stored',
        songsCount: 0
      }, { headers: corsHeaders });
    }

    let spotifyAccessToken = venue.spotify_access_token;
    if (!spotifyAccessToken) {
      return Response.json({ error: 'Spotify not connected' }, { status: 400, headers: corsHeaders });
    }

    // Refresh token if expired
    if (venue.spotify_token_expires_at && new Date(venue.spotify_token_expires_at) < new Date()) {
      const refreshed = await refreshSpotifyToken(venue.spotify_refresh_token, venue.spotify_client_id, venue.spotify_client_secret);
      spotifyAccessToken = refreshed.access_token;
      await supabase.from('venue_settings').update({
        spotify_access_token: refreshed.access_token,
        spotify_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        ...(refreshed.refresh_token ? { spotify_refresh_token: refreshed.refresh_token } : {})
      }).eq('id', venue.id);
    }

    const allSongs: any[] = [];
    const errors: string[] = [];

    for (const playlistId of venue.allowed_playlists) {
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=100`,
          { headers: { 'Authorization': `Bearer ${spotifyAccessToken}` } }
        );

        if (!response.ok) {
          const errBody = await response.text().catch(() => '');
          const errMsg = `Playlist ${playlistId}: HTTP ${response.status} - ${errBody}`;
          console.error(errMsg);
          errors.push(errMsg);
          break;
        }

        const data = await response.json();
        const tracks = data.items
          .filter((item: any) => item.track && !item.track.is_local)
          .map((item: any) => ({
            id: item.track.id,
            title: item.track.name,
            artist: item.track.artists.map((a: any) => a.name).join(', '),
            cover: item.track.album.images[0]?.url || '',
            duration: Math.floor(item.track.duration_ms / 1000)
          }));

        allSongs.push(...tracks);
        hasMore = data.next !== null;
        offset += 100;

        if (allSongs.length > 10000) break;
      }
    }

    const songsToCreate = allSongs.map(song => ({
      venue_id: venueId,
      platform_song_id: song.id,
      song_title: song.title,
      artist: song.artist,
      album_cover: song.cover,
      duration_seconds: song.duration || 180,
      platform: venue.music_platform || 'spotify'
    }));

    const batchSize = 100;
    for (let i = 0; i < songsToCreate.length; i += batchSize) {
      const batch = songsToCreate.slice(i, i + batchSize);
      await supabase.from('venue_available_songs').insert(batch);
    }

    return Response.json({
      success: errors.length === 0,
      message: errors.length > 0
        ? `Synced ${allSongs.length} songs. Errors: ${errors.join(' | ')}`
        : `Successfully synced ${allSongs.length} songs`,
      songsCount: allSongs.length,
      errors
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error syncing venue songs:', error);
    return Response.json({ error: (error as any).message }, { status: 500, headers: corsHeaders });
  }
});

async function refreshSpotifyToken(refreshToken: string, clientIdOverride?: string, clientSecretOverride?: string) {
  const clientId = clientIdOverride || Deno.env.get('SPOTIFY_CLIENT_ID') || '';
  const clientSecret = clientSecretOverride || Deno.env.get('SPOTIFY_CLIENT_SECRET') || '';
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });
  if (!response.ok) throw new Error('Failed to refresh Spotify token');
  return await response.json();
}
