import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Showcase } from '@/components/home/Showcase'
import { home } from '@/content/home'
import {
  INITIAL,
  applyFill,
  changePct,
  reducer,
  stateJson,
  stepTickers,
  type Order,
} from '@/components/home/showcase/state'

const order = (over: Partial<Order> = {}): Order => ({
  id: 1,
  symbol: 'NVDA',
  side: 'buy',
  qty: 10,
  price: 1200,
  status: 'open',
  time: '10:00:00',
  ...over,
})

describe('price walk', () => {
  it('is deterministic for a seed and actually moves', () => {
    const a = stepTickers(INITIAL.tickers, 42)
    const b = stepTickers(INITIAL.tickers, 42)
    expect(a.seed).toBe(b.seed)
    expect(a.tickers.map((t) => t.price)).toEqual(b.tickers.map((t) => t.price))
    expect(a.tickers.map((t) => t.price)).not.toEqual(INITIAL.tickers.map((t) => t.price))
    expect(stepTickers(INITIAL.tickers, 43).tickers.map((t) => t.price)).not.toEqual(a.tickers.map((t) => t.price))
  })

  it('marks the direction and scrolls the series by one point', () => {
    const t0 = INITIAL.tickers[0]
    const t1 = stepTickers(INITIAL.tickers, 42).tickers[0]
    expect(t1.series).toHaveLength(t0.series.length)
    expect(t1.series[t1.series.length - 1]).toBe(t1.price)
    expect(t1.series.slice(0, -1)).toEqual(t0.series.slice(1))
    expect(t1.dir).toBe(t1.price > t0.price ? 'up' : 'down')
    expect(t1.rev).toBe(t0.rev + 1)
  })

  it('reads change against the day open', () => {
    expect(changePct({ ...INITIAL.tickers[0], price: 110, open: 100 })).toBeCloseTo(10)
  })
})

describe('position book', () => {
  it('averages up on a buy and reduces on a sell', () => {
    const held = [{ symbol: 'NVDA', qty: 40, avg: 1180.2 }]
    expect(applyFill(held, order({ qty: 10, price: 1280.2 }))).toEqual([{ symbol: 'NVDA', qty: 50, avg: 1200.2 }])
    expect(applyFill(held, order({ side: 'sell', qty: 15 }))).toEqual([{ symbol: 'NVDA', qty: 25, avg: 1180.2 }])
    expect(applyFill(held, order({ side: 'sell', qty: 40 }))).toEqual([])
    expect(applyFill([], order({ symbol: 'AMD', qty: 5, price: 100 }))).toEqual([
      { symbol: 'AMD', qty: 5, avg: 100 },
    ])
  })
})

describe('order reducer', () => {
  it('places an order, then fills it into the position, log and toast stack', () => {
    const placed = reducer(INITIAL, { type: 'place', at: 0 })
    expect(placed.orders[0]).toMatchObject({ symbol: 'NVDA', side: 'buy', qty: 10, status: 'open' })
    expect(placed.placing).toBe(placed.orders[0].id)

    const filled = reducer(placed, { type: 'fill', id: placed.orders[0].id, at: 0 })
    expect(filled.placing).toBeNull()
    expect(filled.orders[0].status).toBe('filled')
    expect(filled.positions.find((p) => p.symbol === 'NVDA')?.qty).toBe(50)
    expect(filled.cash).toBeLessThan(INITIAL.cash)
    expect(filled.unread).toBe(1)
    expect(filled.toasts).toHaveLength(1)
    expect(filled.activity[0].title).toBe('Order filled')
    expect(filled.activity[0].body).toMatch(/^Bought 10 NVDA @ \$/)
  })

  it('never stacks more than two toasts', () => {
    let s = INITIAL
    for (let i = 0; i < 4; i++) {
      const placed = reducer(s, { type: 'place', at: i })
      s = reducer(placed, { type: 'fill', id: placed.orders[0].id, at: i })
    }
    expect(s.toasts).toHaveLength(2)
    expect(s.activity).toHaveLength(4)
  })

  it('fires an ambient notification once the schedule comes round', () => {
    let s = { ...INITIAL, noticeAt: 1 }
    s = reducer(s, { type: 'tick', at: 1000 })
    expect(s.activity).toHaveLength(1)
    expect(s.unread).toBe(1)
    expect(s.noticeAt).toBeGreaterThan(1)
  })

  it('expires a toast on the tick after its lifetime', () => {
    const placed = reducer(INITIAL, { type: 'place', at: 0 })
    const filled = reducer(placed, { type: 'fill', id: placed.orders[0].id, at: 0 })
    expect(reducer(filled, { type: 'tick', at: 3000 }).toasts).toHaveLength(1)
    expect(reducer(filled, { type: 'tick', at: 9000 }).toasts).toHaveLength(0)
  })

  it('clears the unread count when the activity tab opens', () => {
    const placed = reducer(INITIAL, { type: 'place', at: 0 })
    const filled = reducer(placed, { type: 'fill', id: placed.orders[0].id, at: 0 })
    expect(reducer(filled, { type: 'tab', tab: 'activity' }).unread).toBe(0)
  })
})

