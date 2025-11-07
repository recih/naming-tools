import userEvent from '@testing-library/user-event'
import cnchar from 'cnchar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as loader from '@/data/loader'
import { useSearchStore } from '@/stores/useSearchStore'
import { render, screen, waitFor } from '@/test/utils'
import { RadicalSelector } from './RadicalSelector'

vi.mock('@/data/loader', async () => {
  const actual = await vi.importActual('@/data/loader')
  return {
    ...actual,
    getAllRadicals: vi.fn(),
    searchByRadicals: vi.fn(),
  }
})

const mockRadicals = ['女', '子', '木', '水', '火']

describe('RadicalSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSearchStore.setState({
      allRadicals: [],
      selectedRadicals: [],
      searchMode: 'OR',
      radicalFilter: '',
      isRadicalSelectorOpen: true,
    })

    vi.mocked(loader.getAllRadicals).mockResolvedValue(mockRadicals)
    vi.mocked(loader.searchByRadicals).mockResolvedValue([])

    // Mock cnchar.spell for pinyin display
    vi.mocked(cnchar.spell as any).mockImplementation((char: string) => {
      const map: Record<string, string> = {
        女: 'nv',
        子: 'zi',
        木: 'mu',
        水: 'shui',
        火: 'huo',
      }
      return [map[char] || char]
    })
  })

  it('should load radicals on mount', async () => {
    render(<RadicalSelector />)

    await waitFor(() => {
      expect(loader.getAllRadicals).toHaveBeenCalled()
    })
  })

  it('should display radical buttons', async () => {
    render(<RadicalSelector />)

    await waitFor(() => {
      for (const radical of mockRadicals) {
        expect(screen.getByText(radical)).toBeInTheDocument()
      }
    })
  })

  it('should display pinyin for radicals', async () => {
    render(<RadicalSelector />)

    await waitFor(() => {
      expect(screen.getByText('mu')).toBeInTheDocument()
      expect(screen.getByText('nv')).toBeInTheDocument()
    })
  })

  it('should toggle radical selection on click', async () => {
    const user = userEvent.setup()
    render(<RadicalSelector />)

    await waitFor(() => {
      expect(screen.getByText('女')).toBeInTheDocument()
    })

    const radicalButton = screen.getByText('女').closest('button')
    if (radicalButton) {
      await user.click(radicalButton)
    }

    const state = useSearchStore.getState()
    expect(state.selectedRadicals).toContain('女')
  })

  it('should display selected radicals as badges', async () => {
    const user = userEvent.setup()
    render(<RadicalSelector />)

    await waitFor(() => {
      expect(screen.getByText('女')).toBeInTheDocument()
    })

    const radicalButton = screen.getByText('女').closest('button')
    if (radicalButton) {
      await user.click(radicalButton)
    }

    await waitFor(() => {
      expect(screen.getByText('已选择:')).toBeInTheDocument()
    })
  })

  it('should clear selection when clear button clicked', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      allRadicals: mockRadicals,
      selectedRadicals: ['女', '木'],
    })

    render(<RadicalSelector />)

    const clearButton = screen.getByText('清空')
    await user.click(clearButton)

    const state = useSearchStore.getState()
    expect(state.selectedRadicals).toHaveLength(0)
  })

  it('should show AND/OR mode toggle', () => {
    render(<RadicalSelector />)

    expect(screen.getByText('OR')).toBeInTheDocument()
    expect(screen.getByText('AND')).toBeInTheDocument()
  })

  it('should switch search mode when mode button clicked', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      allRadicals: mockRadicals,
      selectedRadicals: ['女'],
      searchMode: 'OR',
    })

    render(<RadicalSelector />)

    const andButton = screen.getByText('AND')
    await user.click(andButton)

    const state = useSearchStore.getState()
    expect(state.searchMode).toBe('AND')
  })

  it('should disable mode buttons when no radicals selected', () => {
    render(<RadicalSelector />)

    const orButton = screen.getByText('OR')
    const andButton = screen.getByText('AND')

    expect(orButton).toBeDisabled()
    expect(andButton).toBeDisabled()
  })

  it('should filter radicals by pinyin input', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      allRadicals: mockRadicals,
    })

    render(<RadicalSelector />)

    const input = screen.getByPlaceholderText('输入拼音筛选')
    await user.type(input, 'mu')

    await waitFor(() => {
      expect(screen.getByText('找到 1 个部首')).toBeInTheDocument()
    })
  })

  it('should clear filter when X button clicked', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      allRadicals: mockRadicals,
      radicalFilter: 'mu',
    })

    render(<RadicalSelector />)

    const clearFilterButtons = screen.getAllByRole('button')
    const clearFilterButton = clearFilterButtons.find((btn) =>
      btn.querySelector('svg.h-4.w-4'),
    )

    if (clearFilterButton) {
      await user.click(clearFilterButton)
    }

    const state = useSearchStore.getState()
    expect(state.radicalFilter).toBe('')
  })

  it('should toggle collapsible when trigger clicked', async () => {
    const user = userEvent.setup()
    render(<RadicalSelector />)

    const trigger = screen.getByText('选择偏旁部首')
    await user.click(trigger)

    const state = useSearchStore.getState()
    expect(state.isRadicalSelectorOpen).toBe(false)
  })

  it('should remove radical when badge clicked', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      allRadicals: mockRadicals,
      selectedRadicals: ['女', '木'],
    })

    render(<RadicalSelector />)

    await waitFor(() => {
      expect(screen.getByText('已选择:')).toBeInTheDocument()
    })

    // Find badge with '女' and click it
    const badges = screen.getAllByText('女')
    const badge = badges.find((el) => el.closest('.cursor-pointer'))

    if (badge) {
      await user.click(badge)
    }

    const state = useSearchStore.getState()
    expect(state.selectedRadicals).not.toContain('女')
  })
})
