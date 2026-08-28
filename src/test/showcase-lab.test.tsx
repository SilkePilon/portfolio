import { render, screen } from '@testing-library/react'
import { LabOption } from '@/components/lab/showcase/LabOption'
import { ShowcaseLab, labOptions } from '@/components/lab/showcase/ShowcaseLab'

describe('LabOption', () => {
  it('renders children and reports progress 1 in test mode', async () => {
    const onProgress = vi.fn()
    render(
      <LabOption id="x" onProgress={onProgress}>
        <span>stage</span>
      </LabOption>,
    )
    expect(screen.getByText('stage')).toBeInTheDocument()
    await Promise.resolve()
    expect(onProgress).toHaveBeenCalledWith(1)
  })
})

describe('ShowcaseLab', () => {
  it('renders all ten options', () => {
    const { container } = render(<ShowcaseLab />)
    expect(labOptions).toHaveLength(10)
    expect(container.querySelectorAll('[data-lab-option]')).toHaveLength(10)
  })
})
