'use client'
import { createContext, useContext, type ReactNode } from 'react'
import { site as staticSite } from '@/content/site'

export type SiteContent = typeof staticSite

const SiteContext = createContext<SiteContent>(staticSite)

/** Makes the CMS "Site settings" available to client components (`useSite()`); falls back to the static content. */
export function SiteProvider({ value, children }: { value: SiteContent; children: ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)
