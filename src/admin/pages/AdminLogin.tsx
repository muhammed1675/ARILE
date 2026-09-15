import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, LockKeyhole } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useToast } from '../../contexts/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../data/site';
import { Button } from '../../components/ui/Button';

const inputClass =
'w-full border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-subtle ' +
'transition-colors duration-200 focus:border-accent focus:outline-none';

export function AdminLogin() {
  usePageMeta(`Admin — ${SITE.name}`);
  const { user, loading, enabled, signIn } = useAuth();
  const { resolved, isAdmin } = useAdminAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Clear any stale error once the user changes the form.
  useEffect(() => {
    setError(null);
  }, [email, password]);

  if (!loading && user && resolved && isAdmin) {
    return <Navigate to="/admin/orders" replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    }
    setBusy(false);
  };

  const showNotAdmin = !loading && user && resolved && !isAdmin;

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-2xl tracking-brand text-ink">{SITE.name}</p>
          <p className="mt-2 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-subtle">
            <LockKeyhole size={12} strokeWidth={1.5} />
            Admin
          </p>
        </div>

        {!enabled &&
        <p className="mb-6 flex items-start gap-2.5 border border-line bg-surface-2 p-4 text-[11px] font-light leading-relaxed text-muted">
            <AlertCircle size={15} strokeWidth={1.5} className="mt-px shrink-0 text-accent" />
            Admin needs Supabase credentials. Add them to your <code>.env</code> — see{' '}
            <code>setup.md</code>.
          </p>
        }

        {showNotAdmin &&
        <p className="mb-6 flex items-start gap-2.5 border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
            <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
            This account doesn&apos;t have admin access. Run the{' '}
            <code>update public.profiles set is_admin = true …</code> statement from{' '}
            <code>setup.md</code> against this account, then sign in again.
          </p>
        }

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email" />
            
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password" />
            
          </div>

          {error &&
          <p className="flex items-start gap-2.5 border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
              <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
              {error}
            </p>
          }

          <Button type="submit" size="lg" fullWidth disabled={busy || !enabled}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-subtle">
          Not an admin? <a href="/" className="text-accent hover:underline">Back to the storefront</a>
        </p>
      </div>
    </div>);

}
