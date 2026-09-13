import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { SITE } from '../data/site';

const sections: {title: string;body: React.ReactNode;}[] = [
{
  title: '1. Who we are',
  body:
  <p>
      {SITE.name} ("we", "us", "our") is a made-to-order and ready-to-wear atelier based
      in {SITE.address}. This policy explains what information we collect through{' '}
      {typeof window !== 'undefined' ? window.location.hostname : 'this website'}, why we
      collect it, and the choices you have. It applies to visitors, account holders and
      customers alike.
    </p>

},
{
  title: '2. Information we collect',
  body:
  <>
      <p>We collect information in three ways:</p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <strong className="text-ink">You give it to us directly</strong> — your name,
          email, phone number and delivery address when you create an account, place an
          order, or send us an enquiry through the contact or bespoke forms.
        </li>
        <li>
          <strong className="text-ink">It's created when you use the site</strong> — the
          items in your bag, your order history, and your measurements if you save them
          to your account for future fittings.
        </li>
        <li>
          <strong className="text-ink">It comes from a provider you chose</strong> — if
          you sign in with Google, we receive your name and email address from Google.
          We never see your Google password.
        </li>
      </ul>
      <p className="mt-3">
        We do not collect payment card details ourselves — those go directly to our
        payment processor, Korapay, over an encrypted connection.
      </p>
    </>

},
{
  title: '3. How we use your information',
  body:
  <ul className="list-disc space-y-2 pl-5">
      <li>To take, process, produce and deliver your order.</li>
      <li>To create and maintain your account, including signing you in securely.</li>
      <li>To respond to enquiries, bespoke commission requests and support questions.</li>
      <li>
        To send you order and delivery updates, and — only if you subscribe — occasional
        emails about new pieces and restocks. You can unsubscribe from the latter at any
        time.
      </li>
      <li>To meet our legal, tax and accounting obligations.</li>
      <li>To keep the site secure and prevent fraud.</li>
    </ul>

},
{
  title: '4. Who we share it with',
  body:
  <>
      <p>
        We do not sell your personal information. We share it only with the services
        that help us run the business, and only what each one needs to do its job:
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li><strong className="text-ink">Supabase</strong> — hosts our database and handles account sign-in.</li>
        <li><strong className="text-ink">Korapay</strong> — processes payments for orders.</li>
        <li><strong className="text-ink">Resend</strong> — delivers our transactional emails (receipts, order updates, enquiry replies).</li>
        <li><strong className="text-ink">Google</strong> — if you choose to sign in with Google.</li>
      </ul>
      <p className="mt-3">
        We may also disclose information where required by law, or to protect the
        rights, property or safety of {SITE.name}, our customers, or others.
      </p>
    </>

},
{
  title: '5. Cookies and local storage',
  body:
  <p>
      We use your browser's local storage to remember your shopping bag and your theme
      preference (light or dark) between visits. These are functional and are not used
      to track you across other websites. We do not currently use third-party
      advertising or analytics cookies.
    </p>

},
{
  title: '6. How long we keep it',
  body:
  <p>
      We keep order records for as long as needed to meet our tax and accounting
      obligations under Nigerian law. If you delete your account, we remove your profile
      and saved measurements, but retain the order records tied to it for that legal
      period.
    </p>

},
{
  title: '7. Your rights',
  body:
  <>
      <p>You can ask us at any time to:</p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>See what personal information we hold about you.</li>
        <li>Correct information that is inaccurate or out of date.</li>
        <li>Delete your account and associated personal data, subject to section 6.</li>
        <li>Withdraw consent to marketing emails.</li>
      </ul>
      <p className="mt-3">
        You can update your name, phone number and measurements yourself from your{' '}
        <a href="/account" className="text-accent underline-offset-4 hover:underline">
          account page
        </a>
        . For anything else, email us at{' '}
        <a href={`mailto:${SITE.email}`} className="text-accent underline-offset-4 hover:underline">
          {SITE.email}
        </a>{' '}
        and we'll respond within a reasonable time.
      </p>
    </>

},
{
  title: '8. Children',
  body:
  <p>
      This site is not directed at children, and we do not knowingly collect personal
      information from anyone under 18.
    </p>

},
{
  title: '9. Changes to this policy',
  body:
  <p>
      We may update this policy as the business or the law changes. Meaningful changes
      will be reflected by the "last updated" date below.
    </p>

},
{
  title: '10. Contact us',
  body:
  <p>
      Questions about this policy or your data can be sent to{' '}
      <a href={`mailto:${SITE.email}`} className="text-accent underline-offset-4 hover:underline">
        {SITE.email}
      </a>{' '}
      or {SITE.phone}.
    </p>

}];


export function PrivacyPolicy() {
  usePageMeta(`Privacy Policy — ${SITE.name}`);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <p className="text-[10px] uppercase tracking-widest text-accent">Legal</p>
      <h1 className="mt-2.5 font-serif text-[2.5rem] leading-none sm:text-5xl">
        Privacy Policy
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
