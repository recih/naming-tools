import userEvent from '@testing-library/user-event'
import cnchar from 'cnchar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as loader from '@/data/loader'
import { useFavoritesStore } from '@/stores/useFavoritesStore'
import { render, screen, waitFor } from '@/test/utils'
import type { ChineseCharacter } from '@/types'
import { FavoritesView } from './FavoritesView'

// Mock loader module
vi.mock('@/data/loader', async () => {
  const actual = await vi.importActual('@/data/loader')
  return {
    ...actual,
    loadCharacters: vi.fn(),
  }
})

// Mock CharacterCard component
vi.mock('./CharacterCard', () => ({
  CharacterCard: ({ character }: { character: ChineseCharacter }) => (
    <div data-testid="character-card">{character.word}</div>
  ),
}))

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

describe('FavoritesView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFavoritesStore.setState({ favorites: [] })

    vi.mocked(loader.loadCharacters).mockResolvedValue(mockCharacters)

    // Mock cnchar.info
    vi.mocked(cnchar.info).mockReturnValue([{ fiveElement: '木' }] as any)
  })

  it('should show empty state when no favorites', () => {
    render(<FavoritesView />)

    expect(screen.getByText('还没有收藏任何汉字')).toBeInTheDocument()
  })

  it('should render batch input textarea', () => {
    render(<FavoritesView />)

    expect(screen.getByLabelText('批量添加汉字')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/输入或粘贴汉字/)).toBeInTheDocument()
  })

  it('should add characters from text input', async () => {
    const user = userEvent.setup()
    render(<FavoritesView />)

    await waitFor(() => {
      expect(loader.loadCharacters).toHaveBeenCalled()
    })

    const textarea = screen.getByLabelText('批量添加汉字')
    const addButton = screen.getByText('添加到收藏')

    await user.type(textarea, '好木林')
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/成功添加 3 个/)).toBeInTheDocument()
    })

    const state = useFavoritesStore.getState()
    expect(state.favorites).toHaveLength(3)
  })

  it('should show error message when input is empty', async () => {
    const user = userEvent.setup()
    render(<FavoritesView />)

    const addButton = screen.getByText('添加到收藏')
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('请输入汉字')).toBeInTheDocument()
    })
  })

  it('should skip already favorited characters', async () => {
    const user = userEvent.setup()
    useFavoritesStore.setState({
      favorites: [mockCharacters[0]],
    })

    render(<FavoritesView />)

    await waitFor(() => {
      expect(loader.loadCharacters).toHaveBeenCalled()
    })

    const textarea = screen.getByLabelText('批量添加汉字')
    const addButton = screen.getByText('添加到收藏')

    await user.type(textarea, '好木')
    await user.click(addButton)

    await waitFor(() => {
      expect(
        screen.getByText(/成功添加 1 个，跳过已收藏 1 个/),
      ).toBeInTheDocument()
    })
  })

  it('should handle invalid characters', async () => {
    const user = userEvent.setup()
    render(<FavoritesView />)

    await waitFor(() => {
      expect(loader.loadCharacters).toHaveBeenCalled()
    })

    const textarea = screen.getByLabelText('批量添加汉字')
    const addButton = screen.getByText('添加到收藏')

    await user.type(textarea, '好森') // 森 not in mockCharacters
    await user.click(addButton)

    await waitFor(() => {
      expect(
        screen.getByText(/成功添加 1 个，无效汉字 1 个/),
      ).toBeInTheDocument()
    })
  })

  it('should clear input after successful addition', async () => {
    const user = userEvent.setup()
    render(<FavoritesView />)

    await waitFor(() => {
      expect(loader.loadCharacters).toHaveBeenCalled()
    })

    const textarea = screen.getByLabelText(
      '批量添加汉字',
    ) as HTMLTextAreaElement
    const addButton = screen.getByText('添加到收藏')

    await user.type(textarea, '好')
    await user.click(addButton)

    await waitFor(() => {
      expect(textarea.value).toBe('')
    })
  })

  it('should render favorites list', () => {
    useFavoritesStore.setState({
      favorites: [mockCharacters[0], mockCharacters[1]],
    })

    render(<FavoritesView />)

    expect(screen.getAllByTestId('character-card')).toHaveLength(2)
    expect(screen.getByText('好')).toBeInTheDocument()
    expect(screen.getByText('木')).toBeInTheDocument()
  })

  it('should show favorites count', () => {
    useFavoritesStore.setState({
      favorites: [mockCharacters[0], mockCharacters[1], mockCharacters[2]],
    })

    render(<FavoritesView />)

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText(/个收藏/)).toBeInTheDocument()
  })

  it('should clear all favorites when clear button clicked', async () => {
    const user = userEvent.setup()
    useFavoritesStore.setState({
      favorites: [mockCharacters[0], mockCharacters[1]],
    })

    render(<FavoritesView />)

    const clearButton = screen.getByText('清空收藏')
    await user.click(clearButton)

    const state = useFavoritesStore.getState()
    expect(state.favorites).toHaveLength(0)
  })

  it('should not show clear button when no favorites', () => {
    render(<FavoritesView />)

    expect(screen.queryByText('清空收藏')).not.toBeInTheDocument()
  })

  it('should render grid layout with correct classes', () => {
    useFavoritesStore.setState({
      favorites: [mockCharacters[0]],
    })

    const { container } = render(<FavoritesView />)

    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass(
      'grid-cols-2',
      'sm:grid-cols-3',
      'md:grid-cols-4',
      'lg:grid-cols-5',
      'xl:grid-cols-6',
      '2xl:grid-cols-8',
    )
  })

  it('should load characters on mount', async () => {
    render(<FavoritesView />)

    await waitFor(() => {
      expect(loader.loadCharacters).toHaveBeenCalled()
    })
  })

  it('should handle mixed text with non-Chinese characters', async () => {
    const user = userEvent.setup()
    render(<FavoritesView />)

    await waitFor(() => {
      expect(loader.loadCharacters).toHaveBeenCalled()
    })

    const textarea = screen.getByLabelText('批量添加汉字')
    const addButton = screen.getByText('添加到收藏')

    await user.type(textarea, 'Hello 好 World 木')
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/成功添加 2 个/)).toBeInTheDocument()
    })

    const state = useFavoritesStore.getState()
    expect(state.favorites).toHaveLength(2)
  })
})
