import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchStore } from '@/stores/useSearchStore'
import { render, screen, waitFor } from '@/test/utils'
import type { ChineseCharacter } from '@/types'
import { StatsDisplay } from './StatsDisplay'

// Mock getFiveElementCounts
vi.mock('@/data/loader', () => ({
  getFiveElementCounts: vi.fn().mockReturnValue({
    金: 20,
    木: 30,
    水: 25,
    火: 15,
    土: 10,
  }),
}))

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
    word: '水',
    oldword: '水',
    strokes: '4',
    pinyin: 'shuǐ',
    radicals: '水',
    explanation: '液体',
    more: '',
  },
]

describe('StatsDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSearchStore.setState({
      searchResults: [],
    })
  })

  it('should display total count of results', () => {
    useSearchStore.setState({
      searchResults: mockCharacters,
    })

    render(<StatsDisplay />)

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText(/个字/i)).toBeInTheDocument()
  })

  it('should display zero when no results', () => {
    useSearchStore.setState({
      searchResults: [],
    })

    render(<StatsDisplay />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should open popover when clicked', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      searchResults: mockCharacters,
    })

    render(<StatsDisplay />)

    const button = screen.getByRole('button', { name: /找到/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('五行分布')).toBeInTheDocument()
    })
  })

  it('should display five element distribution in popover', async () => {
    const user = userEvent.setup()
    const { getFiveElementCounts } = await import('@/data/loader')
    vi.mocked(getFiveElementCounts).mockReturnValue({
      金: 20,
      木: 30,
      水: 25,
      火: 15,
      土: 10,
    })

    useSearchStore.setState({
      searchResults: Array(100).fill(mockCharacters[0]),
    })

    render(<StatsDisplay />)

    const button = screen.getByRole('button', { name: /找到/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('20')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  it('should display percentages correctly', async () => {
    const user = userEvent.setup()
    const { getFiveElementCounts } = await import('@/data/loader')
    vi.mocked(getFiveElementCounts).mockReturnValue({
      金: 20,
      木: 30,
      水: 25,
      火: 15,
      土: 10,
    })

    useSearchStore.setState({
      searchResults: Array(100).fill(mockCharacters[0]),
    })

    render(<StatsDisplay />)

    const button = screen.getByRole('button', { name: /找到/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('20%')).toBeInTheDocument()
      expect(screen.getByText('30%')).toBeInTheDocument()
      expect(screen.getByText('25%')).toBeInTheDocument()
      expect(screen.getByText('15%')).toBeInTheDocument()
      expect(screen.getByText('10%')).toBeInTheDocument()
    })
  })

  it('should show progress bars for each element', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      searchResults: Array(100).fill(mockCharacters[0]),
    })

    render(<StatsDisplay />)

    const button = screen.getByRole('button', { name: /找到/i })
    await user.click(button)

    await waitFor(() => {
      // 检查是否有progress bars（通过查找progressbar role）
      const progressBars = screen.getAllByRole('progressbar')
      expect(progressBars.length).toBe(5) // 五个五行元素
    })
  })

  it('should display "暂无数据" when no results', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      searchResults: [],
    })

    render(<StatsDisplay />)

    const button = screen.getByRole('button', { name: /找到/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('暂无数据')).toBeInTheDocument()
    })
  })

  it('should show total count in popover header', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      searchResults: Array(125).fill(mockCharacters[0]),
    })

    render(<StatsDisplay />)

    const button = screen.getByRole('button', { name: /找到/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/共 125 个汉字/i)).toBeInTheDocument()
    })
  })

  it('should calculate percentages correctly when total is not 100', async () => {
    const user = userEvent.setup()
    const { getFiveElementCounts } = await import('@/data/loader')
    vi.mocked(getFiveElementCounts).mockReturnValue({
      金: 10,
      木: 15,
      水: 12,
      火: 8,
      土: 5,
    })

    useSearchStore.setState({
      searchResults: Array(50).fill(mockCharacters[0]),
    })

    render(<StatsDisplay />)

    const button = screen.getByRole('button', { name: /找到/i })
    await user.click(button)

    await waitFor(() => {
      // 10/50 = 20%
      expect(screen.getByText('20%')).toBeInTheDocument()
      // 15/50 = 30%
      expect(screen.getByText('30%')).toBeInTheDocument()
    })
  })

  it('should show correct element names', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      searchResults: mockCharacters,
    })

    render(<StatsDisplay />)

    const button = screen.getByRole('button', { name: /找到/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('金')).toBeInTheDocument()
      expect(screen.getByText('木')).toBeInTheDocument()
      expect(screen.getByText('水')).toBeInTheDocument()
      expect(screen.getByText('火')).toBeInTheDocument()
      expect(screen.getByText('土')).toBeInTheDocument()
    })
  })

  it('should have correct icon', () => {
    render(<StatsDisplay />)

    const button = screen.getByRole('button', { name: /找到/i })
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should handle zero percentage correctly', async () => {
    const user = userEvent.setup()
    const { getFiveElementCounts } = await import('@/data/loader')
    vi.mocked(getFiveElementCounts).mockReturnValue({
      金: 0,
      木: 0,
      水: 0,
      火: 0,
      土: 0,
    })

    useSearchStore.setState({
      searchResults: [],
    })

    render(<StatsDisplay />)

    const button = screen.getByRole('button', { name: /找到/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('暂无数据')).toBeInTheDocument()
    })
  })
})
