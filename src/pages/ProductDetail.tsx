import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Minus, Plus, Ruler, Truck, MessageCircle } from 'lucide-react';
import { useProduct, useProducts } from '../hooks/useProducts';
import { usePageMeta } from '../hooks/usePageMeta';
import { useCart } from '../contexts/CartContext';
import { formatNaira } from '../lib/format';
import { SITE } from '../data/site';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/shop/ProductCard';
import { Stagger } from '../components/ui/Reveal';

export function ProductDetail() {
  const { slug } = useParams<{slug: string;}>();
  const { product, loading } = useProduct(slug);
  const { products } = useProducts();
  const { addItem } = useCart();

  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  usePageMeta(
    product ? `${product.name} — ${SITE.name}` : `Shop — ${SITE.name}`,
    product?.description
  );

  useEffect(() => {
    if (!product) return;
    const firstAvailable = product.variants.find((v) => v.stock > 0);
    setSize(firstAvailable?.size ?? product.variants[0]?.size ?? '');
    setColor(product.colors[0] ?? '');
    setQuantity(1);
    setActiveImage(0);
    setAdded(false);
  }, [product]);

  if (loading && !product) {
    return (
      <div className="mx-auto max-w-container px-5 pb-20 pt-32 md:px-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[3/4] animate-pulse bg-surface-2" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse bg-surface-2" />
            <div className="h-4 w-1/3 animate-pulse bg-surface-2" />
            <div className="h-24 w-full animate-pulse bg-surface-2" />
          </div>
        </div>
      </div>);

  }

  if (!product) {
    return (
      <div className="mx-auto max-w-container px-5 py-40 text-center md:px-10">
        <h1 className="font-serif text-4xl">We could not find that piece</h1>
        <p className="mt-3 text-sm font-light text-muted">
          It may have sold out or been archived.
        </p>
        <div className="mt-8">
          <Button as="link" to="/shop" variant="outline">
            Back to the collection
          </Button>
        </div>
      </div>);

  }

  const selectedVariant = product.variants.find((v) => v.size === size);
  const maxQty = Math.max(1, Math.min(selectedVariant?.stock ?? 1, 5));
  const soldOut = product.availability === 'sold_out' || (selectedVariant?.stock ?? 0) === 0;
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addItem(product, size, color, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const whatsappHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    `Hello ARÍLÉ, I'd like to ask about the ${product.name}.`
  )}`;

  return (
    <div className="pt-24 md:pt-28">
      <div className="mx-auto max-w-container px-5 md:px-10">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 py-5 text-[10px] uppercase tracking-widest text-muted transition-colors duration-200 hover:text-accent">
          
          <ArrowLeft size={13} strokeWidth={1.5} />
          All pieces
        </Link>

        <div className="grid gap-10 pb-16 lg:grid-cols-2 lg:gap-16 lg:pb-24">
          {/* Gallery */}
          <div>
            <motion.div
              key={activeImage}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="aspect-[3/4] overflow-hidden bg-surface-2">
              
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover" />
              
            </motion.div>

            {product.images.length > 1 &&
            <div className="mt-3 flex gap-3">
                {product.images.map((img, i) =>
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                className={`h-20 w-16 overflow-hidden border transition-colors duration-200 ${
                i === activeImage ? 'border-accent' : 'border-line hover:border-muted'}`
                }>
                
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
              )}
              </div>
            }
          </div>

          {/* Details */}
          <div className="lg:pt-2">
            <p className="text-[10px] uppercase tracking-widest text-accent">
              {product.occasion}
            </p>

            <h1 className="mt-3 font-serif text-[2.5rem] leading-[1.02] sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-2 font-serif text-lg italic text-muted">“{product.meaning}”</p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-serif text-3xl tabular-nums">
                {formatNaira(product.price)}
              </span>
              {onSale &&
              <span className="text-sm tabular-nums text-subtle line-through">
                  {formatNaira(product.compareAtPrice as number)}
                </span>
              }
            </div>

            <p className="mt-6 text-sm font-light leading-relaxed text-muted">
              {product.description}
            </p>

            {/* Colour */}
            {product.colors.length > 0 &&
            <fieldset className="mt-9">
                <legend className="mb-3 text-[10px] uppercase tracking-widest text-subtle">
                  Colour · <span className="text-ink">{color}</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) =>
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-pressed={color === c}
                  className={`border px-4 py-2.5 text-[11px] transition-colors duration-200 ${
                  color === c ?
                  'border-accent text-accent' :
                  'border-line text-muted hover:border-muted hover:text-ink'}`
                  }>
                  
                      {c}
                    </button>
                )}
                </div>
              </fieldset>
            }

            {/* Size */}
            <fieldset className="mt-7">
              <legend className="mb-3 flex items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-subtle">
                <span>
                  Size · <span className="text-ink">{size}</span>
                </span>
                <Link
                  to="/bespoke#sizing"
                  className="inline-flex items-center gap-1.5 text-accent transition-opacity duration-200 hover:opacity-75">
                  
                  <Ruler size={12} strokeWidth={1.5} />
                  Size guide
                </Link>
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const unavailable = v.stock === 0;
                  return (
                    <button
                      key={v.size}
                      type="button"
                      disabled={unavailable}
                      onClick={() => setSize(v.size)}
                      aria-pressed={size === v.size}
                      className={`min-w-[3.25rem] border px-3.5 py-2.5 text-[11px] transition-colors duration-200 ${
                      unavailable ?
                      'cursor-not-allowed border-line text-subtle line-through opacity-50' :
                      size === v.size ?
                      'border-accent text-accent' :
                      'border-line text-muted hover:border-muted hover:text-ink'}`
                      }>
                      
                      {v.size}
                    </button>);

                })}
              </div>
              {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 2 &&
              <p className="mt-2.5 text-[11px] text-clay">
                  Only {selectedVariant.stock} left in {size}
                </p>
              }
            </fieldset>

            {/* Quantity + add */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center border border-line">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="grid h-12 w-12 place-items-center text-muted transition-colors duration-200 hover:text-accent">
                  
                  <Minus size={14} strokeWidth={1.5} />
                </button>
                <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  aria-label="Increase quantity"
                  className="grid h-12 w-12 place-items-center text-muted transition-colors duration-200 hover:text-accent">
                  
                  <Plus size={14} strokeWidth={1.5} />
                </button>
              </div>

              <Button
                onClick={handleAdd}
                disabled={soldOut}
                size="lg"
                className="flex-1">
                
                {added ?
                <>
                    <Check size={15} strokeWidth={2} />
                    Added to bag
                  </> :
                soldOut ?
                'Sold out' :

                `Add to bag · ${formatNaira(product.price * quantity)}`
                }
              </Button>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-line px-6 py-3.5 text-[11px] uppercase tracking-widest text-muted transition-colors duration-200 hover:border-accent hover:text-accent">
              
              <MessageCircle size={15} strokeWidth={1.5} />
              Ask about this piece
            </a>

            {/* Specs */}
            <dl className="mt-10 divide-y divide-line border-y border-line text-sm">
              {[
              ['Fabric', product.fabric],
              ['Embroidery', product.embroidery],
              ['Occasion', product.occasion]].
              map(([label, value]) =>
              <div key={label} className="flex justify-between gap-6 py-3.5">
                  <dt className="text-[10px] uppercase tracking-widest text-subtle">
                    {label}
                  </dt>
                  <dd className="text-right font-light text-muted">{value}</dd>
                </div>
              )}
            </dl>

            <p className="mt-5 flex items-center gap-2.5 text-[11px] font-light text-muted">
              <Truck size={14} strokeWidth={1.5} className="text-accent" />
              {product.leadTime} · Free delivery within Lagos
            </p>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 &&
        <section className="border-t border-line py-16 md:py-20">
            <h2 className="mb-10 font-serif text-3xl md:text-4xl">
              Wear it <span className="italic text-accent">with</span>
            </h2>
            <Stagger className="grid grid-cols-2 gap-x-5 gap-y-10 md:gap-x-6 lg:grid-cols-4">
              {related.map((p) =>
            <ProductCard key={p.id} product={p} />
            )}
            </Stagger>
          </section>
        }
      </div>
    </div>);

}