import cnchar from 'cnchar'
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  getCharacterStructure,
  getFiveElement,
  getStrokeCount,
} from '@/data/loader'
import { cn } from '@/lib/utils'
import { useDetailPanelStore } from '@/stores/useDetailPanelStore'
import { useFavoritesStore } from '@/stores/useFavoritesStore'
import { useSearchStore } from '@/stores/useSearchStore'

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

export function CharacterDetailPanel() {
  const {
    selectedCharacter,
    clearSelection,
    navigateToPrevious,
    navigateToNext,
  } = useDetailPanelStore()
  const { searchResults } = useSearchStore()
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()

  // 检测是否为移动端（小于 lg 断点，即 1024px）
  // SSR-safe: 默认假设桌面端，客户端挂载后再检测
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // SSR-safe: 只在浏览器环境中执行
    if (typeof window === 'undefined') return

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    // 初始检查
    checkMobile()

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 计算当前索引和导航状态
  const { currentIndex, isFirst, isLast } = useMemo(() => {
    if (!selectedCharacter || searchResults.length === 0) {
      return { currentIndex: -1, isFirst: true, isLast: true }
    }
    const index = searchResults.findIndex(
      (char) => char.word === selectedCharacter.word,
    )
    return {
      currentIndex: index,
      isFirst: index <= 0,
      isLast: index >= searchResults.length - 1,
    }
  }, [selectedCharacter, searchResults])

  if (!selectedCharacter) {
    return null
  }

  // 获取详细信息
  const strokeCount = getStrokeCount(selectedCharacter.word)
  const fiveElement = getFiveElement(selectedCharacter.word)
  const structure = getCharacterStructure(selectedCharacter.word)
  const radicals = cnchar.radical(selectedCharacter.word)
  const radicalStr =
    radicals && radicals.length > 0
      ? radicals.map((r) => `${r.radical}(${r.radicalCount}画)`).join('、')
      : '未知'

  const elementConfig = fiveElement ? FIVE_ELEMENT_COLORS[fiveElement] : null
  const favorited = isFavorite(selectedCharacter.word)

  const handleToggleFavorite = () => {
    if (favorited) {
      removeFavorite(selectedCharacter.word)
    } else {
      addFavorite(selectedCharacter)
    }
  }

  const DetailContent = () => (
    <div className="flex flex-col h-full">
      {/* 关闭按钮 - 仅桌面端显示 */}
      <div className="hidden lg:flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={clearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 大号汉字显示区 */}
      <div className="text-center py-8 border-b">
        <ruby className="text-8xl font-serif select-none">
          {selectedCharacter.word}
          <rt className="text-xl font-normal">{selectedCharacter.pinyin}</rt>
        </ruby>
      </div>

      {/* 基本信息卡片 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">笔画数：</span>
              <span className="font-medium">{strokeCount} 画</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">部首：</span>
              <span className="font-medium">{radicalStr}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">五行：</span>
              {elementConfig ? (
                <span
                  className={cn(
                    'inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium',
                    elementConfig.bg,
                    elementConfig.text,
                  )}
                >
                  {elementConfig.label}
                </span>
              ) : (
                <span className="text-sm">未知</span>
              )}
            </div>

            {structure && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">结构：</span>
                <span className="font-medium">{structure}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 释义区 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">释义</h3>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {selectedCharacter.explanation}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 操作按钮区 */}
      <div className="border-t p-4 space-y-2">
        {/* 收藏按钮 */}
        <Button
          variant={favorited ? 'default' : 'outline'}
          className="w-full"
          onClick={handleToggleFavorite}
        >
          <Heart className={cn('h-4 w-4 mr-2', favorited && 'fill-current')} />
          {favorited ? '已收藏' : '收藏'}
        </Button>

        {/* 导航按钮 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={isFirst}
            onClick={() => navigateToPrevious(searchResults)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一个
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={isLast}
            onClick={() => navigateToNext(searchResults)}
          >
            下一个
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {currentIndex >= 0 && (
          <p className="text-xs text-center text-muted-foreground">
            {currentIndex + 1} / {searchResults.length}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* 桌面端：固定侧边栏 */}
      {!isMobile && (
        <div className="w-96 border-l bg-background h-full flex flex-col overflow-hidden">
          <DetailContent />
        </div>
      )}

      {/* 移动/平板端：Sheet 覆盖层 */}
      {isMobile && (
        <Sheet open={!!selectedCharacter} onOpenChange={clearSelection}>
          <SheetContent side="right" className="w-80 sm:w-96 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>汉字详情</SheetTitle>
            </SheetHeader>
            <DetailContent />
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
