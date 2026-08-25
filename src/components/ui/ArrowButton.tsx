import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { ArrowIcon } from './Icons'

type Props = {
  to?: string
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  /** Always-visible 5px white bar on the left (the template's "Form CTA" style). Without it a 3px bar grows in on hover. */
  bar?: boolean
  arrow?: 'right' | 'up-right'
  disabled?: boolean
  className?: string
  children: string
  ariaLabel?: string
}

const ease = 'transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]'

/**
 * The template's arrow cell: label on the left, arrow on the right, `padding 25px 20px`.
 * On hover the label and the arrow slide out and a duplicate slides in (text from above, arrow from the left).
 */
export function ArrowButton({ to, href, onClick, type = 'button', bar = false, arrow = 'right', disabled, className, children, ariaLabel }: Props) {
  const cls = cn(
    'group relative flex w-full cursor-pointer items-center justify-between gap-5 px-5 py-[25px] text-left text-nav text-fg',
    disabled && 'pointer-events-none opacity-60',
    className,
  )
  const inner: ReactNode = (
    <>
      <span
        aria-hidden
        className={cn(
          'absolute left-0 top-0 h-full bg-white',
          bar ? 'w-[5px]' : 'w-[3px] origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-y-100',
        )}
      />
      <span className="relative block h-[1em] overflow-hidden">
        <span className={cn('block', ease, 'group-hover:translate-y-full')}>{children}</span>
        <span aria-hidden className={cn('absolute left-0 top-0 block -translate-y-full', ease, 'group-hover:translate-y-0')}>
          {children}
        </span>
      </span>
      <span className="relative block size-3 shrink-0 overflow-hidden">
        <ArrowIcon className={cn('size-3', ease, arrow === 'up-right' && '-rotate-45', 'group-hover:translate-x-full')} />
        <ArrowIcon
          className={cn('absolute left-0 top-0 size-3 -translate-x-full', ease, arrow === 'up-right' && '-rotate-45', 'group-hover:translate-x-0')}
        />
      </span>
    </>
  )
  if (to) {
    return (
      <Link href={to} className={cls} aria-label={ariaLabel}>
        {inner}
      </Link>
    )
  }
  if (href) {
    const external = /^https?:/.test(href)
    return (
      <a href={href} className={cls} aria-label={ariaLabel} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
        {inner}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>
      {inner}
    </button>
  )
}
