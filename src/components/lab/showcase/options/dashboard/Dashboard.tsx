'use client'
/**
 * The interactive app that lives on the `04 components` layer: "Ledger", a small trading terminal. Prices walk
 * on a seeded LCG every 800 ms, the changed cells flash, sparklines scroll, the chart line slides, notifications
 * arrive on their own, and the order ticket really fills — position, cash, orders and activity all update.
 *
 * `data-skel` marks the boxes the `03 layout` layer traces; `data-ix` marks the targets the `05 interaction`
 * layer points at. Both are measured with offsetLeft/offsetTop so the 3D transform never affects them.
 */
import { memo, useMemo } from 'react'
import {
  AnimatedNumber,
  Badge,
  Bell,
  Button,
  Card,
  Flash,
  PriceChart,
  Segmented,
  Separator,
  Sparkline,
  Spinner,
  Stepper,
  Tabs,
  Toast,
  toneColor,
  AppStyles,
  DOWN,
  UP,
} from './ui'
import {
  TABS,
  TIMEFRAMES,
  WATCHLIST,
  accountValue,
  changePct,
  chartSeries,
  dayPnl,
  findTicker,
  money,
  signedMoney,
  signedPct,
  toneOf,
  type Notice,
  type Position,
  type Ticker,
  type TradingApp,
} from './state'
import { cn } from '@/lib/cn'

const micro = 'font-mono text-[10px] leading-none tracking-[0.06em] text-gray-400 uppercase'
const mono = 'font-mono tabular-nums'

/** One watchlist line: symbol, scrolling sparkline, flashing price and change. */
const WatchRow = memo(function WatchRow({
  ticker,
  position,
  selected,
  hide = false,
  onSelect,
}: {
  ticker: Ticker
  position?: Position
  selected: boolean
  hide?: boolean
  onSelect: () => void
}) {
  const pct = changePct(ticker)
  const tone = toneOf(pct)
  const color = toneColor(tone)
  return (
    <button
      type="button"
      data-ix="row"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex-1 items-center gap-2 border-t border-white/[0.07] px-2.5 text-left transition-colors first:border-t-0 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none',
        hide ? 'hidden tablet:flex' : 'flex',
        selected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]',
      )}
    >
      <span className="w-[52px] shrink-0">
        <span className={`${mono} block text-[11px] leading-tight text-white`}>{ticker.symbol}</span>
        <span className={`${mono} block text-[9px] leading-tight text-gray-500`}>
          {position ? `${position.qty} sh` : '—'}
        </span>
      </span>
      <span className="hidden min-w-0 flex-1 tablet:block">
        <Sparkline data={ticker.series.slice(-32)} color={color} className="h-6 opacity-80" />
      </span>
      <span className="flex-1 tablet:hidden" />
      <span className={`${mono} w-[76px] shrink-0 text-right text-[11px] leading-none text-white`}>
        <Flash key={ticker.rev} dir={ticker.dir}>
          {money(ticker.price)}
        </Flash>
      </span>
      <span className={`${mono} w-[54px] shrink-0 text-right text-[10px] leading-none`} style={{ color }}>
        {signedPct(pct)}
      </span>
    </button>
  )
})

/** Markets tab line: the same walk, shown as a heat chip instead of a sparkline. */
const MarketRow = memo(function MarketRow({ ticker, onSelect }: { ticker: Ticker; onSelect: () => void }) {
  const pct = changePct(ticker)
  const tone = toneOf(pct)
  const color = toneColor(tone)
  // Chip opacity tracks the size of the move, so the list reads as a heat map at a glance.
  const heat = Math.min(0.34, 0.07 + Math.abs(pct) * 0.11)
  return (
    <button
      type="button"
      data-ix="row"
      onClick={onSelect}
      className="flex flex-1 items-center gap-3 border-t border-white/[0.07] px-3 text-left transition-colors first:border-t-0 hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
    >
      <span className={`${mono} w-[54px] shrink-0 text-[11px] leading-none text-white`}>{ticker.symbol}</span>
      <span className="min-w-0 flex-1 truncate text-[11px] leading-none text-gray-500">{ticker.name}</span>
      <span className={`${mono} w-[80px] shrink-0 text-right text-[11px] leading-none text-white`}>
        <Flash key={ticker.rev} dir={ticker.dir}>
          {money(ticker.price)}
        </Flash>
      </span>
      <span
        className={`${mono} w-[62px] shrink-0 rounded-[4px] py-[3px] text-center text-[10px] leading-none`}
        style={{ color, background: `${color}${Math.round(heat * 255).toString(16).padStart(2, '0')}` }}
      >
        {signedPct(pct)}
      </span>
    </button>
  )
})

