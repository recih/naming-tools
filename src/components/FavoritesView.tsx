import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useFavoritesStore } from '@/stores/useFavoritesStore'
import { Trash2 } from 'lucide-react'
import { CharacterCard } from './CharacterCard'

export function FavoritesView() {
  const { favorites, clearFavorites } = useFavoritesStore()

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          还没有收藏任何汉字
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          共{' '}
          <span className="font-semibold text-foreground">
            {favorites.length}
          </span>{' '}
          个收藏
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearFavorites}
          className="h-8"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          清空收藏
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
        {favorites.map((char) => (
          <CharacterCard key={char.word} character={char} />
        ))}
      </div>
    </div>
  )
}
