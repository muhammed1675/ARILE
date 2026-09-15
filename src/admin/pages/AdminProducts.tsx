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
  backendReady
} from '../../lib/admin-api';
import { formatNaira } from '../../lib/format';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useToast } from '../../contexts/ToastContext';
import { SITE } from '../../data/site';
import { PRODUCTS as SEED_PRODUCTS } from '../../data/products';
import { ProductForm } from '../components/ProductForm';
import { Badge, Card } from '../components/dashboard/ui';

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 ${
        on ? 'border-dash-accent bg-dash-accent' : 'border-dash-border bg-dash-muted'
      }`}
    >
      <span
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
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
      if (res.ok && res.data) setProducts(res.data);
      else setError(res.message ?? 'Could not load products.');
      setLoading(false);
    });
  };

  useEffect(load, []);

  const toggleActive = async (p: AdminProduct) => {
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, isActive: !x.isActive } : x)));
    const result = await adminSetProductActive(p.id, !p.isActive);
    if (!result.ok) {
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, isActive: p.isActive } : x)));
      toast.error(result.message ?? 'Could not update the product.');
    }
  };

  const toggleFeatured = async (p: AdminProduct) => {
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, featured: !x.featured } : x)));
    const result = await adminSetProductFeatured(p.id, !p.featured);
    if (!result.ok) {
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, featured: p.featured } : x)));
      toast.error(result.message ?? 'Could not update the product.');
    }
  };

  const submitForm = async (payload: ProductFormPayload) => {
    setSaving(true);
    const result = editing === 'new' ? await adminCreateProduct(payload) : await adminUpdateProduct(payload);
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
    return <ProductForm editing={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSubmit={submitForm} saving={saving} />;
  }

  const list = backendReady ? products : SEED_PRODUCTS.map((p) => ({ ...p, isActive: true }) as AdminProduct);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-dash-fg">Products</h1>
          <p className="mt-1 text-xs text-dash-muted-fg">Manage your catalogue.</p>
        </div>
        {backendReady && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-lg bg-dash-primary px-4 py-2.5 text-sm font-medium text-dash-primary-fg transition-opacity duration-200 hover:opacity-90"
          >
            <Plus size={15} strokeWidth={1.75} />
            New piece
          </button>
        )}
      </div>

      {!backendReady && (
        <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-dash-border bg-dash-surface p-4 text-sm leading-relaxed text-dash-muted-fg">
          <AlertCircle size={15} strokeWidth={1.5} className="mt-px shrink-0 text-dash-accent" />
          Connect Supabase to manage the live catalogue — showing the bundled seed data below, read-only.
        </p>
      )}

      {error && (
        <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-dash-destructive">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-dash-muted" />
          ))}
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="mt-5 space-y-3 lg:hidden">
            {list.map((p) => (
              <Card key={p.id} className="p-4 shadow-none">
                <div className="flex gap-3">
                  <img src={p.images[0]} alt="" className="h-16 w-12 shrink-0 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-dash-fg">{p.name}</p>
                        <p className="truncate text-[11px] text-dash-muted-fg">{p.slug}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          disabled={!backendReady}
                          onClick={() => setEditing(p as AdminProduct)}
                          aria-label={`Edit ${p.name}`}
                          className="grid h-8 w-8 place-items-center rounded-full border border-dash-border text-dash-muted-fg hover:border-dash-accent hover:text-dash-accent disabled:opacity-40"
                        >
                          <Pencil size={13} strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          disabled={!backendReady}
                          onClick={() => remove(p as AdminProduct)}
                          aria-label={`Delete ${p.name}`}
                          className="grid h-8 w-8 place-items-center rounded-full border border-dash-border text-dash-muted-fg hover:border-dash-destructive hover:text-dash-destructive disabled:opacity-40"
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-dash-muted-fg">
                      <span className="capitalize">{p.category}</span>
                      <span className="font-medium tabular-nums text-dash-fg">{formatNaira(p.price)}</span>
                      <Badge tone="neutral" className="capitalize">
                        {p.availability.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-dash-muted-fg">
                        <Toggle on={p.featured} label={`Feature ${p.name}`} onChange={() => backendReady && toggleFeatured(p as AdminProduct)} />
                        Featured
                      </label>
                      <label className="flex items-center gap-2 text-xs text-dash-muted-fg">
                        <Toggle on={p.isActive} label={`Activate ${p.name}`} onChange={() => backendReady && toggleActive(p as AdminProduct)} />
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop: table */}
          <Card className="mt-5 hidden overflow-x-auto shadow-none lg:block">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-dash-border bg-dash-muted/40 text-left text-[11px] uppercase tracking-wide text-dash-muted-fg">
                  <th className="px-5 py-3 font-medium">Piece</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 text-right font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Availability</th>
                  <th className="px-5 py-3 font-medium">Featured</th>
                  <th className="px-5 py-3 font-medium">Active</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-b border-dash-border last:border-b-0 hover:bg-dash-muted/20">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt="" className="h-11 w-9 rounded object-cover" />
                        <div>
                          <p className="text-dash-fg">{p.name}</p>
                          <p className="text-[11px] text-dash-muted-fg">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 capitalize text-dash-muted-fg">{p.category}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-dash-fg">{formatNaira(p.price)}</td>
                    <td className="px-5 py-3">
                      <Badge tone="neutral" className="capitalize">
                        {p.availability.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Toggle on={p.featured} label={`Feature ${p.name}`} onChange={() => backendReady && toggleFeatured(p as AdminProduct)} />
                    </td>
                    <td className="px-5 py-3">
                      <Toggle on={p.isActive} label={`Activate ${p.name}`} onChange={() => backendReady && toggleActive(p as AdminProduct)} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={!backendReady}
                          onClick={() => setEditing(p as AdminProduct)}
                          aria-label={`Edit ${p.name}`}
                          className="grid h-8 w-8 place-items-center rounded-full border border-dash-border text-dash-muted-fg transition-colors duration-200 hover:border-dash-accent hover:text-dash-accent disabled:opacity-40"
                        >
                          <Pencil size={13} strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          disabled={!backendReady}
                          onClick={() => remove(p as AdminProduct)}
                          aria-label={`Delete ${p.name}`}
                          className="grid h-8 w-8 place-items-center rounded-full border border-dash-border text-dash-muted-fg transition-colors duration-200 hover:border-dash-destructive hover:text-dash-destructive disabled:opacity-40"
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
