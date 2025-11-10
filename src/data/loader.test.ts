import cnchar from 'cnchar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChineseCharacter } from '@/types'
import {
  buildRadicalIndex,
  filterByFiveElements,
  getAllRadicals,
  getCharacterStructure,
  getFiveElement,
  getFiveElementCounts,
  getStrokeCount,
  loadCharacters,
  searchByRadicals,
} from './loader'

// Mock data for testing
const mockCharacters: ChineseCharacter[] = [
  {
    word: '好',
    oldword: '好',
    strokes: '6',
    pinyin: 'hǎo',
    radicals: '女',
    explanation: '优点多或使人满意的',
    more: '',
  },
  {
    word: '女',
    oldword: '女',
    strokes: '3',
    pinyin: 'nǚ',
    radicals: '女',
    explanation: '女性',
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
  {
    word: '森',
    oldword: '森',
    strokes: '12',
    pinyin: 'sēn',
    radicals: '木',
    explanation: '树木众多',
    more: '',
  },
]

// Mock duplicate characters
const mockCharactersWithDuplicates: ChineseCharacter[] = [
  ...mockCharacters,
  {
    word: '好',
    oldword: '好',
    strokes: '6',
    pinyin: 'hǎo',
    radicals: '女',
    explanation: '优点多或使人满意的',
    more: '',
  },
]

// Reset module state to clear cache
let loadCharactersModule: typeof import('./loader')

describe('loader.ts', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset module-level cache by re-importing
    vi.resetModules()
    loadCharactersModule = await import('./loader')
  })

  describe('loadCharacters', () => {
    it('should load characters successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCharacters,
      })

      const characters = await loadCharactersModule.loadCharacters()
      expect(characters).toEqual(mockCharacters)
      expect(global.fetch).toHaveBeenCalledWith('/api/word-json')
    })

    it('should remove duplicate characters', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCharactersWithDuplicates,
      })

      const characters = await loadCharactersModule.loadCharacters()
      expect(characters).toHaveLength(5)
      expect(characters.filter((c) => c.word === '好')).toHaveLength(1)
    })

    it('should return empty array on fetch error', async () => {
      vi.resetModules()
      const freshModule = await import('./loader')

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      })

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const characters = await freshModule.loadCharacters()

      expect(characters).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should return empty array on network error', async () => {
      vi.resetModules()
      const freshModule = await import('./loader')

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const characters = await freshModule.loadCharacters()

      expect(characters).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('buildRadicalIndex', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCharacters,
      })

      // Mock cnchar.radical
      vi.mocked(cnchar.radical).mockImplementation((char: string) => {
        const radicalMap: Record<string, string[]> = {
          好: ['女', '子'],
          女: ['女'],
          木: ['木'],
          林: ['木'],
          森: ['木'],
        }
        const radicals = radicalMap[char] || []
        return radicals.map((radical) => ({ radical })) as any
      })
    })

    it('should build radical index correctly', async () => {
      const index = await loadCharactersModule.buildRadicalIndex()

      expect(index['女']).toBeDefined()
      expect(index['女']).toHaveLength(2) // 好, 女
      expect(index['木']).toBeDefined()
      expect(index['木']).toHaveLength(3) // 木, 林, 森
      expect(index['子']).toBeDefined()
      expect(index['子']).toHaveLength(1) // 好
    })

    it('should skip characters without radicals', async () => {
      vi.resetModules()
      const freshModule = await import('./loader')

      vi.mocked(cnchar.radical).mockReturnValue([])

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCharacters,
      })

      const index = await freshModule.buildRadicalIndex()
      expect(Object.keys(index)).toHaveLength(0)
    })
  })

  describe('getAllRadicals', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCharacters,
      })

      vi.mocked(cnchar.radical).mockImplementation((char: string) => {
        const radicalMap: Record<string, string[]> = {
          好: ['女'],
          女: ['女'],
          木: ['木'],
          林: ['木'],
          森: ['木'],
        }
        const radicals = radicalMap[char] || []
        return radicals.map((radical) => ({ radical })) as any
      })
    })

    it('should return sorted list of all radicals', async () => {
      const radicals = await loadCharactersModule.getAllRadicals()

      expect(radicals).toContain('女')
      expect(radicals).toContain('木')
      expect(radicals.length).toBeGreaterThan(0)
    })

    it('should sort radicals by Chinese locale', async () => {
      const radicals = await loadCharactersModule.getAllRadicals()
      const sorted = [...radicals].sort((a, b) => a.localeCompare(b, 'zh-CN'))
      expect(radicals).toEqual(sorted)
    })
  })

  describe('searchByRadicals', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCharacters,
      })

      vi.mocked(cnchar.radical).mockImplementation((char: string) => {
        const radicalMap: Record<string, string[]> = {
          好: ['女', '子'],
          女: ['女'],
          木: ['木'],
          林: ['木'],
          森: ['木'],
        }
        const radicals = radicalMap[char] || []
        return radicals.map((radical) => ({ radical })) as any
      })
    })

    it('should return empty array for empty radicals', async () => {
      const results = await loadCharactersModule.searchByRadicals([])
      expect(results).toEqual([])
    })

    it('should search by single radical in OR mode', async () => {
      const results = await loadCharactersModule.searchByRadicals(['女'], 'OR')
      expect(results.some((c) => c.word === '好')).toBe(true)
      expect(results.some((c) => c.word === '女')).toBe(true)
    })

    it('should search by multiple radicals in OR mode', async () => {
      const results = await loadCharactersModule.searchByRadicals(
        ['女', '木'],
        'OR',
      )
      expect(results.some((c) => c.word === '好')).toBe(true)
      expect(results.some((c) => c.word === '木')).toBe(true)
    })

    it('should not have duplicates in OR mode', async () => {
      const results = await loadCharactersModule.searchByRadicals(
        ['女', '子'],
        'OR',
      )
      const words = results.map((c) => c.word)
      const uniqueWords = [...new Set(words)]
      expect(words.length).toBe(uniqueWords.length)
    })

    it('should search by single radical in AND mode', async () => {
      const results = await loadCharactersModule.searchByRadicals(['女'], 'AND')
      expect(results.some((c) => c.word === '好')).toBe(true)
      expect(results.some((c) => c.word === '女')).toBe(true)
    })

    it('should search by multiple radicals in AND mode', async () => {
      const results = await loadCharactersModule.searchByRadicals(
        ['女', '子'],
        'AND',
      )
      expect(results).toHaveLength(1)
      expect(results[0].word).toBe('好')
    })

    it('should return empty for non-existent radical combinations in AND mode', async () => {
      const results = await loadCharactersModule.searchByRadicals(
        ['女', '木'],
        'AND',
      )
      expect(results).toHaveLength(0)
    })
  })

  describe('getFiveElement', () => {
    it('should return five element for character', () => {
      vi.mocked(cnchar.info).mockReturnValue([{ fiveElement: '木' }] as any)

      const element = getFiveElement('木')
      expect(element).toBe('木')
    })

    it('should return empty string if no five element', () => {
      vi.mocked(cnchar.info).mockReturnValue([{}] as any)

      const element = getFiveElement('?')
      expect(element).toBe('')
    })

    it('should return empty string on error', () => {
      vi.mocked(cnchar.info).mockImplementation(() => {
        throw new Error('cnchar error')
      })

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const element = getFiveElement('?')

      expect(element).toBe('')
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should handle empty array result', () => {
      vi.mocked(cnchar.info).mockReturnValue([] as any)

      const element = getFiveElement('?')
      expect(element).toBe('')
    })
  })

  describe('filterByFiveElements', () => {
    beforeEach(() => {
      vi.mocked(cnchar.info).mockImplementation((char: string) => {
        const elementMap: Record<string, string> = {
          好: '水',
          女: '火',
          木: '木',
          林: '木',
          森: '木',
        }
        return [{ fiveElement: elementMap[char] || '' }] as any
      })
    })

    it('should return all characters if no elements specified', () => {
      const results = filterByFiveElements(mockCharacters, [])
      expect(results).toEqual(mockCharacters)
    })

    it('should filter by single element', () => {
      const results = filterByFiveElements(mockCharacters, ['木'])
      expect(results).toHaveLength(3) // 木, 林, 森
      expect(results.every((c) => ['木', '林', '森'].includes(c.word))).toBe(
        true,
      )
    })

    it('should filter by multiple elements', () => {
      const results = filterByFiveElements(mockCharacters, ['木', '水'])
      expect(results).toHaveLength(4) // 木, 林, 森, 好
    })

    it('should not have duplicates', () => {
      const duplicates = [...mockCharacters, mockCharacters[0]]
      const results = filterByFiveElements(duplicates, ['水'])
      expect(results).toHaveLength(1)
      expect(results[0].word).toBe('好')
    })
  })

  describe('getFiveElementCounts', () => {
    beforeEach(() => {
      vi.mocked(cnchar.info).mockImplementation((char: string) => {
        const elementMap: Record<string, string> = {
          好: '水',
          女: '火',
          木: '木',
          林: '木',
          森: '木',
        }
        return [{ fiveElement: elementMap[char] || '' }] as any
      })
    })

    it('should count five elements correctly', () => {
      const counts = getFiveElementCounts(mockCharacters)

      expect(counts['木']).toBe(3)
      expect(counts['水']).toBe(1)
      expect(counts['火']).toBe(1)
      expect(counts['金']).toBe(0)
      expect(counts['土']).toBe(0)
    })

    it('should return zero counts for empty array', () => {
      const counts = getFiveElementCounts([])

      expect(counts['金']).toBe(0)
      expect(counts['木']).toBe(0)
      expect(counts['水']).toBe(0)
      expect(counts['火']).toBe(0)
      expect(counts['土']).toBe(0)
    })

    it('should ignore characters without five element', () => {
      vi.mocked(cnchar.info).mockReturnValue([{}] as any)

      const counts = getFiveElementCounts(mockCharacters)

      expect(counts['金']).toBe(0)
      expect(counts['木']).toBe(0)
      expect(counts['水']).toBe(0)
      expect(counts['火']).toBe(0)
      expect(counts['土']).toBe(0)
    })
  })

  describe('getStrokeCount', () => {
    it('should return stroke count as number', () => {
      vi.mocked(cnchar.stroke as any).mockReturnValue(6)

      const count = getStrokeCount('好')
      expect(count).toBe(6)
    })

    it('should return first element if array returned', () => {
      vi.mocked(cnchar.stroke as any).mockReturnValue([8])

      const count = getStrokeCount('林')
      expect(count).toBe(8)
    })

    it('should return 0 on error', () => {
      vi.mocked(cnchar.stroke as any).mockImplementation(() => {
        throw new Error('cnchar error')
      })

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const count = getStrokeCount('?')

      expect(count).toBe(0)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should return 0 for unexpected return type', () => {
      vi.mocked(cnchar.stroke as any).mockReturnValue('invalid')

      const count = getStrokeCount('?')
      expect(count).toBe(0)
    })
  })

  describe('getCharacterStructure', () => {
    it('should return structure for character', () => {
      vi.mocked(cnchar.info).mockReturnValue([{ structure: '左右结构' }] as any)

      const structure = getCharacterStructure('好')
      expect(structure).toBe('左右结构')
    })

    it('should return empty string if no structure', () => {
      vi.mocked(cnchar.info).mockReturnValue([{}] as any)

      const structure = getCharacterStructure('?')
      expect(structure).toBe('')
    })

    it('should return empty string on error', () => {
      vi.mocked(cnchar.info).mockImplementation(() => {
        throw new Error('cnchar error')
      })

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const structure = getCharacterStructure('?')

      expect(structure).toBe('')
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
})
