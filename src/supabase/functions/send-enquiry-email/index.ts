// =====================================================================
// send-enquiry-email — notifies the studio of a contact / bespoke
// enquiry and sends the customer an acknowledgement, both via Resend.
// Deploy:  supabase functions deploy send-enquiry-email --no-verify-jwt
// Secrets: RESEND_API_KEY, ORDER_EMAIL_FROM, ORDER_EMAIL_TO
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

const shell = (inner: string) => `
<div style="background:#faf6ee;padding:40px 0;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:40px;">
    <p style="font-family:Georgia,serif;font-size:24px;letter-spacing:6px;margin:0 0 4px;">ARÍLÉ</p>
    <p style="color:#8a6d2f;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 32px;">
      African wear, timeless you
    </p>
    ${inner}
    <p style="margin-top:32px;color:#999;font-size:11px;">
      ARÍLÉ · Victoria Island, Lagos · hello@arile.ng
    </p>
  </div>
</div>`;

async function send(to: string, subject: string, html: string, replyTo?: string) {
  const key = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('ORDER_EMAIL_FROM') ?? 'ARÍLÉ <hello@arile.ng>';
  if (!key) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html, reply_to: replyTo })
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ message: 'Method not allowed' }, 405);

  try {
    const { name, email, phone, subject, message, type } = await req.json();

    if (!name || !email || !message) {
      return json({ message: 'name, email and message are required.' }, 400);
    }

    const label =
    type === 'bespoke' ? 'Bespoke' : type === 'aso_ebi' ? 'Aṣọ-ẹbí' : 'General';

    const studioInbox = Deno.env.get('ORDER_EMAIL_TO');
    if (studioInbox) {
      await send(
        studioInbox,
        `${label} enquiry — ${name}`,
        shell(`
          <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 20px;">New ${label.toLowerCase()} enquiry</h1>
          <table style="width:100%;font-size:14px;color:#444;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#888;width:90px;">Name</td><td>${name}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Email</td><td>${email}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Phone</td><td>${phone ?? '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Subject</td><td>${subject ?? '—'}</td></tr>
          </table>
          <div style="margin-top:20px;padding:18px;background:#faf6ee;font-size:14px;line-height:1.7;color:#333;white-space:pre-wrap;">${message}</div>
        `),
        email
      );
    }

    await send(
      email,
      'We have your message — ARÍLÉ',
      shell(`
        <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 14px;">Thank you, ${name}.</h1>
        <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 18px;">
          Your message reached the atelier. Someone from our team will reply within one
          working day — usually sooner.
        </p>
        <p style="color:#555;font-size:14px;line-height:1.7;margin:0;">
          If it is urgent, WhatsApp is the fastest way to reach us.
        </p>
      `)
    );

    return json({ ok: true });
  } catch (error) {
    return json(
      { message: error instanceof Error ? error.message : 'Unexpected error.' },
      500
    );
  }
});