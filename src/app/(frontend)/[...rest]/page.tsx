import { notFound } from 'next/navigation'

/**
 * Catch-all for URLs no other frontend route matches. Calling notFound() here renders
 * `(frontend)/not-found.tsx` inside the site shell; without it Next falls back to its
 * bare default 404 because this app has two root layouts ((frontend) and (payload)).
 */
export default function CatchAll() {
  notFound()
}
