import cnchar from 'cnchar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchStore } from '@/stores/useSearchStore'
import { render, screen } from '@/test/utils'
import type { ChineseCharacter } from '@/types'
import { SearchResults } from './SearchResults'

// Mock SearchToolbar component
vi.mock('./SearchToolbar', () => ({
  SearchToolbar: () => <div data-testid="search-toolbar">Search Toolbar</div>,
}))

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
]

describe('SearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSearchStore.setState({
      searchResults: [],
      selectedRadicals: [],
      selectedFiveElements: [],
      isLoading: false,
    })

    // Mock cnchar.info
    vi.mocked(cnchar.info).mockReturnValue([{ fiveElement: '木' }] as any)
  })

  it('should show loading message when loading', () => {
    useSearchStore.setState({ isLoading: true })

    render(<SearchResults />)

    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('should show prompt when no selection', () => {
    render(<SearchResults />)

    expect(screen.getByText('请选择偏旁部首或五行开始搜索')).toBeInTheDocument()
  })

  it('should show no results message when search returns empty', () => {
    useSearchStore.setState({
      selectedRadicals: ['女'],
      searchResults: [],
    })

    render(<SearchResults />)

    expect(screen.getByText('未找到匹配的汉字')).toBeInTheDocument()
  })

  it('should render character cards when results exist', () => {
    useSearchStore.setState({
      selectedRadicals: ['女'],
      searchResults: mockCharacters,
    })

    render(<SearchResults />)

    expect(screen.getAllByTestId('character-card')).toHaveLength(2)
    expect(screen.getByText('好')).toBeInTheDocument()
    expect(screen.getByText('木')).toBeInTheDocument()
  })

  it('should render search toolbar when results exist', () => {
    useSearchStore.setState({
      selectedRadicals: ['女'],
      searchResults: mockCharacters,
    })

    render(<SearchResults />)

    expect(screen.getByTestId('search-toolbar')).toBeInTheDocument()
  })

  it('should not render toolbar when no results', () => {
    useSearchStore.setState({
      selectedRadicals: [],
      searchResults: [],
    })

    render(<SearchResults />)

    expect(screen.queryByTestId('search-toolbar')).not.toBeInTheDocument()
  })

  it('should render grid layout with correct classes', () => {
    useSearchStore.setState({
      selectedRadicals: ['女'],
      searchResults: mockCharacters,
    })

    const { container } = render(<SearchResults />)

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

  it('should show results with five element selection only', () => {
    useSearchStore.setState({
      selectedFiveElements: ['木'],
      searchResults: mockCharacters,
    })

    render(<SearchResults />)

    expect(screen.getAllByTestId('character-card')).toHaveLength(2)
  })

  it('should show results with both radical and five element selection', () => {
    useSearchStore.setState({
      selectedRadicals: ['女'],
      selectedFiveElements: ['水'],
      searchResults: [mockCharacters[0]],
    })

    render(<SearchResults />)

    expect(screen.getAllByTestId('character-card')).toHaveLength(1)
    expect(screen.getByText('好')).toBeInTheDocument()
  })
})
