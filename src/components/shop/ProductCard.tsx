import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Product } from '../../types';
import { formatNaira } from '../../lib/format';
import { revealItemVariants } from '../ui/Reveal';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useToast } from '../../contexts/ToastContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const onSale =
  product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const soldOut = product.availability === 'sold_out';

  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();
  const saved = isWishlisted(product.id);

  const onToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Sign in to save pieces to your wishlist.');
      navigate('/account');
      return;
    }
    toggle(product.id);
  };

  return (
    <motion.article variants={revealItemVariants} className="group flex h-full flex-col">
      <Link
        to={`/shop/${product.slug}`}
        className="flex h-full flex-col focus:outline-none focus-visible:outline-2 focus-visible:outline-accent">
        
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-2">
          <img
            src={product.images[0]}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition-transform duration-[450ms] ease-lux group-hover:scale-[1.04]" />
          

          {(onSale || soldOut) &&
          <span
            className={`absolute left-3 top-3 px-2.5 py-1 text-[9px] uppercase tracking-widest ${
            soldOut ? 'bg-surface text-muted' : 'bg-clay text-white'}`
            }>
            
              {soldOut ? 'Sold out' : 'Last pieces'}
            </span>
          }

          <button
            type="button"
            onClick={onToggleWishlist}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={saved}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-canvas/90 text-muted backdrop-blur-sm transition-colors duration-200 hover:text-accent">
            
            <Heart
              size={15}
              strokeWidth={1.75}
              className={saved ? 'fill-accent text-accent' : ''} />
            
          </button>

          {/* Quick-look affordance, desktop only */}
          <span className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-2 border border-accent/70 bg-canvas/90 py-2.5 text-center text-[10px] uppercase tracking-widest text-accent opacity-0 backdrop-blur-sm transition-[opacity,transform] duration-200 ease-lux group-hover:translate-y-0 group-hover:opacity-100 md:block">
            View piece
          </span>
        </div>

        <div className="flex flex-1 flex-col pt-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-xl leading-tight transition-colors duration-200 group-hover:text-accent">
              {product.name}
            </h3>
            <div className="shrink-0 text-right">
              <p className="text-sm tabular-nums">{formatNaira(product.price)}</p>
              {onSale &&
              <p className="text-[11px] tabular-nums text-subtle line-through">
                  {formatNaira(product.compareAtPrice as number)}
                </p>
              }
            </div>
          </div>

          <p className="mt-1.5 text-[10px] uppercase tracking-widest text-subtle">
            {product.fabric}
          </p>

          {/* mt-auto keeps this row on a shared baseline across the grid */}
          <p className="mt-auto pt-3 text-[11px] font-light italic text-muted">
            {product.meaning}
          </p>
        </div>
      </Link>
    </motion.article>);

}