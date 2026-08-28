import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Option10Layers } from '@/components/lab/showcase/options/Option10Layers'
import { bumpVersion, stageAt, stateJson, INITIAL } from '@/components/lab/showcase/options/dashboard/state'

describe('deploy dashboard state', () => {
  it('maps progress onto pipeline stages', () => {
    expect(stageAt(0)).toBe('build')
    expect(stageAt(0.4)).toBe('image')
    expect(stageAt(0.7)).toBe('push')
    expect(stageAt(1)).toBe('rollout')
  })

  it('bumps the patch version', () => {
    expect(bumpVersion('v1.4.0')).toBe('v1.4.1')
    expect(bumpVersion('v1.4.9')).toBe('v1.4.10')
  })

  it('prints only version, flags and deploy', () => {
    expect(JSON.parse(stateJson(INITIAL))).toEqual({
      version: 'v1.4.0',
      flags: { livePreview: true, edgeCache: true, smoothScroll: true, analytics: false },
      deploy: { status: 'idle', stage: null, progress: 0 },
    })
  })
})

describe('Option10Layers', () => {
  it('renders one interactive dashboard with a label per layer', () => {
    const { container } = render(<Option10Layers />)
    expect(container.querySelectorAll('[data-lab-option]')).toHaveLength(1)
    // The app is mounted once — a single Deploy button, not one per layer.
    expect(screen.getAllByRole('button', { name: 'Deploy' })).toHaveLength(1)
    for (const name of ['backend', 'state', 'layout', 'components', 'interaction']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0)
    }
  })

  it('switches panes from the sidebar and toggles a flag through to the state layer', async () => {
    const user = userEvent.setup()
    render(<Option10Layers />)
    expect(document.body.textContent).toContain('"analytics": false')

    await user.click(screen.getAllByRole('tab', { name: 'Flags' })[0])
    const row = screen.getByRole('switch', { name: 'Analytics' })
    expect(row).toHaveAttribute('aria-checked', 'false')
    await user.click(row)

    expect(row).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('4 of 4 enabled')).toBeInTheDocument()
    expect(document.body.textContent).toContain('"analytics": true')
  })

  it('runs the deploy pipeline and bumps the version', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Option10Layers />)
    const header = screen.getAllByText('v1.4.0')
    expect(header.length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Deploy' }))
    await vi.advanceTimersByTimeAsync(5000)

    expect(await screen.findByText('Deployed to production · 38 ms')).toBeInTheDocument()
    expect(document.body.textContent).toContain('v1.4.1')
    vi.useRealTimers()
  })
})
