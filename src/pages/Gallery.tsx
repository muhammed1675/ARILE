import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { GALLERY_ITEMS } from '../data/gallery';
import { SITE } from '../data/site';
import { Reveal, Stagger, RevealItem } from '../components/ui/Reveal';
import { Button } from '../components/ui/Button';

export function Gallery() {
  usePageMeta(
    `Gallery — ${SITE.name}`,
    'Photographs from inside the ARÍLÉ atelier in Lagos — finished pieces, fabric detail and work in progress.'
  );

  const [lightbox, setLightbox] = useState<number | null>(null);
  const open = lightbox !== null;

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight')
      setLightbox((i) => i === null ? i : (i + 1) % GALLERY_ITEMS.length);
      if (e.key === 'ArrowLeft')
      setLightbox((i) =>
      i === null ? i : (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length
      );
    };

    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const current = lightbox !== null ? GALLERY_ITEMS[lightbox] : null;

  return (
    <div className="pt-28 md:pt-32">
      <header className="mx-auto max-w-container px-5 pb-12 md:px-10 md:pb-16">
        <Reveal>
          <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            The archive
          </p>
          <h1 className="max-w-3xl font-serif text-[2.5rem] leading-[1.05] sm:text-5xl md:text-6xl">
            Every piece, <span className="italic text-accent">every cut.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-muted md:text-base">
            Finished garments, fabric close enough to count the threads, and the quiet
            hours in between. Select any image to view it full size.
          </p>
        </Reveal>
      </header>

      <section className="mx-auto max-w-container px-5 pb-20 md:px-10 md:pb-28">
        <Stagger
          className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:auto-rows-[210px] md:grid-cols-6 md:gap-4"
          stagger={0.05}>
          
          {GALLERY_ITEMS.map((item, i) =>
          <RevealItem key={item.id} className={item.span}>
              <button
              type="button"
              onClick={() => setLightbox(i)}
              className="group relative h-full w-full overflow-hidden bg-surface-2"
              aria-label={`View ${item.caption}`}>
              
                <img
                src={item.src}
                alt={item.caption}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[450ms] ease-lux group-hover:scale-[1.05]" />
              
                <span
                className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/35"
                aria-hidden="true" />
              
                <span className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="h-px w-5 bg-[#c9a961]" aria-hidden="true" />
                  <span className="text-[10px] uppercase tracking-widest text-white">
                    {item.caption}
                  </span>
                </span>
              </button>
            </RevealItem>
          )}
        </Stagger>

        <Reveal delay={0.1}>
          <div className="mt-16 border-t border-line pt-12 text-center">
            <h2 className="font-serif text-2xl md:text-3xl">
              Want a closer look at something?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-light text-muted">
              We keep detail shots and fabric samples for every piece in the archive.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button as="link" to="/shop" size="lg">
                Shop the collection
              </Button>
              <Button as="link" to="/contact" variant="ghost" size="lg">
                Request samples
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {open && current &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label={current.caption}>
          
            <div className="flex items-center justify-between px-5 py-4">
              <p className="text-[10px] uppercase tracking-widest text-white/60">
                {String((lightbox ?? 0) + 1).padStart(2, '0')} /{' '}
                {String(GALLERY_ITEMS.length).padStart(2, '0')}
              </p>
              <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white/80 transition-colors duration-200 hover:border-white hover:text-white">
              
                <X size={17} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-1 items-center justify-between gap-2 px-2 pb-4 sm:px-5">
              <button
              type="button"
              onClick={() =>
              setLightbox((i) =>
              i === null ? i : (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length
              )
              }
              aria-label="Previous image"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/25 text-white/80 transition-colors duration-200 hover:border-white hover:text-white">
              
                <ChevronLeft size={19} strokeWidth={1.5} />
              </button>

              <motion.img
              key={current.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              src={current.src}
              alt={current.caption}
              className="max-h-full min-h-0 flex-1 object-contain" />
            

              <button
              type="button"
              onClick={() =>
              setLightbox((i) => i === null ? i : (i + 1) % GALLERY_ITEMS.length)
              }
              aria-label="Next image"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/25 text-white/80 transition-colors duration-200 hover:border-white hover:text-white">
              
                <ChevronRight size={19} strokeWidth={1.5} />
              </button>
            </div>

            <p className="pb-6 text-center text-[10px] uppercase tracking-widest text-white/70">
              {current.caption}
            </p>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}