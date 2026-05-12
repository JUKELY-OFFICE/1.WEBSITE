import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } }
);

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state') ?? '';
    const errorParam = url.searchParams.get('error');

    if (errorParam) {
      return new Response(
        `<html><body><h1>Erreur de connexion</h1><p>La connexion à Spotify a été annulée.</p><script>window.close();</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code) {
      return new Response(JSON.stringify({ error: 'No authorization code provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const parts = state.split('|');
    const originFromState = parts[0] ?? '';
    const venueIdFromState = parts[1] ?? '';

    let clientId = Deno.env.get('SPOTIFY_CLIENT_ID') ?? '';
    let clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET') ?? '';
    const redirectUri = Deno.env.get('SPOTIFY_REDIRECT_URI') ?? '';

    if (venueIdFromState) {
      const { data: venueForCreds } = await supabase
        .from('venue_settings')
        .select('spotify_client_id, spotify_client_secret')
        .eq('venue_id', venueIdFromState)
        .single();
      if (venueForCreds?.spotify_client_id) clientId = venueForCreds.spotify_client_id;
      if (venueForCreds?.spotify_client_secret) clientSecret = venueForCreds.spotify_client_secret;
    }

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return new Response(
        `<html><body><h1>Erreur Spotify</h1><p>${errorData.error_description ?? errorData.error}</p><p>Redirect URI: ${redirectUri}</p><script>setTimeout(() => window.close(), 8000);</script></body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const tokens = await tokenResponse.json();
    const venueId = venueIdFromState;

    if (!venueId) {
      return new Response(
        `<html><body><h1>Erreur</h1><p>Venue manquante.</p><script>setTimeout(() => window.close(), 3000);</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const { data: venues } = await supabase
      .from('venue_settings')
      .select('id')
      .eq('venue_id', venueId);

    if (!venues || venues.length === 0) {
      return new Response(
        `<html><body><h1>Erreur</h1><p>Établissement non trouvé.</p><script>setTimeout(() => window.close(), 3000);</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    await supabase.from('venue_settings').update({
      spotify_access_token: tokens.access_token,
      spotify_refresh_token: tokens.refresh_token,
      spotify_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    }).eq('id', venues[0].id);

    const redirectBase = originFromState || 'https://jukely.uk';
    return Response.redirect(`${redirectBase}/dashboard?spotify_connected=true`, 302);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      `<html><body><h1>Erreur</h1><p>${msg}</p><script>setTimeout(() => window.close(), 5000);</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
});
