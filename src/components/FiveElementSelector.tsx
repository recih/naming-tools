import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useSearchStore } from '@/stores/useSearchStore'
import type { FiveElement } from '@/types'
import { X } from 'lucide-react'

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
  const { selectedFiveElements, toggleFiveElement, clearFiveElements } =
    useSearchStore()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>按五行筛选</CardTitle>
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
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {FIVE_ELEMENTS.map(({ element, label, color, textColor }) => {
            const isSelected = selectedFiveElements.includes(element)
            return (
              <button
                key={element}
                type="button"
                onClick={() => toggleFiveElement(element)}
                className={cn(
                  'rounded-lg px-6 py-3 font-medium text-lg transition-all hover:scale-105 hover:shadow-lg',
                  isSelected
                    ? `${color} ${textColor} ring-4 ring-offset-2 ring-gray-900`
                    : `${color} ${textColor} opacity-60 hover:opacity-100`,
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
