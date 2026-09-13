import { type ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="px-4 min-h-dvh bg-background text-foreground flex flex-col gap-8">
      {children}
    </div>
  );
}
