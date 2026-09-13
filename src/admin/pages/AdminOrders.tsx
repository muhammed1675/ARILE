import React, { useEffect, useState } from 'react';
import { AlertCircle, PackageSearch } from 'lucide-react';
import { adminGetOrders, adminUpdateOrderStatus, backendReady } from '../../lib/admin-api';
import { formatDate, formatNaira } from '../../lib/format';
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    adminGetOrders().then((res) => {
      if (res.ok && res.data) setOrders(res.data);else
      setError(res.message ?? 'Could not load orders.');
      setLoading(false);
    });
  }, []);

  const onStatusChange = async (order: Order, status: OrderStatus) => {
    setSavingId(order.id);
    const prev = order.status;
    setOrders((list) => list.map((o) => o.id === order.id ? { ...o, status } : o));
    const result = await adminUpdateOrderStatus(order.id, status);
    if (!result.ok) {
      setOrders((list) => list.map((o) => o.id === order.id ? { ...o, status: prev } : o));
      setError(result.message ?? 'Could not update the order.');
    }
    setSavingId(null);
  };

  if (!backendReady) {
    return (
      <NoticeCard message="Connect Supabase to see live orders here — add your keys to .env, see setup.md." />);

  }

  return (
    <div>
      <h1 className="font-serif text-2xl">Orders</h1>

      {error &&
      <p className="mt-4 flex items-start gap-2.5 border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          {error}
        </p>
      }

      {loading ?
      <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) =>
        <div key={i} className="h-20 animate-pulse bg-surface-2" />
        )}
        </div> :
      orders.length === 0 ?
      <EmptyState /> :

      <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left text-[10px] uppercase tracking-widest text-subtle">
                <th className="px-4 py-3 font-normal">Reference</th>
                <th className="px-4 py-3 font-normal">Customer</th>
                <th className="px-4 py-3 font-normal">Placed</th>
                <th className="px-4 py-3 font-normal text-right">Total</th>
                <th className="px-4 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) =>
            <tr key={order.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-serif text-accent">{order.reference}</td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{order.customer.fullName}</p>
                    <p className="text-[11px] text-subtle">{order.customer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-subtle">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNaira(order.total)}</td>
                  <td className="px-4 py-3">
                    <select
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
                  </td>
                </tr>
            )}
            </tbody>
          </table>
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
