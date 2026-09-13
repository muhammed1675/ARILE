import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatNaira } from '../lib/format';
import { SITE } from '../data/site';
import { Button } from '../components/ui/Button';

const LAGOS_SHIPPING = 0;
const NATIONAL_SHIPPING = 8500;

export function Cart() {
  usePageMeta(`Your bag — ${SITE.name}`);
  const { lines, subtotal, updateQuantity, removeItem, count } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-container flex-col items-center px-5 py-40 text-center md:px-10">
        <div className="grid h-16 w-16 place-items-center rounded-full border border-line text-subtle">
          <ShoppingBag size={22} strokeWidth={1.25} />
        </div>
        <h1 className="mt-7 font-serif text-4xl">Your bag is empty</h1>
        <p className="mt-3 max-w-sm text-sm font-light text-muted">
          Nothing chosen yet. Every ARÍLÉ piece is cut by hand — take your time.
        </p>
        <div className="mt-8">
          <Button as="link" to="/shop" size="lg">
            Browse the collection
          </Button>
        </div>
      </div>);

  }

  return (
    <div className="mx-auto max-w-container px-5 pb-24 pt-28 md:px-10 md:pt-32">
      <header className="border-b border-line pb-8">
        <h1 className="font-serif text-[2.5rem] leading-none sm:text-5xl">Your bag</h1>
        <p className="mt-3 text-[10px] uppercase tracking-widest text-subtle">
          {count} {count === 1 ? 'piece' : 'pieces'}
        </p>
      </header>

      <div className="grid gap-12 pt-10 lg:grid-cols-12 lg:gap-16">
        <ul className="divide-y divide-line lg:col-span-7">
          {lines.map((line) =>
          <li key={`${line.productId}-${line.size}-${line.color}`} className="flex gap-5 py-6">
              <Link
              to={`/shop/${line.slug}`}
              className="shrink-0 overflow-hidden bg-surface-2">
              
                <img
                src={line.image}
                alt={line.name}
                className="h-40 w-28 object-cover sm:h-44 sm:w-32"
                loading="lazy" />
              
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                    to={`/shop/${line.slug}`}
                    className="font-serif text-2xl leading-tight transition-colors duration-200 hover:text-accent">
                    
                      {line.name}
                    </Link>
                    <p className="mt-1.5 text-[10px] uppercase tracking-widest text-subtle">
                      {line.size} · {line.color}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm tabular-nums">
                    {formatNaira(line.price * line.quantity)}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                  <div className="flex items-center border border-line">
                    <button
                    type="button"
                    onClick={() =>
                    updateQuantity(line.productId, line.size, line.color, line.quantity - 1)
                    }
                    aria-label="Decrease quantity"
                    className="grid h-10 w-10 place-items-center text-muted transition-colors duration-200 hover:text-accent">
                    
                      <Minus size={13} strokeWidth={1.5} />
                    </button>
                    <span className="w-9 text-center text-xs tabular-nums">{line.quantity}</span>
                    <button
                    type="button"
                    onClick={() =>
                    updateQuantity(line.productId, line.size, line.color, line.quantity + 1)
                    }
                    aria-label="Increase quantity"
                    className="grid h-10 w-10 place-items-center text-muted transition-colors duration-200 hover:text-accent">
                    
                      <Plus size={13} strokeWidth={1.5} />
                    </button>
                  </div>

                  <button
                  type="button"
                  onClick={() => removeItem(line.productId, line.size, line.color)}
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-subtle transition-colors duration-200 hover:text-danger">
                  
                    <Trash2 size={13} strokeWidth={1.5} />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          )}
        </ul>

        {/* Summary */}
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="border border-line bg-surface p-6 md:p-7 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl">Summary</h2>

            <dl className="mt-6 space-y-3 border-b border-line pb-5 text-sm">
              <div className="flex justify-between">
                <dt className="font-light text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-light text-muted">Delivery · Lagos</dt>
                <dd className="tabular-nums text-success">Free</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-light text-muted">Delivery · Nationwide</dt>
                <dd className="tabular-nums">{formatNaira(NATIONAL_SHIPPING)}</dd>
              </div>
            </dl>

            <div className="flex items-baseline justify-between pt-5">
              <span className="text-[10px] uppercase tracking-widest text-subtle">
                Total from
              </span>
              <span className="font-serif text-3xl tabular-nums">
                {formatNaira(subtotal + LAGOS_SHIPPING)}
              </span>
            </div>
            <p className="mt-2 text-[11px] font-light leading-relaxed text-subtle">
              Final delivery is calculated once you enter your address.
            </p>

            <div className="mt-6 space-y-2.5">
              <Button as="link" to="/checkout" size="lg" fullWidth>
                Proceed to checkout
              </Button>
              <Button as="link" to="/shop" variant="ghost" size="md" fullWidth>
                Continue shopping
              </Button>
            </div>

            <p className="mt-5 text-center text-[10px] uppercase tracking-widest text-subtle">
              Secure payment via Korapay
            </p>
          </div>
        </aside>
      </div>
    </div>);

}