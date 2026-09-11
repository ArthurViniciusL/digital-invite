import { type ReactNode } from 'react'

import { useSession } from '@/hooks/useSession'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Guard for the administrator area.
 *
 * The intended behaviour is: resolve the active Supabase session through
 * `supabase.auth.getSession()` (wrapped by `useSession`), render nothing while
 * it is still resolving, send visitors without a session to `/admin/login`, and
 * render the children otherwise.
 *
 * TODO: implement the redirect. `useSession` is still a stub, so adding
 * `<Navigate to="/admin/login" replace />` now would lock the route for
 * everyone. Wire both together in the authentication step.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading } = useSession()

  if (isLoading) {
    return null
  }

  return <>{children}</>
}
