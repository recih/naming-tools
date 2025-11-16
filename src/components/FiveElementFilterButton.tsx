import { ChevronDown, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  getFiveElementCounts,
  loadCharacters,
  searchByRadicals,
} from '@/data/loader'
import { cn } from '@/lib/utils'
import { useSearchStore } from '@/stores/useSearchStore'
import type { ChineseCharacter, FiveElement } from '@/types'

// 五行配置
const FIVE_ELEMENTS: Array<{
  element: FiveElement
  label: string
  bgColor: string
  textColor: string
  displayColor: string
}> = [
  {
    element: '金',
    label: '金',
    bgColor: 'bg-amber-500 hover:bg-amber-600',
    textColor: 'text-white',
    displayColor: 'text-amber-600',
  },
  {
    element: '木',
    label: '木',
    bgColor: 'bg-green-500 hover:bg-green-600',
    textColor: 'text-white',
    displayColor: 'text-green-600',
  },
  {
    element: '水',
    label: '水',
    bgColor: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-white',
    displayColor: 'text-blue-600',
  },
  {
    element: '火',
    label: '火',
    bgColor: 'bg-red-500 hover:bg-red-600',
    textColor: 'text-white',
    displayColor: 'text-red-600',
  },
  {
    element: '土',
    label: '土',
    bgColor: 'bg-yellow-700 hover:bg-yellow-800',
    textColor: 'text-white',
    displayColor: 'text-yellow-700',
  },
]

export function FiveElementFilterButton() {
  const {
    selectedFiveElements,
    selectedRadicals,
    searchMode,
    toggleFiveElement,
    clearFiveElements,
  } = useSearchStore()

  const [open, setOpen] = useState(false)
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

  // 按钮显示内容
  const getButtonLabel = () => {
    if (selectedFiveElements.length === 0) {
      return (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          五行
        </>
      )
    }

    return (
      <>
        <Sparkles className="h-4 w-4 mr-2" />
        <span className="flex items-center gap-1">
          {selectedFiveElements.map((element) => {
            const config = FIVE_ELEMENTS.find((e) => e.element === element)
            return (
              <span key={element} className={config?.displayColor}>
                {element}
              </span>
            )
          })}
        </span>
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={selectedFiveElements.length > 0 ? 'secondary' : 'outline'}
          className="h-9"
        >
          {getButtonLabel()}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px] p-0" align="start">
        <div className="space-y-4 p-4">
          {/* 标题 */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">五行筛选</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 已选五行 */}
          {selectedFiveElements.length > 0 && (
            <>
              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  已选 ({selectedFiveElements.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedFiveElements.map((element) => {
                    const config = FIVE_ELEMENTS.find(
                      (e) => e.element === element,
                    )
                    return (
                      <Badge
                        key={element}
                        className={cn(
                          'cursor-pointer',
                          config?.bgColor,
                          config?.textColor,
                        )}
                        onClick={() => toggleFiveElement(element)}
                      >
                        {element}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    )
                  })}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* 五行选择按钮组 */}
          <div className="space-y-2">
            {FIVE_ELEMENTS.map(({ element, label, bgColor, textColor }) => {
              const isSelected = selectedFiveElements.includes(element)
              const count = elementCounts[element] || 0

              return (
                <Button
                  key={element}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'w-full justify-between h-10',
                    isSelected && bgColor,
                    isSelected && textColor,
                  )}
                  onClick={() => toggleFiveElement(element)}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-3 w-3 rounded-full',
                        bgColor.split(' ')[0],
                      )}
                    />
                    {label}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(isSelected && 'bg-white/20 text-white')}
                  >
                    {formatCount(count)}字
                  </Badge>
                </Button>
              )
            })}
          </div>

          <Separator />

          {/* 底部操作 */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFiveElements}
              disabled={selectedFiveElements.length === 0}
            >
              清空已选
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              应用筛选
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
