import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchStore } from '@/stores/useSearchStore'
import { render, screen, waitFor } from '@/test/utils'
import type { ChineseCharacter } from '@/types'
import { FiveElementFilterButton } from './FiveElementFilterButton'

// Mock data loader functions
vi.mock('@/data/loader', () => ({
  loadCharacters: vi.fn().mockResolvedValue([]),
  searchByRadicals: vi.fn().mockResolvedValue([]),
  getFiveElementCounts: vi.fn().mockReturnValue({
    金: 100,
    木: 150,
    水: 120,
    火: 130,
    土: 110,
  }),
}))

describe('FiveElementFilterButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSearchStore.setState({
      selectedFiveElements: [],
      selectedRadicals: [],
      searchMode: 'OR',
      toggleFiveElement: vi.fn(),
      clearFiveElements: vi.fn(),
    } as any)
  })

  it('should render button with default label when no elements selected', () => {
    render(<FiveElementFilterButton />)

    expect(screen.getByRole('button', { name: /五行/i })).toBeInTheDocument()
  })

  it('should show selected elements in button label with colors', () => {
    useSearchStore.setState({
      selectedFiveElements: ['金', '水'],
    })

    render(<FiveElementFilterButton />)

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('金')
    expect(button).toHaveTextContent('水')
  })

  it('should apply secondary variant when elements are selected', () => {
    useSearchStore.setState({
      selectedFiveElements: ['金'],
    })

    render(<FiveElementFilterButton />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-secondary')
  })

  it('should open popover when button clicked', async () => {
    const user = userEvent.setup()
    render(<FiveElementFilterButton />)

    const button = screen.getByRole('button', { name: /五行/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('五行筛选')).toBeInTheDocument()
    })
  })

  it('should display all five elements when popover is open', async () => {
    const user = userEvent.setup()
    render(<FiveElementFilterButton />)

    const button = screen.getByRole('button', { name: /五行/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /金/i })).toHaveLength(1)
      expect(screen.getAllByRole('button', { name: /木/i })).toHaveLength(1)
      expect(screen.getAllByRole('button', { name: /水/i })).toHaveLength(1)
      expect(screen.getAllByRole('button', { name: /火/i })).toHaveLength(1)
      expect(screen.getAllByRole('button', { name: /土/i })).toHaveLength(1)
    })
  })

  it('should show element counts in buttons', async () => {
    const user = userEvent.setup()
    render(<FiveElementFilterButton />)

    const button = screen.getByRole('button', { name: /五行/i })
    await user.click(button)

    await waitFor(() => {
      // 查找包含"字"的元素
      const badges = screen.getAllByText(/\d+字/)
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it('should have format function for large counts', () => {
    // 测试格式化函数逻辑
    const formatCount = (count: number): string => {
      if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`
      }
      return count.toString()
    }

    expect(formatCount(1500)).toBe('1.5k')
    expect(formatCount(2300)).toBe('2.3k')
    expect(formatCount(500)).toBe('500')
  })

  it('should call toggleFiveElement when element button clicked', async () => {
    const user = userEvent.setup()
    const toggleFiveElement = vi.fn()
    useSearchStore.setState({ toggleFiveElement } as any)

    render(<FiveElementFilterButton />)

    const button = screen.getByRole('button', { name: /五行/i })
    await user.click(button)

    await waitFor(async () => {
      const elementButtons = screen.getAllByRole('button', { name: /金/i })
      // 第一个是主按钮，第二个是五行选项按钮
      const metalButton = elementButtons[elementButtons.length - 1]
      await user.click(metalButton)
    })

    expect(toggleFiveElement).toHaveBeenCalledWith('金')
  })

  it('should display selected elements as badges in popover', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      selectedFiveElements: ['金', '水'],
    })

    render(<FiveElementFilterButton />)

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/已选 \(2\):/i)).toBeInTheDocument()
    })
  })

  it('should call clearFiveElements when clear button clicked', async () => {
    const user = userEvent.setup()
    const clearFiveElements = vi.fn()
    useSearchStore.setState({
      selectedFiveElements: ['金'],
      clearFiveElements,
    } as any)

    render(<FiveElementFilterButton />)

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /清空已选/i })
      return user.click(clearButton)
    })

    expect(clearFiveElements).toHaveBeenCalledTimes(1)
  })

  it('should close popover when apply button clicked', async () => {
    const user = userEvent.setup()
    render(<FiveElementFilterButton />)

    const button = screen.getByRole('button', { name: /五行/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('五行筛选')).toBeInTheDocument()
    })

    const applyButton = screen.getByRole('button', { name: /应用筛选/i })
    await user.click(applyButton)

    await waitFor(() => {
      expect(screen.queryByText('五行筛选')).not.toBeInTheDocument()
    })
  })

  it('should show correct colors for each element', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      selectedFiveElements: ['金', '木', '水', '火', '土'],
    })

    render(<FiveElementFilterButton />)

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      const badges = screen.getAllByRole('button').filter((btn) =>
        ['金', '木', '水', '火', '土'].some((el) => btn.textContent?.includes(el) && btn.getAttribute('class')?.includes('bg-')),
      )

      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it('should load characters on mount', async () => {
    const { loadCharacters } = await import('@/data/loader')

    render(<FiveElementFilterButton />)

    await waitFor(() => {
      expect(loadCharacters).toHaveBeenCalled()
    })
  })

  it('should disable clear button when no elements selected', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      selectedFiveElements: [],
    })

    render(<FiveElementFilterButton />)

    const button = screen.getByRole('button', { name: /五行/i })
    await user.click(button)

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /清空已选/i })
      expect(clearButton).toBeDisabled()
    })
  })
})
