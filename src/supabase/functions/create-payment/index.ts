// =====================================================================
// create-payment — opens a Korapay charge and returns the checkout URL.
// Deploy:  supabase functions deploy create-payment --no-verify-jwt
// Secrets: KORAPAY_SECRET_KEY, SITE_URL
// =====================================================================

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ message: 'Method not allowed' }, 405);

  const secretKey = Deno.env.get('KORAPAY_SECRET_KEY');
  const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';

  if (!secretKey) {
    return json({ message: 'KORAPAY_SECRET_KEY is not set on this project.' }, 500);
  }

  try {
    const { reference, amount, customer, items } = await req.json();

    if (!reference || !amount || !customer?.email) {
      return json({ message: 'reference, amount and customer.email are required.' }, 400);
    }

    const response = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reference,
        // Korapay expects the major unit for NGN charges
        amount: Number(amount),
        currency: 'NGN',
        narration: `ARÍLÉ order ${reference}`,
        channels: ['card', 'bank_transfer', 'pay_with_bank'],
        default_channel: 'card',
        redirect_url: `${siteUrl}/order/${reference}`,
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/korapay-webhook`,
        customer: {
          name: customer.fullName,
          email: customer.email
        },
        metadata: {
          reference,
          item_count: String(Array.isArray(items) ? items.length : 0),
          phone: customer.phone ?? '',
          city: customer.city ?? '',
          state: customer.state ?? ''
        }
      })
    });

    const payload = await response.json();

    if (!response.ok || !payload?.status) {
      return json(
        { message: payload?.message ?? 'Korapay rejected the charge.' },
        response.status === 200 ? 400 : response.status
      );
    }

    return json({ checkoutUrl: payload.data.checkout_url, reference });
  } catch (error) {
    return json(
      { message: error instanceof Error ? error.message : 'Unexpected error.' },
      500
    );
  }
});