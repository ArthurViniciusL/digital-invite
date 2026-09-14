import { Navigate } from 'react-router-dom';

import { LoginForm } from '@/components/admin/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/hooks/useSession';

const pageTitle = 'Área do organizador';
const pageDescription = 'Entre para ver quem confirmou presença.';

export function AdminLoginPage() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <div className="admin-theme min-h-dvh" />;
  }

  if (session !== null) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="admin-theme flex min-h-dvh items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
          <CardDescription>{pageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
