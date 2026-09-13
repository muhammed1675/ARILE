import React from 'react';
import { Stagger } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { ProductCard } from '../shop/ProductCard';
import { Button } from '../ui/Button';
import { useProducts } from '../../hooks/useProducts';

export function FeaturedProducts() {
  const { products, loading } = useProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-container px-5 md:px-10">
        <SectionHeading
          eyebrow="This season"
          title={
          <>
              Pieces people are <span className="italic text-accent">reaching for.</span>
            </>
          }
          aside={
          <Button as="link" to="/shop" variant="ghost" size="sm">
              See all pieces
            </Button>
          }
          className="mb-12 md:mb-14" />
        

        {loading ?
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) =>
          <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-surface-2" />
                <div className="mt-4 h-4 w-2/3 bg-surface-2" />
                <div className="mt-2 h-3 w-1/3 bg-surface-2" />
              </div>
          )}
          </div> :

        <Stagger className="grid grid-cols-2 gap-x-5 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {featured.map((product, i) =>
          <ProductCard key={product.id} product={product} priority={i < 2} />
          )}
          </Stagger>
        }
      </div>
    </section>);

}