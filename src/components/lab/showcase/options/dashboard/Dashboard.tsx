'use client'
/**
 * The interactive app that lives on the `04 components` layer: a small deploy dashboard for the "portfolio"
 * project. Sidebar switches the main pane, the flag switches really toggle, and Deploy runs a ~4s fake
 * pipeline whose progress, stage and log stream come from `useDeployApp`.
 *
 * `data-skel` marks the boxes the `03 layout` layer traces; `data-ix` marks the targets the `05 interaction`
 * layer points at. Both are measured with offsetLeft/offsetTop so the 3D transform never affects them.
 */
import { ACCENT, Badge, Button, Card, Progress, Separator, Sparkline, Spinner, Switch, Tabs } from './ui'
import { FLAGS, STAGES, TABS, type DeployApp } from './state'

const STATS = [
  {
    label: 'Requests · 24h',
    value: '1.28M',
    delta: '+12.4%',
    up: true,
    data: [12, 18, 15, 22, 19, 26, 24, 30, 27, 33, 29, 38, 35, 41, 37, 44, 40, 47, 43, 50, 46, 53, 49, 58],
  },
  {
    label: 'p95 latency',
    value: '38 ms',
    delta: '−6 ms',
    up: true,
    data: [58, 54, 56, 49, 52, 47, 50, 44, 46, 42, 45, 40, 43, 39, 41, 37, 40, 36, 38, 35, 37, 34, 36, 33],
  },
  {
    label: 'Error rate',
    value: '0.02%',
    delta: 'stable',
    up: false,
    data: [8, 6, 7, 5, 6, 5, 7, 4, 5, 4, 6, 3, 5, 4, 4, 3, 5, 3, 4, 3, 4, 2, 3, 3],
  },
]

const TRAFFIC = [34, 41, 38, 46, 52, 44, 58, 63, 55, 68, 74, 66, 79, 71, 84, 77, 88, 81, 92, 86, 96, 89, 71, 62]

const DEPLOYS = [
  { sha: '9f4c1ab', message: 'feat(lab): exploded UI showcase', when: '4 m ago', duration: '38 s', status: 'Ready' },
  { sha: '2b7de90', message: 'fix(works): grid slot order', when: '2 h ago', duration: '41 s', status: 'Ready' },
  { sha: 'c81a3f5', message: 'chore: cache the CMS getters', when: 'Yesterday', duration: '44 s', status: 'Ready' },
  { sha: '5ad0c72', message: 'feat(cms): deploys collection', when: '2 d ago', duration: '1 m 02 s', status: 'Failed' },
]

const micro = 'font-mono text-[10px] leading-none tracking-[0.06em] text-gray-400 uppercase'

