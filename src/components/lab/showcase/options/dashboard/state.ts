'use client'
/**
 * State for the lab's trading dashboard ("Ledger"). Everything is deterministic — there is no `Math.random`
 * anywhere, so the server render and the first client render are identical and the whole app is replayable
 * from a seed. Prices move through `stepTickers`, a pure LCG random walk that the reducer folds into state.
 *
 * `useTradingApp` is the single source of truth: the `04 components` layer renders it, the `02 state` layer
 * prints a slice of it as JSON. One ambient driver (`setInterval`, started by an IntersectionObserver on the
 * app root, never in test mode) dispatches the tick that moves prices, expires toasts and fires the automatic
 * notification feed. The only other timer is the bounded `setTimeout` that fills a placed order.
 */
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

export type Tab = 'portfolio' | 'markets' | 'orders' | 'activity'
export type Side = 'buy' | 'sell'
export type Timeframe = '1D' | '1W' | '1M'
/** Direction of a value, used for the green / red / grey tone everywhere. */
export type Tone = 'up' | 'down' | 'flat'

export type Ticker = {
  symbol: string
  name: string
  /** Live price, moved by `stepTickers`. */
  price: number
  /** Day open — every change % on screen is `price / open - 1`. */
  open: number
  /** Per-tick volatility of the random walk. */
  vol: number
  /** Live intraday series, `LIVE_POINTS` long; a tick drops the oldest and appends the new price. */
  series: number[]
  /** Fixed longer history behind the 1W / 1M timeframes; ends at `open`. */
  history: number[]
  /** Direction of the *last* tick — picks the flash colour. */
  dir: Tone
  /** Tick counter. Used as a React key so the flash keyframe re-triggers on every change. */
  rev: number
}

export type Position = { symbol: string; qty: number; avg: number }
export type Order = {
  id: number
  symbol: string
  side: Side
  qty: number
  price: number
  status: 'open' | 'filled'
  time: string
}
export type Notice = { id: number; title: string; body: string; tone: Tone; time: string; at: number }

export type AppState = {
  tab: Tab
  selected: string
  timeframe: Timeframe
  tickers: Ticker[]
  positions: Position[]
  orders: Order[]
  /** Full notification log, newest first — the Activity tab and the `02 state` count. */
  activity: Notice[]
  /** The at most two notices currently floating over the app. */
  toasts: Notice[]
  unread: number
  ticket: { side: Side; qty: number }
  /** Id of the order waiting to fill, or null. Drives the spinner on the button. */
  placing: number | null
  cash: number
  seed: number
  ticks: number
  /** `ticks` value at which the next ambient notification fires. */
  noticeAt: number
  nextId: number
}

export const TABS: { value: Tab; label: string }[] = [
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'markets', label: 'Markets' },
  { value: 'orders', label: 'Orders' },
  { value: 'activity', label: 'Activity' },
]

export const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M']

/** How many of `tickers` show up on the Portfolio watchlist; the rest only appear under Markets. */
export const WATCHLIST = 6
/** Ambient tick: prices move, toasts expire, the notification schedule advances. */
export const TICK_MS = 800
/** A toast lives this long before the driver drops it. */
export const TOAST_MS = 4000
/** An order sits `open` this long before it fills. */
export const FILL_MS = 900
/** Ambient notifications: the first after ~7 s, then every 6.4–9.6 s. */
const NOTICE_FIRST = 9
const NOTICE_MIN = 8
const NOTICE_MAX = 12

const LIVE_POINTS = 60
const HISTORY_POINTS = 90

const round2 = (n: number) => Math.round(n * 100) / 100

/** 32-bit LCG. Pure: takes a seed, returns the next seed and a 0..1 float. */
export const rand = (seed: number): [number, number] => {
  const next = (Math.imul(seed, 1664525) + 1013904223) >>> 0
  return [next, next / 4294967296]
}

