import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.5.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

const stripe = new Stripe(Deno.env.get('private_stripe')!, {
  apiVersion: '2024-12-18.acacia',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { venueId, recipientName, address, formats } = await req.json();

    if (!venueId || !recipientName || !address || !formats || formats.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
    }

    const { data: order } = await supabase
      .from('qr_code_order')
      .insert({
        venue_id: venueId,
        recipient_name: recipientName,
        address: address,
        formats: formats,
        status: 'pending',
        amount: 25
      })
      .select()
      .single();

    const baseUrl = Deno.env.get('SPOTIFY_REDIRECT_URI')!.replace('/api/spotifyCallback', '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: 'price_1Sjak4FPNRjlhl2LCG0DM4ij', quantity: 1 }],
      mode: 'payment',
      success_url: `${baseUrl}/Dashboard?qr_order_success=true`,
      cancel_url: `${baseUrl}/Dashboard?qr_order_cancelled=true`,
      metadata: {
        order_id: order?.id,
        venue_id: venueId,
        recipient_name: recipientName,
        formats: formats.join(', '),
        type: 'qr_code_order'
      }
    });

    await supabase
      .from('qr_code_order')
      .update({ stripe_session_id: session.id })
      .eq('id', order?.id);

    return Response.json({ sessionUrl: session.url, orderId: order?.id }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating QR code checkout:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
