import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center border border-rule px-3 py-2 text-mono-bold', className)}>{children}</span>
}
