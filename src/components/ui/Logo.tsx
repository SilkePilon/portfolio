'use client'
import Link from 'next/link'
import { useSite } from '@/components/layout/SiteProvider'
import { cn } from '@/lib/cn'
import { LogoMark } from './Icons'

/** Brand mark + two-line wordmark, links home. */
export function Logo({ className }: { className?: string }) {
  const site = useSite()
  return (
    <Link href="/" aria-label={site.name} className={cn('flex shrink-0 items-center gap-[5px] text-fg', className)}>
      <LogoMark className="h-[30px] w-9" />
      <span className="flex flex-col font-display text-[13px] font-bold uppercase leading-none tracking-[-0.02em]">
        <span>{site.wordmark[0]}</span>
        <span>{site.wordmark[1]}</span>
      </span>
    </Link>
  )
}