export const money = (n: number, d = 2) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`
/** `+$1,240.20` / `−$88.10` — a typographic minus, never a hyphen. */
export const signedMoney = (n: number) => `${n < 0 ? '−' : '+'}${money(Math.abs(n))}`
export const signedPct = (n: number) => `${n < 0 ? '−' : '+'}${Math.abs(n).toFixed(2)}%`
export const changePct = (t: Ticker) => (t.price / t.open - 1) * 100
export const toneOf = (n: number): Tone => (n > 0 ? 'up' : n < 0 ? 'down' : 'flat')

/** `hh:mm:ss` for the activity log. */
const clock = (at: number) => new Date(at).toTimeString().slice(0, 8)

const SEEDS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 1203.4, open: 1174.2, vol: 0.0016 },
  { symbol: 'AAPL', name: 'Apple Inc', price: 189.62, open: 191.05, vol: 0.0009 },
  { symbol: 'TSLA', name: 'Tesla Inc', price: 244.18, open: 236.9, vol: 0.0022 },
  { symbol: 'AMD', name: 'Adv. Micro Dev', price: 167.35, open: 163.4, vol: 0.0019 },
  { symbol: 'MSFT', name: 'Microsoft', price: 421.77, open: 424.6, vol: 0.0008 },
  { symbol: 'BTC', name: 'Bitcoin', price: 68420.5, open: 66980, vol: 0.0025 },
  { symbol: 'GOOGL', name: 'Alphabet A', price: 174.06, open: 172.3, vol: 0.001 },
  { symbol: 'AMZN', name: 'Amazon', price: 186.44, open: 188.7, vol: 0.0012 },
  { symbol: 'META', name: 'Meta Platforms', price: 502.19, open: 495.6, vol: 0.0014 },
  { symbol: 'AVGO', name: 'Broadcom', price: 1342.8, open: 1361.4, vol: 0.0015 },
  { symbol: 'COIN', name: 'Coinbase', price: 218.73, open: 209.9, vol: 0.0028 },
  { symbol: 'ETH', name: 'Ethereum', price: 3742.6, open: 3801.2, vol: 0.0024 },
]

/**
 * A deterministic walk of `n` points that ends exactly on `end`. Generated at module scope from a fixed seed,
 * so the markup the server produces and the markup the client hydrates are byte-identical.
 */
function walk(n: number, end: number, vol: number, seed: number): number[] {
  let s = seed
  let v = 1
  const raw: number[] = []
  for (let i = 0; i < n; i++) {
    const [ns, r] = rand(s)
    s = ns
    v *= 1 + (r - 0.5) * vol * 8
    raw.push(v)
  }
  const scale = end / raw[n - 1]
  return raw.map((x) => round2(x * scale))
}

const INITIAL_TICKERS: Ticker[] = SEEDS.map((t, i) => ({
  ...t,
  history: walk(HISTORY_POINTS, t.open, t.vol, 1013 + i * 7919),
  series: walk(LIVE_POINTS, t.price, t.vol, 4001 + i * 6151),
  dir: 'flat',
  rev: 0,
}))

export const INITIAL: AppState = {
  tab: 'portfolio',
  selected: 'NVDA',
  timeframe: '1D',
  tickers: INITIAL_TICKERS,
  positions: [
    { symbol: 'NVDA', qty: 40, avg: 1180.2 },
    { symbol: 'MSFT', qty: 25, avg: 402.1 },
    { symbol: 'AAPL', qty: 60, avg: 178.4 },
  ],
  orders: [],
  activity: [],
  toasts: [],
  unread: 0,
  ticket: { side: 'buy', qty: 10 },
  placing: null,
  cash: 24860,
  seed: 20260828,
  ticks: 0,
  noticeAt: NOTICE_FIRST,
  nextId: 1,
}

export const findTicker = (tickers: Ticker[], symbol: string): Ticker =>
  tickers.find((t) => t.symbol === symbol) ?? tickers[0]

/** Cash plus every position marked to the live price. */
export const accountValue = (s: AppState) =>
  s.positions.reduce((n, p) => n + p.qty * findTicker(s.tickers, p.symbol).price, s.cash)

/** Unrealised move since the open across every position. */
export const dayPnl = (s: AppState) =>
  s.positions.reduce((n, p) => {
    const t = findTicker(s.tickers, p.symbol)
    return n + p.qty * (t.price - t.open)
  }, 0)

/** The series the main chart draws: live intraday, or the fixed history with the live price tacked on. */
export const chartSeries = (t: Ticker, tf: Timeframe): number[] =>
  tf === '1D' ? t.series : [...t.history.slice(tf === '1W' ? -40 : -HISTORY_POINTS), t.price]

/**
 * One step of the random walk, pure and seeded. Each ticker gets a draw, nudged back toward its open so the
 * prices stay in a believable band instead of wandering off. Unchanged tickers keep their identity, so a row
 * that did not move does not flash.
 */
export function stepTickers(tickers: Ticker[], seed: number): { tickers: Ticker[]; seed: number } {
  let s = seed
  const out = tickers.map((t) => {
    const [ns, r] = rand(s)
    s = ns
    const pull = ((t.open - t.price) / t.open) * 0.06
    const price = round2(Math.max(0.01, t.price * (1 + (r - 0.5) * 2 * t.vol + pull)))
    if (price === t.price) return t
    return {
      ...t,
      price,
      dir: price > t.price ? ('up' as const) : ('down' as const),
      rev: t.rev + 1,
      series: [...t.series.slice(1), price],
    }
  })
  return { tickers: out, seed: s }
}

/** Apply a filled order to the position book: average up on a buy, reduce (and drop at zero) on a sell. */
export function applyFill(positions: Position[], o: Order): Position[] {
  const i = positions.findIndex((p) => p.symbol === o.symbol)
  const sign = o.side === 'buy' ? 1 : -1
  if (i < 0) return sign > 0 ? [...positions, { symbol: o.symbol, qty: o.qty, avg: o.price }] : positions
  const p = positions[i]
  const qty = p.qty + sign * o.qty
  if (qty <= 0) return positions.filter((_, k) => k !== i)
  const avg = sign > 0 ? round2((p.qty * p.avg + o.qty * o.price) / qty) : p.avg
  return positions.map((x, k) => (k === i ? { symbol: x.symbol, qty, avg } : x))
}

/** The ambient notification feed. Bodies read the live prices so the copy is never stale. */
const AUTO: { title: string; tone: Tone; body: (t: Ticker[]) => string }[] = [
  { title: 'Price alert', tone: 'up', body: (t) => `AAPL crossed ${money(findTicker(t, 'AAPL').price)}` },
  { title: 'Momentum', tone: 'up', body: (t) => `AMD ${signedPct(changePct(findTicker(t, 'AMD')))} in the last 5 min` },
  { title: 'Dividend received', tone: 'up', body: () => 'MSFT $12.40 credited to cash' },
  { title: 'Volume spike', tone: 'flat', body: () => 'TSLA trading at 2.4× average volume' },
  { title: 'Price alert', tone: 'down', body: (t) => `BTC fell below ${money(findTicker(t, 'BTC').price + 240)}` },
  { title: 'Earnings', tone: 'flat', body: () => 'NVDA reports after the close' },
  { title: 'Order book', tone: 'up', body: (t) => `NVDA bid ${money(findTicker(t, 'NVDA').price - 0.6)} × 400` },
  { title: 'Watchlist', tone: 'down', body: () => 'META down three sessions in a row' },
]

/** Toasts stack to at most two; the newest pushes the oldest out. */
const stack = (list: Notice[], n: Notice) => [n, ...list].slice(0, 2)
/** The log keeps a bounded window — this is a fake feed, not an archive. */
const log = (list: Notice[], n: Notice) => [n, ...list].slice(0, 24)

export type Action =
  | { type: 'tab'; tab: Tab }
  | { type: 'select'; symbol: string }
  | { type: 'timeframe'; timeframe: Timeframe }
  | { type: 'side'; side: Side }
  | { type: 'qty'; delta: number }
  | { type: 'tick'; at: number }
  | { type: 'place'; at: number }
  | { type: 'fill'; id: number; at: number }
  | { type: 'dismiss'; id: number }

export function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'tab':
      if (s.tab === a.tab) return s
      // Opening Activity is what marks the feed read.
      return { ...s, tab: a.tab, unread: a.tab === 'activity' ? 0 : s.unread }
    case 'select':
      return s.selected === a.symbol ? s : { ...s, selected: a.symbol }
    case 'timeframe':
      return s.timeframe === a.timeframe ? s : { ...s, timeframe: a.timeframe }
    case 'side':
      return s.ticket.side === a.side ? s : { ...s, ticket: { ...s.ticket, side: a.side } }
    case 'qty': {
      const qty = Math.max(1, Math.min(999, s.ticket.qty + a.delta))
      return qty === s.ticket.qty ? s : { ...s, ticket: { ...s.ticket, qty } }
    }
    case 'tick': {
      const stepped = stepTickers(s.tickers, s.seed)
      const ticks = s.ticks + 1
      const next: AppState = {
        ...s,
        tickers: stepped.tickers,
        seed: stepped.seed,
        ticks,
        toasts: s.toasts.filter((t) => a.at - t.at < TOAST_MS),
      }
      if (ticks < s.noticeAt) return next
      const [s1, pick] = rand(next.seed)
      const [s2, gap] = rand(s1)
      const tpl = AUTO[Math.floor(pick * AUTO.length) % AUTO.length]
      const notice: Notice = {
        id: next.nextId,
        title: tpl.title,
        body: tpl.body(next.tickers),
        tone: tpl.tone,
        time: clock(a.at),
        at: a.at,
      }
      return {
        ...next,
        seed: s2,
        nextId: next.nextId + 1,
        noticeAt: ticks + NOTICE_MIN + Math.floor(gap * (NOTICE_MAX - NOTICE_MIN)),
        unread: next.tab === 'activity' ? 0 : next.unread + 1,
        toasts: stack(next.toasts, notice),
        activity: log(next.activity, notice),
      }
    }
    case 'place': {
      if (s.placing !== null) return s
      const t = findTicker(s.tickers, s.selected)
      const order: Order = {
        id: s.nextId,
        symbol: t.symbol,
        side: s.ticket.side,
        qty: s.ticket.qty,
        price: t.price,
        status: 'open',
        time: clock(a.at),
      }
      return { ...s, placing: order.id, nextId: s.nextId + 1, orders: [order, ...s.orders].slice(0, 12) }
    }
    case 'fill': {
      const order = s.orders.find((o) => o.id === a.id)
      if (!order || order.status !== 'open') return { ...s, placing: null }
      const notice: Notice = {
        id: s.nextId,
        title: 'Order filled',
        body: `${order.side === 'buy' ? 'Bought' : 'Sold'} ${order.qty} ${order.symbol} @ ${money(order.price)}`,
        tone: order.side === 'buy' ? 'up' : 'down',
        time: clock(a.at),
        at: a.at,
      }
      return {
        ...s,
        placing: null,
        nextId: s.nextId + 1,
        orders: s.orders.map((o) => (o.id === a.id ? { ...o, status: 'filled' as const } : o)),
        positions: applyFill(s.positions, order),
        cash: round2(s.cash + (order.side === 'buy' ? -1 : 1) * order.qty * order.price),
        unread: s.tab === 'activity' ? 0 : s.unread + 1,
        toasts: stack(s.toasts, notice),
        activity: log(s.activity, notice),
      }
    }
    case 'dismiss':
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) }
  }
}

export type TradingApp = {
  state: AppState
  /** Attach to the app's outer box — the ambient driver only runs while this is on screen. */
  rootRef: React.RefObject<HTMLDivElement | null>
  setTab: (tab: Tab) => void
  select: (symbol: string) => void
  setTimeframe: (tf: Timeframe) => void
  setSide: (side: Side) => void
  stepQty: (delta: number) => void
  placeOrder: () => void
  dismiss: (id: number) => void
}

export function useTradingApp(): TradingApp {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const rootRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const latest = useRef(state)
  latest.current = state

  // The one ambient driver. Started by an IntersectionObserver on the app root, paused when the tab is
  // hidden, stopped on unmount, and never started under vitest so tests stay deterministic.
  useEffect(() => {
    if (import.meta.env.MODE === 'test') return
    const el = rootRef.current
    if (!el) return
    let id: ReturnType<typeof setInterval> | null = null
    const stop = () => {
      if (id) clearInterval(id)
      id = null
    }
    const start = () => {
      if (id) return
      id = setInterval(() => {
        if (!document.hidden) dispatch({ type: 'tick', at: Date.now() })
      }, TICK_MS)
    }
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0 })
    io.observe(el)
    return () => {
      io.disconnect()
      stop()
    }
  }, [])

  useEffect(
    () => () => {
      for (const t of timers.current) clearTimeout(t)
      timers.current = []
    },
    [],
  )

  const setTab = useCallback((tab: Tab) => dispatch({ type: 'tab', tab }), [])
  const select = useCallback((symbol: string) => dispatch({ type: 'select', symbol }), [])
  const setTimeframe = useCallback((timeframe: Timeframe) => dispatch({ type: 'timeframe', timeframe }), [])
  const setSide = useCallback((side: Side) => dispatch({ type: 'side', side }), [])
  const stepQty = useCallback((delta: number) => dispatch({ type: 'qty', delta }), [])
  const dismiss = useCallback((id: number) => dispatch({ type: 'dismiss', id }), [])

  // User-initiated, so it runs whether or not the ambient driver is awake; the handle is cleared on unmount.
  // The reducer stamps the new order with `nextId`, so the fill can be scheduled without waiting for a render.
  const placeOrder = useCallback(() => {
    const s = latest.current
    if (s.placing !== null) return
    const id = s.nextId
    dispatch({ type: 'place', at: Date.now() })
    timers.current.push(setTimeout(() => dispatch({ type: 'fill', id, at: Date.now() }), FILL_MS))
  }, [])

  return { state, rootRef, setTab, select, setTimeframe, setSide, stepQty, placeOrder, dismiss }
}

/** The slice of state printed on the `02 state` layer — hand-formatted so it stays inside the sheet. */
export function stateJson(s: AppState): string {
  const rows = (list: string[]) => list.map((l, i) => (i === list.length - 1 ? l : `${l},`))
  const positions = s.positions.map(
    (p) => `    { "symbol": "${p.symbol}", "qty": ${p.qty}, "avg": ${p.avg} }`,
  )
  const orders = s.orders
    .slice(0, 3)
    .map((o) => `    { "symbol": "${o.symbol}", "side": "${o.side}", "qty": ${o.qty}, "status": "${o.status}" }`)
  return [
    '{',
    `  "account": { "value": ${round2(accountValue(s))}, "dayPnl": ${round2(dayPnl(s))} },`,
    `  "selected": "${s.selected}",`,
    '  "positions": [',
    ...rows(positions),
    '  ],',
    '  "orders": [',
    ...rows(orders),
    '  ],',
    `  "notifications": ${s.activity.length}`,
    '}',
  ].join('\n')
}
