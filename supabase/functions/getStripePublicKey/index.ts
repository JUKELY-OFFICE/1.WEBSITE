const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const publicKey = Deno.env.get('public_stripe');
    if (!publicKey) {
      return Response.json({ error: 'Public key not configured' }, { status: 500, headers: corsHeaders });
    }
    return Response.json({ publicKey }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
