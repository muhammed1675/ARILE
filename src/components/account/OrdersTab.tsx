import React, { useEffect, useState } from 'react';
import { Package, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyOrders } from '../../lib/api';
import { formatNaira, formatDate } from '../../lib/format';
import { SITE } from '../../data/site';
import { Order } from '../../types';
import { Button } from '../ui/Button';

const statusLabel: Record<string, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  in_production: 'In production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export function OrdersTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getMyOrders(user.id).then((res) => {
      if (res.ok && res.data) setOrders(res.data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) =>
        <div key={i} className="h-24 animate-pulse bg-surface-2" />
        )}
      </div>);

  }

  if (orders.length === 0) {
    return (
      <div className="border border-line bg-surface p-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line text-subtle">
          <Package size={19} strokeWidth={1.25} />
        </div>
        <p className="mt-5 font-serif text-xl">No orders yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm font-light text-muted">
          When you place an order it will appear here with its production status.
        </p>
        <div className="mt-7">
          <Button as="link" to="/shop">
            Browse the collection
          </Button>
        </div>
      </div>);

  }

  return (
    <ul className="space-y-3">
      {orders.map((order) =>
      <li key={order.id} className="border border-line bg-surface p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-serif text-xl text-accent">{order.reference}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-subtle">
                {formatDate(order.createdAt)} · {order.items.length}{' '}
                {order.items.length === 1 ? 'piece' : 'pieces'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-xl tabular-nums">{formatNaira(order.total)}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted">
                {statusLabel[order.status] ?? order.status}
              </p>
            </div>
          </div>

          <ul className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            {order.items.map((item) =>
          <li
            key={`${item.productId}-${item.size}`}
            className="flex items-center gap-2.5 bg-surface-2 px-3 py-2">
            
                <img src={item.image} alt="" className="h-9 w-7 object-cover" />
                <span className="text-[11px] text-muted">
                  {item.name} · {item.size} · ×{item.quantity}
                </span>
              </li>
          )}
          </ul>

          {order.status === 'pending' &&
        <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
              <p className="flex-1 text-[11px] font-light text-subtle">
                Need to make a change or cancel this order?
              </p>
              <Button
            as="a"
            href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
              `Hello ARÍLÉ, regarding order ${order.reference} — `
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="sm">
            
                <MessageCircle size={13} strokeWidth={1.5} />
                Contact us
              </Button>
            </div>
        }
        </li>
      )}
    </ul>);

}
