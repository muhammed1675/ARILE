import React, { useEffect, useState } from 'react';
import { LogOut, Package, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { getMyOrders } from '../lib/api';
import { formatNaira, formatDate } from '../lib/format';
import { SITE } from '../data/site';
import { Order } from '../types';
import { Button } from '../components/ui/Button';

const inputClass =
'w-full border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-subtle ' +
'transition-colors duration-200 focus:border-accent focus:outline-none';

const statusLabel: Record<string, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  in_production: 'In production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

function AuthPanel() {
  const { signIn, signUp, enabled } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const result =
    mode === 'signin' ?
    await signIn(email, password) :
    await signUp(email, password, fullName);

    if (result.error) setError(result.error);else
    if (mode === 'signup')
    setNotice('Check your inbox to confirm your email, then sign in.');

    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-serif text-[2.5rem] leading-none sm:text-5xl">
        {mode === 'signin' ? 'Sign in' : 'Create account'}
      </h1>
      <p className="mt-3 text-sm font-light leading-relaxed text-muted">
        {mode === 'signin' ?
        'Track your orders and keep your measurements on file.' :
        'Save your measurements so every future order fits the first time.'}
      </p>

      {!enabled &&
      <p className="mt-6 flex items-start gap-2.5 border border-line bg-surface-2 p-4 text-[11px] font-light leading-relaxed text-muted">
          <AlertCircle size={15} strokeWidth={1.5} className="mt-px shrink-0 text-accent" />
          Accounts need Supabase credentials. Add them to your <code>.env</code> and this
          panel goes live — see <code>setup.md</code>.
        </p>
      }

      <form onSubmit={submit} className="mt-8 space-y-5">
        {mode === 'signup' &&
        <div>
            <label htmlFor="a-name" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
              Full name
            </label>
            <input
            id="a-name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            autoComplete="name" />
          
          </div>
        }

        <div>
          <label htmlFor="a-email" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
            Email
          </label>
          <input
            id="a-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email" />
          
        </div>

        <div>
          <label htmlFor="a-password" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
            Password
          </label>
          <input
            id="a-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
          
        </div>

        {error &&
        <p className="flex items-start gap-2.5 border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
            <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
            {error}
          </p>
        }
        {notice &&
        <p className="flex items-start gap-2.5 border border-success/40 bg-success/5 p-4 text-sm text-success">
            <Check size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
            {notice}
          </p>
        }

        <Button type="submit" size="lg" fullWidth disabled={busy || !enabled}>
          {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        {mode === 'signin' ? 'No account yet?' : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
            setNotice(null);
          }}
          className="text-accent underline-offset-4 transition-opacity duration-200 hover:opacity-75 hover:underline">
          
          {mode === 'signin' ? 'Create one' : 'Sign in'}
        </button>
      </p>
    </div>);

}

export function Account() {
  usePageMeta(`Account — ${SITE.name}`);
  const { user, loading, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    getMyOrders(user.id).then((res) => {
      if (res.ok && res.data) setOrders(res.data);
      setOrdersLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-container px-5 py-40 md:px-10">
        <div className="mx-auto h-8 w-48 animate-pulse bg-surface-2" />
      </div>);

  }

  if (!user) {
    return (
      <div className="mx-auto max-w-container px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <AuthPanel />
      </div>);

  }

  return (
    <div className="mx-auto max-w-container px-5 pb-24 pt-28 md:px-10 md:pt-32">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-accent">Your account</p>
          <h1 className="mt-2.5 font-serif text-[2.25rem] leading-none sm:text-4xl">
            {user.user_metadata?.full_name as string || user.email}
          </h1>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-2 border border-line px-5 py-2.5 text-[10px] uppercase tracking-widest text-muted transition-colors duration-200 hover:border-accent hover:text-accent">
          
          <LogOut size={13} strokeWidth={1.5} />
          Sign out
        </button>
      </header>

      <section className="pt-10">
        <h2 className="font-serif text-2xl">Your orders</h2>

        {ordersLoading ?
        <div className="mt-6 space-y-3">
            {Array.from({ length: 2 }).map((_, i) =>
          <div key={i} className="h-24 animate-pulse bg-surface-2" />
          )}
          </div> :
        orders.length === 0 ?
        <div className="mt-8 border border-line bg-surface p-10 text-center">
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
          </div> :

        <ul className="mt-6 space-y-3">
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
                    <p className="font-serif text-xl tabular-nums">
                      {formatNaira(order.total)}
                    </p>
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
              </li>
          )}
          </ul>
        }
      </section>
    </div>);

}