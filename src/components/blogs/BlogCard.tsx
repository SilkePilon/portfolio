'use client'
import Link from 'next/link'
import type { Blog } from '@/content/types'
import { Corners } from '@/components/ui/Corners'
import { ArrowIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'

/** Short "Nov 18, 2025" form used on cards. */
export const shortDate = (d: string) => d.replace(/^([A-Z][a-z]{2})[a-z]*/, '$1')

/** Blog card: category + date, arrow circle, title at the bottom; hover tints the card. */
export function BlogCard({ blog, className }: { blog: Blog; className?: string }) {
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className={cn('group relative flex min-h-[300px] flex-col justify-between gap-10 border-y border-rule p-5 transition-colors duration-300 hover:bg-gray-900', className)}
    >
      <Corners />
      <div className="flex items-start justify-between gap-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-mono">{blog.category}</span>
          <span className="text-mono text-gray-500">{shortDate(blog.date)}</span>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-rule transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black">
          <ArrowIcon className="size-3 -rotate-45" />
        </span>
      </div>
      <h3 className="max-w-[300px] text-body-lg">{blog.title}</h3>
    </Link>
  )
}
