import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Check, Clock, Mail, MessageCircle } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { verifyPayment } from '../lib/korapay';
import { getOrderByReference } from '../lib/api';
import { formatNaira } from '../lib/format';
import { SITE } from '../data/site';
import { Order } from '../types';
import { Button } from '../components/ui/Button';

type Status = 'checking' | 'success' | 'pending' | 'failed' | 'preview';

export function OrderSuccess() {
  const { reference = '' } = useParams<{reference: string;}>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';

  const [status, setStatus] = useState<Status>(isPreview ? 'preview' : 'checking');
  const [order, setOrder] = useState<Order | null>(null);

  usePageMeta(`Order ${reference} — ${SITE.name}`);

  useEffect(() => {
    if (isPreview || !reference) return;
    let cancelled = false;

    (async () => {
      const result = await verifyPayment(reference);
      if (cancelled) return;

      if (!result.ok) {
        setStatus('pending');
      } else if (result.status === 'success') {
        setStatus('success');
      } else if (result.status === 'pending') {
        setStatus('pending');
      } else {
        setStatus('failed');
      }

      const fetched = await getOrderByReference(reference);
      if (!cancelled && fetched.ok && fetched.data) setOrder(fetched.data);
    })();

    return () => {
      cancelled = true;
    };
  }, [reference, isPreview]);

  const headline =
  status === 'failed' ?
  'We could not confirm that payment' :
  status === 'pending' ?
  'Your payment is processing' :
  'Thank you — your order is in';

  const body =
  status === 'failed' ?
  'No charge has been completed. You can try again, or reach us directly and we will take the order by hand.' :
  status === 'pending' ?
  'Some bank transfers take a few minutes to settle. We will email you the moment it clears.' :
  'Our team has been notified. You will receive a confirmation email shortly, and we will be in touch about fittings or dispatch.';

  return (
    <div className="mx-auto max-w-2xl px-5 py-32 text-center md:px-10 md:py-40">
      <div
        className={`mx-auto grid h-16 w-16 place-items-center rounded-full border ${
        status === 'failed' ?
        'border-danger/50 text-danger' :
        status === 'pending' || status === 'checking' ?
        'border-line text-muted' :
        'border-accent text-accent'}`
        }>
        
        {status === 'pending' || status === 'checking' ?
        <Clock size={24} strokeWidth={1.25} /> :

        <Check size={24} strokeWidth={1.25} />
        }
      </div>

      <h1 className="mt-8 font-serif text-[2.25rem] leading-tight sm:text-5xl">
        {status === 'checking' ? 'Confirming your payment…' : headline}
      </h1>

      <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-muted md:text-base">
        {status === 'checking' ? 'One moment while we check with Korapay.' : body}
      </p>

      <div className="mt-9 inline-block border border-line bg-surface px-7 py-5">
        <p className="text-[10px] uppercase tracking-widest text-subtle">Order reference</p>
        <p className="mt-1.5 font-serif text-2xl tracking-wide text-accent">{reference}</p>
      </div>

      {order &&
      <div className="mx-auto mt-10 max-w-md border border-line text-left">
          <ul className="divide-y divide-line">
            {order.items.map((item) =>
          <li key={`${item.productId}-${item.size}`} className="flex gap-4 p-4">
                <img
              src={item.image}
              alt=""
              className="h-16 w-12 shrink-0 object-cover"
              loading="lazy" />
            
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-base">{item.name}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-subtle">
                    {item.size} · {item.color} · ×{item.quantity}
                  </p>
                </div>
                <span className="text-xs tabular-nums">
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
      }

      {status === 'preview' &&
      <p className="mx-auto mt-8 max-w-md border border-line bg-surface-2 p-4 text-[11px] font-light leading-relaxed text-muted">
          Preview mode — payment keys are not connected yet, so this order was not charged.
          Add your Supabase and Korapay credentials to take live payments.
        </p>
      }

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button as="link" to="/shop" size="lg">
          Continue shopping
        </Button>
        <Button
          as="a"
          href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
            `Hello ARÍLÉ, about order ${reference}…`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          size="lg">
          
          <MessageCircle size={15} strokeWidth={1.5} />
          Message the atelier
        </Button>
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-[11px] text-subtle">
        <Mail size={13} strokeWidth={1.5} />
        Questions? {SITE.email}
      </p>
    </div>);

}