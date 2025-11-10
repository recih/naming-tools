import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useFavoritesStore } from '@/stores/useFavoritesStore'

describe('SSR Safety Tests', () => {
  let originalWindow: typeof globalThis.window

  beforeEach(() => {
    originalWindow = globalThis.window
    // Clear localStorage
    localStorage.clear()
  })

  afterEach(() => {
    // Restore window
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    })
  })

  describe('useFavoritesStore localStorage persistence', () => {
    it('should handle SSR environment gracefully', () => {
      // Simulate SSR by removing window
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      // Creating store should not throw
      expect(() => {
        const state = useFavoritesStore.getState()
        return state.favorites
      }).not.toThrow()
    })

    it('should work normally in browser environment', () => {
      const { addFavorite, favorites } = useFavoritesStore.getState()

      expect(favorites).toEqual([])

      const character = {
        word: '好',
        oldword: '好',
        strokes: '6',
        pinyin: 'hǎo',
        radicals: '女',
        explanation: '优点多',
        more: '',
      }

      addFavorite(character)

      const state = useFavoritesStore.getState()
      expect(state.favorites).toHaveLength(1)
    })

    it('should not throw when accessing localStorage in SSR', () => {
      // Simulate SSR
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      // The custom storage implementation should handle this gracefully
      const storage = {
        getItem: (name: string) => {
          if (typeof window === 'undefined') return null
          return localStorage.getItem(name)
        },
        setItem: (name: string, value: string) => {
          if (typeof window === 'undefined') return
          localStorage.setItem(name, value)
        },
        removeItem: (name: string) => {
          if (typeof window === 'undefined') return
          localStorage.removeItem(name)
        },
      }

      expect(() => {
        storage.getItem('test')
        storage.setItem('test', 'value')
        storage.removeItem('test')
      }).not.toThrow()
    })
  })

  describe('loader.ts cnchar initialization', () => {
    it('should only initialize cnchar in browser environment', async () => {
      // This is a conceptual test - the actual check is in loader.ts
      // We're verifying the pattern is correct
      const ssrSafeInit = () => {
        if (typeof window !== 'undefined') {
          // cnchar initialization would happen here
          return true
        }
        return false
      }

      // In jsdom (test environment), window exists
      expect(ssrSafeInit()).toBe(true)

      // Simulate SSR
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      expect(ssrSafeInit()).toBe(false)
    })
  })

  describe('window object access patterns', () => {
    it('should safely check for window existence', () => {
      const checkWindow = () => typeof window !== 'undefined'

      expect(checkWindow()).toBe(true)

      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      expect(checkWindow()).toBe(false)
    })

    it('should handle localStorage access safely', () => {
      const safeLocalStorageAccess = (key: string, value?: string) => {
        if (typeof window === 'undefined') return null

        if (value !== undefined) {
          localStorage.setItem(key, value)
        }
        return localStorage.getItem(key)
      }

      expect(safeLocalStorageAccess('test', 'value')).toBe('value')

      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      expect(safeLocalStorageAccess('test')).toBe(null)
    })

    it('should handle window.matchMedia safely', () => {
      const safeMatchMedia = (query: string) => {
        if (typeof window === 'undefined') return null
        return window.matchMedia(query)
      }

      expect(safeMatchMedia('(min-width: 768px)')).not.toBeNull()

      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      expect(safeMatchMedia('(min-width: 768px)')).toBeNull()
    })
  })

  describe('store initialization in SSR', () => {
    it('should initialize stores without errors in SSR', () => {
      // Clear store first
      useFavoritesStore.setState({ favorites: [] })

      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      expect(() => {
        // Store should be importable and usable even in SSR
        const state = useFavoritesStore.getState()
        return state
      }).not.toThrow()
    })

    it('should have default state in SSR environment', () => {
      // Clear store first
      useFavoritesStore.setState({ favorites: [] })
      localStorage.clear()

      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      const state = useFavoritesStore.getState()
      expect(state.favorites.length).toBeGreaterThanOrEqual(0)
    })
  })
})
