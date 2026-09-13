// =====================================================================
// korapay-webhook — server-to-server confirmation from Korapay.
// This is the source of truth for payment status: it fires even if the
// customer closes the tab before being redirected back.
//
// Deploy:  supabase functions deploy korapay-webhook --no-verify-jwt
// Secrets: KORAPAY_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Then register the URL in the Korapay dashboard under Settings → API.
// =====================================================================

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { createHmac } from 'node:crypto';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

serve(async (req) => {
  if (req.method !== 'POST') return json({ message: 'Method not allowed' }, 405);

  const secretKey = Deno.env.get('KORAPAY_SECRET_KEY');
  if (!secretKey) return json({ message: 'KORAPAY_SECRET_KEY is not set.' }, 500);

  const raw = await req.text();

  // Korapay signs the `data` object with HMAC SHA-256 using your secret key.
  const signature = req.headers.get('x-korapay-signature');
  let body: Record<string, unknown>;

  try {
    body = JSON.parse(raw);
  } catch {
    return json({ message: 'Invalid JSON.' }, 400);
  }

  const expected = createHmac('sha256', secretKey).
  update(JSON.stringify((body as {data?: unknown;}).data ?? {})).
  digest('hex');

  if (!signature || signature !== expected) {
    return json({ message: 'Invalid signature.' }, 401);
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const event = body as any;
  const reference = event?.data?.reference as string | undefined;

  if (!reference) return json({ message: 'No reference in payload.' }, 400);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  if (event.event === 'charge.success') {
    await admin.
    from('orders').
    update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_ref: event?.data?.payment_reference ?? reference
    }).
    eq('reference', reference).
    eq('status', 'pending');
  }

  if (event.event === 'charge.failed') {
    await admin.
    from('orders').
    update({ status: 'cancelled' }).
    eq('reference', reference).
    eq('status', 'pending');
  }

  return json({ received: true });
});