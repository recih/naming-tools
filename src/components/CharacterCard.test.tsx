import userEvent from '@testing-library/user-event'
import cnchar from 'cnchar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDetailPanelStore } from '@/stores/useDetailPanelStore'
import { useFavoritesStore } from '@/stores/useFavoritesStore'
import { render, screen } from '@/test/utils'
import type { ChineseCharacter } from '@/types'
import { CharacterCard } from './CharacterCard'

const mockCharacter: ChineseCharacter = {
  word: '好',
  oldword: '好',
  strokes: '6',
  pinyin: 'hǎo',
  radicals: '女',
  explanation: '优点多或使人满意的',
  more: '',
}

describe('CharacterCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFavoritesStore.setState({ favorites: [] })
    useDetailPanelStore.setState({ selectedCharacter: null, isOpen: false })

    // Mock cnchar.info for five element
    vi.mocked(cnchar.info).mockReturnValue([{ fiveElement: '水' }] as any)
  })

  it('should render character with pinyin', () => {
    render(<CharacterCard character={mockCharacter} />)

    expect(screen.getByText('好')).toBeInTheDocument()
    expect(screen.getByText('hǎo')).toBeInTheDocument()
  })

  it('should display five element badge', () => {
    render(<CharacterCard character={mockCharacter} />)

    const badge = screen.getByText('水')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-blue-500')
  })

  it('should not display badge if no five element', () => {
    vi.mocked(cnchar.info).mockReturnValue([{}] as any)

    render(<CharacterCard character={mockCharacter} />)

    expect(screen.queryByText('水')).not.toBeInTheDocument()
  })

  it('should open detail panel when clicked', async () => {
    const user = userEvent.setup()
    render(<CharacterCard character={mockCharacter} />)

    const card = screen.getByText('好').closest('div')?.parentElement
    if (card) {
      await user.click(card)
    }

    const state = useDetailPanelStore.getState()
    expect(state.selectedCharacter).toEqual(mockCharacter)
    expect(state.isOpen).toBe(true)
  })

  it('should toggle favorite when heart icon clicked', async () => {
    const user = userEvent.setup()
    render(<CharacterCard character={mockCharacter} />)

    const heartButton = screen.getByRole('button')
    await user.click(heartButton)

    const state = useFavoritesStore.getState()
    expect(state.favorites).toHaveLength(1)
    expect(state.favorites[0].word).toBe('好')
  })

  it('should remove favorite when already favorited', async () => {
    const user = userEvent.setup()
    useFavoritesStore.setState({
      favorites: [mockCharacter],
    })

    render(<CharacterCard character={mockCharacter} />)

    const heartButton = screen.getByRole('button')
    await user.click(heartButton)

    const state = useFavoritesStore.getState()
    expect(state.favorites).toHaveLength(0)
  })

  it('should show filled heart when favorited', () => {
    useFavoritesStore.setState({
      favorites: [mockCharacter],
    })

    render(<CharacterCard character={mockCharacter} />)

    const heartIcon = screen.getByRole('button').querySelector('svg')
    expect(heartIcon).toHaveClass('fill-red-500')
  })

  it('should not open detail panel when favorite button clicked', async () => {
    const user = userEvent.setup()
    render(<CharacterCard character={mockCharacter} />)

    const heartButton = screen.getByRole('button')
    await user.click(heartButton)

    const state = useDetailPanelStore.getState()
    expect(state.isOpen).toBe(false)
  })

  it('should render correct five element colors', () => {
    const elements: Array<{ element: string; colorClass: string }> = [
      { element: '金', colorClass: 'bg-amber-400' },
      { element: '木', colorClass: 'bg-green-500' },
      { element: '水', colorClass: 'bg-blue-500' },
      { element: '火', colorClass: 'bg-red-500' },
      { element: '土', colorClass: 'bg-yellow-700' },
    ]

    for (const { element, colorClass } of elements) {
      vi.mocked(cnchar.info).mockReturnValue([{ fiveElement: element }] as any)

      const { unmount } = render(<CharacterCard character={mockCharacter} />)

      const badge = screen.getByText(element)
      expect(badge).toHaveClass(colorClass)

      unmount()
    }
  })
})
