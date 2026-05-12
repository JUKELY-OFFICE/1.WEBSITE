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
    const { venueId, origin } = await req.json();
    if (!venueId) {
      return Response.json({ error: 'venueId is required' }, { status: 400, headers: corsHeaders });
    }

    const { data: venue } = await supabase
      .from('venue_settings')
      .select('spotify_client_id')
      .eq('venue_id', venueId)
      .single();

    const clientId = venue?.spotify_client_id || Deno.env.get('SPOTIFY_CLIENT_ID');
    const redirectUri = Deno.env.get('SPOTIFY_REDIRECT_URI');

    console.log('[spotifyAuth] clientId:', clientId ? clientId.slice(0, 8) + '...' : 'MISSING');
    console.log('[spotifyAuth] redirectUri:', redirectUri || 'MISSING');

    if (!clientId || !redirectUri) {
      return Response.json({ error: 'Spotify credentials not configured' }, { status: 500, headers: corsHeaders });
    }

    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
      'user-read-playback-state',
      'user-modify-playback-state'
    ].join(' ');

    const state = `${origin || ''}|${venueId}`;

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${encodeURIComponent(state)}`;

    return Response.json({ authUrl }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
