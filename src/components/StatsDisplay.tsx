import { BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { getFiveElementCounts } from '@/data/loader'
import { useSearchStore } from '@/stores/useSearchStore'
import type { FiveElement } from '@/types'

// 五行颜色配置
const ELEMENT_COLORS: Record<
  FiveElement,
  { name: string; color: string; progressColor: string }
> = {
  金: { name: '金', color: 'text-amber-600', progressColor: 'bg-amber-500' },
  木: { name: '木', color: 'text-green-600', progressColor: 'bg-green-500' },
  水: { name: '水', color: 'text-blue-600', progressColor: 'bg-blue-500' },
  火: { name: '火', color: 'text-red-600', progressColor: 'bg-red-500' },
  土: { name: '土', color: 'text-yellow-700', progressColor: 'bg-yellow-700' },
}

export function StatsDisplay() {
  const { searchResults } = useSearchStore()

  const elementCounts = getFiveElementCounts(searchResults)
  const totalCount = searchResults.length

  // 计算百分比
  const getPercentage = (count: number): number => {
    if (totalCount === 0) return 0
    return Math.round((count / totalCount) * 100)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-muted-foreground hover:text-foreground"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          找到 <strong className="mx-1 text-foreground">{totalCount}</strong>{' '}
          个字
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="center">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-semibold">五行分布</h4>
            <p className="text-sm text-muted-foreground">
              共 {totalCount} 个汉字
            </p>
          </div>

          {totalCount > 0 ? (
            <div className="space-y-3">
              {(Object.keys(ELEMENT_COLORS) as FiveElement[]).map((element) => {
                const count = elementCounts[element] || 0
                const percentage = getPercentage(count)
                const config = ELEMENT_COLORS[element]

                return (
                  <div key={element} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={config.color}>{config.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-5 px-1.5">
                          {count}
                        </Badge>
                        <span className="text-muted-foreground min-w-[3ch] text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-2"
                      indicatorClassName={config.progressColor}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-6">
              暂无数据
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
