import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/api/auth';

const signOutLabel = 'Sair';

export function SignOutButton() {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const leaveSession = useCallback(async () => {
    setIsSigningOut(true);
    await signOut();
    void navigate('/admin/login', { replace: true });
  }, [navigate]);

  return (
    <Button
      variant="destructive"
      type="button"
      disabled={isSigningOut}
      onClick={() => {
        void leaveSession();
      }}
    >
      <LogOut aria-hidden />
      {signOutLabel}
    </Button>
  );
}
