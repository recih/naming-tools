import cnchar from 'cnchar'
import { create } from 'zustand'
import {
  filterByFiveElements,
  getAllRadicals,
  getStrokeCount,
  loadCharacters,
  searchByRadicals,
} from '@/data/loader'
import type {
  ChineseCharacter,
  FiveElement,
  SearchMode,
  SortMode,
} from '@/types'

interface SearchState {
  // 状态
  allRadicals: string[]
  selectedRadicals: string[]
  selectedFiveElements: FiveElement[]
  searchMode: SearchMode
  sortBy: SortMode
  searchResults: ChineseCharacter[]
  isLoading: boolean
  radicalFilter: string
  isRadicalSelectorOpen: boolean
  isFiveElementSelectorOpen: boolean

  // 计算属性
  getFilteredRadicals: () => string[]

  // Actions
  loadRadicals: () => Promise<void>
  toggleRadical: (radical: string) => void
  toggleFiveElement: (element: FiveElement) => void
  setSearchMode: (mode: SearchMode) => void
  setSortBy: (mode: SortMode) => void
  performSearch: () => Promise<void>
  clearSelection: () => void
  clearFiveElements: () => void
  setRadicalFilter: (filter: string) => void
  toggleRadicalSelector: () => void
  toggleFiveElementSelector: () => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // 初始状态
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

  // 计算属性：根据拼音过滤部首
  getFilteredRadicals: () => {
    const { allRadicals, radicalFilter } = get()
    if (!radicalFilter.trim()) {
      return allRadicals
    }

    const filter = radicalFilter.toLowerCase().trim()
    return allRadicals.filter((radical) => {
      const pinyinResult = cnchar.spell(radical, 'low')
      const pinyin = Array.isArray(pinyinResult)
        ? pinyinResult.join('')
        : String(pinyinResult)
      return pinyin.includes(filter)
    })
  },

  // 加载所有部首
  loadRadicals: async () => {
    set({ isLoading: true })
    try {
      const radicals = await getAllRadicals()
      set({ allRadicals: radicals })
    } catch (error) {
      console.error('Failed to load radicals:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  // 切换部首选择状态
  toggleRadical: (radical: string) => {
    const { selectedRadicals } = get()
    const isSelected = selectedRadicals.includes(radical)

    const newSelection = isSelected
      ? selectedRadicals.filter((r) => r !== radical)
      : [...selectedRadicals, radical]

    set({ selectedRadicals: newSelection })

    // 自动触发搜索
    get().performSearch()
  },

  // 切换五行选择状态
  toggleFiveElement: (element: FiveElement) => {
    const { selectedFiveElements } = get()
    const isSelected = selectedFiveElements.includes(element)

    const newSelection = isSelected
      ? selectedFiveElements.filter((e) => e !== element)
      : [...selectedFiveElements, element]

    set({ selectedFiveElements: newSelection })

    // 自动触发搜索
    get().performSearch()
  },

  // 设置搜索模式
  setSearchMode: (mode: SearchMode) => {
    set({ searchMode: mode })
    // 如果已有选择，自动重新搜索
    if (get().selectedRadicals.length > 0) {
      get().performSearch()
    }
  },

  // 设置排序模式
  setSortBy: (mode: SortMode) => {
    const { searchResults } = get()
    set({ sortBy: mode })
    // 如果有结果，立即重新排序
    if (searchResults.length > 0) {
      const sortedResults = applySorting([...searchResults], mode)
      set({ searchResults: sortedResults })
    }
  },

  // 执行搜索
  performSearch: async () => {
    const { selectedRadicals, selectedFiveElements, searchMode, sortBy } = get()

    // 如果既没选部首也没选五行，返回空
    if (selectedRadicals.length === 0 && selectedFiveElements.length === 0) {
      set({ searchResults: [] })
      return
    }

    set({ isLoading: true })
    try {
      let results: ChineseCharacter[]

      // 如果选了部首，按部首搜索
      if (selectedRadicals.length > 0) {
        results = await searchByRadicals(selectedRadicals, searchMode)
      } else {
        // 如果只选了五行，从所有汉字中筛选
        results = await loadCharacters()
      }

      // 如果选了五行，进行五行过滤
      if (selectedFiveElements.length > 0) {
        results = filterByFiveElements(results, selectedFiveElements)
      }

      // 应用排序
      results = applySorting(results, sortBy)

      set({ searchResults: results })
    } catch (error) {
      console.error('Search failed:', error)
      set({ searchResults: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  // 清空选择
  clearSelection: () => {
    set({ selectedRadicals: [], searchResults: [] })
  },

  // 清空五行选择
  clearFiveElements: () => {
    set({ selectedFiveElements: [] })
    // 自动触发搜索
    get().performSearch()
  },

  // 设置部首过滤器
  setRadicalFilter: (filter: string) => {
    set({ radicalFilter: filter })
  },

  // 切换部首选择器展开/折叠状态
  toggleRadicalSelector: () => {
    set((state) => ({ isRadicalSelectorOpen: !state.isRadicalSelectorOpen }))
  },

  // 切换五行选择器展开/折叠状态
  toggleFiveElementSelector: () => {
    set((state) => ({
      isFiveElementSelectorOpen: !state.isFiveElementSelectorOpen,
    }))
  },
}))

/**
 * 应用排序逻辑
 */
function applySorting(
  results: ChineseCharacter[],
  sortBy: SortMode,
): ChineseCharacter[] {
  if (sortBy === 'default') {
    return results
  }

  return [...results].sort((a, b) => {
    switch (sortBy) {
      case 'stroke-asc':
        return getStrokeCount(a.word) - getStrokeCount(b.word)
      case 'stroke-desc':
        return getStrokeCount(b.word) - getStrokeCount(a.word)
      case 'pinyin-asc':
        return a.pinyin.localeCompare(b.pinyin, 'zh-CN')
      case 'pinyin-desc':
        return b.pinyin.localeCompare(a.pinyin, 'zh-CN')
      default:
        return 0
    }
  })
}
