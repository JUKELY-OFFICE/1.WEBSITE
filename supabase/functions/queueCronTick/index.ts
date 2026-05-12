import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

Deno.serve(async (req) => {
  try {
    const expected = Deno.env.get('CRON_TOKEN');
    const got = req.headers.get('x-cron-secret');
    if (!expected || got !== expected) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any = {};
    try { body = await req.json(); } catch (_) {}
    const debug = body?.debug === true;

    const { data: venues } = await supabase
      .from('venue_settings')
      .select('*')
      .order('created_date', { ascending: false })
      .limit(2000);

    const spotifyVenues = (venues || []).filter((v: any) => v.venue_id && v.spotify_access_token);

    let processed = 0;
    let queued = 0;
    let skipped = 0;
    const errors: any[] = [];
    const debugDetails: any[] = [];

    for (const venue of spotifyVenues) {
      processed++;
      try {
        const res = await handleVenue(venue);
        if (res.status === 'queued') queued++;
        else skipped++;
        if (debug) {
          debugDetails.push({ venue_id: venue.venue_id, status: res.status, reason: res.reason, extra: res.extra || null });
        }
      } catch (e: any) {
        const err = { venue_id: venue.venue_id, error: String(e?.message ?? e) };
        errors.push(err);
        if (debug) {
          debugDetails.push({ venue_id: venue.venue_id, status: 'error', reason: 'exception', extra: { message: err.error } });
        }
      }
    }

    return Response.json({
      ok: true, processed, queued, skipped,
      errorsCount: errors.length,
      errors: errors.slice(0, 20),
      ...(debug ? { debugDetails } : {}),
      ts: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: String((error as any)?.message ?? error) }, { status: 500 });
  }
});

async function handleVenue(venue: any) {
  const venueId = venue.venue_id;

  if (!venue.spotify_access_token) return { status: 'skipped', reason: 'missing_access_token' };
  if (!venue.spotify_refresh_token) return { status: 'skipped', reason: 'missing_refresh_token' };

  if (venue.last_spotify_queue_push_time) {
    const delta = Date.now() - new Date(venue.last_spotify_queue_push_time).getTime();
    if (delta < 30000) {
      return { status: 'skipped', reason: 'recently_pushed', extra: { secondsAgo: Math.floor(delta / 1000) } };
    }
  }

  let accessToken = venue.spotify_access_token;
  if (venue.spotify_token_expires_at && new Date(venue.spotify_token_expires_at) < new Date()) {
    const refreshed = await refreshSpotifyToken(venue.spotify_refresh_token, venue.spotify_client_id, venue.spotify_client_secret);
    await supabase
      .from('venue_settings')
      .update({
        spotify_access_token: refreshed.access_token,
        spotify_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        ...(refreshed.refresh_token ? { spotify_refresh_token: refreshed.refresh_token } : {})
      })
      .eq('id', venue.id);
    accessToken = refreshed.access_token;
  }

  const playingRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (playingRes.status === 204) return { status: 'skipped', reason: 'spotify_204_no_content' };
  if (!playingRes.ok) {
    const txt = await playingRes.text().catch(() => '');
    return { status: 'skipped', reason: 'spotify_currently_playing_not_ok', extra: { status: playingRes.status, body: txt.slice(0, 120) } };
  }

  const data = await playingRes.json();
  if (!data?.is_playing || !data?.item) return { status: 'skipped', reason: 'not_playing' };

  const timeRemaining = data.item.duration_ms - data.progress_ms;
  if (timeRemaining > 25000) {
    return { status: 'skipped', reason: 'too_early', extra: { remainingSeconds: Math.floor(timeRemaining / 1000) } };
  }

  const { data: queuedSongs } = await supabase
    .from('song_queue')
    .select('*')
    .eq('venue_id', venueId)
    .eq('status', 'queued')
    .order('created_date', { ascending: true })
    .limit(2000);

  if (!queuedSongs || queuedSongs.length === 0) return { status: 'skipped', reason: 'empty_queue' };

  const priority = queuedSongs.filter((s: any) => s.is_priority);
  const nextSong = priority.length ? priority[0] : queuedSongs[0];

  if (!nextSong?.platform_song_id) return { status: 'skipped', reason: 'missing_platform_song_id' };

  const addRes = await fetch(
    `https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${nextSong.platform_song_id}`,
    { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!(addRes.ok || addRes.status === 204)) {
    const txt = await addRes.text().catch(() => '');
    throw new Error(`Spotify add-to-queue failed: ${addRes.status} ${txt.slice(0, 200)}`);
  }

  await supabase
    .from('venue_settings')
    .update({ last_spotify_queue_push_time: new Date().toISOString() })
    .eq('id', venue.id);

  await supabase.from('song_queue').delete().eq('id', nextSong.id);

  return { status: 'queued', reason: 'added_to_spotify' };
}

async function refreshSpotifyToken(refreshToken: string, clientIdOverride?: string, clientSecretOverride?: string) {
  const clientId = clientIdOverride || Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = clientSecretOverride || Deno.env.get('SPOTIFY_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('Missing Spotify env vars');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });
  if (!response.ok) {
    const txt = await response.text().catch(() => '');
    throw new Error('Failed to refresh token: ' + txt.slice(0, 200));
  }
  return await response.json();
}
