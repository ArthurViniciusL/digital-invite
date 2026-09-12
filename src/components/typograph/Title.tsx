import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

export function Title({ children, className, ...props }: TitleProps) {
  return (
    <h1 className={cn('font-bold text-4xl text-ellipsis', className)} {...props}>
      {children}
    </h1>
  )
}
