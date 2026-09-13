import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { checkIsAdmin } from '../../lib/admin-api';

interface AdminAuthState {
  /** true once we know whether the current user is an admin (or that there is no user) */
  resolved: boolean;
  isAdmin: boolean;
}

export function useAdminAuth(): AdminAuthState {
  const { user, loading } = useAuth();
  const [state, setState] = useState<AdminAuthState>({ resolved: false, isAdmin: false });

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setState({ resolved: true, isAdmin: false });
      return;
    }

    let cancelled = false;
    setState({ resolved: false, isAdmin: false });

    checkIsAdmin(user.id).then((isAdmin) => {
      if (!cancelled) setState({ resolved: true, isAdmin });
    });

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  return state;
}
