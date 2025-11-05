import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { loadCharacters } from '@/data/loader'
import { useFavoritesStore } from '@/stores/useFavoritesStore'
import type { ChineseCharacter } from '@/types'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CharacterCard } from './CharacterCard'

export function FavoritesView() {
  const { favorites, clearFavorites, addFavoritesFromText } =
    useFavoritesStore()
  const [inputText, setInputText] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [allCharacters, setAllCharacters] = useState<ChineseCharacter[]>([])

  // 加载所有汉字数据
  useEffect(() => {
    loadCharacters().then(setAllCharacters)
  }, [])

  // 处理添加汉字
  const handleAddCharacters = () => {
    if (!inputText.trim()) {
      setResultMessage('请输入汉字')
      return
    }

    const result = addFavoritesFromText(inputText, allCharacters)

    // 构建反馈消息
    const messages: string[] = []
    if (result.added > 0) {
      messages.push(`成功添加 ${result.added} 个`)
    }
    if (result.skipped > 0) {
      messages.push(`跳过已收藏 ${result.skipped} 个`)
    }
    if (result.invalid > 0) {
      messages.push(`无效汉字 ${result.invalid} 个`)
    }

    setResultMessage(messages.join('，'))

    // 清空输入框
    if (result.added > 0) {
      setInputText('')
    }
  }

  return (
    <div className="space-y-4">
      {/* 手动添加汉字输入区 */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">批量添加汉字</label>
            <Textarea
              placeholder="输入或粘贴汉字，支持多行文本，会自动提取汉字并过滤空白字符"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddCharacters} className="flex-1">
              <Plus className="h-4 w-4 mr-1" />
              添加到收藏
            </Button>
          </div>
          {resultMessage && (
            <div className="text-sm text-muted-foreground text-center">
              {resultMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 收藏列表 */}
      {favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            还没有收藏任何汉字
          </CardContent>
        </Card>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
