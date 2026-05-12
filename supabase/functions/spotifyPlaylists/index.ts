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
    if (!venueId) {
      return Response.json({ error: 'venueId required' }, { status: 400, headers: corsHeaders });
    }

    const { data: venues } = await supabase
      .from('venue_settings')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_date', { ascending: false })
      .limit(1);

    if (!venues || venues.length === 0 || !venues[0].spotify_access_token) {
      return Response.json({ error: 'Spotify not connected' }, { status: 400, headers: corsHeaders });
    }

    const venue = venues[0];

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
      venue.spotify_access_token = refreshedTokens.access_token;
    }

    const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: { 'Authorization': `Bearer ${venue.spotify_access_token}` }
    });

    if (!playlistsResponse.ok) {
      const errorData = await playlistsResponse.json();
      return Response.json({ error: 'Failed to fetch playlists', details: errorData }, { status: 500, headers: corsHeaders });
    }

    const data = await playlistsResponse.json();
    return Response.json({ playlists: data.items }, { headers: corsHeaders });
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
