import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
  as?: 'h1' | 'h2'
}

export function Title({ children, className, as: Heading = 'h1', ...props }: TitleProps) {
  return (
    <Heading className={cn('font-bold text-4xl text-ellipsis', className)} {...props}>
      {children}
    </Heading>
  )
}
