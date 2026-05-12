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
    const { paymentIntentId, paymentLogId, songQueueId } = await req.json();

    if (!paymentIntentId) {
      return Response.json({ error: 'Payment intent ID required' }, { status: 400, headers: corsHeaders });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      if (paymentLogId) {
        await supabase
          .from('payment_log')
          .update({ status: 'completed', song_queue_id: songQueueId })
          .eq('id', paymentLogId);
      }
      return Response.json({ success: true, status: 'succeeded' }, { headers: corsHeaders });
    } else {
      if (paymentLogId && paymentIntent.status === 'canceled') {
        await supabase
          .from('payment_log')
          .update({ status: 'failed' })
          .eq('id', paymentLogId);
      }
      return Response.json({ success: false, status: paymentIntent.status }, { headers: corsHeaders });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
