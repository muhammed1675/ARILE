import React, { useEffect, useState } from 'react';
import { AlertCircle, PackageSearch, ChevronDown, MapPin, Search } from 'lucide-react';
import { adminGetOrders, adminUpdateOrderStatus, backendReady } from '../../lib/admin-api';
import { formatDate, formatNaira } from '../../lib/format';
import { useToast } from '../../contexts/ToastContext';
import { Order, OrderStatus } from '../../types';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../data/site';
import { Badge, Card } from '../components/dashboard/ui';

const statusOptions: OrderStatus[] = [
  'pending',
  'paid',
  'in_production',
  'shipped',
  'delivered',
  'cancelled'
];

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  in_production: 'In production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

const statusTone: Record<OrderStatus, 'neutral' | 'success' | 'warning' | 'destructive' | 'accent'> = {
  pending: 'warning',
  paid: 'success',
  in_production: 'accent',
  shipped: 'accent',
  delivered: 'success',
  cancelled: 'destructive'
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
      if (res.ok && res.data) setOrders(res.data);
      else toast.error(res.message ?? 'Could not load orders.');
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStatusChange = async (order: Order, status: OrderStatus) => {
    setSavingId(order.id);
    const prev = order.status;
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status } : o)));
    const result = await adminUpdateOrderStatus(order.id, status);
    if (!result.ok) {
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: prev } : o)));
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
      o.customer.email.toLowerCase().includes(q)
    );
  });

  if (!backendReady) {
    return <NoticeCard message="Connect Supabase to see live orders here — add your keys to .env, see setup.md." />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-dash-fg">Orders</h1>
          <p className="mt-1 text-xs text-dash-muted-fg">Manage and fulfil customer orders.</p>
        </div>
        {orders.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dash-muted-fg" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reference, name or email…"
              className="h-9 w-full rounded-lg border border-dash-border bg-dash-surface pl-9 pr-3 text-sm text-dash-fg placeholder:text-dash-muted-fg focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-dash-muted" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : (
        <Card className="mt-5 divide-y divide-dash-border overflow-hidden shadow-none">
          <div className="hidden bg-dash-muted/40 px-5 py-3 text-[11px] uppercase tracking-wide text-dash-muted-fg md:grid md:grid-cols-[1.1fr_1.4fr_1fr_0.9fr_1.2fr_1.5rem]">
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
                  className="grid w-full grid-cols-2 gap-y-2 px-4 py-3.5 text-left text-sm transition-colors duration-150 hover:bg-dash-muted/40 sm:px-5 md:grid-cols-[1.1fr_1.4fr_1fr_0.9fr_1.2fr_1.5rem] md:items-center md:gap-y-0"
                >
                  <span className="font-mono text-[12px] font-semibold text-dash-fg">{order.reference}</span>
                  <span className="order-3 md:order-none">
                    <span className="block truncate text-dash-fg">{order.customer.fullName}</span>
                    <span className="block truncate text-[11px] text-dash-muted-fg">{order.customer.email}</span>
                  </span>
                  <span className="order-4 text-dash-muted-fg md:order-none">{formatDate(order.createdAt)}</span>
                  <span className="order-2 text-right font-medium tabular-nums text-dash-fg md:order-none">
                    {formatNaira(order.total)}
                  </span>
                  <span className="order-5 md:order-none">
                    <Badge tone={statusTone[order.status]}>{statusLabel[order.status]}</Badge>
                  </span>
                  <ChevronDown
                    size={15}
                    strokeWidth={1.75}
                    className={`order-6 shrink-0 text-dash-muted-fg transition-transform duration-200 md:order-none md:justify-self-end ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-dash-border bg-dash-muted/30 px-4 py-5 sm:px-5">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-dash-muted-fg">Items</p>
                        <ul className="mt-2.5 space-y-2">
                          {order.items.map((item) => (
                            <li key={`${item.productId}-${item.size}`} className="flex items-center gap-2.5">
                              <img src={item.image} alt="" className="h-10 w-8 shrink-0 rounded object-cover" />
                              <span className="text-xs text-dash-fg">
                                {item.name} · {item.size} · {item.color} · ×{item.quantity} ·{' '}
                                {formatNaira(item.price * item.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-dash-muted-fg">
                          <MapPin size={11} strokeWidth={1.75} />
                          Ship to
                        </p>
                        <p className="mt-2.5 text-xs leading-relaxed text-dash-fg">
                          {order.customer.fullName}
                          <br />
                          {order.customer.phone}
                          <br />
                          {order.customer.address}, {order.customer.city}, {order.customer.state},{' '}
                          {order.customer.country}
                        </p>
                        {order.customer.notes && (
                          <p className="mt-2.5 text-xs italic text-dash-muted-fg">“{order.customer.notes}”</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-dash-border pt-5">
                      <label htmlFor={`status-${order.id}`} className="text-[11px] uppercase tracking-wide text-dash-muted-fg">
                        Update status
                      </label>
                      <select
                        id={`status-${order.id}`}
                        value={order.status}
                        disabled={savingId === order.id}
                        onChange={(e) => onStatusChange(order, e.target.value as OrderStatus)}
                        className="rounded-lg border border-dash-border bg-dash-surface px-2.5 py-1.5 text-[12px] text-dash-fg focus:border-dash-accent focus:outline-none"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {visible.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-dash-muted-fg">No orders match “{query}”.</p>
          )}
        </Card>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="mt-6 p-10 text-center shadow-none">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-dash-border text-dash-muted-fg">
        <PackageSearch size={19} strokeWidth={1.25} />
      </div>
      <p className="mt-5 text-lg font-semibold text-dash-fg">No orders yet</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-dash-muted-fg">
        Orders placed at checkout will show up here.
      </p>
    </Card>
  );
}

function NoticeCard({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-dash-border bg-dash-surface p-4 text-sm leading-relaxed text-dash-muted-fg">
      <AlertCircle size={15} strokeWidth={1.5} className="mt-px shrink-0 text-dash-accent" />
      {message}
    </div>
  );
}
