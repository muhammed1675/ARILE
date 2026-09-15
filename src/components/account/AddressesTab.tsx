import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  AddressRecord,
  AddressPayload,
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress } from
'../../lib/api';
import { NIGERIAN_STATES } from '../../data/site';
import { Button } from '../ui/Button';

const inputClass =
'w-full border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-subtle ' +
'transition-colors duration-200 focus:border-accent focus:outline-none';

const emptyForm: AddressPayload = {
  label: 'Home',
  fullName: '',
  phone: '',
  address: '',
  city: '',
  state: 'Lagos',
  country: 'Nigeria',
  isDefault: false
};

export function AddressesTab() {
  const { user } = useAuth();
  const toast = useToast();

  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<AddressPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!user) return;
    setLoading(true);
    getMyAddresses(user.id).then((res) => {
      if (res.ok && res.data) setAddresses(res.data);
      setLoading(false);
    });
  };

  useEffect(load, [user]);

  const startNew = () => {
    setForm({ ...emptyForm, isDefault: addresses.length === 0 });
    setEditingId('new');
  };

  const startEdit = (addr: AddressRecord) => {
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      isDefault: addr.isDefault
    });
    setEditingId(addr.id);
  };

  const cancel = () => setEditingId(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const result =
    editingId === 'new' ?
    await addAddress(user.id, form) :
    await updateAddress(editingId as string, form);

    setSaving(false);
    if (!result.ok) {
      toast.error(result.message ?? 'Could not save that address.');
      return;
    }
    toast.success(editingId === 'new' ? 'Address saved.' : 'Address updated.');
    setEditingId(null);
    load();
  };

  const remove = async (id: string) => {
    const result = await deleteAddress(id);
    if (!result.ok) {
      toast.error(result.message ?? 'Could not remove that address.');
      return;
    }
    toast.success('Address removed.');
    load();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) =>
        <div key={i} className="h-28 animate-pulse bg-surface-2" />
        )}
      </div>);

  }

  if (editingId) {
    return (
      <form onSubmit={save} className="max-w-lg space-y-5">
        <h2 className="font-serif text-xl">
          {editingId === 'new' ? 'Add address' : 'Edit address'}
        </h2>

        <div>
          <label htmlFor="a-label" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
            Label
          </label>
          <input
            id="a-label"
            required
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className={inputClass}
            placeholder="Home, Office…" />
          
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="a-name" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
              Full name
            </label>
            <input
              id="a-name"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={inputClass} />
            
          </div>
          <div>
            <label htmlFor="a-phone" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
              Phone
            </label>
            <input
              id="a-phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass} />
            
          </div>
        </div>

        <div>
          <label htmlFor="a-address" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
            Street address
          </label>
          <input
            id="a-address"
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={inputClass} />
          
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="a-city" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
              City
            </label>
            <input
              id="a-city"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={inputClass} />
            
          </div>
          <div>
            <label htmlFor="a-state" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
              State
            </label>
            <select
              id="a-state"
              required
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className={inputClass}>
              
              {NIGERIAN_STATES.map((s) =>
              <option key={s} value={s}>
                  {s}
                </option>
              )}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            className="h-4 w-4 border-line accent-accent" />
          
          Set as default address
        </label>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save address'}
          </Button>
          <Button type="button" variant="ghost" onClick={cancel}>
            Cancel
          </Button>
        </div>
      </form>);

  }

  return (
    <div>
      {addresses.length === 0 ?
      <div className="border border-line bg-surface p-10 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line text-subtle">
            <MapPin size={19} strokeWidth={1.25} />
          </div>
          <p className="mt-5 font-serif text-xl">No saved addresses</p>
          <p className="mx-auto mt-2 max-w-sm text-sm font-light text-muted">
            Save an address once and future checkouts will be a single click.
          </p>
          <div className="mt-7">
            <Button onClick={startNew}>
              <Plus size={14} strokeWidth={1.75} />
              Add address
            </Button>
          </div>
        </div> :

      <div className="space-y-3">
          {addresses.map((addr) =>
        <div key={addr.id} className="border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 font-serif text-lg">
                    {addr.label}
                    {addr.isDefault &&
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest text-accent">
                        <Star size={10} strokeWidth={2} className="fill-accent" />
                        Default
                      </span>
                }
                  </p>
                  <p className="mt-1.5 text-sm font-light text-muted">{addr.fullName}</p>
                  <p className="text-sm font-light text-muted">{addr.phone}</p>
                  <p className="mt-1.5 text-sm font-light text-muted">
                    {addr.address}, {addr.city}, {addr.state}, {addr.country}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                type="button"
                onClick={() => startEdit(addr)}
                aria-label="Edit address"
                className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-colors duration-200 hover:border-accent hover:text-accent">
                
                    <Pencil size={13} strokeWidth={1.5} />
                  </button>
                  <button
                type="button"
                onClick={() => remove(addr.id)}
                aria-label="Delete address"
                className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-colors duration-200 hover:border-danger hover:text-danger">
                
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
        )}
          <Button variant="ghost" onClick={startNew}>
            <Plus size={14} strokeWidth={1.75} />
            Add another address
          </Button>
        </div>
      }
    </div>);

}
