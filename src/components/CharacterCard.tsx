import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getFiveElement } from '@/data/loader'
import { cn } from '@/lib/utils'
import { useFavoritesStore } from '@/stores/useFavoritesStore'
import type { ChineseCharacter } from '@/types'
import { Heart } from 'lucide-react'

interface CharacterCardProps {
  character: ChineseCharacter
}

// 五行颜色映射
const FIVE_ELEMENT_COLORS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  金: { bg: 'bg-amber-400', text: 'text-gray-900', label: '金' },
  木: { bg: 'bg-green-500', text: 'text-white', label: '木' },
  水: { bg: 'bg-blue-500', text: 'text-white', label: '水' },
  火: { bg: 'bg-red-500', text: 'text-white', label: '火' },
  土: { bg: 'bg-yellow-700', text: 'text-white', label: '土' },
}

export function CharacterCard({ character }: CharacterCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const favorited = isFavorite(character.word)

  // 获取五行属性
  const fiveElement = getFiveElement(character.word)
  const elementConfig = fiveElement ? FIVE_ELEMENT_COLORS[fiveElement] : null

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
          <div className="flex flex-col gap-1">
            <ruby className="text-4xl font-serif select-none">
              {character.word}
              <rt className="text-xs font-normal">{character.pinyin}</rt>
            </ruby>
            {elementConfig && (
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium w-fit',
                  elementConfig.bg,
                  elementConfig.text,
                )}
              >
                {elementConfig.label}
              </span>
            )}
          </div>
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
