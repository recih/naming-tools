import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ChineseCharacter } from '@/types'
import { useDetailPanelStore } from './useDetailPanelStore'

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

describe('useDetailPanelStore', () => {
  beforeEach(() => {
    useDetailPanelStore.setState({
      selectedCharacter: null,
      isOpen: false,
    })
  })

  describe('selectCharacter', () => {
    it('should select a character and open panel', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      act(() => {
        result.current.selectCharacter(mockCharacters[0])
      })

      expect(result.current.selectedCharacter).toEqual(mockCharacters[0])
      expect(result.current.isOpen).toBe(true)
    })

    it('should replace previously selected character', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      act(() => {
        result.current.selectCharacter(mockCharacters[0])
      })

      expect(result.current.selectedCharacter?.word).toBe('好')

      act(() => {
        result.current.selectCharacter(mockCharacters[1])
      })

      expect(result.current.selectedCharacter?.word).toBe('木')
    })
  })

  describe('clearSelection', () => {
    it('should clear selection and close panel', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      act(() => {
        result.current.selectCharacter(mockCharacters[0])
      })

      expect(result.current.isOpen).toBe(true)

      act(() => {
        result.current.clearSelection()
      })

      expect(result.current.selectedCharacter).toBeNull()
      expect(result.current.isOpen).toBe(false)
    })
  })

  describe('navigateToPrevious', () => {
    it('should navigate to previous character', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      act(() => {
        result.current.selectCharacter(mockCharacters[1]) // Select 木 (index 1)
      })

      act(() => {
        result.current.navigateToPrevious(mockCharacters)
      })

      expect(result.current.selectedCharacter?.word).toBe('好') // Should go to 好 (index 0)
    })

    it('should not navigate if already at first character', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      act(() => {
        result.current.selectCharacter(mockCharacters[0]) // Select first
      })

      act(() => {
        result.current.navigateToPrevious(mockCharacters)
      })

      expect(result.current.selectedCharacter?.word).toBe('好') // Should stay at first
    })

    it('should not navigate if no character selected', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      act(() => {
        result.current.navigateToPrevious(mockCharacters)
      })

      expect(result.current.selectedCharacter).toBeNull()
    })

    it('should not navigate if results array is empty', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      act(() => {
        result.current.selectCharacter(mockCharacters[0])
      })

      act(() => {
        result.current.navigateToPrevious([])
      })

      expect(result.current.selectedCharacter?.word).toBe('好') // Should stay unchanged
    })
  })

  describe('navigateToNext', () => {
    it('should navigate to next character', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      act(() => {
        result.current.selectCharacter(mockCharacters[0]) // Select 好 (index 0)
      })

      act(() => {
        result.current.navigateToNext(mockCharacters)
      })

      expect(result.current.selectedCharacter?.word).toBe('木') // Should go to 木 (index 1)
    })

    it('should not navigate if already at last character', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      act(() => {
        result.current.selectCharacter(mockCharacters[2]) // Select last
      })

      act(() => {
        result.current.navigateToNext(mockCharacters)
      })

      expect(result.current.selectedCharacter?.word).toBe('林') // Should stay at last
    })

    it('should not navigate if no character selected', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      act(() => {
        result.current.navigateToNext(mockCharacters)
      })

      expect(result.current.selectedCharacter).toBeNull()
    })

    it('should not navigate if results array is empty', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      act(() => {
        result.current.selectCharacter(mockCharacters[0])
      })

      act(() => {
        result.current.navigateToNext([])
      })

      expect(result.current.selectedCharacter?.word).toBe('好') // Should stay unchanged
    })
  })

  describe('navigation edge cases', () => {
    it('should handle navigation when character not in results', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      const otherCharacter: ChineseCharacter = {
        word: '森',
        oldword: '森',
        strokes: '12',
        pinyin: 'sēn',
        radicals: '木',
        explanation: '树木众多',
        more: '',
      }

      act(() => {
        result.current.selectCharacter(otherCharacter)
      })

      act(() => {
        result.current.navigateToNext(mockCharacters)
      })

      // Should not navigate since character is not in results
      expect(result.current.selectedCharacter?.word).toBe('森')
    })

    it('should navigate through entire list sequentially', () => {
      const { result } = renderHook(() => useDetailPanelStore())

      // Start at first
      act(() => {
        result.current.selectCharacter(mockCharacters[0])
      })

      expect(result.current.selectedCharacter?.word).toBe('好')

      // Navigate to second
      act(() => {
        result.current.navigateToNext(mockCharacters)
      })

      expect(result.current.selectedCharacter?.word).toBe('木')

      // Navigate to third
      act(() => {
        result.current.navigateToNext(mockCharacters)
      })

      expect(result.current.selectedCharacter?.word).toBe('林')

      // Navigate back to second
      act(() => {
        result.current.navigateToPrevious(mockCharacters)
      })

      expect(result.current.selectedCharacter?.word).toBe('木')

      // Navigate back to first
      act(() => {
        result.current.navigateToPrevious(mockCharacters)
      })

      expect(result.current.selectedCharacter?.word).toBe('好')
    })
  })
})
