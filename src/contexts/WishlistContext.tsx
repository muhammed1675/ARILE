import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback } from
'react';
import { useAuth } from './AuthContext';
import { getMyWishlistIds, addToWishlist, removeFromWishlist } from '../lib/api';

interface WishlistContextValue {
  ids: Set<string>;
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  /** Returns false (and does nothing) if the visitor isn't signed in — the caller decides how to prompt. */
  toggle: (productId: string) => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: {children: ReactNode;}) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    let cancelled = false;
    setLoading(true);
    getMyWishlistIds(user.id).then((res) => {
      if (cancelled) return;
      if (res.ok && res.data) setIds(new Set(res.data));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) return false;

      const isSaved = ids.has(productId);
      // Optimistic update — flip it back if the request fails.
      setIds((current) => {
        const next = new Set(current);
        if (isSaved) next.delete(productId);else
        next.add(productId);
        return next;
      });

      const result = isSaved ?
      await removeFromWishlist(user.id, productId) :
      await addToWishlist(user.id, productId);

      if (!result.ok) {
        setIds((current) => {
          const next = new Set(current);
          if (isSaved) next.add(productId);else
          next.delete(productId);
          return next;
        });
      }

      return result.ok;
    },
    [user, ids]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      loading,
      isWishlisted: (productId: string) => ids.has(productId),
      toggle
    }),
    [ids, loading, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
