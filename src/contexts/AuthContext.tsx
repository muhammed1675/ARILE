import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo } from
'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  enabled: boolean;
  /** True once we've checked the signed-in user's profile and it has no phone on file. */
  needsPhone: boolean;
  checkingProfile: boolean;
  signIn: (email: string, password: string) => Promise<{error: string | null;}>;
  signUp: (
  email: string,
  password: string,
  fullName: string,
  phone: string)
  => Promise<{error: string | null;}>;
  signInWithGoogle: () => Promise<{error: string | null;}>;
  savePhone: (phone: string) => Promise<{error: string | null;}>;
  updateProfile: (fullName: string, phone: string) => Promise<{error: string | null;}>;
  changePassword: (newPassword: string) => Promise<{error: string | null;}>;
  requestPasswordReset: (email: string) => Promise<{error: string | null;}>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: {children: ReactNode;}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPhone, setNeedsPhone] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  const refreshPhoneStatus = useCallback(async (userId: string) => {
    if (!supabase) return;
    setCheckingProfile(true);
    const { data } = await supabase.
    from('profiles').
    select('phone').
    eq('id', userId).
    maybeSingle();
    setNeedsPhone(!data?.phone);
    setCheckingProfile(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session?.user) refreshPhoneStatus(data.session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next?.user) refreshPhoneStatus(next.user.id);else
      setNeedsPhone(false);
    });

    return () => listener.subscription.unsubscribe();
  }, [refreshPhoneStatus]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      enabled: isSupabaseConfigured,
      needsPhone,
      checkingProfile,
      signIn: async (email, password) => {
        if (!supabase) return { error: 'Accounts are not connected yet.' };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signUp: async (email, password, fullName, phone) => {
        if (!supabase) return { error: 'Accounts are not connected yet.' };
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone } }
        });
        return { error: error?.message ?? null };
      },
      signInWithGoogle: async () => {
        if (!supabase) return { error: 'Accounts are not connected yet.' };
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/account` }
        });
        return { error: error?.message ?? null };
      },
      savePhone: async (phone) => {
        if (!supabase) return { error: 'Accounts are not connected yet.' };
        const userId = session?.user?.id;
        if (!userId) return { error: 'You need to be signed in.' };
        const { error } = await supabase.
        from('profiles').
        upsert({ id: userId, phone }, { onConflict: 'id' });
        if (error) return { error: error.message };
        setNeedsPhone(false);
        return { error: null };
      },
      updateProfile: async (fullName, phone) => {
        if (!supabase) return { error: 'Accounts are not connected yet.' };
        const userId = session?.user?.id;
        if (!userId) return { error: 'You need to be signed in.' };
        const { error } = await supabase.
        from('profiles').
        upsert({ id: userId, full_name: fullName, phone }, { onConflict: 'id' });
        if (error) return { error: error.message };
        setNeedsPhone(!phone);
        return { error: null };
      },
      changePassword: async (newPassword) => {
        if (!supabase) return { error: 'Accounts are not connected yet.' };
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { error: error?.message ?? null };
      },
      requestPasswordReset: async (email) => {
        if (!supabase) return { error: 'Accounts are not connected yet.' };
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
      }
    }),
    [session, loading, needsPhone, checkingProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
