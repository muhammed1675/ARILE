import React, { useEffect, useState } from 'react';
import { LogOut, Package, AlertCircle, Check, Phone } from 'lucide-react';
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

// A permissive but real phone check: optional leading +, then 7-15 digits.
// Loose on purpose — customers order from many countries — but blocks
// obviously-empty or junk input so it's not a rubber-stamp requirement.
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.1z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4C29.6 35.1 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.9 39.7 16.4 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.5l6.6 5.4C41.6 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>);

}

function AuthPanel() {
  const { signIn, signUp, signInWithGoogle, enabled } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === 'signup' && !PHONE_PATTERN.test(phone.trim())) {
      setError('Enter a valid phone number — digits only, 7 to 15 of them.');
      return;
    }

    setBusy(true);
    const result =
    mode === 'signin' ?
    await signIn(email, password) :
    await signUp(email, password, fullName, phone.trim());

    if (result.error) setError(result.error);else
    if (mode === 'signup')
    setNotice('Check your inbox to confirm your email, then sign in.');

    setBusy(false);
  };

  const continueWithGoogle = async () => {
    setError(null);
    setGoogleBusy(true);
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
      setGoogleBusy(false);
    }
    // On success the browser is redirected to Google, so no further
    // state update happens here.
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

      <button
        type="button"
        onClick={continueWithGoogle}
        disabled={googleBusy || !enabled}
        className="mt-8 flex w-full items-center justify-center gap-3 border border-line bg-canvas py-3.5 text-xs uppercase tracking-widest text-ink transition-colors duration-200 hover:border-accent disabled:cursor-not-allowed disabled:opacity-45">
        
        <GoogleIcon />
        {googleBusy ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div className="mt-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-line" />
        <span className="text-[10px] uppercase tracking-widest text-subtle">Or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} className="mt-6 space-y-5">
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

        {mode === 'signup' &&
        <div>
            <label htmlFor="a-phone" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
              Phone number
            </label>
            <input
            id="a-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+234 800 000 0000"
            autoComplete="tel" />
          
            <p className="mt-2 text-[11px] font-light text-subtle">
              Required — we use this to reach you about your order.
            </p>
          </div>
        }

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

/**
 * Google sign-in never collects a phone number, so anyone who lands here
 * without one on file is blocked from the rest of the account page until
 * they add it. Email/password sign-up already requires it above, so this
 * only ever triggers for Google users (or older accounts predating this).
 */
function RequirePhonePanel() {
  const { savePhone, signOut } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!PHONE_PATTERN.test(phone.trim())) {
      setError('Enter a valid phone number — digits only, 7 to 15 of them.');
      return;
    }

    setBusy(true);
    const result = await savePhone(phone.trim());
    if (result.error) setError(result.error);
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line text-accent">
        <Phone size={19} strokeWidth={1.5} />
      </div>
      <h1 className="mt-5 text-center font-serif text-[2rem] leading-none sm:text-4xl">
        One last thing
      </h1>
      <p className="mt-3 text-center text-sm font-light leading-relaxed text-muted">
        Add a phone number to finish setting up your account — we use this to reach you
        about your order.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="rp-phone" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
            Phone number
          </label>
          <input
            id="rp-phone"
            type="tel"
            required
            autoFocus
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+234 800 000 0000"
            autoComplete="tel" />
          
        </div>

        {error &&
        <p className="flex items-start gap-2.5 border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
            <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
            {error}
          </p>
        }

        <Button type="submit" size="lg" fullWidth disabled={busy}>
          {busy ? 'Saving…' : 'Save and continue'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        <button
          type="button"
          onClick={signOut}
          className="text-accent underline-offset-4 transition-opacity duration-200 hover:opacity-75 hover:underline">
          
          Sign out instead
        </button>
      </p>
    </div>);

}

export function Account() {
  usePageMeta(`Account — ${SITE.name}`);
  const { user, loading, needsPhone, checkingProfile, signOut } = useAuth();
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

  if (loading || (user && checkingProfile)) {
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

  if (needsPhone) {
    return (
      <div className="mx-auto max-w-container px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <RequirePhonePanel />
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
