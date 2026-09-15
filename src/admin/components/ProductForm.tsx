import React, { useRef, useState } from 'react';
import { X, Plus, Upload, Loader2 } from 'lucide-react';
import {
  AdminProduct,
  ProductFormPayload,
  adminUploadProductImage } from
'../../lib/admin-api';
import { CATEGORY_LABELS } from '../../data/products';
import { useToast } from '../../contexts/ToastContext';
import { Category, Availability } from '../../types';

const inputClass =
'w-full border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-subtle ' +
'transition-colors duration-200 focus:border-accent focus:outline-none';

const labelClass = 'mb-1.5 block text-[10px] uppercase tracking-widest text-subtle';

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS).filter((c) => c !== 'all') as Category[];

const slugify = (s: string) =>
s.
toLowerCase().
trim().
replace(/[^a-z0-9\s-]/g, '').
replace(/\s+/g, '-').
replace(/-+/g, '-');

function emptyForm(): ProductFormPayload {
  return {
    id: '',
    slug: '',
    name: '',
    meaning: '',
    category: 'agbada',
    price: 0,
    compareAtPrice: null,
    images: [],
    fabric: '',
    embroidery: '',
    occasion: '',
    description: '',
    colors: [],
    variants: [{ size: 'M', stock: 1 }],
    availability: 'in_stock',
    leadTime: '',
    featured: false,
    isActive: true
  };
}

function fromProduct(p: AdminProduct): ProductFormPayload {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    meaning: p.meaning,
    category: p.category,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    fabric: p.fabric,
    embroidery: p.embroidery,
    occasion: p.occasion,
    description: p.description,
    colors: p.colors,
    variants: p.variants,
    availability: p.availability,
    leadTime: p.leadTime,
    featured: p.featured,
    isActive: p.isActive
  };
}

interface ProductFormProps {
  editing: AdminProduct | null;
  onCancel: () => void;
  onSubmit: (payload: ProductFormPayload) => Promise<void>;
  saving: boolean;
}

