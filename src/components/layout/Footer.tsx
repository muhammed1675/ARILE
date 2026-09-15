import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { SITE } from '../../data/site';
import { subscribeToNewsletter } from '../../lib/api';

const columns = [
{
  title: 'Shop',
  links: [
  { label: 'All pieces', to: '/shop' },
  { label: 'Agbada', to: '/shop?category=agbada' },
  { label: 'Kaftan', to: '/shop?category=kaftan' },
  { label: "Women's", to: '/shop?category=womens' },
  { label: 'Accessories', to: '/shop?category=accessories' }]

},
{
  title: 'Atelier',
  links: [
  { label: 'Our story', to: '/story' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Bespoke service', to: '/bespoke' },
  { label: 'Size guide', to: '/bespoke#sizing' }]

},
{
  title: 'Care',
  links: [
  { label: 'Contact us', to: '/contact' },
  { label: 'Shipping & returns', to: '/contact#shipping' },
  { label: 'Your account', to: '/account' },
  { label: 'Track an order', to: '/track-order' }]

}];

const legalLinks = [
{ label: 'Privacy Policy', to: '/privacy-policy' },
{ label: 'Terms & Conditions', to: '/terms-conditions' }];


export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    const result = await subscribeToNewsletter(email.trim());
    if (result.ok) {
      setStatus('done');
      setEmail('');
    } else {
      setStatus('error');
      setMessage(result.message ?? 'Could not subscribe right now.');
    }
  };

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-container px-5 py-16 md:px-10 md:py-20">
        {/* Newsletter — the one thing we want from a visitor who reached the bottom */}
        <div className="grid gap-10 border-b border-line pb-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <h2 className="font-serif text-3xl leading-tight md:text-4xl">
              Be first to see <span className="italic text-accent">new pieces.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-muted">
              Occasional letters from the atelier — new drops, restocks and private
              appointment windows. No noise.
            </p>
          </div>

          <form onSubmit={onSubscribe} className="flex flex-col justify-end">
            {status === 'done' ?
            <p className="flex items-center gap-2 text-sm text-success">
                <Check size={16} strokeWidth={1.5} />
                You&apos;re on the list. Welcome to ARÍLÉ.
              </p> :

            <>
                <label htmlFor="newsletter" className="sr-only">
                  Email address
                </label>
                <div className="flex items-center gap-3 border-b border-line-strong pb-3 focus-within:border-accent transition-colors duration-200">
                  <input
                  id="newsletter"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-transparent text-sm text-ink placeholder:text-subtle focus:outline-none" />
                
                  <button
                  type="submit"
                  disabled={status === 'loading'}
                  aria-label="Subscribe"
                  className="shrink-0 text-accent transition-transform duration-200 hover:translate-x-1 disabled:opacity-50">
                  
                    <ArrowRight size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </>
            }
          </form>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4 md:gap-8">
          {columns.map((col) =>
          <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-5 text-[10px] uppercase tracking-widest text-subtle">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) =>
              <li key={link.label}>
                    <Link
                  to={link.to}
                  className="text-sm font-light text-muted transition-colors duration-200 hover:text-accent">
                  
                      {link.label}
                    </Link>
                  </li>
              )}
              </ul>
            </nav>
          )}

          <div className="min-w-0">
            <h3 className="mb-5 text-[10px] uppercase tracking-widest text-subtle">Visit</h3>
            <address className="space-y-3 not-italic text-sm font-light text-muted">
              <p className="break-words">{SITE.address}</p>
              <p>{SITE.hours}</p>
              <a
                href={`tel:${SITE.phone.replace(/\s+/g, '')}`}
                className="block transition-colors duration-200 hover:text-accent">
                
                {SITE.phone}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="block break-all transition-colors duration-200 hover:text-accent">
                
                {SITE.email}
              </a>
            </address>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              {SITE.socials.map((s) =>
              <li key={s.label}>
                  <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase tracking-widest text-muted transition-colors duration-200 hover:text-accent">
                  
                    {s.label}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Legal row */}
        <div className="flex flex-col gap-5 border-t border-line pt-8 text-[10px] uppercase tracking-widest text-subtle md:flex-row md:flex-wrap md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
            <p className="shrink-0">© {new Date().getFullYear()} {SITE.name} · Lagos, Nigeria</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map((link) =>
              <li key={link.to}>
                  <Link
                  to={link.to}
                  className="transition-colors duration-200 hover:text-accent">
                  
                    {link.label}
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <p className="font-serif text-xs italic tracking-normal text-accent">{SITE.motto}</p>
          <a
            href={SITE.builder.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 transition-colors duration-200 hover:text-accent">
            
            <span>Crafted by</span>
            <span className="text-accent">{SITE.builder.label}</span>
          </a>
        </div>
      </div>

      {/* Oversized wordmark — closing flourish */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none overflow-hidden border-t border-line">
        
        <p className="whitespace-nowrap text-center font-serif tracking-brand text-ink/[0.06] text-[22vw] leading-[0.8]">
          {SITE.name}
        </p>
      </div>
    </footer>);

}