// =====================================================================
// send-newsletter — lets an admin email every newsletter subscriber via
// Resend. Unlike send-enquiry-email (public, no-verify-jwt), this handles
// a bulk send to real customer addresses, so it re-checks — server-side,
// against the caller's own Supabase access token — that the requester is
// an admin before sending anything. The anon key alone never authorizes
// this: without a valid admin session it responds 401/403 and sends no
// mail at all.
//
// Deploy:  supabase functions deploy send-newsletter --no-verify-jwt
// Secrets: RESEND_API_KEY, ORDER_EMAIL_FROM, SUPABASE_URL,
//          SUPABASE_SERVICE_ROLE_KEY
// =====================================================================

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

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
      ARÍLÉ · Victoria Island, Lagos · hello@arile.ng<br/>
      To stop receiving these, reply and let us know.
    </p>
  </div>
</div>`;

async function sendOne(key: string, from: string, to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html })
  });
  return res.ok;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ message: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ message: 'Supabase service credentials are not configured.' }, 500);
  }

  // A service-role client so this function can read `profiles.is_admin` and
  // `newsletter_subscribers` regardless of the caller's own RLS grants —
  // but only *after* we've confirmed the caller is who the token says and
  // that they are, in fact, an admin.
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return json({ message: 'Missing authorization.' }, 401);

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) return json({ message: 'Invalid or expired session.' }, 401);

  const { data: profile } = await admin.
  from('profiles').
  select('is_admin').
  eq('id', userData.user.id).
  maybeSingle();

  if (!profile?.is_admin) return json({ message: 'Admin access required.' }, 403);

  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return json({ message: 'RESEND_API_KEY is not set.' }, 500);
  const from = Deno.env.get('ORDER_EMAIL_FROM') ?? 'ARÍLÉ <hello@arile.ng>';

  try {
    const { subject, message } = await req.json();
    if (!subject || !message) {
      return json({ message: 'subject and message are required.' }, 400);
    }

    const { data: subscribers, error: subsError } = await admin.
    from('newsletter_subscribers').
    select('email');

    if (subsError) return json({ message: subsError.message }, 500);
    if (!subscribers || subscribers.length === 0) {
      return json({ ok: true, sent: 0 });
    }

    const html = shell(`
      <div style="font-size:14px;line-height:1.8;color:#333;white-space:pre-wrap;">${message}</div>
    `);

    // Resend's free/starter tiers rate-limit to a couple of requests per
    // second, so this sends in small sequential batches rather than firing
    // every email at once.
    const BATCH_SIZE = 5;
    let sent = 0;
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((s: { email: string }) => sendOne(resendKey, from, s.email, subject, html))
      );
      sent += results.filter(Boolean).length;
    }

    return json({ ok: true, sent });
  } catch (error) {
    return json(
      { message: error instanceof Error ? error.message : 'Unexpected error.' },
      500
    );
  }
});
