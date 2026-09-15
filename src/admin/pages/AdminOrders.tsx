import React, { useEffect, useState } from 'react';
import { AlertCircle, PackageSearch, ChevronDown, MapPin } from 'lucide-react';
import { adminGetOrders, adminUpdateOrderStatus, backendReady } from '../../lib/admin-api';
import { formatDate, formatNaira } from '../../lib/format';
import { useToast } from '../../contexts/ToastContext';
import { Order, OrderStatus } from '../../types';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../data/site';

const statusOptions: OrderStatus[] = [
'pending',
'paid',
'in_production',
'shipped',
'delivered',
'cancelled'];


const statusLabel: Record<OrderStatus, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  in_production: 'In production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

const statusTone: Record<OrderStatus, string> = {
  pending: 'text-subtle',
  paid: 'text-success',
  in_production: 'text-accent',
  shipped: 'text-accent',
  delivered: 'text-success',
  cancelled: 'text-danger'
};

export function AdminOrders() {
  usePageMeta(`Orders — ${SITE.name} Admin`);
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    adminGetOrders().then((res) => {
      if (res.ok && res.data) setOrders(res.data);else
      toast.error(res.message ?? 'Could not load orders.');
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStatusChange = async (order: Order, status: OrderStatus) => {
    setSavingId(order.id);
    const prev = order.status;
    setOrders((list) => list.map((o) => o.id === order.id ? { ...o, status } : o));
    const result = await adminUpdateOrderStatus(order.id, status);
    if (!result.ok) {
      setOrders((list) => list.map((o) => o.id === order.id ? { ...o, status: prev } : o));
      toast.error(result.message ?? 'Could not update the order.');
    } else {
      toast.success(`${order.reference} marked ${statusLabel[status].toLowerCase()}.`);
    }
    setSavingId(null);
  };

  const visible = orders.filter((o) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      o.reference.toLowerCase().includes(q) ||
      o.customer.fullName.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q));

  });

  if (!backendReady) {
    return (
      <NoticeCard message="Connect Supabase to see live orders here — add your keys to .env, see setup.md." />);

  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl">Orders</h1>
        {orders.length > 0 &&
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reference, name or email…"
          className="w-64 max-w-full border border-line bg-canvas px-3.5 py-2 text-sm text-ink placeholder:text-subtle transition-colors duration-200 focus:border-accent focus:outline-none" />
        
        }
      </div>

      {loading ?
      <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) =>
        <div key={i} className="h-20 animate-pulse bg-surface-2" />
        )}
        </div> :
      orders.length === 0 ?
      <EmptyState /> :

      <div className="mt-6 divide-y divide-line border border-line">
          <div className="hidden bg-surface px-4 py-3 text-[10px] uppercase tracking-widest text-subtle md:grid md:grid-cols-[1.1fr_1.4fr_1fr_0.9fr_1.2fr_1.5rem]">
            <span>Reference</span>
            <span>Customer</span>
            <span>Placed</span>
            <span className="text-right">Total</span>
            <span>Status</span>
            <span />
          </div>
          {visible.map((order) => {
          const isOpen = expanded === order.id;
          return (
            <div key={order.id}>
                <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : order.id)}
                aria-expanded={isOpen}
                className="grid w-full grid-cols-2 gap-y-2 px-4 py-3 text-left text-sm transition-colors duration-150 hover:bg-surface md:grid-cols-[1.1fr_1.4fr_1fr_0.9fr_1.2fr_1.5rem] md:items-center md:gap-y-0">
                
                  <span className="font-serif text-accent">{order.reference}</span>
                  <span className="order-3 md:order-none">
                    <span className="block text-ink">{order.customer.fullName}</span>
                    <span className="block text-[11px] text-subtle">{order.customer.email}</span>
                  </span>
                  <span className="order-4 text-subtle md:order-none">
                    {formatDate(order.createdAt)}
                  </span>
                  <span className="order-2 text-right tabular-nums md:order-none">
                    {formatNaira(order.total)}
                  </span>
                  <span className={`order-5 text-[11px] uppercase tracking-widest md:order-none ${statusTone[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                  <ChevronDown
                  size={15}
                  strokeWidth={1.75}
                  className={`order-6 shrink-0 text-subtle transition-transform duration-200 md:order-none md:justify-self-end ${isOpen ? 'rotate-180' : ''}`} />
                
                </button>

                {isOpen &&
              <div className="border-t border-line bg-surface px-4 py-5">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-subtle">Items</p>
                        <ul className="mt-2.5 space-y-2">
                          {order.items.map((item) =>
                      <li key={`${item.productId}-${item.size}`} className="flex items-center gap-2.5">
                              <img src={item.image} alt="" className="h-10 w-8 shrink-0 object-cover" />
                              <span className="text-xs text-muted">
                                {item.name} · {item.size} · {item.color} · ×{item.quantity} ·{' '}
                                {formatNaira(item.price * item.quantity)}
                              </span>
                            </li>
                      )}
                        </ul>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-subtle">
                          <MapPin size={11} strokeWidth={1.75} />
                          Ship to
                        </p>
                        <p className="mt-2.5 text-xs leading-relaxed text-muted">
                          {order.customer.fullName}
                          <br />
                          {order.customer.phone}
                          <br />
                          {order.customer.address}, {order.customer.city},{' '}
                          {order.customer.state}, {order.customer.country}
                        </p>
                        {order.customer.notes &&
                    <p className="mt-2.5 text-xs italic text-subtle">
                            “{order.customer.notes}”
                          </p>
                    }
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3 border-t border-line pt-5">
                      <label htmlFor={`status-${order.id}`} className="text-[10px] uppercase tracking-widest text-subtle">
                        Update status
                      </label>
                      <select
                    id={`status-${order.id}`}
                    value={order.status}
                    disabled={savingId === order.id}
                    onChange={(e) => onStatusChange(order, e.target.value as OrderStatus)}
                    className={`border border-line bg-canvas px-2.5 py-1.5 text-[12px] transition-colors duration-200 focus:border-accent focus:outline-none ${statusTone[order.status]}`}>
                    
                        {statusOptions.map((s) =>
                    <option key={s} value={s}>
                            {statusLabel[s]}
                          </option>
                    )}
                      </select>
                    </div>
                  </div>
              }
              </div>);

        })}
          {visible.length === 0 &&
        <p className="px-4 py-8 text-center text-sm text-muted">
              No orders match “{query}”.
            </p>
        }
        </div>
      }
    </div>);

}

function EmptyState() {
  return (
    <div className="mt-8 border border-line bg-surface p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line text-subtle">
        <PackageSearch size={19} strokeWidth={1.25} />
      </div>
      <p className="mt-5 font-serif text-xl">No orders yet</p>
      <p className="mx-auto mt-2 max-w-sm text-sm font-light text-muted">
        Orders placed at checkout will show up here.
      </p>
    </div>);

}

function NoticeCard({ message }: {message: string;}) {
  return (
    <div className="flex items-start gap-2.5 border border-line bg-surface-2 p-4 text-[13px] font-light leading-relaxed text-muted">
      <AlertCircle size={15} strokeWidth={1.5} className="mt-px shrink-0 text-accent" />
      {message}
    </div>);

}
