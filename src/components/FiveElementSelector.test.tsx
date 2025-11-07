import userEvent from '@testing-library/user-event'
import cnchar from 'cnchar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as loader from '@/data/loader'
import { useSearchStore } from '@/stores/useSearchStore'
import { render, screen, waitFor } from '@/test/utils'
import type { ChineseCharacter } from '@/types'
import { FiveElementSelector } from './FiveElementSelector'

vi.mock('@/data/loader', async () => {
  const actual = await vi.importActual('@/data/loader')
  return {
    ...actual,
    loadCharacters: vi.fn(),
    searchByRadicals: vi.fn(),
    getFiveElementCounts: vi.fn(),
  }
})

const mockCharacters: ChineseCharacter[] = [
  {
    word: '好',
    oldword: '好',
    strokes: '6',
    pinyin: 'hǎo',
    radicals: '女',
    explanation: '优点多',
    more: '',
  },
  {
    word: '木',
    oldword: '木',
    strokes: '4',
    pinyin: 'mù',
    radicals: '木',
    explanation: '树木',
    more: '',
  },
]

describe('FiveElementSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSearchStore.setState({
      selectedRadicals: [],
      selectedFiveElements: [],
      searchMode: 'OR',
      isFiveElementSelectorOpen: true,
    })

    vi.mocked(loader.loadCharacters).mockResolvedValue(mockCharacters)
    vi.mocked(loader.searchByRadicals).mockResolvedValue(mockCharacters)
    vi.mocked(loader.getFiveElementCounts).mockReturnValue({
      金: 100,
      木: 200,
      水: 150,
      火: 120,
      土: 80,
    })

    // Mock cnchar.info
    vi.mocked(cnchar.info).mockReturnValue([{ fiveElement: '木' }] as any)
  })

  it('should render all five elements', () => {
    render(<FiveElementSelector />)

    expect(screen.getByText('金')).toBeInTheDocument()
    expect(screen.getByText('木')).toBeInTheDocument()
    expect(screen.getByText('水')).toBeInTheDocument()
    expect(screen.getByText('火')).toBeInTheDocument()
    expect(screen.getByText('土')).toBeInTheDocument()
  })

  it('should display element counts', async () => {
    render(<FiveElementSelector />)

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('200')).toBeInTheDocument()
    })
  })

  it('should format large counts with k suffix', async () => {
    vi.mocked(loader.getFiveElementCounts).mockReturnValue({
      金: 1500,
      木: 2000,
      水: 1200,
      火: 1800,
      土: 800,
    })

    render(<FiveElementSelector />)

    await waitFor(() => {
      expect(screen.getByText('1.5k')).toBeInTheDocument()
      expect(screen.getByText('2.0k')).toBeInTheDocument()
    })
  })

  it('should toggle element selection on click', async () => {
    const user = userEvent.setup()
    render(<FiveElementSelector />)

    const woodButton = screen.getByText('木').closest('button')
    if (woodButton) {
      await user.click(woodButton)
    }

    const state = useSearchStore.getState()
    expect(state.selectedFiveElements).toContain('木')
  })

  it('should display selected elements as badges', async () => {
    const user = userEvent.setup()
    render(<FiveElementSelector />)

    const woodButton = screen.getByText('木').closest('button')
    if (woodButton) {
      await user.click(woodButton)
    }

    await waitFor(() => {
      expect(screen.getByText('已选择:')).toBeInTheDocument()
    })
  })

  it('should clear selection when clear button clicked', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      selectedFiveElements: ['木', '水'],
    })

    render(<FiveElementSelector />)

    const clearButton = screen.getByText('清空筛选')
    await user.click(clearButton)

    const state = useSearchStore.getState()
    expect(state.selectedFiveElements).toHaveLength(0)
  })

  it('should show clear button only when elements are selected', () => {
    const { rerender } = render(<FiveElementSelector />)

    expect(screen.queryByText('清空筛选')).not.toBeInTheDocument()

    useSearchStore.setState({ selectedFiveElements: ['木'] })
    rerender(<FiveElementSelector />)

    expect(screen.getByText('清空筛选')).toBeInTheDocument()
  })

  it('should toggle collapsible when trigger clicked', async () => {
    const user = userEvent.setup()
    render(<FiveElementSelector />)

    const trigger = screen.getByText('按五行筛选')
    await user.click(trigger)

    const state = useSearchStore.getState()
    expect(state.isFiveElementSelectorOpen).toBe(false)
  })

  it('should update counts based on radical selection', async () => {
    useSearchStore.setState({
      selectedRadicals: ['木'],
    })

    vi.mocked(loader.searchByRadicals).mockResolvedValue([mockCharacters[1]])
    vi.mocked(loader.getFiveElementCounts).mockReturnValue({
      金: 0,
      木: 50,
      水: 0,
      火: 0,
      土: 0,
    })

    render(<FiveElementSelector />)

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument()
    })

    expect(loader.searchByRadicals).toHaveBeenCalledWith(['木'], 'OR')
  })

  it('should remove element when badge clicked', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      selectedFiveElements: ['木', '水'],
    })

    render(<FiveElementSelector />)

    await waitFor(() => {
      expect(screen.getByText('已选择:')).toBeInTheDocument()
    })

    // Find badges and click the first one (木)
    const badges = screen.getAllByText('木')
    const badge = badges.find((el) => el.closest('.cursor-pointer'))

    if (badge) {
      await user.click(badge)
    }

    const state = useSearchStore.getState()
    expect(state.selectedFiveElements).not.toContain('木')
  })

  it('should apply correct colors to element buttons', () => {
    render(<FiveElementSelector />)

    const elements = [
      { text: '金', colorClass: 'bg-amber-400' },
      { text: '木', colorClass: 'bg-green-500' },
      { text: '水', colorClass: 'bg-blue-500' },
      { text: '火', colorClass: 'bg-red-500' },
      { text: '土', colorClass: 'bg-yellow-700' },
    ]

    for (const { text, colorClass } of elements) {
      const button = screen.getByText(text).closest('button')
      expect(button).toHaveClass(colorClass)
    }
  })

  it('should highlight selected elements with ring', async () => {
    const user = userEvent.setup()
    render(<FiveElementSelector />)

    const woodButton = screen.getByText('木').closest('button')
    expect(woodButton).not.toHaveClass('ring-4')

    if (woodButton) {
      await user.click(woodButton)
    }

    await waitFor(() => {
      expect(woodButton).toHaveClass('ring-4')
    })
  })

  it('should load characters on mount', async () => {
    render(<FiveElementSelector />)

    await waitFor(() => {
      expect(loader.loadCharacters).toHaveBeenCalled()
    })
  })
})
