import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from '../ui/Reveal';

const quotes = [
{
  quote:
  'I wore the Adéwálé to my father’s eightieth. Three people stopped the ceremony to ask who made it. That has never happened to me in a suit.',
  name: 'Tunde Bakare',
  role: 'Lagos · Wedding 2025'
},
{
  quote:
  'They made forty aṣọ-ẹbí pieces for our family and every single one fit. I still do not understand how. The gele alone was worth it.',
  name: 'Amaka Obi',
  role: 'Abuja · Traditional wedding'
},
{
  quote:
  'Shipped to London in nine days. The box, the tissue, the hand-written note — it felt like receiving something from a house, not a shop.',
  name: 'Kwame Mensah',
  role: 'London · Made-to-measure'
}];


export function Testimonials() {
  const [active, setActive] = useState(0);
  const current = quotes[active];

  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-5 text-center md:px-10">
        <Reveal>
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-widest text-accent">
              In their words
            </span>
          </div>
        </Reveal>

        <div className="min-h-[13rem] md:min-h-[11rem]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
              
              <p className="font-serif text-2xl leading-snug text-balance md:text-[2rem]">
                “{current.quote}”
              </p>
              <footer className="mt-7">
                <p className="text-sm text-ink">{current.name}</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-subtle">
                  {current.role}
                </p>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2.5">
          {quotes.map((q, i) =>
          <button
            key={q.name}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Read testimonial from ${q.name}`}
            aria-current={i === active}
            className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${
            i === active ? 'w-7 bg-accent' : 'w-1.5 bg-line-strong hover:bg-muted'}`
            } />

          )}
        </div>
      </div>
    </section>);

}