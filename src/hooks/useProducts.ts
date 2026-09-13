import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  source: 'supabase' | 'local';
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    meaning: row.meaning ?? '',
    category: row.category,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
    currency: 'NGN',
    images: row.images ?? [],
    fabric: row.fabric ?? '',
    embroidery: row.embroidery ?? '',
    occasion: row.occasion ?? '',
    description: row.description ?? '',
    colors: row.colors ?? [],
    variants: row.variants ?? [],
    availability: row.availability ?? 'in_stock',
    leadTime: row.lead_time ?? '',
    featured: Boolean(row.featured)
  };
}

/**
 * Loads the catalogue from Supabase when it is configured, and otherwise
 * serves the bundled seed data so the storefront is never empty.
 */
export function useProducts(): ProductsState {
  const [state, setState] = useState<ProductsState>({
    products: PRODUCTS,
    loading: Boolean(supabase),
    error: null,
    source: 'local'
  });

  useEffect(() => {
    let cancelled = false;

    const client = supabase;
    if (!client) return;

    (async () => {
      const { data, error } = await client.
      from('products').
      select('*').
      eq('is_active', true).
      order('created_at', { ascending: false });

      if (cancelled) return;

      if (error || !data || data.length === 0) {
        setState({
          products: PRODUCTS,
          loading: false,
          error: error?.message ?? null,
          source: 'local'
        });
        return;
      }

      setState({
        products: data.map(mapRow),
        loading: false,
        error: null,
        source: 'supabase'
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function useProduct(slug: string | undefined) {
  const { products, loading } = useProducts();
  const product = slug ? products.find((p) => p.slug === slug) : undefined;
  return { product, loading };
}