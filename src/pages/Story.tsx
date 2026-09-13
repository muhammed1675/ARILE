import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { SITE, ATELIER_IMAGE, FABRIC_IMAGE, HERO_IMAGE } from '../data/site';
import { Reveal, Stagger, RevealItem } from '../components/ui/Reveal';
import { Button } from '../components/ui/Button';

const chapters = [
{
  year: '2019',
  title: 'One loom in Iseyin',
  copy:
  'ARÍLÉ started as a standing order with a single weaver — twelve yards of aṣọ-òkè a month, cut and sewn in a room above a hardware shop in Surulere.'
},
{
  year: '2021',
  title: 'The Victoria Island studio',
  copy:
  'We outgrew the room. The new studio gave us space for a cutting table long enough to lay an agbada flat, and for clients to actually sit while being measured.'
},
{
  year: '2023',
  title: 'Twelve artisans',
  copy:
  'Our embroidery bench grew to six. We began training apprentices from families who had stopped passing the craft down, because there was no living in it.'
},
{
  year: 'Today',
  title: 'Forty countries',
  copy:
  'A piece leaves Lagos most weeks for London, Atlanta, Toronto, Dubai. The work has not changed. The hands have not changed. Only the postcode on the box.'
}];


const values = [
{
  title: 'Cloth with a source',
  copy:
  'We buy direct from weaving families in Iseyin and Okene. We know whose loom each length came off, and we pay before we sell.'
},
{
  title: 'Hands before machines',
  copy:
  'Machines finish seams. Hands do everything that shows — the embroidery, the neckline, the fall of a sleeve. That is not nostalgia, it is quality control.'
},
{
  title: 'Built to be inherited',
  copy:
  'We construct for a second wearer. Generous seam allowance, reinforced stress points, and a repair service that never expires.'
}];


export function Story() {
  usePageMeta(
    `Our story — ${SITE.name}`,
    'How ARÍLÉ grew from a single loom in Iseyin to a Lagos atelier shipping handcrafted African wear to forty countries.'
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[62svh] items-end overflow-hidden">
        <img
          src={ATELIER_IMAGE}
          alt="Hands guiding gold embroidery thread through cloth"
          className="absolute inset-0 h-full w-full object-cover" />
        
        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-container px-5 pb-14 pt-32 md:px-10 md:pb-20">
          <Reveal>
            <p className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/70">
              <span className="h-px w-8 bg-[#c9a961]" aria-hidden="true" />
              Our story
            </p>
            <h1 className="max-w-3xl font-serif text-[2.75rem] leading-[1.02] text-white sm:text-6xl md:text-7xl">
              A craft worth
              <span className="italic text-[#d9bd7f]"> refusing to lose.</span>
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Opening statement — the thing we want remembered */}
      <section className="bg-canvas py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-5 md:px-10">
          <Reveal>
            <p className="font-serif text-2xl leading-snug text-balance md:text-[2.1rem]">
              For a long time, the finest African tailoring was something you inherited,
              not something you could buy. We built ARÍLÉ so that the standard your
              grandfather knew is still available — at the same quality, to anyone,
              anywhere.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 text-sm font-light leading-relaxed text-muted md:text-base">
              That means we are slower than we could be and smaller than we could be. It
              also means every piece that leaves the studio is one we would put our own
              name inside — and we do.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-y border-line bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-container px-5 md:px-10">
          <Reveal>
            <h2 className="mb-14 font-serif text-[2.15rem] leading-tight sm:text-4xl md:text-5xl">
              How we got <span className="italic text-accent">here.</span>
            </h2>
          </Reveal>

          <Stagger className="grid gap-px bg-line md:grid-cols-2 lg:grid-cols-4">
            {chapters.map((c) =>
            <RevealItem key={c.year} className="bg-surface p-7 md:p-8">
                <span className="font-serif text-3xl text-accent">{c.year}</span>
                <h3 className="mt-4 font-serif text-xl">{c.title}</h3>
                <p className="mt-3 text-[13px] font-light leading-relaxed text-muted">
                  {c.copy}
                </p>
              </RevealItem>
            )}
          </Stagger>
        </div>
      </section>

      {/* Values with image */}
      <section className="bg-canvas py-20 md:py-28">
        <div className="mx-auto max-w-container px-5 md:px-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="aspect-[4/5] overflow-hidden bg-surface-2">
                  <img
                    src={FABRIC_IMAGE}
                    alt="Close detail of handwoven aṣọ-òkè with gold thread"
                    loading="lazy"
                    className="h-full w-full object-cover" />
                  
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <Reveal>
                <h2 className="font-serif text-[2.15rem] leading-tight sm:text-4xl md:text-5xl">
                  What we will not
                  <span className="italic text-accent"> compromise.</span>
                </h2>
              </Reveal>

              <dl className="mt-10 divide-y divide-line border-y border-line">
                {values.map((v, i) =>
                <Reveal key={v.title} delay={i * 0.07}>
                    <div className="py-7">
                      <dt className="font-serif text-xl">{v.title}</dt>
                      <dd className="mt-2.5 text-sm font-light leading-relaxed text-muted">
                        {v.copy}
                      </dd>
                    </div>
                  </Reveal>
                )}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden border-t border-line">
        <img src={HERO_IMAGE} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/72" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center md:px-10 md:py-32">
          <Reveal>
            <h2 className="font-serif text-[2.25rem] leading-tight text-white sm:text-4xl md:text-5xl">
              Come and be measured.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm font-light leading-relaxed text-white/75 md:text-base">
              The studio is open Tuesday to Saturday, by appointment. Tea is included;
              rushing is not.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button as="link" to="/bespoke" size="lg">
                Book an appointment
              </Button>
              <Button
                as="link"
                to="/shop"
                variant="outline"
                size="lg"
                className="!border-white/45 !text-white hover:!bg-white hover:!text-black">
                
                Shop ready-to-wear
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>);

}