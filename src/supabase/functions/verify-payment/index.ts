// =====================================================================
// verify-payment — confirms a Korapay charge, marks the order paid and
// sends the customer receipt + studio notification through Resend.
// Deploy:  supabase functions deploy verify-payment --no-verify-jwt
// Secrets: KORAPAY_SECRET_KEY, RESEND_API_KEY, ORDER_EMAIL_FROM,
//          ORDER_EMAIL_TO, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// =====================================================================

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

const naira = (n: number) => `₦${Number(n).toLocaleString('en-NG')}`;

/* eslint-disable @typescript-eslint/no-explicit-any */
function receiptHtml(order: any) {
  const rows = (order.items ?? []).
  map(
    (i: any) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;">
          <strong style="font-family:Georgia,serif;font-size:16px;">${i.name}</strong><br/>
          <span style="color:#777;font-size:12px;">${i.size} · ${i.color} · ×${i.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;">
          ${naira(i.price * i.quantity)}
        </td>
      </tr>`
  ).
  join('');

  return `
  <div style="background:#faf6ee;padding:40px 0;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;padding:40px;">
      <p style="font-family:Georgia,serif;font-size:26px;letter-spacing:6px;margin:0 0 4px;">ARÍLÉ</p>
      <p style="color:#8a6d2f;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 32px;">
        African wear, timeless you
      </p>

      <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 12px;">Thank you, ${
  order.customer?.fullName ?? 'friend'}.</h1>
      <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 28px;">
        Your payment has cleared and your order is confirmed. We will be in touch about
        dispatch — or fittings, if your piece is being made for you.
      </p>

      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;margin:0 0 4px;">Order reference</p>
      <p style="font-family:Georgia,serif;font-size:22px;color:#8a6d2f;margin:0 0 28px;">${
  order.reference}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:8px;">
        <tr><td style="padding:6px 0;color:#777;">Subtotal</td><td style="text-align:right;">${naira(order.subtotal)}</td></tr>
        <tr><td style="padding:6px 0;color:#777;">Delivery</td><td style="text-align:right;">${
  Number(order.shipping) === 0 ? 'Free' : naira(order.shipping)}</td></tr>
        <tr><td style="padding:14px 0 0;font-weight:bold;">Total</td>
            <td style="text-align:right;padding:14px 0 0;font-family:Georgia,serif;font-size:20px;">${
  naira(order.total)}</td></tr>
      </table>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #eee;color:#777;font-size:12px;line-height:1.7;">
        <strong style="color:#333;">Delivering to</strong><br/>
        ${order.customer?.address ?? ''}<br/>
        ${order.customer?.city ?? ''}, ${order.customer?.state ?? ''}<br/>
        ${order.customer?.phone ?? ''}
      </div>

      <p style="margin-top:32px;color:#999;font-size:11px;">
        ARÍLÉ · Victoria Island, Lagos · hello@arile.ng
      </p>
    </div>
  </div>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const key = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('ORDER_EMAIL_FROM') ?? 'ARÍLÉ <orders@arile.ng>';
  if (!key) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html })
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const url = new URL(req.url);
  const reference = url.searchParams.get('reference');
  if (!reference) return json({ message: 'reference is required.' }, 400);

  const secretKey = Deno.env.get('KORAPAY_SECRET_KEY');
  if (!secretKey) return json({ message: 'KORAPAY_SECRET_KEY is not set.' }, 500);

  try {
    const res = await fetch(
      `https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const payload = await res.json();

    const koraStatus = payload?.data?.status as string | undefined;
    const status =
    koraStatus === 'success' ?
    'success' :
    koraStatus === 'processing' || koraStatus === 'pending' ?
    'pending' :
    'failed';

    // Mark the order paid and send receipts — once.
    if (status === 'success') {
      const admin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const { data: order } = await admin.
      from('orders').
      select('*').
      eq('reference', reference).
      maybeSingle();

      if (order && order.status === 'pending') {
        await admin.
        from('orders').
        update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_ref: payload?.data?.payment_reference ?? reference
        }).
        eq('reference', reference);

        const html = receiptHtml(order);
        await sendEmail(order.customer.email, `Your ARÍLÉ order ${reference}`, html);

        const studioInbox = Deno.env.get('ORDER_EMAIL_TO');
        if (studioInbox) {
          await sendEmail(
            studioInbox,
            `New order ${reference} — ${naira(order.total)}`,
            html
          );
        }
      }
    }

    return json({ status, reference });
  } catch (error) {
    return json(
      { message: error instanceof Error ? error.message : 'Unexpected error.' },
      500
    );
  }
});