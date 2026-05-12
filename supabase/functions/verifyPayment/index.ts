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

    const { sessionId } = await req.json();
    const stripe = new Stripe(Deno.env.get('private_stripe')!);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const isValid = session.status === 'complete' &&
      (session.payment_status === 'paid' || session.payment_status === 'no_payment_required');

    if (isValid) {
      await supabase
        .from('profiles')
        .update({ paid: true })
        .eq('id', user.id);

      const { data: venues } = await supabase
        .from('venue_settings')
        .select('*')
        .eq('created_by', user.email);

      if (venues && venues.length > 0) {
        await supabase
          .from('venue_settings')
          .update({
            has_paid: true,
            subscription_status: 'active',
            stripe_customer_id: session.customer
          })
          .eq('id', venues[0].id);
      }

      return Response.json({ success: true }, { headers: corsHeaders });
    }

    return Response.json({
      success: false,
      error: 'Session not valid',
      session_status: session.status,
      payment_status: session.payment_status
    }, { status: 400, headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