export function ProductForm({ editing, onCancel, onSubmit, saving }: ProductFormProps) {
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductFormPayload>(
    editing ? fromProduct(editing) : emptyForm()
  );
  const [colorsText, setColorsText] = useState(form.colors.join(', '));
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof ProductFormPayload,>(key: K, value: ProductFormPayload[K]) =>
  setForm((f) => ({ ...f, [key]: value }));

  const onNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      // Only auto-fill slug/id while creating a new product — never rewrite
      // them once a piece already exists and might be linked to elsewhere.
      slug: editing ? f.slug : slugify(name),
      id: editing ? f.id : `p-${slugify(name)}`
    }));
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const result = await adminUploadProductImage(file);
      if (result.ok && result.data) uploaded.push(result.data);else
      toast.error(result.message ?? `Could not upload ${file.name}.`);
    }
    if (uploaded.length) set('images', [...form.images, ...uploaded]);
    setUploading(false);
    if (fileInput.current) fileInput.current.value = '';
  };

  const removeImage = (url: string) => set('images', form.images.filter((i) => i !== url));

  const updateVariant = (i: number, patch: Partial<{size: string;stock: number;}>) =>
  set(
    'variants',
    form.variants.map((v, idx) => idx === i ? { ...v, ...patch } : v)
  );

  const addVariant = () => set('variants', [...form.variants, { size: '', stock: 0 }]);
  const removeVariant = (i: number) => set('variants', form.variants.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.slug.trim() || !form.id.trim()) {
      toast.error('Name is required.');
      return;
    }
    if (form.price <= 0) {
      toast.error('Enter a price greater than zero.');
      return;
    }
    if (form.images.length === 0) {
      toast.error('Add at least one photo.');
      return;
    }

    await onSubmit({
      ...form,
      colors: colorsText.
      split(',').
      map((c) => c.trim()).
      filter(Boolean),
      variants: form.variants.filter((v) => v.size.trim())
    });
  };

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-8">
      <h2 className="font-serif text-xl">{editing ? 'Edit piece' : 'New piece'}</h2>

      {/* Photos */}
      <div>
        <label className={labelClass}>Photos</label>
        <div className="flex flex-wrap gap-3">
          {form.images.map((url) =>
          <div key={url} className="group relative h-24 w-20 shrink-0 overflow-hidden border border-line">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
              type="button"
              onClick={() => removeImage(url)}
              aria-label="Remove photo"
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-canvas/90 text-danger opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              
                <X size={11} strokeWidth={2} />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="grid h-24 w-20 shrink-0 place-items-center border border-dashed border-line text-subtle transition-colors duration-200 hover:border-accent hover:text-accent disabled:opacity-50">
            
            {uploading ?
            <Loader2 size={16} strokeWidth={1.75} className="animate-spin" /> :

            <Upload size={16} strokeWidth={1.5} />
            }
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)} />
          
        </div>
        <p className="mt-2 text-[11px] font-light text-subtle">
          Portrait shots (3:4) against a consistent backdrop look best. First photo is the
          cover image.
        </p>
      </div>

      {/* Basics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-name" className={labelClass}>Name</label>
          <input
            id="pf-name"
            required
            value={form.name}
            onChange={(e) => onNameChange(e.target.value)}
            className={inputClass} />
          
        </div>
        <div>
          <label htmlFor="pf-meaning" className={labelClass}>Meaning (optional)</label>
          <input
            id="pf-meaning"
            value={form.meaning}
            onChange={(e) => set('meaning', e.target.value)}
            placeholder="e.g. “God made this”"
            className={inputClass} />
          
        </div>
        <div>
          <label htmlFor="pf-slug" className={labelClass}>URL slug</label>
          <input
            id="pf-slug"
            required
            value={form.slug}
            onChange={(e) => set('slug', slugify(e.target.value))}
            className={inputClass} />
          
        </div>
        <div>
          <label htmlFor="pf-category" className={labelClass}>Category</label>
          <select
            id="pf-category"
            value={form.category}
            onChange={(e) => set('category', e.target.value as Category)}
            className={inputClass}>
            
            {CATEGORY_OPTIONS.map((c) =>
            <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            )}
          </select>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-price" className={labelClass}>Price (₦)</label>
          <input
            id="pf-price"
            type="number"
            required
            min={1}
            value={form.price || ''}
            onChange={(e) => set('price', Number(e.target.value))}
            className={inputClass} />
          
        </div>
        <div>
          <label htmlFor="pf-compare" className={labelClass}>Compare-at price (optional)</label>
          <input
            id="pf-compare"
            type="number"
            min={0}
            value={form.compareAtPrice ?? ''}
            onChange={(e) =>
            set('compareAtPrice', e.target.value ? Number(e.target.value) : null)
            }
            placeholder="Shows as a strikethrough price"
            className={inputClass} />
          
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="pf-fabric" className={labelClass}>Fabric</label>
          <input
            id="pf-fabric"
            value={form.fabric}
            onChange={(e) => set('fabric', e.target.value)}
            className={inputClass} />
          
        </div>
        <div>
          <label htmlFor="pf-embroidery" className={labelClass}>Embroidery</label>
          <input
            id="pf-embroidery"
            value={form.embroidery}
            onChange={(e) => set('embroidery', e.target.value)}
            className={inputClass} />
          
        </div>
        <div>
          <label htmlFor="pf-occasion" className={labelClass}>Occasion</label>
          <input
            id="pf-occasion"
            value={form.occasion}
            onChange={(e) => set('occasion', e.target.value)}
            className={inputClass} />
          
        </div>
      </div>

      <div>
        <label htmlFor="pf-colors" className={labelClass}>Colours (comma-separated)</label>
        <input
          id="pf-colors"
          value={colorsText}
          onChange={(e) => setColorsText(e.target.value)}
          placeholder="Ivory, Indigo, Burgundy"
          className={inputClass} />
        
      </div>

      <div>
        <label htmlFor="pf-desc" className={labelClass}>Description</label>
        <textarea
          id="pf-desc"
          rows={4}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className={inputClass} />
        
      </div>

      {/* Stock */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-availability" className={labelClass}>Availability</label>
          <select
            id="pf-availability"
            value={form.availability}
            onChange={(e) => set('availability', e.target.value as Availability)}
            className={inputClass}>
            
            <option value="in_stock">In stock</option>
            <option value="made_to_order">Made to order</option>
            <option value="sold_out">Sold out</option>
          </select>
        </div>
        <div>
          <label htmlFor="pf-leadtime" className={labelClass}>Lead time</label>
          <input
            id="pf-leadtime"
            value={form.leadTime}
            onChange={(e) => set('leadTime', e.target.value)}
            placeholder="e.g. Ships in 3–5 days"
            className={inputClass} />
          
        </div>
      </div>

      <div>
        <label className={labelClass}>Sizes & stock</label>
        <div className="space-y-2">
          {form.variants.map((v, i) =>
          <div key={i} className="flex items-center gap-2">
              <input
              value={v.size}
              onChange={(e) => updateVariant(i, { size: e.target.value })}
              placeholder="Size (e.g. M, or one-size for fabric)"
              className={`${inputClass} flex-1`} />
            
              <input
              type="number"
              min={0}
              value={v.stock}
              onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
              placeholder="Stock"
              className={`${inputClass} w-24`} />
            
              <button
              type="button"
              onClick={() => removeVariant(i)}
              aria-label="Remove size"
              className="grid h-9 w-9 shrink-0 place-items-center text-subtle transition-colors duration-200 hover:text-danger">
              
                <X size={14} strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-accent hover:underline">
          
          <Plus size={13} strokeWidth={1.75} />
          Add size
        </button>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="h-4 w-4 border-line accent-accent" />
          
          Feature on homepage
        </label>
        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            className="h-4 w-4 border-line accent-accent" />
          
          Visible in shop
        </label>
      </div>

      <div className="flex gap-3 border-t border-line pt-6">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-accent px-6 py-3 text-[11px] uppercase tracking-widest text-accent-ink transition-opacity duration-200 hover:opacity-90 disabled:opacity-50">
          
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Create piece'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-line px-6 py-3 text-[11px] uppercase tracking-widest text-muted transition-colors duration-200 hover:border-accent hover:text-accent">
          
          Cancel
        </button>
      </div>
    </form>);

}