describe('state layer JSON', () => {
  it('prints the account, selection, positions, orders and notification count', () => {
    expect(JSON.parse(stateJson(INITIAL))).toEqual({
      account: { value: expect.any(Number), dayPnl: expect.any(Number) },
      selected: 'NVDA',
      positions: [
        { symbol: 'NVDA', qty: 40, avg: 1180.2 },
        { symbol: 'MSFT', qty: 25, avg: 402.1 },
        { symbol: 'AAPL', qty: 60, avg: 178.4 },
      ],
      orders: [],
      notifications: 0,
    })
  })
})

describe('Showcase', () => {
  it('renders one interactive terminal with a label per layer', () => {
    const { container } = render(<Showcase />)
    expect(container.querySelectorAll('section#showcase')).toHaveLength(1)
    // The app is mounted once — a single order button, not one per layer.
    expect(screen.getAllByRole('button', { name: /Place order/ })).toHaveLength(1)
    for (const name of ['backend', 'state', 'layout', 'components', 'interaction']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0)
    }
  })

  it('names the demo app from the CMS', () => {
    render(<Showcase />)
    expect(screen.getAllByText(home.showcase.appName).length).toBeGreaterThan(0)
  })

  it('selects a ticker from the watchlist, through to the state layer', async () => {
    const user = userEvent.setup()
    render(<Showcase />)
    expect(document.body.textContent).toContain('"selected": "NVDA"')

    await user.click(screen.getByRole('button', { name: /TSLA/ }))

    expect(screen.getByRole('button', { name: /TSLA/ })).toHaveAttribute('aria-pressed', 'true')
    expect(document.body.textContent).toContain('"selected": "TSLA"')
  })

  it('steps the quantity and switches the order side', async () => {
    const user = userEvent.setup()
    render(<Showcase />)
    const qty = screen.getByLabelText('Quantity')
    expect(qty).toHaveTextContent('10')

    await user.click(screen.getByRole('button', { name: 'Increase Quantity' }))
    expect(qty).toHaveTextContent('11')

    await user.click(screen.getByRole('button', { name: 'sell' }))
    expect(screen.getByRole('button', { name: 'sell' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('places an order: the toast, the bell count, the position and the log all update', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Showcase />)
    expect(screen.queryByTestId('bell-count')).not.toBeInTheDocument()
    expect(screen.getByText('40 sh')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Place order/ }))
    expect(screen.getByRole('button', { name: /Placing/ })).toBeDisabled()
    await vi.advanceTimersByTimeAsync(1500)

    expect(screen.getAllByText('Order filled').length).toBeGreaterThan(0)
    expect(screen.getByTestId('bell-count')).toHaveTextContent('1')
    expect(screen.getByText('50 sh')).toBeInTheDocument()
    expect(document.body.textContent).toContain('"status": "filled"')
    vi.useRealTimers()
  })
})
