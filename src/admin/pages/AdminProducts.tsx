import React, { useEffect, useState } from 'react';
import { AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  AdminProduct,
  ProductFormPayload,
  adminGetProducts,
  adminSetProductActive,
  adminSetProductFeatured,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  backendReady } from
'../../lib/admin-api';
import { formatNaira } from '../../lib/format';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useToast } from '../../contexts/ToastContext';
import { SITE } from '../../data/site';
import { PRODUCTS as SEED_PRODUCTS } from '../../data/products';
import { ProductForm } from '../components/ProductForm';

function Toggle({ on, onChange, label }: {on: boolean;onChange: () => void;label: string;}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 ${
      on ? 'border-accent bg-accent' : 'border-line bg-surface-2'}`
      }>
      
      <span
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-canvas transition-transform duration-200 ${
        on ? 'translate-x-4' : 'translate-x-0.5'}`
        } />
      
    </button>);

}

export function AdminProducts() {
  usePageMeta(`Products — ${SITE.name} Admin`);
  const toast = useToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminProduct | null | 'new'>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!backendReady) {
      setLoading(false);
      return;
    }
    setLoading(true);
    adminGetProducts().then((res) => {
      if (res.ok && res.data) setProducts(res.data);else
      setError(res.message ?? 'Could not load products.');
      setLoading(false);
    });
  };

  useEffect(load, []);

  const toggleActive = async (p: AdminProduct) => {
    setProducts((list) => list.map((x) => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
    const result = await adminSetProductActive(p.id, !p.isActive);
    if (!result.ok) {
      setProducts((list) => list.map((x) => x.id === p.id ? { ...x, isActive: p.isActive } : x));
      toast.error(result.message ?? 'Could not update the product.');
    }
  };

  const toggleFeatured = async (p: AdminProduct) => {
    setProducts((list) => list.map((x) => x.id === p.id ? { ...x, featured: !x.featured } : x));
    const result = await adminSetProductFeatured(p.id, !p.featured);
    if (!result.ok) {
      setProducts((list) => list.map((x) => x.id === p.id ? { ...x, featured: p.featured } : x));
      toast.error(result.message ?? 'Could not update the product.');
    }
  };

  const submitForm = async (payload: ProductFormPayload) => {
    setSaving(true);
    const result =
    editing === 'new' ?
    await adminCreateProduct(payload) :
    await adminUpdateProduct(payload);
    setSaving(false);

    if (!result.ok) {
      toast.error(result.message ?? 'Could not save that piece.');
      return;
    }
    toast.success(editing === 'new' ? 'Piece added to the catalogue.' : 'Piece updated.');
    setEditing(null);
    load();
  };

  const remove = async (p: AdminProduct) => {
    if (!window.confirm(`Remove "${p.name}" from the catalogue? This can't be undone.`)) {
      return;
    }
    const result = await adminDeleteProduct(p.id);
    if (!result.ok) {
      toast.error(result.message ?? 'Could not remove that piece.');
      return;
    }
    toast.success('Piece removed.');
    load();
  };

  if (editing) {
    return (
      <ProductForm
        editing={editing === 'new' ? null : editing}
        onCancel={() => setEditing(null)}
        onSubmit={submitForm}
        saving={saving} />);


  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl">Products</h1>
        {backendReady &&
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-[11px] uppercase tracking-widest text-accent-ink transition-opacity duration-200 hover:opacity-90">
          
            <Plus size={14} strokeWidth={1.75} />
            New piece
          </button>
        }
      </div>

      {!backendReady &&
      <p className="mt-4 flex items-start gap-2.5 border border-line bg-surface-2 p-4 text-[13px] font-light leading-relaxed text-muted">
          <AlertCircle size={15} strokeWidth={1.5} className="mt-px shrink-0 text-accent" />
          Connect Supabase to manage the live catalogue — showing the bundled seed data
          below, read-only.
        </p>
      }

      {error &&
      <p className="mt-4 flex items-start gap-2.5 border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          {error}
        </p>
      }

      {loading ?
      <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) =>
        <div key={i} className="h-16 animate-pulse bg-surface-2" />
        )}
        </div> :

      <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left text-[10px] uppercase tracking-widest text-subtle">
                <th className="px-4 py-3 font-normal">Piece</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal text-right">Price</th>
                <th className="px-4 py-3 font-normal">Availability</th>
                <th className="px-4 py-3 font-normal">Featured</th>
                <th className="px-4 py-3 font-normal">Active</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(backendReady ? products : SEED_PRODUCTS.map((p) => ({ ...p, isActive: true }))).
            map((p) =>
            <tr key={p.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="h-11 w-9 object-cover" />
                      <div>
                        <p className="text-ink">{p.name}</p>
                        <p className="text-[11px] text-subtle">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted">{p.category}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNaira(p.price)}</td>
                  <td className="px-4 py-3 capitalize text-muted">
                    {p.availability.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <Toggle
                    on={p.featured}
                    label={`Feature ${p.name}`}
                    onChange={() => backendReady && toggleFeatured(p as AdminProduct)} />
                  
                  </td>
                  <td className="px-4 py-3">
                    <Toggle
                    on={p.isActive}
                    label={`Activate ${p.name}`}
                    onChange={() => backendReady && toggleActive(p as AdminProduct)} />
                  
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                    type="button"
                    disabled={!backendReady}
                    onClick={() => setEditing(p as AdminProduct)}
                    aria-label={`Edit ${p.name}`}
                    className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-colors duration-200 hover:border-accent hover:text-accent disabled:opacity-40">
                    
                        <Pencil size={13} strokeWidth={1.5} />
                      </button>
                      <button
                    type="button"
                    disabled={!backendReady}
                    onClick={() => remove(p as AdminProduct)}
                    aria-label={`Delete ${p.name}`}
                    className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-colors duration-200 hover:border-danger hover:text-danger disabled:opacity-40">
                    
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }
    </div>);

}
