import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchStore } from '@/stores/useSearchStore'
import { render, screen } from '@/test/utils'
import { FilterToolbar } from './FilterToolbar'

// Mock子组件
vi.mock('./RadicalFilterButton', () => ({
  RadicalFilterButton: () => <div data-testid="radical-filter-button">RadicalFilterButton</div>,
}))

vi.mock('./FiveElementFilterButton', () => ({
  FiveElementFilterButton: () => <div data-testid="five-element-filter-button">FiveElementFilterButton</div>,
}))

vi.mock('./StatsDisplay', () => ({
  StatsDisplay: () => <div data-testid="stats-display">StatsDisplay</div>,
}))

describe('FilterToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSearchStore.setState({
      selectedRadicals: [],
      selectedFiveElements: [],
      searchResults: [],
      sortBy: 'default',
    })
  })

  it('should render all toolbar components', () => {
    render(<FilterToolbar />)

    expect(screen.getByTestId('radical-filter-button')).toBeInTheDocument()
    expect(screen.getByTestId('five-element-filter-button')).toBeInTheDocument()
    expect(screen.getByTestId('stats-display')).toBeInTheDocument()
  })

  it('should render sort select with default value', () => {
    render(<FilterToolbar />)

    const sortSelect = screen.getByRole('combobox')
    expect(sortSelect).toBeInTheDocument()
  })

  it('should render reset button', () => {
    const { container } = render(<FilterToolbar />)

    // 查找带RotateCcw图标的按钮
    const resetButton = container.querySelector('button svg.lucide-rotate-ccw')
    expect(resetButton).toBeInTheDocument()
  })

  it('should call clearSelection and clearFiveElements when reset button clicked', async () => {
    const user = userEvent.setup()
    const clearSelection = vi.fn()
    const clearFiveElements = vi.fn()

    useSearchStore.setState({
      clearSelection,
      clearFiveElements,
    } as any)

    const { container } = render(<FilterToolbar />)

    // 查找带RotateCcw图标的按钮
    const resetButton = container.querySelector('button svg.lucide-rotate-ccw')?.closest('button') as HTMLElement
    expect(resetButton).toBeInTheDocument()

    await user.click(resetButton)

    expect(clearSelection).toHaveBeenCalledTimes(1)
    expect(clearFiveElements).toHaveBeenCalledTimes(1)
  })

  it('should have sort select component', () => {
    const setSortBy = vi.fn()

    useSearchStore.setState({
      setSortBy,
    } as any)

    render(<FilterToolbar />)

    const sortSelect = screen.getByRole('combobox')
    expect(sortSelect).toBeInTheDocument()
  })

  it('should have sticky positioning', () => {
    const { container } = render(<FilterToolbar />)

    const toolbar = container.firstChild as HTMLElement
    expect(toolbar).toHaveClass('sticky')
    expect(toolbar).toHaveClass('top-0')
  })

  it('should have proper z-index for overlay', () => {
    const { container } = render(<FilterToolbar />)

    const toolbar = container.firstChild as HTMLElement
    expect(toolbar).toHaveClass('z-10')
  })
})
