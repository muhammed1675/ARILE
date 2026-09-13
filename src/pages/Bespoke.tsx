import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { SITE, ATELIER_IMAGE } from '../data/site';
import { formatNaira } from '../lib/format';
import { submitEnquiry } from '../lib/api';
import { Reveal, Stagger, RevealItem } from '../components/ui/Reveal';
import { Button } from '../components/ui/Button';

const tiers = [
{
  n: '01',
  title: 'Bespoke',
  price: 850000,
  priceNote: 'from',
  timeline: '8–12 weeks',
  copy: 'Built from nothing but your measurements and the occasion. Unlimited fittings, exclusive fabric sourcing, embroidery designed for you alone.',
  includes: ['Pattern cut from scratch', 'Unlimited fittings', 'Bespoke embroidery design', 'Garment bag & storage box'],
  featured: true
},
{
  n: '02',
  title: 'Made-to-measure',
  price: 450000,
  priceNote: 'from',
  timeline: '4–6 weeks',
  copy: 'Our house patterns, adjusted precisely to you. The fastest route to a garment that fits like it was drawn on.',
  includes: ['House pattern, graded to you', 'Two fittings', 'Choice of archive fabrics', 'Garment bag'],
  featured: false
},
{
  n: '03',
  title: 'Aṣọ-ẹbí',
  price: 0,
  priceNote: 'By consultation',
  timeline: 'Set with you',
  copy: 'Group commissions for weddings and ceremonies. One cloth, many bodies, no compromises on any of them.',
  includes: ['On-site measuring for your party', 'Volume fabric reservation', 'Coordinated delivery', 'Dedicated coordinator'],
  featured: false
}];


const sizing = [
['S', '36–38"', '30–32"', '38–40"'],
['M', '39–41"', '33–35"', '41–43"'],
['L', '42–44"', '36–38"', '44–46"'],
['XL', '45–47"', '39–41"', '47–49"'],
['XXL', '48–50"', '42–44"', '50–52"']];


const inputClass =
'w-full border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-subtle ' +
'transition-colors duration-200 focus:border-accent focus:outline-none';

