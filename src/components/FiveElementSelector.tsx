import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  getFiveElementCounts,
  loadCharacters,
  searchByRadicals,
} from '@/data/loader'
import { cn } from '@/lib/utils'
import { useSearchStore } from '@/stores/useSearchStore'
import type { ChineseCharacter, FiveElement } from '@/types'
import { ChevronDown, X } from 'lucide-react'
import { useEffect, useState } from 'react'

// 五行配置
const FIVE_ELEMENTS: Array<{
  element: FiveElement
  label: string
  color: string
  textColor: string
}> = [
  {
    element: '金',
    label: '金',
    color: 'bg-amber-400 hover:bg-amber-500',
    textColor: 'text-gray-900',
  },
  {
    element: '木',
    label: '木',
    color: 'bg-green-500 hover:bg-green-600',
    textColor: 'text-white',
  },
  {
    element: '水',
    label: '水',
    color: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-white',
  },
  {
    element: '火',
    label: '火',
    color: 'bg-red-500 hover:bg-red-600',
    textColor: 'text-white',
  },
  {
    element: '土',
    label: '土',
    color: 'bg-yellow-700 hover:bg-yellow-800',
    textColor: 'text-white',
  },
]

export function FiveElementSelector() {
  const {
    selectedRadicals,
    searchMode,
    selectedFiveElements,
    toggleFiveElement,
    clearFiveElements,
    isFiveElementSelectorOpen,
    toggleFiveElementSelector,
  } = useSearchStore()

  const [allCharacters, setAllCharacters] = useState<ChineseCharacter[]>([])
  const [elementCounts, setElementCounts] = useState<
    Record<FiveElement, number>
  >({
    金: 0,
    木: 0,
    水: 0,
    火: 0,
    土: 0,
  })

  // 加载所有汉字用于计算五行分布
  useEffect(() => {
    loadCharacters().then(setAllCharacters)
  }, [])

  // 计算基于当前部首筛选后的五行分布
  useEffect(() => {
    if (allCharacters.length === 0) return

    // 如果选择了部首，使用部首筛选后的结果
    if (selectedRadicals.length > 0) {
      searchByRadicals(selectedRadicals, searchMode).then((results) => {
        setElementCounts(getFiveElementCounts(results))
      })
    } else {
      // 否则使用全部汉字
      setElementCounts(getFiveElementCounts(allCharacters))
    }
  }, [allCharacters, selectedRadicals, searchMode])

  // 格式化数字显示
  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <Collapsible
      open={isFiveElementSelectorOpen}
      onOpenChange={toggleFiveElementSelector}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <CardTitle>按五行筛选</CardTitle>
              <ChevronDown
                className={cn(
                  'h-5 w-5 transition-transform',
                  isFiveElementSelectorOpen && 'rotate-180',
                )}
              />
            </CollapsibleTrigger>
            {selectedFiveElements.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFiveElements}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              清空筛选
            </Button>
          )}
        </div>
        {selectedFiveElements.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-sm text-muted-foreground">已选择:</span>
            {selectedFiveElements.map((element) => {
              const config = FIVE_ELEMENTS.find((e) => e.element === element)
              return (
                <Badge
                  key={element}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => toggleFiveElement(element)}
                >
                  {config?.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              )
            })}
          </div>
        )}
      </CardHeader>
      <CollapsibleContent>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {FIVE_ELEMENTS.map(({ element, label, color, textColor }) => {
              const isSelected = selectedFiveElements.includes(element)
              const count = elementCounts[element] || 0
              return (
                <button
                  key={element}
                  type="button"
                  onClick={() => toggleFiveElement(element)}
                  className={cn(
                    'rounded-lg px-6 py-3 font-medium text-lg transition-all hover:scale-105 hover:shadow-lg flex items-baseline gap-2',
                    isSelected
                      ? `${color} ${textColor} ring-4 ring-offset-2 ring-gray-900`
                      : `${color} ${textColor} opacity-60 hover:opacity-100`,
                  )}
                >
                  <span>{label}</span>
                  <span className="text-sm opacity-80">{formatCount(count)}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </CollapsibleContent>
    </Card>
    </Collapsible>
  )
}
