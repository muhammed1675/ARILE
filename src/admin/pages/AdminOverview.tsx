import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  Boxes,
  Mail,
  PackageCheck,
  PackageX,
  Wallet
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { adminGetEnquiries, adminGetOrders, adminGetProducts, backendReady } from '../../lib/admin-api';
import { formatDate, formatNaira } from '../../lib/format';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../data/site';
import { Order, Enquiry } from '../../types';
import { Badge, Card, CardHeader, CardTitle, StatCard } from '../components/dashboard/ui';

function statusTone(status: Order['status']): 'neutral' | 'success' | 'warning' | 'destructive' | 'accent' {
  switch (status) {
    case 'delivered':
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'destructive';
    case 'pending':
      return 'warning';
    default:
      return 'accent';
  }
}

const statusLabel: Record<Order['status'], string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  in_production: 'In production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

function formatCompactNaira(value: number) {
  if (value >= 1_000_000) return `\u20a6${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `\u20a6${(value / 1_000).toFixed(1)}K`;
  return `\u20a6${value}`;
}

/** Builds a trailing 6-month revenue trend from raw orders (excludes cancelled). */
function buildMonthlyRevenue(orders: Order[]) {
  const months: { key: string; label: string; revenue: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('en-NG', { month: 'short' }),
      revenue: 0
    });
  }
  const byKey = new Map(months.map((m) => [m.key, m]));
  orders.forEach((order) => {
    if (order.status === 'cancelled') return;
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = byKey.get(key);
    if (bucket) bucket.revenue += order.total;
  });
  return months;
}

export function AdminOverview() {
  usePageMeta(`Overview — ${SITE.name} Admin`);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!backendReady) {
      setLoading(false);
      return;
    }
    Promise.all([adminGetOrders(), adminGetProducts(), adminGetEnquiries()]).then(
      ([ordersRes, productsRes, enquiriesRes]) => {
        if (ordersRes.ok && ordersRes.data) setOrders(ordersRes.data);
        if (productsRes.ok && productsRes.data) setProductCount(productsRes.data.length);
        if (enquiriesRes.ok && enquiriesRes.data) setEnquiries(enquiriesRes.data);
        setLoading(false);
      }
    );
  }, []);

  const stats = useMemo(() => {
    const completed = orders.filter((o) => o.status === 'delivered' || o.status === 'paid').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    return { completed, cancelled, revenue };
  }, [orders]);

  const chartData = useMemo(() => buildMonthlyRevenue(orders), [orders]);
  const recentOrders = orders.slice(0, 5);
  const unhandledEnquiries = enquiries.filter((e) => !e.handled).slice(0, 4);

  if (!backendReady) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-dash-border bg-dash-surface p-4 text-sm leading-relaxed text-dash-muted-fg">
        <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-dash-accent" />
        Connect Supabase to see live store performance here — add your keys to .env, see setup.md.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          metric={{ id: 'products', label: 'Total products', value: loading ? '—' : String(productCount), icon: Boxes }}
        />
        <StatCard
          metric={{
            id: 'completed',
            label: 'Completed orders',
            value: loading ? '—' : String(stats.completed),
            icon: PackageCheck
          }}
        />
        <StatCard
          metric={{
            id: 'cancelled',
            label: 'Cancelled orders',
            value: loading ? '—' : String(stats.cancelled),
            icon: PackageX
          }}
        />
        <StatCard
          metric={{
            id: 'revenue',
            label: 'Revenue (all time)',
            value: loading ? '—' : formatNaira(stats.revenue),
            icon: Wallet
          }}
        />
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-dash-muted-fg">Revenue, last 6 months</p>
              <CardTitle className="mt-1.5 text-2xl sm:text-3xl">
                {loading ? '—' : formatNaira(stats.revenue)}
              </CardTitle>
            </div>
          </CardHeader>
          <div className="px-2 pb-4 pt-5 sm:px-5">
            <div className="h-[240px] w-full" role="img" aria-label="Monthly revenue chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgb(var(--dash-border))" strokeDasharray="3 6" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'rgb(var(--dash-muted-fg))' }}
                    dy={8}
                  />
                  <YAxis
                    width={52}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'rgb(var(--dash-muted-fg))' }}
                    tickFormatter={formatCompactNaira}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatNaira(value), 'Revenue']}
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: 'rgb(var(--dash-border))',
                      backgroundColor: 'rgb(var(--dash-surface))',
                      color: 'rgb(var(--dash-fg))',
                      fontSize: 12
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="rgb(var(--dash-fg))"
                    strokeWidth={2}
                    fill="rgb(var(--dash-fg))"
                    fillOpacity={0.06}
                    activeDot={{ r: 4, fill: 'rgb(var(--dash-fg))', stroke: 'rgb(var(--dash-surface))', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Needs attention</CardTitle>
            <Link to="/admin/enquiries" className="text-xs font-medium text-dash-accent hover:underline">
              View all
            </Link>
          </CardHeader>
          <div className="divide-y divide-dash-border">
            {loading ? (
              <p className="p-4 text-sm text-dash-muted-fg">Loading…</p>
            ) : unhandledEnquiries.length === 0 ? (
              <p className="p-4 text-sm text-dash-muted-fg">No unhandled enquiries. Nice work.</p>
            ) : (
              unhandledEnquiries.map((e) => (
                <div key={e.id} className="flex items-start gap-3 p-4">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dash-muted text-dash-fg">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-dash-fg">{e.name}</p>
                    <p className="truncate text-xs text-dash-muted-fg">{e.subject || e.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent orders</CardTitle>
            <p className="mt-1 text-xs text-dash-muted-fg">Your latest customer orders</p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-dash-accent hover:underline"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-dash-border text-[11px] uppercase tracking-wide text-dash-muted-fg">
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Date</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-dash-muted-fg">
                    Loading…
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-dash-muted-fg">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-dash-border last:border-b-0">
                    <td className="px-5 py-3 font-mono text-[12px] font-medium text-dash-fg">
                      {order.reference}
                    </td>
                    <td className="max-w-[160px] truncate px-5 py-3 text-dash-fg">
                      {order.customer.fullName}
                    </td>
                    <td className="hidden whitespace-nowrap px-5 py-3 text-dash-muted-fg sm:table-cell">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-dash-fg">
                      {formatNaira(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={statusTone(order.status)}>{statusLabel[order.status]}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
