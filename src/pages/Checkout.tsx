import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatNaira, generateReference } from '../lib/format';
import { createOrder } from '../lib/api';
import { initialisePayment } from '../lib/korapay';
import { SITE, NIGERIAN_STATES } from '../data/site';
import { CustomerDetails } from '../types';
import { Button } from '../components/ui/Button';

const NATIONAL_SHIPPING = 8500;

const emptyCustomer: CustomerDetails = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: 'Lagos',
  country: 'Nigeria',
  notes: ''
};

function Field({
  label,
  id,
  children,
  required





}: {label: string;id: string;children: React.ReactNode;required?: boolean;}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
        
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {children}
    </div>);

}

const inputClass =
'w-full border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-subtle ' +
'transition-colors duration-200 focus:border-accent focus:outline-none';

export function Checkout() {
  usePageMeta(`Checkout — ${SITE.name}`);
  const { lines, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<CustomerDetails>({
    ...emptyCustomer,
    email: user?.email ?? ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = customer.state === 'Lagos' ? 0 : NATIONAL_SHIPPING;
  const total = subtotal + shipping;

  const valid = useMemo(
    () =>
    customer.fullName.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(customer.email) &&
    customer.phone.trim().length >= 7 &&
    customer.address.trim().length > 4 &&
    customer.city.trim().length > 1,
    [customer]
  );

  const update = (key: keyof CustomerDetails) => (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
  setCustomer((c) => ({ ...c, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || lines.length === 0) return;

    setSubmitting(true);
    setError(null);

    const reference = generateReference();

    const orderResult = await createOrder({
      reference,
      items: lines,
      customer,
      subtotal,
      shipping,
      total,
      userId: user?.id ?? null
    });

    if (!orderResult.ok) {
      setError(orderResult.message ?? 'Could not save your order.');
      setSubmitting(false);
      return;
    }

    const payment = await initialisePayment({ reference, amount: total, customer, items: lines });

    if (payment.ok && payment.checkoutUrl) {
      window.location.href = payment.checkoutUrl;
      return;
    }

    // Preview mode / payment unavailable — still confirm so the flow is testable.
    clearCart();
    navigate(`/order/${reference}?preview=1`, { replace: true });
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-container px-5 py-40 text-center md:px-10">
        <h1 className="font-serif text-4xl">Nothing to check out</h1>
        <p className="mt-3 text-sm font-light text-muted">
          Add a piece to your bag first.
        </p>
        <div className="mt-8">
          <Button as="link" to="/shop" size="lg">
            Browse the collection
          </Button>
        </div>
      </div>);

  }

  return (
    <div className="mx-auto max-w-container px-5 pb-24 pt-28 md:px-10 md:pt-32">
      <header className="border-b border-line pb-8">
        <h1 className="font-serif text-[2.5rem] leading-none sm:text-5xl">Checkout</h1>
        <p className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-subtle">
          <Lock size={12} strokeWidth={1.5} />
          Payment secured by Korapay
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-12 pt-10 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-10 lg:col-span-7">
          <fieldset>
            <legend className="mb-6 font-serif text-2xl">Contact</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" id="fullName" required>
                <input
                  id="fullName"
                  required
                  value={customer.fullName}
                  onChange={update('fullName')}
                  className={inputClass}
                  placeholder="Adébáyọ̀ Ògúnlànà"
                  autoComplete="name" />
                
              </Field>
              <Field label="Email" id="email" required>
                <input
                  id="email"
                  type="email"
                  required
                  value={customer.email}
                  onChange={update('email')}
                  className={inputClass}
                  placeholder="you@email.com"
                  autoComplete="email" />
                
              </Field>
              <Field label="Phone" id="phone" required>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={customer.phone}
                  onChange={update('phone')}
                  className={inputClass}
                  placeholder="+234 801 234 5678"
                  autoComplete="tel" />
                
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-6 font-serif text-2xl">Delivery</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Street address" id="address" required>
                  <input
                    id="address"
                    required
                    value={customer.address}
                    onChange={update('address')}
                    className={inputClass}
                    placeholder="12 Kofo Abayomi Street"
                    autoComplete="street-address" />
                  
                </Field>
              </div>
              <Field label="City" id="city" required>
                <input
                  id="city"
                  required
                  value={customer.city}
                  onChange={update('city')}
                  className={inputClass}
                  placeholder="Victoria Island"
                  autoComplete="address-level2" />
                
              </Field>
              <Field label="State" id="state" required>
                <select
                  id="state"
                  value={customer.state}
                  onChange={update('state')}
                  className={inputClass}>
                  
                  {NIGERIAN_STATES.map((s) =>
                  <option key={s} value={s}>
                      {s}
                    </option>
                  )}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Delivery notes (optional)" id="notes">
                  <textarea
                    id="notes"
                    rows={3}
                    value={customer.notes}
                    onChange={update('notes')}
                    className={`${inputClass} resize-none`}
                    placeholder="Gate code, landmark, preferred delivery window, or measurement notes." />
                  
                </Field>
              </div>
            </div>
          </fieldset>

          {error &&
          <p className="flex items-start gap-2.5 border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
              <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
              {error}
            </p>
          }
        </div>

        {/* Order summary */}
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="border border-line bg-surface p-6 md:p-7 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl">Your order</h2>

            <ul className="mt-6 space-y-4 border-b border-line pb-5">
              {lines.map((line) =>
              <li
                key={`${line.productId}-${line.size}-${line.color}`}
                className="flex gap-3.5">
                
                  <img
                  src={line.image}
                  alt=""
                  className="h-16 w-12 shrink-0 object-cover"
                  loading="lazy" />
                
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-base leading-tight">{line.name}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-widest text-subtle">
                      {line.size} · {line.color} · ×{line.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums">
                    {formatNaira(line.price * line.quantity)}
                  </span>
                </li>
              )}
            </ul>

            <dl className="space-y-2.5 border-b border-line py-5 text-sm">
              <div className="flex justify-between">
                <dt className="font-light text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-light text-muted">Delivery</dt>
                <dd className="tabular-nums">
                  {shipping === 0 ?
                  <span className="text-success">Free</span> :

                  formatNaira(shipping)
                  }
                </dd>
              </div>
            </dl>

            <div className="flex items-baseline justify-between py-5">
              <span className="text-[10px] uppercase tracking-widest text-subtle">Total</span>
              <span className="font-serif text-3xl tabular-nums">{formatNaira(total)}</span>
            </div>

            <Button type="submit" size="lg" fullWidth disabled={!valid || submitting}>
              {submitting ? 'Opening payment…' : `Pay ${formatNaira(total)}`}
            </Button>

            <p className="mt-4 flex items-start gap-2 text-[11px] font-light leading-relaxed text-subtle">
              <ShieldCheck size={14} strokeWidth={1.5} className="mt-px shrink-0 text-accent" />
              You will be redirected to Korapay to complete payment by card, bank transfer
              or USSD.
            </p>

            <p className="mt-4 text-center text-[11px] text-subtle">
              <Link to="/cart" className="transition-colors duration-200 hover:text-accent">
                Edit your bag
              </Link>
            </p>
          </div>
        </aside>
      </form>
    </div>);

}