/** Notification log line, shared by the activity strip under the chart and the Activity tab. */
function ActivityLine({ notice, dense = false }: { notice: Notice; dense?: boolean }) {
  return (
    <span className={cn('lab-row-in flex items-center gap-2.5', dense ? 'py-[3px]' : 'border-t border-white/[0.07] py-2 first:border-t-0')}>
      <span className="h-[6px] w-[6px] shrink-0 rounded-full" style={{ background: toneColor(notice.tone) }} />
      <span className="shrink-0 text-[11px] leading-none text-white">{notice.title}</span>
      <span className="min-w-0 flex-1 truncate text-[11px] leading-none text-gray-500">{notice.body}</span>
      <span className={`${mono} shrink-0 text-[9px] leading-none text-gray-600`}>{notice.time}</span>
    </span>
  )
}

function Empty({ children }: { children: string }) {
  return (
    <span className="flex flex-1 items-center gap-2 text-[11px] leading-none text-gray-600">
      <span className="relative flex h-[6px] w-[6px]">
        <span className="absolute inset-0 rounded-full bg-white/25" />
        <span className="lab-pulse absolute inset-0 rounded-full bg-white/25" />
      </span>
      {children}
    </span>
  )
}

/** The whole terminal. Sized by the layer it sits in (absolute inset-0). */
export function TradingApp({ app }: { app: TradingApp }) {
  const { state, rootRef, setTab, select, setTimeframe, setSide, stepQty, placeOrder, dismiss } = app
  const { tickers, positions, orders, activity, toasts, ticket } = state

  const selected = findTicker(tickers, state.selected)
  const value = accountValue(state)
  const pnl = dayPnl(state)
  const pnlTone = toneOf(pnl)
  const selPct = changePct(selected)
  const selTone = toneOf(selPct)
  const series = useMemo(() => chartSeries(selected, state.timeframe), [selected, state.timeframe])
  const lo = Math.min(...series)
  const hi = Math.max(...series)
  const watchlist = tickers.slice(0, WATCHLIST)
  const total = ticket.qty * selected.price
  const placing = state.placing !== null
  const tabs = useMemo(() => TABS.map((t) => (t.value === 'activity' ? { ...t, badge: state.unread } : t)), [state.unread])

  return (
    <div
      ref={rootRef}
      className="relative flex h-full w-full overflow-hidden rounded-[8px] border border-white/18 bg-[#121212] text-white"
    >
      <AppStyles />

      {/* Sidebar */}
      <aside data-skel className="hidden w-[184px] shrink-0 flex-col border-r border-white/10 bg-[#0b0b0b] p-3 tablet:flex">
        <div className="flex items-center gap-2 rounded-[6px] border border-white/10 bg-white/[0.03] p-2">
          <span className={`${mono} grid h-6 w-6 shrink-0 place-items-center rounded-[5px] bg-white text-[11px] text-[#0e0e0e]`}>
            L
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] leading-tight font-medium">Ledger</span>
            <span className="block truncate text-[10px] leading-tight text-gray-500">Margin · USD</span>
          </span>
        </div>
        <span className={`${micro} mt-5 mb-2 px-2`}>Account</span>
        <Tabs value={state.tab} onValueChange={setTab} items={tabs} />
        <div className="mt-auto flex flex-col gap-1.5">
          <Separator />
          <span className={`${mono} px-2 pt-1 text-[10px] leading-none text-gray-500`}>Cash {money(state.cash)}</span>
          <span className={`${mono} px-2 text-[10px] leading-none text-gray-500`}>IEX feed · 18 ms</span>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header data-skel className="flex h-[58px] shrink-0 items-center gap-3 px-3 tablet:gap-5 tablet:px-4">
          <span className="shrink-0">
            <span className={`${micro} block`}>Account value</span>
            <AnimatedNumber
              value={value}
              format={money}
              className={`${mono} mt-1.5 block text-[17px] leading-none text-white tablet:text-[22px]`}
            />
          </span>
          <span className="shrink-0">
            <span className={`${micro} block`}>Day P&amp;L</span>
            <span className="mt-1.5 flex items-baseline gap-1.5">
              <AnimatedNumber
                value={pnl}
                format={signedMoney}
                className={`${mono} text-[13px] leading-none tablet:text-[15px]`}
                style={{ color: toneColor(pnlTone) }}
              />
              <span className={`${mono} text-[10px] leading-none`} style={{ color: toneColor(pnlTone) }}>
                {signedPct((pnl / (value - pnl)) * 100)}
              </span>
            </span>
          </span>
          <span className="flex-1" />
          <span className="hidden tablet:block">
            <Badge tone="up" dot pulse>
              Market open
            </Badge>
          </span>
          <Bell count={state.unread} />
        </header>
        <Separator />

        {/* Phone-only tab bar (the sidebar is hidden below 810) */}
        <div className="shrink-0 px-3 pt-3 tablet:hidden">
          <Tabs value={state.tab} onValueChange={setTab} items={tabs} orientation="horizontal" />
        </div>

        <main data-skel className="min-h-0 flex-1 overflow-hidden p-2.5 tablet:p-4">
          {state.tab === 'portfolio' && (
            <div className="flex h-full flex-col gap-2 tablet:flex-row tablet:gap-3">
              {/* Watchlist + order ticket */}
              <div className="order-2 flex min-h-0 flex-1 flex-col gap-2 tablet:order-1 tablet:w-[326px] tablet:shrink-0 tablet:gap-3">
                <Card data-skel className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <span className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-2.5 py-2">
                    <span className={micro}>Watchlist</span>
                    <span className={`${mono} text-[9px] leading-none text-gray-600`}>LAST · CHG</span>
                  </span>
                  <span className="flex min-h-0 flex-1 flex-col">
                    {watchlist.map((t, i) => (
                      <WatchRow
                        key={t.symbol}
                        ticker={t}
                        position={positions.find((p) => p.symbol === t.symbol)}
                        selected={t.symbol === selected.symbol}
                        hide={i >= 4}
                        onSelect={() => select(t.symbol)}
                      />
                    ))}
                  </span>
                </Card>

                <Card data-skel className="shrink-0 p-2 tablet:p-3">
                  <span className="flex items-center justify-between">
                    <span className={micro}>Order ticket</span>
                    <span className={`${mono} text-[10px] leading-none text-gray-500`}>{selected.symbol}</span>
                  </span>
                  <span className="mt-2 flex gap-1 rounded-[6px] border border-white/10 bg-white/[0.03] p-[3px] tablet:mt-2.5">
                    {(['buy', 'sell'] as const).map((side) => (
                      <button
                        key={side}
                        type="button"
                        aria-pressed={ticket.side === side}
                        onClick={() => setSide(side)}
                        className={cn(
                          'flex-1 rounded-[4px] py-1.5 text-[11px] leading-none font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none',
                          ticket.side === side ? 'text-[#0e0e0e]' : 'text-gray-400 hover:text-white',
                        )}
                        style={ticket.side === side ? { background: side === 'buy' ? UP : DOWN } : undefined}
                      >
                        {side}
                      </button>
                    ))}
                  </span>
                  <span className="mt-2 flex items-center justify-between tablet:mt-2.5">
                    <span className="text-[11px] leading-none text-gray-400">Quantity</span>
                    <Stepper value={ticket.qty} onStep={stepQty} label="Quantity" />
                  </span>
                  <span className="mt-2 flex items-baseline justify-between tablet:mt-2.5">
                    <span className="text-[11px] leading-none text-gray-400">Est. total</span>
                    <AnimatedNumber value={total} format={money} className={`${mono} text-[13px] leading-none text-white`} />
                  </span>
                  <Button
                    data-ix="order"
                    onClick={placeOrder}
                    disabled={placing}
                    className="mt-2 w-full disabled:opacity-70 tablet:mt-3"
                    style={{ background: ticket.side === 'buy' ? UP : DOWN }}
                  >
                    {placing ? <Spinner /> : null}
                    {placing ? 'Placing…' : 'Place order'}
                  </Button>
                </Card>
              </div>

              {/* Chart + live activity */}
              <div className="order-1 flex h-[32%] min-h-0 shrink-0 flex-col gap-3 tablet:order-2 tablet:h-auto tablet:flex-1 tablet:shrink">
                <Card data-skel className="flex min-h-0 flex-[3] flex-col p-3">
                  <span className="flex shrink-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span data-testid="chart-symbol" className={`${mono} text-[13px] leading-none text-white`}>
                      {selected.symbol}
                    </span>
                    <span className="hidden text-[11px] leading-none text-gray-500 tablet:inline">{selected.name}</span>
                    <span className={`${mono} text-[13px] leading-none text-white`}>
                      <Flash key={selected.rev} dir={selected.dir}>
                        {money(selected.price)}
                      </Flash>
                    </span>
                    <span className={`${mono} text-[11px] leading-none`} style={{ color: toneColor(selTone) }}>
                      {signedMoney(selected.price - selected.open)} ({signedPct(selPct)})
                    </span>
                    <span className="ml-auto">
                      <Segmented value={state.timeframe} items={TIMEFRAMES} onChange={setTimeframe} label="Timeframe" />
                    </span>
                  </span>
                  <PriceChart
                    data={series}
                    tone={selTone}
                    slide={state.timeframe === '1D'}
                    tag={money(selected.price)}
                    className="mt-3"
                  />
                  <span className={`${mono} mt-2 flex shrink-0 justify-between text-[9px] leading-none text-gray-600`}>
                    <span>O {money(selected.open)}</span>
                    <span>H {money(hi)}</span>
                    <span>L {money(lo)}</span>
                    <span className="hidden tablet:inline">VOL 4.82M</span>
                  </span>
                </Card>

                <Card data-skel className="hidden min-h-0 flex-1 flex-col overflow-hidden p-3 tablet:flex">
                  <span className="flex shrink-0 items-center justify-between">
                    <span className={micro}>Activity</span>
                    <span className={`${mono} text-[9px] leading-none text-gray-600`}>LIVE</span>
                  </span>
                  <span className="mt-2 flex min-h-0 flex-1 flex-col justify-start overflow-hidden">
                    {activity.length === 0 ? (
                      <Empty>Streaming market events…</Empty>
                    ) : (
                      activity.slice(0, 3).map((n) => <ActivityLine key={n.id} notice={n} dense />)
                    )}
                  </span>
                </Card>
              </div>
            </div>
          )}

          {state.tab === 'markets' && (
            <Card data-skel className="flex h-full flex-col overflow-hidden">
              {tickers.map((t) => (
                <MarketRow key={t.symbol} ticker={t} onSelect={() => select(t.symbol)} />
              ))}
            </Card>
          )}

          {state.tab === 'orders' && (
            <Card data-skel className="flex h-full flex-col overflow-hidden p-3">
              <span className="flex shrink-0 items-center justify-between">
                <span className={micro}>Orders</span>
                <Badge tone="solid">{`${orders.filter((o) => o.status === 'filled').length} filled`}</Badge>
              </span>
              <span className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden">
                {orders.length === 0 ? (
                  <Empty>No orders yet — place one from the Portfolio tab.</Empty>
                ) : (
                  orders.map((o) => (
                    <span key={o.id} className="lab-row-in flex items-center gap-3 border-t border-white/[0.07] py-2 first:border-t-0">
                      <span className={`${mono} w-[52px] shrink-0 text-[11px] leading-none text-white`}>{o.symbol}</span>
                      <span
                        className={`${mono} w-[38px] shrink-0 text-[10px] leading-none uppercase`}
                        style={{ color: o.side === 'buy' ? UP : DOWN }}
                      >
                        {o.side}
                      </span>
                      <span className={`${mono} w-[40px] shrink-0 text-[11px] leading-none text-gray-300`}>{o.qty}</span>
                      <span className={`${mono} min-w-0 flex-1 text-[11px] leading-none text-gray-300`}>{money(o.price)}</span>
                      <span className={`${mono} hidden shrink-0 text-[9px] leading-none text-gray-600 tablet:inline`}>{o.time}</span>
                      <Badge tone={o.status === 'filled' ? 'up' : 'muted'} dot pulse={o.status === 'open'}>
                        {o.status}
                      </Badge>
                    </span>
                  ))
                )}
              </span>
            </Card>
          )}

          {state.tab === 'activity' && (
            <Card data-skel className="flex h-full flex-col overflow-hidden p-3">
              <span className="flex shrink-0 items-center justify-between">
                <span className={micro}>Notifications</span>
                <span className={`${mono} text-[9px] leading-none text-gray-600`}>{activity.length} events</span>
              </span>
              <span className="mt-1 flex min-h-0 flex-1 flex-col overflow-hidden">
                {activity.length === 0 ? (
                  <Empty>Streaming market events…</Empty>
                ) : (
                  activity.slice(0, 7).map((n) => <ActivityLine key={n.id} notice={n} />)
                )}
              </span>
            </Card>
          )}
        </main>
      </div>

      {/* In-app notifications — at most two, dropped by the driver after ~4 s */}
      <div className="pointer-events-none absolute top-2.5 right-2.5 z-30 flex flex-col gap-2">
        {toasts.map((n) => (
          <Toast key={n.id} title={n.title} body={n.body} tone={n.tone} onClose={() => dismiss(n.id)} />
        ))}
      </div>
    </div>
  )
}
