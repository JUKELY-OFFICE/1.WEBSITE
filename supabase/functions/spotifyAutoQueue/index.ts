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
    if (!venue.spotify_refresh_token) {
      return Response.json({ error: 'Spotify refresh token missing' }, { status: 400, headers: corsHeaders });
    }

    if (venue.last_spotify_queue_push_time) {
      const lastPushTime = new Date(venue.last_spotify_queue_push_time).getTime();
      const timeSinceLastPush = Date.now() - lastPushTime;
      if (timeSinceLastPush < 30000) {
        return Response.json({
          message: 'Song was recently pushed, waiting...',
          timeSinceLastPush: Math.floor(timeSinceLastPush / 1000)
        }, { headers: corsHeaders });
      }
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

    if (response.status === 204 || !response.ok) {
      return Response.json({ message: 'No song playing' }, { headers: corsHeaders });
    }

    const data = await response.json();
    if (!data.is_playing || !data.item) {
      return Response.json({ message: 'No song playing' }, { headers: corsHeaders });
    }

    const timeRemaining = data.item.duration_ms - data.progress_ms;
    if (timeRemaining > 20000) {
      return Response.json({
        message: 'Not yet time to queue next song',
        timeRemaining: Math.floor(timeRemaining / 1000)
      }, { headers: corsHeaders });
    }

    const { data: queuedSongs } = await supabase
      .from('song_queue')
      .select('*')
      .eq('venue_id', venueId)
      .eq('status', 'queued')
      .order('created_date', { ascending: true });

    if (!queuedSongs || queuedSongs.length === 0) {
      return Response.json({ message: 'No songs in queue' }, { headers: corsHeaders });
    }

    const prioritySongs = queuedSongs.filter((s: any) => s.is_priority);
    const nextSong = prioritySongs.length > 0 ? prioritySongs[0] : queuedSongs[0];

    const addToQueueResponse = await fetch(
      `https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${nextSong.platform_song_id}`,
      { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (addToQueueResponse.ok || addToQueueResponse.status === 204) {
      await supabase
        .from('venue_settings')
        .update({ last_spotify_queue_push_time: new Date().toISOString() })
        .eq('id', venue.id);

      await supabase.from('song_queue').delete().eq('id', nextSong.id);

      return Response.json({
        message: 'Song added to Spotify queue and removed from Jukely',
        song: { title: nextSong.song_title, artist: nextSong.artist }
      }, { headers: corsHeaders });
    } else {
      return Response.json({ error: 'Failed to add to Spotify queue' }, { status: 400, headers: corsHeaders });
    }
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
