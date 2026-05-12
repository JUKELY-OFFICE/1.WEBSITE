import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');
const PLAYLIST_ID = '2MPlQa7ZFzdCEHak1w7isT';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getSpotifyAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
    },
    body: 'grant_type=client_credentials'
  });
  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get('Authorization');
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '')
    );
    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const accessToken = await getSpotifyAccessToken();

    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=50`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!playlistResponse.ok) {
      throw new Error('Failed to fetch playlist');
    }

    const playlistData = await playlistResponse.json();
    const tracks = playlistData.items.filter((item: any) => item.track && item.track.id);

    const shuffled = tracks.sort(() => Math.random() - 0.5);
    const randomTracks = shuffled.slice(0, 20);

    const formattedTracks = randomTracks.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map((a: any) => a.name).join(', '),
      album: { images: item.track.album.images },
      duration_ms: item.track.duration_ms,
      uri: item.track.uri
    }));

    return Response.json({ tracks: formattedTracks }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
