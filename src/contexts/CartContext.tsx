import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback } from
'react';
import { CartLine, Product } from '../types';

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'arile-cart';

function lineKey(productId: string, size: string, color: string) {
  return `${productId}::${size}::${color}`;
}

export function CartProvider({ children }: {children: ReactNode;}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {

      /* ignore malformed storage */}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addItem = useCallback(
    (product: Product, size: string, color: string, quantity = 1) => {
      setLines((current) => {
        const key = lineKey(product.id, size, color);
        const existing = current.find(
          (l) => lineKey(l.productId, l.size, l.color) === key
        );

        if (existing) {
          return current.map((l) =>
          lineKey(l.productId, l.size, l.color) === key ?
          { ...l, quantity: l.quantity + quantity } :
          l
          );
        }

        return [
        ...current,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0],
          price: product.price,
          size,
          color,
          quantity
        }];

      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((productId: string, size: string, color: string) => {
    const key = lineKey(productId, size, color);
    setLines((current) =>
    current.filter((l) => lineKey(l.productId, l.size, l.color) !== key)
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, color: string, quantity: number) => {
      const key = lineKey(productId, size, color);
      setLines((current) =>
      quantity <= 0 ?
      current.filter((l) => lineKey(l.productId, l.size, l.color) !== key) :
      current.map((l) =>
      lineKey(l.productId, l.size, l.color) === key ? { ...l, quantity } : l
      )
      );
    },
    []
  );

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    return {
      lines,
      count,
      subtotal,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      updateQuantity,
      clearCart
    };
  }, [lines, isOpen, addItem, removeItem, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}