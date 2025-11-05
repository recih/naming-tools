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
  addFavoritesFromText: (
    text: string,
    allCharacters: ChineseCharacter[],
  ) => { added: number; skipped: number; invalid: number }
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

      // 从文本中批量添加收藏
      addFavoritesFromText: (text: string, allCharacters: ChineseCharacter[]) => {
        // 提取文本中的汉字（使用正则匹配中文字符）
        const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []

        // 去重
        const uniqueChars = [...new Set(chineseChars)]

        // 创建快速查找表
        const validCharMap = new Map(
          allCharacters.map((c) => [c.word, c]),
        )

        let added = 0
        let skipped = 0
        let invalid = 0

        // 验证并添加每个汉字
        for (const char of uniqueChars) {
          const charData = validCharMap.get(char)
          if (charData) {
            // 汉字存在于数据库中
            if (!get().isFavorite(char)) {
              get().addFavorite(charData)
              added++
            } else {
              // 已经收藏过
              skipped++
            }
          } else {
            // 汉字不存在于数据库中
            invalid++
          }
        }

        return { added, skipped, invalid }
      },
    }),
    {
      name: 'chinese-character-favorites', // localStorage key
    },
  ),
)
