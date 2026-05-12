import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

const cache = new Map();
const CACHE_TTL = 3 * 60 * 60 * 1000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getCacheKey(venueId: string, playlists: string[]) {
  return `${venueId}:${[...playlists].sort().join(',')}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const { venueId, offset = 0 } = await req.json();

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
      return Response.json({ error: 'Spotify not connected for this venue' }, { status: 400, headers: corsHeaders });
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

    if (!venue.allowed_playlists || venue.allowed_playlists.length === 0) {
      return Response.json({ songs: [], hasMore: false, nextOffset: offset }, { headers: corsHeaders });
    }

    const cacheKey = getCacheKey(venueId, venue.allowed_playlists);
    const cached = cache.get(cacheKey);

    let uniqueTracks;
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      uniqueTracks = cached.tracks;
    } else {
      const fields = 'items(track(id,name,artists(name),duration_ms,album(images))),next';
      const playlistPromises = venue.allowed_playlists.map(async (playlistId: string) => {
        const tracks = [];
        let next = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&fields=${fields}`;
        while (next) {
          const playlistResponse = await fetch(next, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (!playlistResponse.ok) { console.error(`Failed to fetch playlist ${playlistId}`); break; }
          const data = await playlistResponse.json();
          tracks.push(...data.items.map((item: any) => item.track).filter((track: any) => track !== null));
          next = data.next;
        }
        return tracks;
      });
      const allPlaylistTracks = await Promise.all(playlistPromises);
      const allTracks = allPlaylistTracks.flat();
      uniqueTracks = Array.from(new Map(allTracks.map((track: any) => [track.id, track])).values());
      cache.set(cacheKey, { tracks: uniqueTracks, timestamp: Date.now() });
    }

    const limit = 50;
    const paginatedTracks = uniqueTracks.slice(offset, offset + limit);
    const hasMore = offset + limit < uniqueTracks.length;

    const songs = paginatedTracks.map((track: any) => {
      const images = track.album?.images || [];
      const smallestImage = images.length > 0 ? images[images.length - 1].url : '';
      return {
        id: track.id,
        title: track.name,
        artist: track.artists.map((artist: any) => artist.name).join(', '),
        cover: smallestImage,
        duration: Math.floor(track.duration_ms / 1000)
      };
    });

    return Response.json({ songs, hasMore, nextOffset: offset + limit, total: uniqueTracks.length }, { headers: corsHeaders });
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
