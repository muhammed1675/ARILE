import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { SITE } from '../data/site';

const sections: {title: string;body: React.ReactNode;}[] = [
{
  title: '1. Agreement to these terms',
  body:
  <p>
      By browsing this website or placing an order with {SITE.name}, you agree to these
      Terms & Conditions. If you do not agree, please do not use the site or place an
      order.
    </p>

},
{
  title: '2. Products and pricing',
  body:
  <p>
      All prices are shown in Nigerian Naira (₦) and include applicable duties within
      Nigeria. We reserve the right to correct pricing errors and to change prices at
      any time, though a change will never affect an order you have already paid for.
      Because many pieces are cut and embroidered by hand, small variations in colour,
      pattern placement and fabric grain between the photograph and the finished piece
      are normal and are not considered defects.
    </p>

},
{
  title: '3. Orders and payment',
  body:
  <p>
      Placing an order is an offer to buy, which we accept once payment is confirmed.
      Payments are processed by Korapay; we never see or store your full card details.
      An order is only confirmed once you receive an email confirmation and its status
      shows as paid — a redirect back to our site alone does not guarantee this, which
      is why every payment is independently confirmed with Korapay before an order is
      marked paid.
    </p>

},
{
  title: '4. Made-to-order and bespoke pieces',
  body:
  <p>
      Bespoke and made-to-order pieces are cut specifically for you once measurements
      are confirmed, and cannot be cancelled once production has started. Lead times
      quoted on the product page and in the bespoke enquiry process are estimates, not
      guarantees — we will tell you as soon as we know if a piece will run later than
      quoted.
    </p>

},
{
  title: '5. Shipping and delivery',
  body:
  <p>
      Delivery times vary by destination and are shown at checkout. Risk in the goods
      passes to you once a piece is handed to our courier. We are not responsible for
      delays caused by customs processing, incorrect address details you provided, or
      events outside our reasonable control.
    </p>

},
{
  title: '6. Returns and exchanges',
  body:
  <p>
      Ready-to-wear pieces in original, unworn condition with tags attached may be
      returned within 7 days of delivery for a store credit or exchange — contact us
      first via the details below to arrange it. Because they are cut to your
      measurements, bespoke and made-to-order pieces can only be returned if the piece
      does not match the specification you approved. Items marked "final sale" cannot be
      returned.
    </p>

},
{
  title: '7. Accounts',
  body:
  <p>
      You are responsible for keeping your account credentials confidential and for all
      activity under your account. A phone number is required on every account so we can
      reach you about an order — accounts created without one (for example through
      Google sign-in) will be asked to add one before continuing. Tell us immediately if
      you believe your account has been accessed without your permission.
    </p>

},
{
  title: '8. Intellectual property',
  body:
  <p>
      All photography, designs, text and the {SITE.name} name and mark on this site
      belong to {SITE.name} or its licensors. You may not reproduce, resell or use them
      commercially without our written permission.
    </p>

},
{
  title: '9. Limitation of liability',
  body:
  <p>
      To the fullest extent permitted by law, {SITE.name} is not liable for indirect or
      consequential loss arising from your use of this site or a purchase made through
      it. Nothing in these terms limits any liability that cannot legally be limited,
      such as liability for fraud.
    </p>

},
{
  title: '10. Governing law',
  body:
  <p>
      These terms are governed by the laws of the Federal Republic of Nigeria, and any
      dispute arising from them is subject to the exclusive jurisdiction of the Nigerian
      courts.
    </p>

},
{
  title: '11. Changes to these terms',
  body:
  <p>
      We may update these terms from time to time. The version in force is the one
      published on this page at the time you place an order.
    </p>

},
{
  title: '12. Contact us',
  body:
  <p>
      Questions about these terms can be sent to{' '}
      <a href={`mailto:${SITE.email}`} className="text-accent underline-offset-4 hover:underline">
        {SITE.email}
      </a>{' '}
      or {SITE.phone}.
    </p>

}];


export function TermsConditions() {
  usePageMeta(`Terms & Conditions — ${SITE.name}`);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <p className="text-[10px] uppercase tracking-widest text-accent">Legal</p>
      <h1 className="mt-2.5 font-serif text-[2.5rem] leading-none sm:text-5xl">
        Terms & Conditions
      </h1>
      <p className="mt-4 text-[11px] uppercase tracking-widest text-subtle">
        Last updated: 14 September 2026
      </p>

      <div className="mt-12 space-y-10 text-sm font-light leading-relaxed text-muted">
        {sections.map((s) =>
        <section key={s.title}>
            <h2 className="mb-3 font-serif text-xl text-ink">{s.title}</h2>
            {s.body}
          </section>
        )}
      </div>
    </div>);

}
