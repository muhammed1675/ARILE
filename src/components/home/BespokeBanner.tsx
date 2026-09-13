import React from 'react';
import { FABRIC_IMAGE } from '../../data/site';
import { Reveal } from '../ui/Reveal';
import { Button } from '../ui/Button';

const steps = [
{ n: '01', title: 'Consultation', copy: 'We talk through the occasion, the silhouette and the statement.' },
{ n: '02', title: 'Cloth', copy: 'Choose from our Iseyin looms or bring a fabric with meaning to you.' },
{ n: '03', title: 'Fittings', copy: 'Two to three fittings, adjusted on the body, never on a mannequin.' },
{ n: '04', title: 'Delivery', copy: 'Pressed, boxed and hand-delivered anywhere in the world.' }];


export function BespokeBanner() {
  return (
    <section className="relative overflow-hidden border-y border-line">
      <img
        src={FABRIC_IMAGE}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true" />
      
      <div className="absolute inset-0 bg-black/75" aria-hidden="true" />

      <div className="relative mx-auto max-w-container px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-[#c9a961]" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-widest text-[#c9a961]">
                  Bespoke
                </span>
              </div>
              <h2 className="font-serif text-[2.15rem] leading-[1.08] text-white sm:text-4xl md:text-5xl">
                Nothing off the rack
                <br />
                <span className="italic text-[#d9bd7f]">fits a moment like this.</span>
              </h2>
              <p className="mt-6 max-w-md text-sm font-light leading-relaxed text-white/75 md:text-base">
                Weddings, coronations, aṣọ-ẹbí for forty guests. Tell us the occasion and
                we will build the wardrobe around it — from first sketch to final press.
              </p>
              <div className="mt-9">
                <Button as="link" to="/bespoke" size="lg">
                  Start a commission
                </Button>
              </div>
            </Reveal>
          </div>

          <ol className="grid gap-px overflow-hidden bg-white/15 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {steps.map((step, i) =>
            <li key={step.n} className="bg-black/70 p-6 md:p-7">
                <Reveal delay={i * 0.06}>
                  <span className="font-serif text-3xl text-[#c9a961]">{step.n}</span>
                  <h3 className="mt-3 font-serif text-xl text-white">{step.title}</h3>
                  <p className="mt-2 text-[13px] font-light leading-relaxed text-white/65">
                    {step.copy}
                  </p>
                </Reveal>
              </li>
            )}
          </ol>
        </div>
      </div>
    </section>);

}