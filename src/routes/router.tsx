import { createBrowserRouter } from 'react-router-dom'

import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { AdminLoginPage } from '@/pages/AdminLoginPage'
import { InvitePage } from '@/pages/InvitePage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

/**
 * Application routes.
 *
 * `/`            public invite and RSVP form
 * `/admin/login` public sign-in form
 * `/admin`       dashboard, behind the session guard
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <InvitePage />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
])
