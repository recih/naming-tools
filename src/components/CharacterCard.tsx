import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useFavoritesStore } from '@/stores/useFavoritesStore'
import type { ChineseCharacter } from '@/types'
import { Heart } from 'lucide-react'

interface CharacterCardProps {
  character: ChineseCharacter
}

export function CharacterCard({ character }: CharacterCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const favorited = isFavorite(character.word)

  const handleToggleFavorite = () => {
    if (favorited) {
      removeFavorite(character.word)
    } else {
      addFavorite(character)
    }
  }

  return (
    <Card className="relative overflow-visible hover:shadow-lg transition-shadow group">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <ruby className="text-4xl font-serif select-none">
            {character.word}
            <rt className="text-xs font-normal">{character.pinyin}</rt>
          </ruby>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            className="h-7 w-7 flex-shrink-0"
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                favorited
                  ? 'fill-red-500 text-red-500'
                  : 'text-muted-foreground',
              )}
            />
          </Button>
        </div>
      </div>

      {/* Hover tooltip for explanation */}
      {character.explanation && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg w-72">
            <div className="whitespace-pre-line leading-relaxed">
              {character.explanation}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
