import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatNaira } from '../../lib/format';
import { Button } from '../ui/Button';

export function CartDrawer() {
  const { lines, isOpen, closeCart, updateQuantity, removeItem, subtotal, count } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen &&
      <>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeCart}
          className="fixed inset-0 z-50 bg-black/55"
          aria-hidden="true" />
        

          <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[26rem] flex-col border-l border-line bg-canvas"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping bag">
          
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-baseline gap-2.5">
                <h2 className="font-serif text-xl">Your bag</h2>
                <span className="text-[10px] uppercase tracking-widest text-subtle">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
              type="button"
              onClick={closeCart}
              aria-label="Close bag"
              className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-colors duration-200 hover:border-accent hover:text-accent">
              
                <X size={15} strokeWidth={1.5} />
              </button>
            </header>

            {lines.length === 0 ?
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full border border-line text-subtle">
                  <ShoppingBag size={20} strokeWidth={1.25} />
                </div>
                <div>
                  <p className="font-serif text-xl">Your bag is empty</p>
                  <p className="mt-2 text-sm font-light text-muted">
                    Every piece is cut by hand in Lagos. Find the one that is yours.
                  </p>
                </div>
                <Button as="link" to="/shop" variant="outline" size="md">
                  Browse the collection
                </Button>
              </div> :

          <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
                  {lines.map((line) =>
              <li
                key={`${line.productId}-${line.size}-${line.color}`}
                className="flex gap-4 py-5">
                
                      <Link
                  to={`/shop/${line.slug}`}
                  onClick={closeCart}
                  className="shrink-0 overflow-hidden bg-surface-2">
                  
                        <img
                    src={line.image}
                    alt={line.name}
                    className="h-28 w-20 object-cover"
                    loading="lazy" />
                  
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                        to={`/shop/${line.slug}`}
                        onClick={closeCart}
                        className="block truncate font-serif text-lg leading-tight hover:text-accent transition-colors duration-200">
                        
                              {line.name}
                            </Link>
                            <p className="mt-1 text-[10px] uppercase tracking-widest text-subtle">
                              {line.size} · {line.color}
                            </p>
                          </div>
                          <button
                      type="button"
                      onClick={() => removeItem(line.productId, line.size, line.color)}
                      aria-label={`Remove ${line.name}`}
                      className="shrink-0 text-subtle transition-colors duration-200 hover:text-danger">
                      
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center border border-line">
                            <button
                        type="button"
                        onClick={() =>
                        updateQuantity(
                          line.productId,
                          line.size,
                          line.color,
                          line.quantity - 1
                        )
                        }
                        aria-label="Decrease quantity"
                        className="grid h-8 w-8 place-items-center text-muted transition-colors duration-200 hover:text-accent">
                        
                              <Minus size={12} strokeWidth={1.5} />
                            </button>
                            <span className="w-8 text-center text-xs tabular-nums">
                              {line.quantity}
                            </span>
                            <button
                        type="button"
                        onClick={() =>
                        updateQuantity(
                          line.productId,
                          line.size,
                          line.color,
                          line.quantity + 1
                        )
                        }
                        aria-label="Increase quantity"
                        className="grid h-8 w-8 place-items-center text-muted transition-colors duration-200 hover:text-accent">
                        
                              <Plus size={12} strokeWidth={1.5} />
                            </button>
                          </div>
                          <span className="text-sm tabular-nums">
                            {formatNaira(line.price * line.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
              )}
                </ul>

                <footer className="border-t border-line px-5 py-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-subtle">
                      Subtotal
                    </span>
                    <span className="font-serif text-2xl tabular-nums">
                      {formatNaira(subtotal)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] font-light text-subtle">
                    Shipping calculated at checkout. Duties included within Nigeria.
                  </p>
                  <div className="mt-5 space-y-2.5">
                    <Button as="link" to="/checkout" size="lg" fullWidth>
                      Checkout
                    </Button>
                    <Button as="link" to="/cart" variant="ghost" size="md" fullWidth>
                      View full bag
                    </Button>
                  </div>
                </footer>
              </>
          }
          </motion.aside>
        </>
      }
    </AnimatePresence>);

}