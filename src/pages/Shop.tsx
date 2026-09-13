import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { usePageMeta } from '../hooks/usePageMeta';
import { CATEGORY_LABELS } from '../data/products';
import { SITE } from '../data/site';
import { ProductCard } from '../components/shop/ProductCard';
import { Stagger } from '../components/ui/Reveal';
import { classNames } from '../lib/format';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';

const SORT_OPTIONS: {value: SortKey;label: string;}[] = [
{ value: 'featured', label: 'Featured' },
{ value: 'price-asc', label: 'Price: low to high' },
{ value: 'price-desc', label: 'Price: high to low' },
{ value: 'name', label: 'Alphabetical' }];


const CATEGORIES = ['all', 'agbada', 'kaftan', 'buba', 'womens', 'accessories'];

export function Shop() {
  usePageMeta(`Shop — ${SITE.name}`, 'Browse handcrafted agbada, kaftan, buba and ceremonial African wear from the ARÍLÉ atelier in Lagos.');

  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading } = useProducts();
  const [sort, setSort] = useState<SortKey>('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCategory = searchParams.get('category') ?? 'all';

  const setCategory = (category: string) => {
    const next = new URLSearchParams(searchParams);
    if (category === 'all') next.delete('category');else
    next.set('category', category);
    setSearchParams(next, { replace: true });
    setFiltersOpen(false);
  };

  const visible = useMemo(() => {
    const list =
    activeCategory === 'all' ?
    [...products] :
    products.filter((p) => p.category === activeCategory);

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return list;
  }, [products, activeCategory, sort]);

  return (
    <div className="pt-28 md:pt-32">
      {/* Page head */}
      <header className="mx-auto max-w-container px-5 pb-10 md:px-10 md:pb-14">
        <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-accent">
          <span className="h-px w-8 bg-accent" aria-hidden="true" />
          The collection
        </p>
        <h1 className="max-w-3xl font-serif text-[2.5rem] leading-[1.05] sm:text-5xl md:text-6xl">
          Every piece, cut by hand
          <span className="italic text-accent"> in Lagos.</span>
        </h1>
        <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-muted md:text-base">
          Ready-to-wear pieces ship within days. Anything here can also be remade to your
          exact measurements — just ask at checkout.
        </p>
      </header>

      {/* Filter bar */}
      <div className="sticky top-[3.75rem] z-20 border-y border-line bg-canvas/94 backdrop-blur-md md:top-[4.25rem]">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-5 py-3 md:px-10">
          {/* Desktop categories */}
          <nav aria-label="Filter by category" className="hidden items-center gap-1 md:flex">
            {CATEGORIES.map((cat) =>
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={classNames(
                'px-3.5 py-2 text-[10px] uppercase tracking-widest transition-colors duration-200',
                activeCategory === cat ?
                'text-accent' :
                'text-muted hover:text-ink'
              )}>
              
                {CATEGORY_LABELS[cat]}
              </button>
            )}
          </nav>

          {/* Mobile filter trigger */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted md:hidden">
            
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            {CATEGORY_LABELS[activeCategory]}
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden text-[10px] uppercase tracking-widest text-subtle sm:inline">
              {visible.length} {visible.length === 1 ? 'piece' : 'pieces'}
            </span>
            <label className="sr-only" htmlFor="sort">
              Sort products
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-line bg-canvas px-3 py-2 text-[10px] uppercase tracking-widest text-muted transition-colors duration-200 hover:border-accent focus:border-accent focus:outline-none">
              
              {SORT_OPTIONS.map((o) =>
              <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen &&
      <div className="fixed inset-0 z-50 flex flex-col bg-canvas md:hidden" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-serif text-xl">Filter</h2>
            <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted">
            
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
          <ul className="flex-1 px-5 py-2">
            {CATEGORIES.map((cat) =>
          <li key={cat}>
                <button
              type="button"
              onClick={() => setCategory(cat)}
              className={classNames(
                'w-full border-b border-line py-4 text-left font-serif text-2xl transition-colors duration-200',
                activeCategory === cat ? 'text-accent' : 'text-ink'
              )}>
              
                  {CATEGORY_LABELS[cat]}
                </button>
              </li>
          )}
          </ul>
        </div>
      }

      {/* Grid */}
      <section className="mx-auto max-w-container px-5 py-12 md:px-10 md:py-16">
        {loading ?
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) =>
          <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-surface-2" />
                <div className="mt-4 h-4 w-2/3 bg-surface-2" />
                <div className="mt-2 h-3 w-1/3 bg-surface-2" />
              </div>
          )}
          </div> :
        visible.length === 0 ?
        <div className="py-24 text-center">
            <p className="font-serif text-2xl">Nothing here yet</p>
            <p className="mt-2 text-sm font-light text-muted">
              Try another category — or commission something entirely your own.
            </p>
          </div> :

        <Stagger
          className="grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4"
          stagger={0.06}>
          
            {visible.map((product, i) =>
          <ProductCard key={product.id} product={product} priority={i < 4} />
          )}
          </Stagger>
        }
      </section>
    </div>);

}