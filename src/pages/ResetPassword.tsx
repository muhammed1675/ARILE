import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { SITE } from '../data/site';
import { Button } from '../components/ui/Button';

const inputClass =
'w-full border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-subtle ' +
'transition-colors duration-200 focus:border-accent focus:outline-none';

/**
 * Reached via the link Supabase emails after "Forgot password?". Supabase
 * establishes a temporary recovery session automatically when that link is
 * opened, so this page just needs to collect the new password and call
 * updateUser — no token handling of our own required.
 */
export function ResetPassword() {
  usePageMeta(`Reset password — ${SITE.name}`);
  const { user, loading, changePassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user && !done) {
      toast.error('That reset link has expired. Request a new one from the sign-in page.');
      navigate('/account');
    }
  }, [loading, user, done, navigate, toast]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setBusy(true);
    const result = await changePassword(password);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setDone(true);
    toast.success('Password updated — you can sign in with it now.');
    window.setTimeout(() => navigate('/account'), 1200);
  };

  if (loading || (!user && !done)) {
    return (
      <div className="mx-auto max-w-container px-5 py-40 md:px-10">
        <div className="mx-auto h-8 w-48 animate-pulse bg-surface-2" />
      </div>);

  }

  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-line text-accent">
        <KeyRound size={20} strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 text-center font-serif text-[2.25rem] leading-none sm:text-5xl">
        Set a new password
      </h1>

      <form onSubmit={submit} className="mt-9 space-y-5">
        <div>
          <label htmlFor="rp-pw" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
            New password
          </label>
          <input
            id="rp-pw"
            type="password"
            required
            minLength={6}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password" />
          
        </div>

        <div>
          <label htmlFor="rp-confirm" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
            Confirm new password
          </label>
          <input
            id="rp-confirm"
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
            autoComplete="new-password" />
          
        </div>

        <Button type="submit" size="lg" fullWidth disabled={busy}>
          {busy ? 'Saving…' : 'Save new password'}
        </Button>
      </form>
    </div>);

}
