import type { ChineseCharacter } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  // 状态
  favorites: ChineseCharacter[]

  // Actions
  addFavorite: (character: ChineseCharacter) => void
  removeFavorite: (word: string) => void
  isFavorite: (word: string) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // 初始状态
      favorites: [],

      // 添加收藏
      addFavorite: (character: ChineseCharacter) => {
        const { favorites } = get()
        // 避免重复添加
        if (favorites.some((fav) => fav.word === character.word)) {
          return
        }
        set({ favorites: [...favorites, character] })
      },

      // 移除收藏
      removeFavorite: (word: string) => {
        const { favorites } = get()
        set({ favorites: favorites.filter((fav) => fav.word !== word) })
      },

      // 检查是否已收藏
      isFavorite: (word: string) => {
        const { favorites } = get()
        return favorites.some((fav) => fav.word === word)
      },

      // 清空所有收藏
      clearFavorites: () => {
        set({ favorites: [] })
      },
    }),
    {
      name: 'chinese-character-favorites', // localStorage key
    },
  ),
)
