import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSearchStore } from '@/stores/useSearchStore'
import type { SortMode } from '@/types'
import { FiveElementFilterButton } from './FiveElementFilterButton'
import { RadicalFilterButton } from './RadicalFilterButton'
import { StatsDisplay } from './StatsDisplay'

export function FilterToolbar() {
  const { setSortBy, sortBy, clearSelection, clearFiveElements } =
    useSearchStore()

  const handleReset = () => {
    clearSelection()
    clearFiveElements()
  }

  const handleSortChange = (value: SortMode) => {
    setSortBy(value)
  }

  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between gap-4 p-4 flex-wrap">
        {/* 左侧：筛选器组 */}
        <div className="flex items-center gap-2 flex-wrap">
          <RadicalFilterButton />
          <FiveElementFilterButton />
        </div>

        {/* 中间：统计信息 */}
        <div className="flex-1 min-w-[200px]">
          <StatsDisplay />
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">默认排序</SelectItem>
              <SelectItem value="pinyin-asc">拼音 ↑</SelectItem>
              <SelectItem value="pinyin-desc">拼音 ↓</SelectItem>
              <SelectItem value="stroke-asc">笔画 ↑</SelectItem>
              <SelectItem value="stroke-desc">笔画 ↓</SelectItem>
            </SelectContent>
          </Select>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>清空所有筛选条件</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
