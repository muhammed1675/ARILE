import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo } from
'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  enabled: boolean;
  signIn: (email: string, password: string) => Promise<{error: string | null;}>;
  signUp: (
  email: string,
  password: string,
  fullName: string)
  => Promise<{error: string | null;}>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: {children: ReactNode;}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      enabled: isSupabaseConfigured,
      signIn: async (email, password) => {
        if (!supabase) return { error: 'Accounts are not connected yet.' };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signUp: async (email, password, fullName) => {
        if (!supabase) return { error: 'Accounts are not connected yet.' };
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
      }
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}