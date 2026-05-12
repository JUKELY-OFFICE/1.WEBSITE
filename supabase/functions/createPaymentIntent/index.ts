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
    const { priceId, venueId, songData } = await req.json();

    if (!priceId) {
      return Response.json({ error: 'Price ID required' }, { status: 400, headers: corsHeaders });
    }

    const price = await stripe.prices.retrieve(priceId);
    if (!price || !price.active) {
      return Response.json({ error: 'Price not found or inactive' }, { status: 404, headers: corsHeaders });
    }

    const amount = price.unit_amount;
    const currency = price.currency;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        venue_id: venueId,
        song_title: songData?.title || '',
        song_artist: songData?.artist || '',
        song_id: songData?.id || '',
        album_cover: songData?.album_cover || '',
      },
    });

    const { data: paymentLog } = await supabase
      .from('payment_log')
      .insert({
        venue_id: venueId,
        amount: amount / 100,
        song_title: songData?.title || 'Titre inconnu',
        artist: songData?.artist || 'Artiste inconnu',
        album_cover: songData?.album_cover || '',
        payment_method: 'card',
        status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
      })
      .select()
      .single();

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      currency,
      label: 'Chanson prioritaire',
      paymentLogId: paymentLog?.id,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
