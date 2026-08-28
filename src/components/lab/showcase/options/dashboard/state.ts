'use client'
/**
 * State for the lab's deploy dashboard. Everything is deterministic (no `Math.random`): the fake pipeline is a
 * fixed list of log lines keyed to a 0..1 progress value that a rAF loop walks over ~4s. `useDeployApp` is the
 * single source of truth — the `04 components` layer renders it and the `02 state` layer prints it as JSON.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export type Tab = 'overview' | 'deploys' | 'flags' | 'logs'
export type Stage = 'build' | 'image' | 'push' | 'rollout'
export type DeployStatus = 'idle' | 'running' | 'ready'
export type FlagKey = 'livePreview' | 'edgeCache' | 'smoothScroll' | 'analytics'

export type AppState = {
  tab: Tab
  version: string
  flags: Record<FlagKey, boolean>
  deploy: { status: DeployStatus; stage: Stage | null; progress: number }
  logs: string[]
  banner: string | null
}

export const TABS: { value: Tab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'deploys', label: 'Deploys' },
  { value: 'flags', label: 'Flags' },
  { value: 'logs', label: 'Logs' },
]

export const FLAGS: { key: FlagKey; label: string; hint: string }[] = [
  { key: 'livePreview', label: 'Live preview', hint: 'Draft mode for editors' },
  { key: 'edgeCache', label: 'Edge cache', hint: 'Cache HTML at the edge' },
  { key: 'smoothScroll', label: 'Smooth scroll', hint: 'Lenis on the frontend' },
  { key: 'analytics', label: 'Analytics', hint: 'Anonymous page views' },
]

export const STAGES: { key: Stage; label: string; until: number }[] = [
  { key: 'build', label: 'Building', until: 0.34 },
  { key: 'image', label: 'Packing image', until: 0.58 },
  { key: 'push', label: 'Pushing', until: 0.8 },
  { key: 'rollout', label: 'Rolling out', until: 1 },
]

/** Log lines, each keyed to the progress at which it is appended. */
const PIPELINE: { at: number; line: string }[] = [
  { at: 0.0, line: '› build   queued 9f4c1ab on main' },
  { at: 0.05, line: '› build   ▲ next build · turbopack' },
  { at: 0.14, line: '› build   compiled 412 modules in 2.1s' },
  { at: 0.24, line: '› build   ✓ generating static pages (14/14)' },
  { at: 0.34, line: '› image   layering .next/standalone' },
  { at: 0.44, line: '› image   sha256:8ad31f… 62.4 MB' },
  { at: 0.58, line: '› push    registry.fly.io/portfolio:v1.4.1' },
  { at: 0.68, line: '› push    3 layers pushed, 2 cached' },
  { at: 0.8, line: '› rollout ams · 1/1 healthy' },
  { at: 0.9, line: '› rollout cdg · 1/1 healthy' },
  { at: 1, line: '› rollout ✓ live · 38 ms' },
]

export const IDLE_LOGS = [
  '› build   ✓ generating static pages (14/14)',
  '› image   sha256:41b0c7… 61.9 MB',
  '› push    registry.fly.io/portfolio:v1.4.0',
  '› rollout ams · 1/1 healthy',
  '› rollout ✓ live · 41 ms',
]

export const INITIAL: AppState = {
  tab: 'overview',
  version: 'v1.4.0',
  flags: { livePreview: true, edgeCache: true, smoothScroll: true, analytics: false },
  deploy: { status: 'idle', stage: null, progress: 0 },
  logs: IDLE_LOGS,
  banner: null,
}

const DURATION = 4000

/** `build` up to 0.34, then `image`, `push`, `rollout`. */
export const stageAt = (p: number): Stage => (STAGES.find((s) => p < s.until) ?? STAGES[STAGES.length - 1]).key

/** `v1.4.0` → `v1.4.1`. */
export const bumpVersion = (v: string) => v.replace(/(\d+)$/, (n) => String(Number(n) + 1))

export type DeployApp = {
  state: AppState
  setTab: (tab: Tab) => void
  toggleFlag: (key: FlagKey) => void
  deploy: () => void
}

/** The dashboard's whole behaviour. `deploy()` restarts the pipeline; the rAF loop only re-renders on a 1% step. */
export function useDeployApp(): DeployApp {
  const [state, setState] = useState<AppState>(INITIAL)
  const raf = useRef(0)
  const startedAt = useRef(0)

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const setTab = useCallback((tab: Tab) => setState((s) => (s.tab === tab ? s : { ...s, tab })), [])

  const toggleFlag = useCallback(
    (key: FlagKey) => setState((s) => ({ ...s, flags: { ...s.flags, [key]: !s.flags[key] } })),
    [],
  )

  const deploy = useCallback(() => {
    cancelAnimationFrame(raf.current)
    startedAt.current = performance.now()
    setState((s) => ({ ...s, banner: null, logs: [], deploy: { status: 'running', stage: 'build', progress: 0 } }))

    const tick = () => {
      const raw = Math.min(1, (performance.now() - startedAt.current) / DURATION)
      const progress = Math.round(raw * 100) / 100
      setState((s) => {
        if (s.deploy.status !== 'idle' && s.deploy.progress === progress) return s
        const logs = PIPELINE.filter((l) => l.at <= progress).map((l) => l.line)
        if (progress < 1) return { ...s, logs, deploy: { status: 'running', stage: stageAt(progress), progress } }
        return {
          ...s,
          logs,
          version: bumpVersion(s.version),
          banner: 'Deployed to production · 38 ms',
          deploy: { status: 'ready', stage: 'rollout', progress: 1 },
        }
      })
      if (raw < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }, [])

  return { state, setTab, toggleFlag, deploy }
}

/** The slice of state printed on the `02 state` layer. */
export const stateJson = (s: AppState) =>
  JSON.stringify(
    { version: s.version, flags: s.flags, deploy: { status: s.deploy.status, stage: s.deploy.stage, progress: s.deploy.progress } },
    null,
    2,
  )
