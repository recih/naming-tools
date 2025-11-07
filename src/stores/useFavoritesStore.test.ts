import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChineseCharacter } from '@/types'
import { useFavoritesStore } from './useFavoritesStore'

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

describe('useFavoritesStore', () => {
  beforeEach(() => {
    // Clear localStorage and reset store state
    localStorage.clear()
    useFavoritesStore.setState({ favorites: [] })
  })

  describe('addFavorite', () => {
    it('should add character to favorites', () => {
      const { result } = renderHook(() => useFavoritesStore())

      act(() => {
        result.current.addFavorite(mockCharacters[0])
      })

      expect(result.current.favorites).toHaveLength(1)
      expect(result.current.favorites[0].word).toBe('好')
    })

    it('should not add duplicate character', () => {
      const { result } = renderHook(() => useFavoritesStore())

      act(() => {
        result.current.addFavorite(mockCharacters[0])
        result.current.addFavorite(mockCharacters[0])
      })

      expect(result.current.favorites).toHaveLength(1)
    })

    it('should add multiple different characters', () => {
      const { result } = renderHook(() => useFavoritesStore())

      act(() => {
        result.current.addFavorite(mockCharacters[0])
        result.current.addFavorite(mockCharacters[1])
      })

      expect(result.current.favorites).toHaveLength(2)
    })
  })

  describe('removeFavorite', () => {
    it('should remove character from favorites', () => {
      const { result } = renderHook(() => useFavoritesStore())

      act(() => {
        result.current.addFavorite(mockCharacters[0])
        result.current.addFavorite(mockCharacters[1])
      })

      expect(result.current.favorites).toHaveLength(2)

      act(() => {
        result.current.removeFavorite('好')
      })

      expect(result.current.favorites).toHaveLength(1)
      expect(result.current.favorites[0].word).toBe('木')
    })

    it('should handle removing non-existent character', () => {
      const { result } = renderHook(() => useFavoritesStore())

      act(() => {
        result.current.addFavorite(mockCharacters[0])
      })

      act(() => {
        result.current.removeFavorite('不存在')
      })

      expect(result.current.favorites).toHaveLength(1)
    })
  })

  describe('isFavorite', () => {
    it('should return true for favorite character', () => {
      const { result } = renderHook(() => useFavoritesStore())

      act(() => {
        result.current.addFavorite(mockCharacters[0])
      })

      expect(result.current.isFavorite('好')).toBe(true)
    })

    it('should return false for non-favorite character', () => {
      const { result } = renderHook(() => useFavoritesStore())

      expect(result.current.isFavorite('好')).toBe(false)
    })
  })

  describe('clearFavorites', () => {
    it('should clear all favorites', () => {
      const { result } = renderHook(() => useFavoritesStore())

      act(() => {
        result.current.addFavorite(mockCharacters[0])
        result.current.addFavorite(mockCharacters[1])
      })

      expect(result.current.favorites).toHaveLength(2)

      act(() => {
        result.current.clearFavorites()
      })

      expect(result.current.favorites).toHaveLength(0)
    })
  })

  describe('addFavoritesFromText', () => {
    it('should extract and add Chinese characters from text', () => {
      const { result } = renderHook(() => useFavoritesStore())

      let stats: { added: number; skipped: number; invalid: number }
      act(() => {
        stats = result.current.addFavoritesFromText('好木林', mockCharacters)
      })

      expect(result.current.favorites).toHaveLength(3)
      expect(stats!.added).toBe(3)
      expect(stats!.skipped).toBe(0)
      expect(stats!.invalid).toBe(0)
    })

    it('should skip already favorited characters', () => {
      const { result } = renderHook(() => useFavoritesStore())

      act(() => {
        result.current.addFavorite(mockCharacters[0])
      })

      let stats: { added: number; skipped: number; invalid: number }
      act(() => {
        stats = result.current.addFavoritesFromText('好木', mockCharacters)
      })

      expect(result.current.favorites).toHaveLength(2)
      expect(stats!.added).toBe(1) // only 木
      expect(stats!.skipped).toBe(1) // 好 already favorited
      expect(stats!.invalid).toBe(0)
    })

    it('should handle invalid characters not in database', () => {
      const { result } = renderHook(() => useFavoritesStore())

      let stats: { added: number; skipped: number; invalid: number }
      act(() => {
        stats = result.current.addFavoritesFromText('好ABC森', mockCharacters)
      })

      expect(result.current.favorites).toHaveLength(1) // only 好
      expect(stats!.added).toBe(1)
      expect(stats!.skipped).toBe(0)
      expect(stats!.invalid).toBe(1) // 森 not in mockCharacters
    })

    it('should handle mixed text with English and punctuation', () => {
      const { result } = renderHook(() => useFavoritesStore())

      let stats: { added: number; skipped: number; invalid: number }
      act(() => {
        stats = result.current.addFavoritesFromText(
          'Hello 好, world! 木林.',
          mockCharacters,
        )
      })

      expect(result.current.favorites).toHaveLength(3)
      expect(stats!.added).toBe(3)
    })

    it('should deduplicate characters in text', () => {
      const { result } = renderHook(() => useFavoritesStore())

      let stats: { added: number; skipped: number; invalid: number }
      act(() => {
        stats = result.current.addFavoritesFromText(
          '好好好木木',
          mockCharacters,
        )
      })

      expect(result.current.favorites).toHaveLength(2)
      expect(stats!.added).toBe(2)
    })

    it('should handle empty text', () => {
      const { result } = renderHook(() => useFavoritesStore())

      let stats: { added: number; skipped: number; invalid: number }
      act(() => {
        stats = result.current.addFavoritesFromText('', mockCharacters)
      })

      expect(result.current.favorites).toHaveLength(0)
      expect(stats!.added).toBe(0)
      expect(stats!.skipped).toBe(0)
      expect(stats!.invalid).toBe(0)
    })

    it('should handle text with no Chinese characters', () => {
      const { result } = renderHook(() => useFavoritesStore())

      let stats: { added: number; skipped: number; invalid: number }
      act(() => {
        stats = result.current.addFavoritesFromText(
          'Hello World!',
          mockCharacters,
        )
      })

      expect(result.current.favorites).toHaveLength(0)
      expect(stats!.added).toBe(0)
      expect(stats!.invalid).toBe(0)
    })
  })

  describe('localStorage persistence', () => {
    it('should persist favorites to localStorage', () => {
      const { result } = renderHook(() => useFavoritesStore())

      act(() => {
        result.current.addFavorite(mockCharacters[0])
      })

      const stored = JSON.parse(
        localStorage.getItem('chinese-character-favorites') || '{}',
      )
      expect(stored.state.favorites).toHaveLength(1)
      expect(stored.state.favorites[0].word).toBe('好')
    })
  })
})
