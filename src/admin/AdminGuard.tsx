import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from './hooks/useAdminAuth';

export function AdminGuard({ children }: {children: React.ReactNode;}) {
  const { user, loading } = useAuth();
  const { resolved, isAdmin } = useAdminAuth();

  if (loading || (user && !resolved)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>);

  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
