import React from 'react';
import { Compass } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { SITE, FABRIC_IMAGE } from '../data/site';
import { Button } from '../components/ui/Button';

export function NotFound() {
  usePageMeta(`Page not found — ${SITE.name}`);

  return (
    <div className="relative flex min-h-[calc(100svh-1px)] items-center overflow-hidden">
      <img
        src={FABRIC_IMAGE}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover" />
      
      <div className="absolute inset-0 bg-black/80" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-container flex-col items-center px-5 py-32 text-center md:px-10">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-white/25 text-white/70">
          <Compass size={22} strokeWidth={1.25} />
        </span>

        <p className="mt-8 font-serif text-7xl text-[#d9bd7f] md:text-8xl">404</p>
        <h1 className="mt-4 font-serif text-3xl text-white md:text-4xl">
          This thread leads nowhere.
        </h1>
        <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-white/70">
          The page you were looking for has moved, sold out, or never existed.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button as="link" to="/" size="lg">
            Back home
          </Button>
          <Button
            as="link"
            to="/shop"
            size="lg"
            variant="outline"
            className="!border-white/45 !text-white hover:!bg-white hover:!text-black">
            
            Shop the collection
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-widest text-white/55">
          <a href="/gallery" className="hover:text-white">Gallery</a>
          <a href="/story" className="hover:text-white">Our story</a>
          <a href="/contact" className="hover:text-white">Contact</a>
        </div>
      </div>
    </div>);

}
