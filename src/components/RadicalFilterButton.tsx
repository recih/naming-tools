import cnchar from 'cnchar'
import { ChevronDown, Filter, HelpCircle, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSearchStore } from '@/stores/useSearchStore'
import type { SearchMode } from '@/types'

export function RadicalFilterButton() {
  const {
    selectedRadicals,
    searchMode,
    radicalFilter,
    loadRadicals,
    toggleRadical,
    setSearchMode,
    clearSelection,
    getFilteredRadicals,
    setRadicalFilter,
  } = useSearchStore()

  const [open, setOpen] = useState(false)
  const filteredRadicals = getFilteredRadicals()

  useEffect(() => {
    loadRadicals()
  }, [loadRadicals])

  const handleClearFilter = () => {
    setRadicalFilter('')
  }

  const handleClearSelection = () => {
    clearSelection()
  }

  const handleSearchModeChange = (value: string) => {
    if (value) {
      setSearchMode(value as SearchMode)
    }
  }

  // 按钮显示内容
  const getButtonLabel = () => {
    if (selectedRadicals.length === 0) {
      return (
        <>
          <Filter className="h-4 w-4 mr-2" />
          部首筛选
        </>
      )
    }

    // 显示前2个部首
    const displayRadicals = selectedRadicals.slice(0, 2).join(', ')
    const remaining = selectedRadicals.length - 2

    return (
      <>
        <Filter className="h-4 w-4 mr-2" />
        {displayRadicals}
        {remaining > 0 && (
          <Badge variant="secondary" className="ml-2 h-5 px-1.5">
            +{remaining}
          </Badge>
        )}
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={selectedRadicals.length > 0 ? 'secondary' : 'outline'}
          className="h-9"
        >
          {getButtonLabel()}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[480px] p-0" align="start">
        <div className="space-y-4 p-4">
          {/* 标题 */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">部首筛选</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 拼音搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="输入拼音筛选部首..."
              value={radicalFilter}
              onChange={(e) => setRadicalFilter(e.target.value)}
              className="pl-9 h-9"
            />
            {radicalFilter && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {radicalFilter && (
            <div className="text-sm text-muted-foreground">
              找到 {filteredRadicals.length} 个部首
            </div>
          )}

          <Separator />

          {/* AND/OR 搜索模式 - 只在选中多个部首时显示 */}
          {selectedRadicals.length > 1 && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">搜索模式:</span>
                <ToggleGroup
                  type="single"
                  value={searchMode}
                  onValueChange={handleSearchModeChange}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem value="OR" className="gap-1 h-8">
                          OR
                          <HelpCircle className="h-3 w-3 ml-1" />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>包含任一选中的部首</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem value="AND" className="gap-1 h-8">
                          AND
                          <HelpCircle className="h-3 w-3 ml-1" />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>包含所有选中的部首</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </ToggleGroup>
              </div>
              <Separator />
            </>
          )}

          {/* 已选部首 */}
          {selectedRadicals.length > 0 && (
            <>
              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  已选 ({selectedRadicals.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedRadicals.map((radical) => (
                    <Badge
                      key={radical}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => toggleRadical(radical)}
                    >
                      {radical}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* 部首网格 */}
          <ScrollArea className="h-64">
            <div className="grid grid-cols-6 gap-2 pr-4">
              {filteredRadicals.map((radical) => {
                const isSelected = selectedRadicals.includes(radical)
                const pinyinResult = cnchar.spell(radical, 'low')
                const pinyin = Array.isArray(pinyinResult)
                  ? pinyinResult[0]
                  : String(pinyinResult)

                return (
                  <Button
                    key={radical}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-auto py-2',
                      !isSelected && 'hover:bg-secondary',
                    )}
                    onClick={() => toggleRadical(radical)}
                  >
                    <ruby className="text-base font-serif select-none">
                      {radical}
                      <rt className="text-[10px] font-normal">{pinyin}</rt>
                    </ruby>
                  </Button>
                )
              })}
            </div>
          </ScrollArea>

          <Separator />

          {/* 底部操作 */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              disabled={selectedRadicals.length === 0}
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
