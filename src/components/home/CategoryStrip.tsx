import React from 'react';
import { Link } from 'react-router-dom';
import { Stagger, RevealItem } from '../ui/Reveal';

const categories = [
{
  label: 'Agbada',
  note: 'Ceremonial three-piece',
  to: '/shop?category=agbada',
  image: "/25a171c7-8609-4928-affa-2fdbec48c4b7.jpg"

},
{
  label: 'Kaftan',
  note: 'Everyday linen',
  to: '/shop?category=kaftan',
  image: "/011dee82-292d-450d-8881-28f9d4f61650.jpg"

},
{
  label: "Women's",
  note: 'Iro, buba & gele',
  to: '/shop?category=womens',
  image: "/22d1a6a6-8003-4017-ae93-65aa955739b3.jpg"

},
{
  label: 'Accessories',
  note: 'Fila & finishing',
  to: '/shop?category=accessories',
  image: "/3ded09ea-eab3-437a-945a-4a8a47e9c886.jpg"

}];


export function CategoryStrip() {
  return (
    <section className="border-y border-line bg-surface">
      <Stagger className="mx-auto grid max-w-container grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) =>
        <RevealItem key={cat.label}>
            <Link
            to={cat.to}
            className="group relative block aspect-[4/5] overflow-hidden border-r border-line last:border-r-0 sm:aspect-[3/4] lg:aspect-[4/5]">
            
              <img
              src={cat.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[450ms] ease-lux group-hover:scale-[1.05]" />
            
              <div
              className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/25"
              aria-hidden="true" />
            
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                <h3 className="font-serif text-2xl text-white md:text-3xl">{cat.label}</h3>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-white/65">
                  {cat.note}
                </p>
              </div>
            </Link>
          </RevealItem>
        )}
      </Stagger>
    </section>);

}