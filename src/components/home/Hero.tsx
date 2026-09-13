import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { HERO_IMAGE, SITE } from '../../data/site';
import { Button } from '../ui/Button';

const EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } }
};

const item = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } }
};

export function Hero() {
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 800], [0, 120]);

  return (
    <section className="relative min-h-[92svh] w-full overflow-hidden bg-canvas">
      <motion.div style={{ y: imageY }} className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="A man wearing a white agbada with gold embroidery"
          className="h-full w-full object-cover object-center" />
        
        {/* Solid scrims, not gradients — keeps text legible in both themes */}
        <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-black/35" aria-hidden="true" />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative mx-auto flex min-h-[92svh] max-w-container flex-col justify-end px-5 pb-16 pt-32 md:px-10 md:pb-20">
        
        <motion.p
          variants={item}
          className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/70">
          
          <span className="h-px w-8 bg-[#c9a961]" aria-hidden="true" />
          Handcrafted in Lagos · Est. 2019
        </motion.p>

        <motion.h1
          variants={item}
          className="max-w-4xl font-serif text-[3rem] leading-[0.95] text-white sm:text-6xl md:text-7xl lg:text-8xl">
          
          African wear,
          <br />
          <span className="italic font-light text-[#d9bd7f]">timeless you.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-lg text-sm font-light leading-relaxed text-white/80 md:text-base">
          
          {SITE.description}
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
          <Button as="link" to="/shop" size="lg">
            Shop the collection
          </Button>
          <Button
            as="link"
            to="/bespoke"
            size="lg"
            variant="outline"
            className="!border-white/45 !text-white hover:!bg-white hover:!text-black">
            
            Book a bespoke fitting
          </Button>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-14 flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/55">
          
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/30">
            
            <ArrowDown size={13} strokeWidth={1.5} />
          </motion.span>
          Scroll to explore
        </motion.div>
      </motion.div>
    </section>);

}