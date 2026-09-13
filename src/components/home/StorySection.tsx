import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ATELIER_IMAGE } from '../../data/site';
import { Reveal } from '../ui/Reveal';
import { Button } from '../ui/Button';

const stats = [
{ value: '11', label: 'Days of hand embroidery on a single chest panel' },
{ value: '1962', label: 'The year our head weaver’s family began in Iseyin' },
{ value: '40+', label: 'Countries we have shipped a finished piece to' }];


export function StorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section className="bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-container px-5 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div ref={ref} className="relative lg:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden bg-surface-2 lg:aspect-[5/6]">
              <motion.img
                style={{ y: imageY }}
                src={ATELIER_IMAGE}
                alt="An artisan guiding gold thread embroidery through white fabric"
                loading="lazy"
                className="absolute inset-0 h-[112%] w-full object-cover" />
              
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-accent" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-widest text-accent">
                  The atelier
                </span>
              </div>
              <h2 className="font-serif text-[2.15rem] leading-[1.08] sm:text-4xl md:text-5xl">
                We are not making clothes.
                <br />
                <span className="italic text-accent">We are keeping a craft alive.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-6 text-sm font-light leading-relaxed text-muted md:text-base">
                ARÍLÉ began with a single loom in Iseyin and a stubborn belief that
                African wear deserves the same obsession the world reserves for European
                tailoring. Every garment that leaves our Victoria Island studio has passed
                through at least four pairs of hands.
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <dl className="mt-10 space-y-6 border-t border-line pt-8">
                {stats.map((stat) =>
                <div key={stat.value} className="flex gap-5">
                    <dt className="w-16 shrink-0 font-serif text-3xl text-accent tabular-nums">
                      {stat.value}
                    </dt>
                    <dd className="text-sm font-light leading-relaxed text-muted">
                      {stat.label}
                    </dd>
                  </div>
                )}
              </dl>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10">
                <Button as="link" to="/story" variant="ghost" size="md">
                  Read our story
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>);

}