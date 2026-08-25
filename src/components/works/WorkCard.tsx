'use client'
import { Fragment } from 'react'
import Link from 'next/link'
import { LiquidImage } from '@/components/anim/LiquidImage'
import { Corners } from '@/components/ui/Corners'
import type { Work } from '@/content/types'

/**
 * One project card: ruled image box with the liquid hover mask on top and a title / services row
 * underneath. It fills its cell, so the caller owns the aspect ratio (580×480 wide, 290×350 narrow).
 */
export function WorkCard({ work }: { work: Work }) {
  return (
    <Link href={`/works/${work.slug}`} className="group flex h-full w-full flex-col gap-3.5 tablet:gap-5">
      <div className="relative min-h-0 flex-1 border border-rule bg-black p-2.5 tablet:p-5">
        <Corners />
        <div className="relative h-full w-full overflow-hidden shadow-[0_0_0_1px_var(--rule)]">
          <LiquidImage
            base={work.cover}
            hover={work.hoverCover}
            className="transition-transform duration-500 ease-out-expo group-hover:scale-[1.05]"
          />
        </div>
      </div>
      <div className="flex items-start px-2.5 tablet:px-5">
        <h3 className="min-w-0 flex-1 text-h4">{work.title}</h3>
        <p className="whitespace-pre text-right text-mono">
          {work.services.map((service, i) => (
            <Fragment key={service}>
              {i > 0 && <br />}
              {service}
            </Fragment>
          ))}
        </p>
      </div>
    </Link>
  )
}
