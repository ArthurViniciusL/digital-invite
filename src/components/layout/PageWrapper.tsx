import { type ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
}

/**
 * Shared page shell: background, horizontal gutters and vertical rhythm.
 *
 * TODO: implement the "Cordel Arcade" surface once the designer delivers the
 * paper texture and the carved frame treatment.
 */
export function PageWrapper({ children }: PageWrapperProps) {
  return <div className="px-4 min-h-dvh bg-background text-foreground flex flex-col gap-8">{children}</div>
}