export function Bespoke() {
  usePageMeta(
    `Bespoke — ${SITE.name}`,
    'Commission bespoke, made-to-measure or aṣọ-ẹbí African wear from the ARÍLÉ atelier in Lagos.'
  );

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Bespoke',
    occasion: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const result = await submitEnquiry({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: `${form.service} — ${form.occasion || 'No occasion given'}`,
      message: form.message,
      type: form.service === 'Aṣọ-ẹbí' ? 'aso_ebi' : 'bespoke'
    });

    if (result.ok) {
      setStatus('done');
    } else {
      setStatus('error');
      setError(result.message ?? 'Could not send that just now.');
    }
  };

  return (
    <div className="pt-28 md:pt-32">
      {/* Head */}
      <header className="mx-auto max-w-container px-5 pb-14 md:px-10 md:pb-16">
        <Reveal>
          <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            Bespoke service
          </p>
          <h1 className="max-w-3xl font-serif text-[2.5rem] leading-[1.05] sm:text-5xl md:text-6xl">
            Made for one body.
            <span className="italic text-accent"> Yours.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-muted md:text-base">
            Three ways to commission, depending on how much time you have and how far you
            want to go. All three begin with a conversation.
          </p>
        </Reveal>
      </header>

      {/* Tiers — featured one carries more weight */}
      <section className="mx-auto max-w-container px-5 pb-20 md:px-10 md:pb-28">
        <Stagger className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) =>
          <RevealItem key={tier.n}>
              <article
              className={`flex h-full flex-col border p-7 md:p-8 ${
              tier.featured ?
              'border-accent bg-surface' :
              'border-line bg-canvas'}`
              }>
              
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-2xl text-accent">{tier.n}</span>
                  {tier.featured &&
                <span className="text-[9px] uppercase tracking-widest text-accent">
                      Most requested
                    </span>
                }
                </div>

                <h2 className="mt-5 font-serif text-3xl">{tier.title}</h2>

                <p className="mt-4 text-sm font-light leading-relaxed text-muted">
                  {tier.copy}
                </p>

                <ul className="mt-6 space-y-2.5">
                  {tier.includes.map((inc) =>
                <li key={inc} className="flex items-start gap-2.5 text-[13px] text-muted">
                      <Check size={14} strokeWidth={1.75} className="mt-0.5 shrink-0 text-accent" />
                      {inc}
                    </li>
                )}
                </ul>

                {/* mt-auto locks the footers to a shared baseline */}
                <div className="mt-auto pt-8">
                  <div className="border-t border-line pt-5">
                    <p className="text-[10px] uppercase tracking-widest text-subtle">
                      {tier.price > 0 ? tier.priceNote : 'Investment'}
                    </p>
                    <p className="mt-1 font-serif text-3xl tabular-nums">
                      {tier.price > 0 ? formatNaira(tier.price) : tier.priceNote}
                    </p>
                    <p className="mt-3 text-[10px] uppercase tracking-widest text-subtle">
                      Timeline · <span className="text-ink">{tier.timeline}</span>
                    </p>
                  </div>
                  <div className="mt-5">
                    <Button
                    as="a"
                    href="#enquire"
                    variant={tier.featured ? 'primary' : 'ghost'}
                    size="md"
                    fullWidth>
                    
                      Enquire
                    </Button>
                  </div>
                </div>
              </article>
            </RevealItem>
          )}
        </Stagger>
      </section>

      {/* Sizing */}
      <section id="sizing" className="scroll-mt-28 border-y border-line bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-container px-5 md:px-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <h2 className="font-serif text-[2.15rem] leading-tight sm:text-4xl">
                  Size <span className="italic text-accent">guide.</span>
                </h2>
                <p className="mt-5 text-sm font-light leading-relaxed text-muted">
                  Our ready-to-wear is cut generously, as agbada should be. If you sit
                  between two sizes, take the smaller one — the drape does the rest.
                </p>
                <p className="mt-4 text-sm font-light leading-relaxed text-muted">
                  Not sure? Send us a photo standing straight against a wall and we will
                  tell you. It is free, and we would rather do that than process a return.
                </p>
                <div className="mt-8">
                  <Button as="a" href="#enquire" variant="ghost" size="md">
                    Ask about your size
                  </Button>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <Reveal delay={0.08}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[26rem] border-collapse text-sm">
                    <caption className="sr-only">Measurements by size in inches</caption>
                    <thead>
                      <tr className="border-b border-line-strong">
                        {['Size', 'Chest', 'Waist', 'Hip'].map((h) =>
                        <th
                          key={h}
                          scope="col"
                          className="py-3 text-left text-[10px] uppercase tracking-widest text-subtle">
                          
                            {h}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sizing.map((row) =>
                      <tr key={row[0]} className="border-b border-line">
                          <th scope="row" className="py-3.5 text-left font-serif text-lg">
                            {row[0]}
                          </th>
                          {row.slice(1).map((cell, i) =>
                        <td key={i} className="py-3.5 font-light tabular-nums text-muted">
                              {cell}
                            </td>
                        )}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section id="enquire" className="scroll-mt-28 bg-canvas py-20 md:py-28">
        <div className="mx-auto max-w-container px-5 md:px-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="aspect-[4/5] overflow-hidden bg-surface-2">
                  <img
                    src={ATELIER_IMAGE}
                    alt="An artisan at work in the ARÍLÉ atelier"
                    loading="lazy"
                    className="h-full w-full object-cover" />
                  
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <Reveal>
                <h2 className="font-serif text-[2.15rem] leading-tight sm:text-4xl">
                  Start a <span className="italic text-accent">commission.</span>
                </h2>
                <p className="mt-4 text-sm font-light leading-relaxed text-muted">
                  Tell us the occasion and the date. We reply within one working day.
                </p>
              </Reveal>

              {status === 'done' ?
              <div className="mt-10 border border-accent/40 bg-surface p-8">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-accent text-accent">
                    <Check size={19} strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl">We have your enquiry</h3>
                  <p className="mt-2.5 text-sm font-light leading-relaxed text-muted">
                    One of our team will be in touch within a working day to arrange your
                    first consultation.
                  </p>
                </div> :

              <form onSubmit={onSubmit} className="mt-9 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="b-name" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
                        Name <span className="text-accent">*</span>
                      </label>
                      <input
                      id="b-name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputClass}
                      autoComplete="name" />
                    
                    </div>
                    <div>
                      <label htmlFor="b-email" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
                        Email <span className="text-accent">*</span>
                      </label>
                      <input
                      id="b-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputClass}
                      autoComplete="email" />
                    
                    </div>
                    <div>
                      <label htmlFor="b-phone" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
                        Phone / WhatsApp
                      </label>
                      <input
                      id="b-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={inputClass}
                      autoComplete="tel" />
                    
                    </div>
                    <div>
                      <label htmlFor="b-service" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
                        Service
                      </label>
                      <select
                      id="b-service"
                      value={form.service}
                      onChange={(e) => setForm({ ...form, service: e.target.value })}
                      className={inputClass}>
                      
                        <option>Bespoke</option>
                        <option>Made-to-measure</option>
                        <option>Aṣọ-ẹbí</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="b-occasion" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
                      Occasion & date
                    </label>
                    <input
                    id="b-occasion"
                    value={form.occasion}
                    onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                    className={inputClass}
                    placeholder="Traditional wedding, 14 March 2027" />
                  
                  </div>

                  <div>
                    <label htmlFor="b-message" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
                      Tell us more <span className="text-accent">*</span>
                    </label>
                    <textarea
                    id="b-message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={`${inputClass} resize-none`}
                    placeholder="Colours you have in mind, how many pieces, anything you have seen that you love." />
                  
                  </div>

                  {status === 'error' &&
                <p className="flex items-start gap-2.5 border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
                      <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                      {error}
                    </p>
                }

                  <Button type="submit" size="lg" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Sending…' : 'Send enquiry'}
                  </Button>
                </form>
              }
            </div>
          </div>
        </div>
      </section>
    </div>);

}