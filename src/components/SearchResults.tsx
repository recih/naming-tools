import { Card, CardContent } from '@/components/ui/card'
import { useSearchStore } from '@/stores/useSearchStore'
import { CharacterCard } from './CharacterCard'

export function SearchResults() {
  const { searchResults, selectedRadicals, isLoading } = useSearchStore()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          加载中...
        </CardContent>
      </Card>
    )
  }

  if (selectedRadicals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          请选择偏旁部首开始搜索
        </CardContent>
      </Card>
    )
  }

  if (searchResults.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          未找到匹配的汉字
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        找到{' '}
        <span className="font-semibold text-foreground">
          {searchResults.length}
        </span>{' '}
        个汉字
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {searchResults.map((char) => (
          <CharacterCard key={char.word} character={char} />
        ))}
      </div>
    </div>
  )
}
