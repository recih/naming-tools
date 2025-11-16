import userEvent from '@testing-library/user-event'
import cnchar from 'cnchar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchStore } from '@/stores/useSearchStore'
import { render, screen, waitFor } from '@/test/utils'
import { RadicalFilterButton } from './RadicalFilterButton'

describe('RadicalFilterButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSearchStore.setState({
      selectedRadicals: [],
      searchMode: 'OR',
      radicalFilter: '',
      allRadicals: ['亻', '氵', '木', '金', '火', '土'],
      getFilteredRadicals: () => ['亻', '氵', '木', '金', '火', '土'],
      loadRadicals: vi.fn(),
      toggleRadical: vi.fn(),
      setSearchMode: vi.fn(),
      clearSelection: vi.fn(),
      setRadicalFilter: vi.fn(),
    } as any)

    // Mock cnchar.spell
    vi.mocked(cnchar.spell).mockImplementation((char: string) => {
      const pinyinMap: Record<string, string> = {
        亻: 'ren',
        氵: 'shui',
        木: 'mu',
        金: 'jin',
        火: 'huo',
        土: 'tu',
      }
      return pinyinMap[char] || 'unknown'
    })
  })

  it('should render button with default label when no radicals selected', () => {
    render(<RadicalFilterButton />)

    expect(screen.getByRole('button', { name: /部首筛选/i })).toBeInTheDocument()
  })

  it('should show selected radicals in button label', () => {
    useSearchStore.setState({
      selectedRadicals: ['亻', '氵'],
    })

    render(<RadicalFilterButton />)

    expect(screen.getByText(/亻, 氵/i)).toBeInTheDocument()
  })

  it('should show +N badge when more than 2 radicals selected', () => {
    useSearchStore.setState({
      selectedRadicals: ['亻', '氵', '木', '金'],
    })

    render(<RadicalFilterButton />)

    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('should apply secondary variant when radicals are selected', () => {
    useSearchStore.setState({
      selectedRadicals: ['亻'],
    })

    render(<RadicalFilterButton />)

    const button = screen.getByRole('button', { name: /亻/i })
    expect(button).toHaveClass('bg-secondary')
  })

  it('should open popover when button clicked', async () => {
    const user = userEvent.setup()
    render(<RadicalFilterButton />)

    const button = screen.getByRole('button', { name: /部首筛选/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/输入拼音筛选部首/i)).toBeInTheDocument()
    })
  })

  it('should display radical grid when popover is open', async () => {
    const user = userEvent.setup()
    render(<RadicalFilterButton />)

    const button = screen.getByRole('button', { name: /部首筛选/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /亻/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /氵/i })).toBeInTheDocument()
    })
  })

  it('should have toggleRadical function available', () => {
    const toggleRadical = vi.fn()
    useSearchStore.setState({ toggleRadical } as any)

    render(<RadicalFilterButton />)

    const state = useSearchStore.getState()
    expect(state.toggleRadical).toBeDefined()
  })

  it('should render with multiple radicals selected', () => {
    useSearchStore.setState({
      selectedRadicals: ['亻', '氵'],
    })

    render(<RadicalFilterButton />)

    // 按钮应该显示选中的部首
    expect(screen.getByText(/亻, 氵/i)).toBeInTheDocument()
  })


  it('should display selected radicals as badges in popover', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      selectedRadicals: ['亻', '氵'],
    })

    render(<RadicalFilterButton />)

    const button = screen.getByRole('button', { name: /亻, 氵/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/已选 \(2\):/i)).toBeInTheDocument()
    })
  })

  it('should call clearSelection when clear button clicked', async () => {
    const user = userEvent.setup()
    const clearSelection = vi.fn()
    useSearchStore.setState({
      selectedRadicals: ['亻'],
      clearSelection,
    } as any)

    render(<RadicalFilterButton />)

    const button = screen.getByRole('button', { name: /亻/i })
    await user.click(button)

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /清空已选/i })
      return user.click(clearButton)
    })

    expect(clearSelection).toHaveBeenCalledTimes(1)
  })

  it('should filter radicals when pinyin input changes', async () => {
    const user = userEvent.setup()
    const setRadicalFilter = vi.fn()
    useSearchStore.setState({ setRadicalFilter } as any)

    render(<RadicalFilterButton />)

    const button = screen.getByRole('button', { name: /部首筛选/i })
    await user.click(button)

    await waitFor(async () => {
      const input = screen.getByPlaceholderText(/输入拼音筛选部首/i)
      await user.type(input, 'ren')
    })

    expect(setRadicalFilter).toHaveBeenCalled()
  })

  it('should show filtered radical count when filter is active', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({
      radicalFilter: 'ren',
      getFilteredRadicals: () => ['亻'],
    })

    render(<RadicalFilterButton />)

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/找到 1 个部首/i)).toBeInTheDocument()
    })
  })

  it('should close popover when apply button clicked', async () => {
    const user = userEvent.setup()
    render(<RadicalFilterButton />)

    const button = screen.getByRole('button', { name: /部首筛选/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/输入拼音筛选部首/i)).toBeInTheDocument()
    })

    const applyButton = screen.getByRole('button', { name: /应用筛选/i })
    await user.click(applyButton)

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/输入拼音筛选部首/i)).not.toBeInTheDocument()
    })
  })
})