/** The whole dashboard. Sized by the layer it sits in (absolute inset-0). */
export function DashboardApp({ app }: { app: DeployApp }) {
  const { state, setTab, toggleFlag, deploy } = app
  const running = state.deploy.status === 'running'
  const stage = STAGES.find((s) => s.key === state.deploy.stage)
  const enabled = FLAGS.filter((f) => state.flags[f.key]).length

  return (
    <div className="relative flex h-full w-full overflow-hidden rounded-[8px] border border-white/18 bg-[#121212] text-white">
      {/* Sidebar */}
      <aside data-skel className="hidden w-[184px] shrink-0 flex-col border-r border-white/10 bg-[#0b0b0b] p-3 tablet:flex">
        <div data-skel className="flex items-center gap-2 rounded-[6px] border border-white/10 bg-white/[0.03] p-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[5px] bg-white font-mono text-[11px] text-[#0e0e0e]">p</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] leading-tight font-medium">portfolio</span>
            <span className="block truncate text-[10px] leading-tight text-gray-500">silke / production</span>
          </span>
        </div>
        <span className={`${micro} mt-5 mb-2 px-2`}>Project</span>
        <Tabs value={state.tab} onValueChange={setTab} items={TABS} />
        <div className="mt-auto flex flex-col gap-1.5">
          <Separator />
          <span className="px-2 pt-1 font-mono text-[10px] leading-none text-gray-500">{state.version}</span>
          <span className="px-2 font-mono text-[10px] leading-none text-gray-500">ams · cdg · iad</span>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header data-skel className="flex h-[52px] shrink-0 items-center gap-2 px-3 tablet:gap-3 tablet:px-4">
          <span className="text-[13px] font-medium tablet:hidden">portfolio</span>
          <Badge tone="success" dot>
            Production
          </Badge>
          <span className="hidden font-mono text-[11px] text-gray-500 tablet:inline">{state.version}</span>
          <span className="flex-1" />
          <span className="hidden tablet:block">
            <Button variant="outline" onClick={() => setTab('logs')}>
              Logs
            </Button>
          </span>
          <Button data-ix="deploy" onClick={deploy} className="min-w-[104px]">
            {running ? <Spinner /> : null}
            {running ? 'Deploying…' : 'Deploy'}
          </Button>
        </header>
        <Separator />

        {/* Pipeline strip — always mounted so the layout never jumps mid-deploy */}
        <div data-skel className="flex h-[38px] shrink-0 items-center gap-3 px-3 tablet:px-4">
          <span className={`${micro} w-[74px] shrink-0`} style={state.banner ? { color: ACCENT } : undefined}>
            {running ? stage?.label : state.banner ? 'Deployed' : 'Idle'}
          </span>
          <span className="w-[84px] shrink-0 tablet:w-[120px]">
            <Progress value={running || state.banner ? state.deploy.progress : 0} />
          </span>
          <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-gray-500">
            {state.banner ?? state.logs[state.logs.length - 1] ?? '—'}
          </span>
        </div>
        <Separator />

        {/* Phone-only tab bar (the sidebar is hidden below 810) */}
        <div className="shrink-0 px-3 pt-3 tablet:hidden">
          <Tabs value={state.tab} onValueChange={setTab} items={TABS} orientation="horizontal" />
        </div>

        <main data-skel className="min-h-0 flex-1 overflow-hidden p-3 tablet:p-4">
          {state.tab === 'overview' && (
            <div className="flex h-full flex-col gap-3">
              <div className="grid shrink-0 grid-cols-3 gap-2 tablet:gap-3">
                {STATS.map((s) => (
                  <Card key={s.label} data-skel data-ix="row" className="p-2.5 tablet:p-3">
                    <span className={`${micro} block truncate`}>{s.label}</span>
                    <span className="mt-2 flex items-baseline gap-1.5 whitespace-nowrap">
                      <span className="font-mono text-[15px] leading-none text-white tablet:text-[20px]">{s.value}</span>
                      <span className="text-[10px] leading-none" style={{ color: s.up ? ACCENT : '#777' }}>
                        {s.delta}
                      </span>
                    </span>
                    <Sparkline data={s.data} className="mt-2.5" color={s.up ? ACCENT : '#7a7a7a'} />
                  </Card>
                ))}
              </div>
              <Card data-skel className="flex min-h-0 flex-[3] flex-col p-3">
                <span className="flex shrink-0 items-center justify-between">
                  <span className={micro}>Requests · last 24 h</span>
                  <Badge>hourly</Badge>
                </span>
                <span className="mt-3 flex min-h-0 flex-1 items-end gap-[3px]">
                  {TRAFFIC.map((v, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-t-[2px]"
                      style={{ height: `${v}%`, background: i > 19 ? 'rgba(255,255,255,.26)' : 'rgba(255,255,255,.10)' }}
                    />
                  ))}
                </span>
                <span className="mt-2 flex shrink-0 justify-between font-mono text-[9px] text-gray-500">
                  <span>00:00</span>
                  <span>12:00</span>
                  <span>23:00</span>
                </span>
              </Card>
              <Card data-skel className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {DEPLOYS.slice(0, 2).map((d, i) => (
                  <span
                    key={d.sha}
                    data-ix="row"
                    className="flex flex-1 items-center gap-3 px-3"
                    style={i ? { borderTop: '1px solid rgba(255,255,255,.08)' } : undefined}
                  >
                    <span className="font-mono text-[11px] text-white">{d.sha}</span>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-gray-300">{d.message}</span>
                    <span className="hidden font-mono text-[10px] text-gray-500 tablet:inline">{d.when}</span>
                    <Badge tone="success" dot>
                      Ready
                    </Badge>
                  </span>
                ))}
              </Card>
            </div>
          )}

          {state.tab === 'deploys' && (
            <Card data-skel className="flex h-full flex-col overflow-hidden">
              {DEPLOYS.map((d, i) => (
                <span key={d.sha} data-ix="row" className="flex flex-1 items-center gap-3 px-3" style={i ? { borderTop: '1px solid rgba(255,255,255,.08)' } : undefined}>
                  <span className="font-mono text-[11px] text-white">{d.sha}</span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-gray-300">{d.message}</span>
                  <span className="hidden font-mono text-[10px] text-gray-500 tablet:inline">{d.when}</span>
                  <span className="font-mono text-[10px] text-gray-500">{d.duration}</span>
                  <Badge tone={d.status === 'Ready' ? 'success' : 'danger'} dot>
                    {d.status}
                  </Badge>
                </span>
              ))}
            </Card>
          )}

          {state.tab === 'flags' && (
            <div className="flex h-full flex-col gap-3">
              <span className="flex shrink-0 items-center justify-between">
                <span className={micro}>Feature flags</span>
                <Badge tone="solid">{`${enabled} of 4 enabled`}</Badge>
              </span>
              <Card data-skel className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {FLAGS.map((f, i) => (
                  <span
                    key={f.key}
                    data-ix="row"
                    className="flex flex-1 items-center gap-3 px-3"
                    style={i ? { borderTop: '1px solid rgba(255,255,255,.08)' } : undefined}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] text-white">{f.label}</span>
                      <span className="block truncate text-[11px] text-gray-500">{f.hint}</span>
                    </span>
                    <span className="hidden font-mono text-[10px] text-gray-500 tablet:inline">
                      {state.flags[f.key] ? 'on' : 'off'}
                    </span>
                    <Switch checked={state.flags[f.key]} onToggle={() => toggleFlag(f.key)} label={f.label} />
                  </span>
                ))}
              </Card>
            </div>
          )}

          {state.tab === 'logs' && (
            <Card data-skel className="flex h-full flex-col overflow-hidden bg-[#0b0b0b] p-3">
              <span className={`${micro} shrink-0`}>Build log · {state.version}</span>
              <span className="mt-2 flex min-h-0 flex-1 flex-col justify-end gap-[3px] overflow-hidden font-mono text-[10px] leading-[1.5] text-gray-400 tablet:text-[11px]">
                {state.logs.map((l, i) => (
                  <span key={`${i}-${l}`} className="truncate">
                    {l}
                  </span>
                ))}
              </span>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
