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
      .eq('venue_id', venueId)
      .order('created_date', { ascending: false })
      .limit(1);

    if (!venues || venues.length === 0) {
      return Response.json({ error: 'Venue not found' }, { status: 404, headers: corsHeaders });
    }
    const venue = venues[0];

    if (!venue.spotify_access_token) {
      return Response.json({ error: 'Spotify not connected' }, { status: 400, headers: corsHeaders });
    }

    let accessToken = venue.spotify_access_token;
    if (venue.spotify_token_expires_at && new Date(venue.spotify_token_expires_at) < new Date()) {
      const refreshedTokens = await refreshSpotifyToken(venue.spotify_refresh_token);
      await supabase
        .from('venue_settings')
        .update({
          spotify_access_token: refreshedTokens.access_token,
          spotify_token_expires_at: new Date(Date.now() + refreshedTokens.expires_in * 1000).toISOString(),
          ...(refreshedTokens.refresh_token ? { spotify_refresh_token: refreshedTokens.refresh_token } : {})
        })
        .eq('id', venue.id);
      accessToken = refreshedTokens.access_token;
    }

    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const playerResponse = await fetch('https://api.spotify.com/v1/me/player', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const playerData = playerResponse.ok ? await playerResponse.json() : null;

    const devicesResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const devicesData = devicesResponse.ok ? await devicesResponse.json() : null;

    if (response.status === 204 || !response.ok) {
      return Response.json({ isPlaying: false, track: null, debug: { playerData, devicesData } }, { headers: corsHeaders });
    }

    const data = await response.json();

    if (!data.is_playing || !data.item) {
      return Response.json({ isPlaying: false, track: null, debug: { playerData, devicesData } }, { headers: corsHeaders });
    }

    const track = {
      title: data.item.name,
      artist: data.item.artists.map((artist: any) => artist.name).join(', '),
      cover: data.item.album.images[0]?.url || '',
      duration_ms: data.item.duration_ms,
      progress_ms: data.progress_ms,
      isPlaying: data.is_playing
    };

    return Response.json({ isPlaying: true, track, debug: { playerData, devicesData } }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});

async function refreshSpotifyToken(refreshToken: string) {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken })
  });
  if (!response.ok) throw new Error('Failed to refresh token');
  return await response.json();
}
