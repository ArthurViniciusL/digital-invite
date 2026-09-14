import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useSession } from '@/hooks/useSession';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  if (session === null) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
