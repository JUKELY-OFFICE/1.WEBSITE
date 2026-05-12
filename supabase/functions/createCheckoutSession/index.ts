import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.12.0';

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
    const authHeader = req.headers.get('Authorization');
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '')
    );
    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { userEmail } = await req.json();
    const stripe = new Stripe(Deno.env.get('private_stripe')!);

    let { data: venues } = await supabase
      .from('venue_settings')
      .select('*')
      .eq('created_by', userEmail);

    let venue;
    if (!venues || venues.length === 0) {
      const venueId = 'venue_' + Math.random().toString(36).substr(2, 9);
      const { data: newVenue } = await supabase
        .from('venue_settings')
        .insert({ venue_id: venueId, venue_name: 'Mon établissement', created_by: userEmail })
        .select()
        .single();
      venue = newVenue;
    } else {
      venue = venues[0];
    }

    let customerId = venue.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { venue_id: venue.venue_id }
      });
      customerId = customer.id;
      await supabase
        .from('venue_settings')
        .update({ stripe_customer_id: customerId })
        .eq('id', venue.id);
    }

    const priceId = Deno.env.get('STRIPE_PRICE_ID');
    if (!priceId) throw new Error('STRIPE_PRICE_ID not configured');

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 30 },
      success_url: `${req.headers.get('origin')}/subscriptionsuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/subscription`,
      metadata: { venue_id: venue.venue_id, user_email: userEmail }
    });

    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
