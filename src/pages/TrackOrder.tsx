import React, { useState } from 'react';
import { Search, Package, Check, Clock, XCircle, MessageCircle } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { getOrderByReference } from '../lib/api';
import { formatNaira, formatDate } from '../lib/format';
import { SITE } from '../data/site';
import { Order, OrderStatus } from '../types';
import { Button } from '../components/ui/Button';

const STEPS: {status: OrderStatus;label: string;}[] = [
{ status: 'pending', label: 'Awaiting payment' },
{ status: 'paid', label: 'Paid' },
{ status: 'in_production', label: 'In production' },
{ status: 'shipped', label: 'Shipped' },
{ status: 'delivered', label: 'Delivered' }];


function StatusTracker({ status }: {status: OrderStatus;}) {
  if (status === 'cancelled') {
    return (
      <div className="mt-8 flex items-center gap-3 border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
        <XCircle size={18} strokeWidth={1.5} className="shrink-0" />
        This order was cancelled. Reach out if that doesn't look right.
      </div>);

  }

  const activeIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <ol className="mt-9 flex flex-wrap gap-y-6 sm:flex-nowrap">
      {STEPS.map((step, i) => {
        const reached = i <= activeIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <li key={step.status} className="flex flex-1 flex-col items-center text-center sm:min-w-0">
            <div className="flex w-full items-center">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[11px] transition-colors duration-300 ${
                reached ?
                'border-accent bg-accent text-accent-ink' :
                'border-line text-subtle'}`
                }>
                
                {reached ? <Check size={13} strokeWidth={2} /> : i + 1}
              </span>
              {!isLast &&
              <span
                className={`mx-1.5 h-px flex-1 transition-colors duration-300 ${
                i < activeIndex ? 'bg-accent' : 'bg-line'}`
                } />

              }
            </div>
            <p
              className={`mt-2.5 px-1 text-[10px] uppercase tracking-widest ${
              reached ? 'text-ink' : 'text-subtle'}`
              }>
              
              {step.label}
            </p>
          </li>);

      })}
    </ol>);

}

export function TrackOrder() {
  usePageMeta(`Track your order — ${SITE.name}`);
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = reference.trim().toUpperCase();
    if (!ref) return;

    setStatus('loading');
    setOrder(null);

    const result = await getOrderByReference(ref);
    if (result.ok && result.data) {
      setOrder(result.data);
      setStatus('found');
    } else {
      setMessage(result.message ?? 'We could not find an order with that reference.');
      setStatus('not-found');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-line text-accent">
          <Package size={20} strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 font-serif text-[2.25rem] leading-none sm:text-5xl">
          Track your order
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-light leading-relaxed text-muted">
          Enter the reference number from your confirmation email to see where things
          stand.
        </p>
      </div>

      <form onSubmit={submit} className="mx-auto mt-9 flex max-w-md gap-3">
        <label htmlFor="track-ref" className="sr-only">
          Order reference
        </label>
        <input
          id="track-ref"
          required
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="ARILE-8F3K2Q"
          className="w-full border border-line bg-canvas px-4 py-3.5 text-sm uppercase tracking-wide text-ink placeholder:normal-case placeholder:text-subtle transition-colors duration-200 focus:border-accent focus:outline-none" />
        
        <Button type="submit" size="lg" disabled={status === 'loading'} className="shrink-0">
          <Search size={15} strokeWidth={1.5} />
          <span className="hidden sm:inline">{status === 'loading' ? 'Looking…' : 'Track'}</span>
        </Button>
      </form>

      {status === 'not-found' &&
      <p className="mx-auto mt-6 max-w-md border border-danger/40 bg-danger/5 p-4 text-center text-sm text-danger">
          {message}
        </p>
      }

      {order &&
      <div className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-subtle">Order reference</p>
              <p className="mt-1 font-serif text-2xl tracking-wide text-accent">{order.reference}</p>
            </div>
            <p className="text-[11px] uppercase tracking-widest text-subtle">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <StatusTracker status={order.status} />

          <div className="mt-10 border border-line">
            <ul className="divide-y divide-line">
              {order.items.map((item) =>
            <li key={`${item.productId}-${item.size}`} className="flex gap-4 p-4">
                  <img
                src={item.image}
                alt=""
                className="h-16 w-12 shrink-0 object-cover"
                loading="lazy" />
              
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-base">{item.name}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-widest text-subtle">
                      {item.size} · {item.color} · ×{item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums">
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </li>
            )}
            </ul>
            <div className="flex items-baseline justify-between border-t border-line p-4">
              <span className="text-[10px] uppercase tracking-widest text-subtle">Total</span>
              <span className="font-serif text-xl tabular-nums">{formatNaira(order.total)}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-subtle">
            <Clock size={13} strokeWidth={1.5} />
            Status updates as your order moves through production and dispatch.
          </div>
        </div>
      }

      <div className="mt-14 border-t border-line pt-8 text-center">
        <p className="text-sm font-light text-muted">
          Have an account?{' '}
          <a href="/account" className="text-accent underline-offset-4 hover:underline">
            Sign in
          </a>{' '}
          to see every order in one place.
        </p>
        <div className="mt-5 flex justify-center">
          <Button
            as="a"
            href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
              "Hello ARÍLÉ, I need help tracking an order."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="md">
            
            <MessageCircle size={14} strokeWidth={1.5} />
            Message the atelier
          </Button>
        </div>
      </div>
    </div>);

}
