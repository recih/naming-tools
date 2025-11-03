import {
  filterByFiveElements,
  getAllRadicals,
  loadCharacters,
  searchByRadicals,
} from '@/data/loader'
import type { ChineseCharacter, FiveElement, SearchMode } from '@/types'
import cnchar from 'cnchar'
import { create } from 'zustand'

interface SearchState {
  // 状态
  allRadicals: string[]
  selectedRadicals: string[]
  selectedFiveElements: FiveElement[]
  searchMode: SearchMode
  searchResults: ChineseCharacter[]
  isLoading: boolean
  radicalFilter: string

  // 计算属性
  getFilteredRadicals: () => string[]

  // Actions
  loadRadicals: () => Promise<void>
  toggleRadical: (radical: string) => void
  toggleFiveElement: (element: FiveElement) => void
  setSearchMode: (mode: SearchMode) => void
  performSearch: () => Promise<void>
  clearSelection: () => void
  clearFiveElements: () => void
  setRadicalFilter: (filter: string) => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // 初始状态
  allRadicals: [],
  selectedRadicals: [],
  selectedFiveElements: [],
  searchMode: 'OR',
  searchResults: [],
  isLoading: false,
  radicalFilter: '',

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

  // 执行搜索
  performSearch: async () => {
    const { selectedRadicals, selectedFiveElements, searchMode } = get()

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
}))
