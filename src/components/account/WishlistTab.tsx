import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { formatNaira } from '../../lib/format';
import { Button } from '../ui/Button';

export function WishlistTab() {
  const { ids, loading, toggle } = useWishlist();
  const { products, loading: productsLoading } = useProducts();
  const { user } = useAuth();
  const toast = useToast();

  const saved = products.filter((p) => ids.has(p.id));

  const remove = async (productId: string) => {
    if (!user) return;
    const result = await toggle(productId);
    if (result) toast.success('Removed from wishlist.');
  };

  if (loading || productsLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) =>
        <div key={i} className="aspect-[3/4] animate-pulse bg-surface-2" />
        )}
      </div>);

  }

  if (saved.length === 0) {
    return (
      <div className="border border-line bg-surface p-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line text-subtle">
          <Heart size={19} strokeWidth={1.25} />
        </div>
        <p className="mt-5 font-serif text-xl">Nothing saved yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm font-light text-muted">
          Tap the heart on any piece to keep it here for later.
        </p>
        <div className="mt-7">
          <Button as="link" to="/shop">
            Browse the collection
          </Button>
        </div>
      </div>);

  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {saved.map((product) =>
      <div key={product.id} className="group relative">
          <button
          type="button"
          onClick={() => remove(product.id)}
          aria-label="Remove from wishlist"
          className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-canvas/90 text-muted backdrop-blur-sm transition-colors duration-200 hover:text-danger">
          
            <X size={13} strokeWidth={1.75} />
          </button>
          <Link to={`/shop/${product.slug}`} className="block">
            <div className="aspect-[3/4] overflow-hidden bg-surface-2">
              <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            
            </div>
            <p className="mt-2.5 truncate font-serif text-sm">{product.name}</p>
            <p className="text-xs tabular-nums text-muted">{formatNaira(product.price)}</p>
          </Link>
        </div>
      )}
    </div>);

}
