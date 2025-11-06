import { create } from 'zustand'
import type { ChineseCharacter } from '@/types'

interface DetailPanelState {
  // 状态
  selectedCharacter: ChineseCharacter | null
  isOpen: boolean

  // Actions
  selectCharacter: (character: ChineseCharacter) => void
  clearSelection: () => void
  navigateToPrevious: (allResults: ChineseCharacter[]) => void
  navigateToNext: (allResults: ChineseCharacter[]) => void
}

export const useDetailPanelStore = create<DetailPanelState>((set, get) => ({
  // 初始状态
  selectedCharacter: null,
  isOpen: false,

  // 选中一个汉字
  selectCharacter: (character: ChineseCharacter) => {
    set({ selectedCharacter: character, isOpen: true })
  },

  // 清空选择
  clearSelection: () => {
    set({ selectedCharacter: null, isOpen: false })
  },

  // 导航到上一个字
  navigateToPrevious: (allResults: ChineseCharacter[]) => {
    const { selectedCharacter } = get()
    if (!selectedCharacter || allResults.length === 0) return

    const currentIndex = allResults.findIndex(
      (char) => char.word === selectedCharacter.word,
    )

    if (currentIndex > 0) {
      set({ selectedCharacter: allResults[currentIndex - 1] })
    }
  },

  // 导航到下一个字
  navigateToNext: (allResults: ChineseCharacter[]) => {
    const { selectedCharacter } = get()
    if (!selectedCharacter || allResults.length === 0) return

    const currentIndex = allResults.findIndex(
      (char) => char.word === selectedCharacter.word,
    )

    if (currentIndex >= 0 && currentIndex < allResults.length - 1) {
      set({ selectedCharacter: allResults[currentIndex + 1] })
    }
  },
}))
