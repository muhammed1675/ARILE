import React, { useState } from 'react';
import { MessageCircle, Mail, MapPin, Clock, Check, AlertCircle } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { SITE } from '../data/site';
import { submitEnquiry } from '../lib/api';
import { Reveal } from '../components/ui/Reveal';
import { Button } from '../components/ui/Button';

const inputClass =
'w-full border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-subtle ' +
'transition-colors duration-200 focus:border-accent focus:outline-none';

const faqs = [
{
  q: 'How long does delivery take?',
  a: 'Ready-to-wear ships in 2–5 working days. Within Lagos it is free and usually same-week. Nationwide is ₦8,500. International is quoted at checkout and typically arrives in 5–9 days.'
},
{
  q: 'Can I return a piece?',
  a: 'Ready-to-wear can be returned unworn within 14 days for a full refund. Bespoke and made-to-measure are cut to your body, so they cannot be returned — but we will alter them until they are right, free of charge.'
},
{
  q: 'Do you ship outside Nigeria?',
  a: 'Yes, to over forty countries. Duties are the recipient’s responsibility outside Nigeria. We declare accurately and pack discreetly.'
},
{
  q: 'What if I am between sizes?',
  a: 'Send us your measurements or a straight-on photo and we will advise. If nothing fits cleanly, made-to-measure starts at ₦450,000 and takes 4–6 weeks.'
}];


export function Contact() {
  usePageMeta(
    `Contact — ${SITE.name}`,
    'Reach the ARÍLÉ atelier in Victoria Island, Lagos — WhatsApp, email, or book a studio appointment.'
  );

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const result = await submitEnquiry({ ...form, type: 'general' });
    if (result.ok) setStatus('done');else
    {
      setStatus('error');
      setError(result.message ?? 'Could not send that just now.');
    }
  };

  return (
    <div className="pt-28 md:pt-32">
      <header className="mx-auto max-w-container px-5 pb-14 md:px-10 md:pb-16">
        <Reveal>
          <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            Contact
          </p>
          <h1 className="max-w-3xl font-serif text-[2.5rem] leading-[1.05] sm:text-5xl md:text-6xl">
            Come and see us
            <span className="italic text-accent"> in Lagos.</span>
          </h1>
        </Reveal>
      </header>

      <section className="mx-auto max-w-container px-5 pb-20 md:px-10 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Details */}
          <div className="lg:col-span-5">
            <Reveal>
              <div className="space-y-px overflow-hidden border border-line bg-line">
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 bg-surface p-6 transition-colors duration-200 hover:bg-surface-2">
                  
                  <MessageCircle size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
                  <span>
                    <span className="block text-[10px] uppercase tracking-widest text-subtle">
                      WhatsApp — fastest
                    </span>
                    <span className="mt-1 block text-sm text-ink transition-colors duration-200 group-hover:text-accent">
                      {SITE.phone}
                    </span>
                  </span>
                </a>

                <a
                  href={`mailto:${SITE.email}`}
                  className="group flex items-start gap-4 bg-surface p-6 transition-colors duration-200 hover:bg-surface-2">
                  
                  <Mail size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
                  <span>
                    <span className="block text-[10px] uppercase tracking-widest text-subtle">
                      Email
                    </span>
                    <span className="mt-1 block text-sm text-ink transition-colors duration-200 group-hover:text-accent">
                      {SITE.email}
                    </span>
                  </span>
                </a>

                <div className="flex items-start gap-4 bg-surface p-6">
                  <MapPin size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
                  <span>
                    <span className="block text-[10px] uppercase tracking-widest text-subtle">
                      Studio
                    </span>
                    <span className="mt-1 block text-sm text-ink">{SITE.address}</span>
                    <span className="mt-1 block text-[11px] italic text-muted">
                      Strictly by appointment
                    </span>
                  </span>
                </div>

                <div className="flex items-start gap-4 bg-surface p-6">
                  <Clock size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
                  <span>
                    <span className="block text-[10px] uppercase tracking-widest text-subtle">
                      Hours
                    </span>
                    <span className="mt-1 block text-sm text-ink">{SITE.hours}</span>
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-6">
                <Button
                  as="a"
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  fullWidth>
                  
                  <MessageCircle size={16} strokeWidth={1.5} />
                  Message us on WhatsApp
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <h2 className="font-serif text-[2rem] leading-tight sm:text-4xl">
                Send a <span className="italic text-accent">message.</span>
              </h2>
            </Reveal>

            {status === 'done' ?
            <div className="mt-8 border border-accent/40 bg-surface p-8">
                <div className="grid h-11 w-11 place-items-center rounded-full border border-accent text-accent">
                  <Check size={19} strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-serif text-2xl">Message received</h3>
                <p className="mt-2.5 text-sm font-light leading-relaxed text-muted">
                  Thank you. We answer every message within one working day.
                </p>
              </div> :

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
                      Name <span className="text-accent">*</span>
                    </label>
                    <input
                    id="c-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                    autoComplete="name" />
                  
                  </div>
                  <div>
                    <label htmlFor="c-email" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
                      Email <span className="text-accent">*</span>
                    </label>
                    <input
                    id="c-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                    autoComplete="email" />
                  
                  </div>
                </div>

                <div>
                  <label htmlFor="c-subject" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
                    Subject <span className="text-accent">*</span>
                  </label>
                  <input
                  id="c-subject"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className={inputClass}
                  placeholder="Order enquiry, press, wholesale…" />
                
                </div>

                <div>
                  <label htmlFor="c-message" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
                    Message <span className="text-accent">*</span>
                  </label>
                  <textarea
                  id="c-message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`${inputClass} resize-none`} />
                
                </div>

                {status === 'error' &&
              <p className="flex items-start gap-2.5 border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
                    <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                    {error}
                  </p>
              }

                <Button type="submit" size="lg" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            }
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="shipping" className="scroll-mt-28 border-t border-line bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-container px-5 md:px-10">
          <Reveal>
            <h2 className="mb-12 font-serif text-[2.15rem] leading-tight sm:text-4xl">
              Shipping, returns & <span className="italic text-accent">the rest.</span>
            </h2>
          </Reveal>

          <dl className="grid gap-px bg-line md:grid-cols-2">
            {faqs.map((faq, i) =>
            <Reveal key={faq.q} delay={i * 0.05}>
                <div className="h-full bg-surface p-7 md:p-8">
                  <dt className="font-serif text-xl">{faq.q}</dt>
                  <dd className="mt-3 text-sm font-light leading-relaxed text-muted">
                    {faq.a}
                  </dd>
                </div>
              </Reveal>
            )}
          </dl>
        </div>
      </section>
    </div>);

}