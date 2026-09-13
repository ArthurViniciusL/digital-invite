import { type ReactNode } from 'react';

import { useSession } from '@/hooks/useSession';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
