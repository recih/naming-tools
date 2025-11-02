import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useFavoritesStore } from '@/stores/useFavoritesStore'
import type { ChineseCharacter } from '@/types'
import cnchar from 'cnchar'
import { Heart } from 'lucide-react'

interface CharacterCardProps {
  character: ChineseCharacter
}

export function CharacterCard({ character }: CharacterCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const favorited = isFavorite(character.word)

  // 使用 cnchar 获取部首
  const radical = cnchar.radical(character.word)

  const handleToggleFavorite = () => {
    if (favorited) {
      removeFavorite(character.word)
    } else {
      addFavorite(character)
    }
  }

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="text-6xl font-serif">{character.word}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            className="h-8 w-8"
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-colors',
                favorited
                  ? 'fill-red-500 text-red-500'
                  : 'text-muted-foreground',
              )}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">拼音</div>
          <div className="text-lg font-medium">{character.pinyin}</div>
        </div>

        {radical && (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">部首</div>
            <div className="text-base">{radical}</div>
          </div>
        )}

        {character.explanation && (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">释义</div>
            <div className="text-sm line-clamp-3 leading-relaxed">
              {character.explanation.split('\n')[0]}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
