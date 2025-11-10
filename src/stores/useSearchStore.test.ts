import { act, renderHook } from '@testing-library/react'
import cnchar from 'cnchar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as loader from '@/data/loader'
import type { ChineseCharacter } from '@/types'
import { useSearchStore } from './useSearchStore'

// Mock loader module
vi.mock('@/data/loader', async () => {
  const actual = await vi.importActual('@/data/loader')
  return {
    ...actual,
    getAllRadicals: vi.fn(),
    searchByRadicals: vi.fn(),
    loadCharacters: vi.fn(),
    filterByFiveElements: vi.fn(),
    getStrokeCount: vi.fn(),
  }
})

// Mock data
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
  {
    word: '林',
    oldword: '林',
    strokes: '8',
    pinyin: 'lín',
    radicals: '木',
    explanation: '树林',
    more: '',
  },
]

const mockRadicals = ['女', '子', '木', '水', '火']

describe('useSearchStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    useSearchStore.setState({
      allRadicals: [],
      selectedRadicals: [],
      selectedFiveElements: [],
      searchMode: 'OR',
      sortBy: 'default',
      searchResults: [],
      isLoading: false,
      radicalFilter: '',
      isRadicalSelectorOpen: true,
      isFiveElementSelectorOpen: true,
    })
  })

  describe('loadRadicals', () => {
    it('should load radicals successfully', async () => {
      vi.mocked(loader.getAllRadicals).mockResolvedValue(mockRadicals)

      const { result } = renderHook(() => useSearchStore())

      expect(result.current.isLoading).toBe(false)

      await act(async () => {
        await result.current.loadRadicals()
      })

      expect(result.current.allRadicals).toEqual(mockRadicals)
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle load error gracefully', async () => {
      vi.mocked(loader.getAllRadicals).mockRejectedValue(
        new Error('Load failed'),
      )
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        await result.current.loadRadicals()
      })

      expect(result.current.allRadicals).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('toggleRadical', () => {
    it('should add radical when not selected', async () => {
      vi.mocked(loader.searchByRadicals).mockResolvedValue([mockCharacters[0]])

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        result.current.toggleRadical('女')
      })

      expect(result.current.selectedRadicals).toContain('女')
    })

    it('should remove radical when already selected', async () => {
      vi.mocked(loader.searchByRadicals).mockResolvedValue([mockCharacters[0]])

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        result.current.toggleRadical('女')
      })

      expect(result.current.selectedRadicals).toContain('女')

      await act(async () => {
        result.current.toggleRadical('女')
      })

      expect(result.current.selectedRadicals).not.toContain('女')
    })

    it('should auto-trigger search after toggle', async () => {
      vi.mocked(loader.searchByRadicals).mockResolvedValue([mockCharacters[0]])

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        result.current.toggleRadical('女')
      })

      expect(loader.searchByRadicals).toHaveBeenCalledWith(['女'], 'OR')
    })
  })

  describe('toggleFiveElement', () => {
    it('should add element when not selected', async () => {
      vi.mocked(loader.loadCharacters).mockResolvedValue(mockCharacters)
      vi.mocked(loader.filterByFiveElements).mockReturnValue([
        mockCharacters[1],
      ])

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        result.current.toggleFiveElement('木')
      })

      expect(result.current.selectedFiveElements).toContain('木')
    })

    it('should remove element when already selected', async () => {
      vi.mocked(loader.loadCharacters).mockResolvedValue(mockCharacters)
      vi.mocked(loader.filterByFiveElements).mockReturnValue([
        mockCharacters[1],
      ])

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        result.current.toggleFiveElement('木')
      })

      expect(result.current.selectedFiveElements).toContain('木')

      await act(async () => {
        result.current.toggleFiveElement('木')
      })

      expect(result.current.selectedFiveElements).not.toContain('木')
    })
  })

  describe('setSearchMode', () => {
    it('should update search mode', () => {
      const { result } = renderHook(() => useSearchStore())

      act(() => {
        result.current.setSearchMode('AND')
      })

      expect(result.current.searchMode).toBe('AND')
    })

    it('should re-trigger search if radicals are selected', async () => {
      vi.mocked(loader.searchByRadicals).mockResolvedValue([mockCharacters[0]])

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        result.current.toggleRadical('女')
      })

      vi.clearAllMocks()

      await act(async () => {
        result.current.setSearchMode('AND')
      })

      expect(loader.searchByRadicals).toHaveBeenCalledWith(['女'], 'AND')
    })
  })

  describe('setSortBy', () => {
    it('should update sort mode', () => {
      const { result } = renderHook(() => useSearchStore())

      act(() => {
        result.current.setSortBy('pinyin-asc')
      })

      expect(result.current.sortBy).toBe('pinyin-asc')
    })

    it('should sort existing results', async () => {
      vi.mocked(loader.getStrokeCount).mockImplementation((char: string) => {
        const map: Record<string, number> = { 好: 6, 木: 4, 林: 8 }
        return map[char] || 0
      })

      const { result } = renderHook(() => useSearchStore())

      // Set initial results
      act(() => {
        useSearchStore.setState({ searchResults: mockCharacters })
      })

      // Sort by stroke count ascending
      act(() => {
        result.current.setSortBy('stroke-asc')
      })

      expect(result.current.searchResults[0].word).toBe('木')
      expect(result.current.searchResults[2].word).toBe('林')
    })
  })

  describe('performSearch', () => {
    it('should return empty if no selection', async () => {
      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        await result.current.performSearch()
      })

      expect(result.current.searchResults).toEqual([])
    })

    it('should search by radicals only', async () => {
      vi.mocked(loader.searchByRadicals).mockResolvedValue([mockCharacters[0]])

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        result.current.toggleRadical('女')
      })

      expect(result.current.searchResults).toHaveLength(1)
      expect(loader.searchByRadicals).toHaveBeenCalledWith(['女'], 'OR')
    })

    it('should search by five elements only', async () => {
      vi.mocked(loader.loadCharacters).mockResolvedValue(mockCharacters)
      vi.mocked(loader.filterByFiveElements).mockReturnValue([
        mockCharacters[1],
      ])

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        result.current.toggleFiveElement('木')
      })

      expect(result.current.searchResults).toHaveLength(1)
      expect(loader.loadCharacters).toHaveBeenCalled()
      expect(loader.filterByFiveElements).toHaveBeenCalled()
    })

    it('should search by radicals and filter by five elements', async () => {
      vi.mocked(loader.searchByRadicals).mockResolvedValue(mockCharacters)
      vi.mocked(loader.filterByFiveElements).mockReturnValue([
        mockCharacters[1],
      ])

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        useSearchStore.setState({
          selectedRadicals: ['木'],
          selectedFiveElements: ['木'],
        })
        await result.current.performSearch()
      })

      expect(loader.searchByRadicals).toHaveBeenCalled()
      expect(loader.filterByFiveElements).toHaveBeenCalledWith(mockCharacters, [
        '木',
      ])
    })

    it('should handle search error', async () => {
      vi.mocked(loader.searchByRadicals).mockRejectedValue(
        new Error('Search failed'),
      )
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        useSearchStore.setState({ selectedRadicals: ['女'] })
        await result.current.performSearch()
      })

      expect(result.current.searchResults).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('clearSelection', () => {
    it('should clear radicals and results', async () => {
      vi.mocked(loader.searchByRadicals).mockResolvedValue([mockCharacters[0]])

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        result.current.toggleRadical('女')
      })

      expect(result.current.selectedRadicals).toHaveLength(1)
      expect(result.current.searchResults).toHaveLength(1)

      act(() => {
        result.current.clearSelection()
      })

      expect(result.current.selectedRadicals).toEqual([])
      expect(result.current.searchResults).toEqual([])
    })
  })

  describe('clearFiveElements', () => {
    it('should clear five elements and re-trigger search', async () => {
      vi.mocked(loader.loadCharacters).mockResolvedValue(mockCharacters)
      vi.mocked(loader.filterByFiveElements).mockReturnValue([
        mockCharacters[1],
      ])

      const { result } = renderHook(() => useSearchStore())

      await act(async () => {
        result.current.toggleFiveElement('木')
      })

      expect(result.current.selectedFiveElements).toContain('木')

      await act(async () => {
        result.current.clearFiveElements()
      })

      expect(result.current.selectedFiveElements).toEqual([])
    })
  })

  describe('setRadicalFilter', () => {
    it('should update radical filter', () => {
      const { result } = renderHook(() => useSearchStore())

      act(() => {
        result.current.setRadicalFilter('mu')
      })

      expect(result.current.radicalFilter).toBe('mu')
    })
  })

  describe('getFilteredRadicals', () => {
    beforeEach(() => {
      useSearchStore.setState({ allRadicals: mockRadicals })
    })

    it('should return all radicals when filter is empty', () => {
      const { result } = renderHook(() => useSearchStore())

      const filtered = result.current.getFilteredRadicals()
      expect(filtered).toEqual(mockRadicals)
    })

    it('should filter radicals by pinyin', () => {
      vi.mocked(cnchar.spell as any).mockImplementation((char: string) => {
        const map: Record<string, string> = {
          女: 'nv',
          子: 'zi',
          木: 'mu',
          水: 'shui',
          火: 'huo',
        }
        return map[char] || ''
      })

      const { result } = renderHook(() => useSearchStore())

      act(() => {
        result.current.setRadicalFilter('mu')
      })

      const filtered = result.current.getFilteredRadicals()
      expect(filtered).toContain('木')
      expect(filtered).not.toContain('女')
    })
  })

  describe('toggle collapsible sections', () => {
    it('should toggle radical selector', () => {
      const { result } = renderHook(() => useSearchStore())

      expect(result.current.isRadicalSelectorOpen).toBe(true)

      act(() => {
        result.current.toggleRadicalSelector()
      })

      expect(result.current.isRadicalSelectorOpen).toBe(false)

      act(() => {
        result.current.toggleRadicalSelector()
      })

      expect(result.current.isRadicalSelectorOpen).toBe(true)
    })

    it('should toggle five element selector', () => {
      const { result } = renderHook(() => useSearchStore())

      expect(result.current.isFiveElementSelectorOpen).toBe(true)

      act(() => {
        result.current.toggleFiveElementSelector()
      })

      expect(result.current.isFiveElementSelectorOpen).toBe(false)
    })
  })
})
