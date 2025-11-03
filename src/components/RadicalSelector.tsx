import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useSearchStore } from '@/stores/useSearchStore'
import cnchar from 'cnchar'
import { X } from 'lucide-react'
import { useEffect } from 'react'

export function RadicalSelector() {
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

  const filteredRadicals = getFilteredRadicals()

  useEffect(() => {
    loadRadicals()
  }, [loadRadicals])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>选择偏旁部首</CardTitle>
          <div className="flex items-center gap-2">
            {/* AND/OR 模式切换器 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">模式：</span>
              <div className="inline-flex rounded-md border">
                <Button
                  variant={searchMode === 'OR' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-3 rounded-r-none"
                  onClick={() => setSearchMode('OR')}
                  disabled={selectedRadicals.length === 0}
                >
                  OR
                </Button>
                <Button
                  variant={searchMode === 'AND' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-3 rounded-l-none border-l"
                  onClick={() => setSearchMode('AND')}
                  disabled={selectedRadicals.length === 0}
                >
                  AND
                </Button>
              </div>
            </div>
            {/* 清空按钮 */}
            {selectedRadicals.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                清空
              </Button>
            )}
          </div>
        </div>
        <div className="pt-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="输入拼音筛选"
              value={radicalFilter}
              onChange={(e) => setRadicalFilter(e.target.value)}
              className="h-9 pr-8"
            />
            {radicalFilter && (
              <button
                type="button"
                onClick={() => setRadicalFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {radicalFilter && (
            <div className="text-sm text-muted-foreground mt-2">
              找到 {filteredRadicals.length} 个部首
            </div>
          )}
        </div>
        {selectedRadicals.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-sm text-muted-foreground">已选择:</span>
            {selectedRadicals.map((radical) => (
              <Badge
                key={radical}
                variant="default"
                className="cursor-pointer"
                onClick={() => toggleRadical(radical)}
              >
                {radical}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {filteredRadicals.map((radical) => {
            const isSelected = selectedRadicals.includes(radical)
            const pinyinResult = cnchar.spell(radical, 'low')
            const pinyin = Array.isArray(pinyinResult)
              ? pinyinResult[0]
              : String(pinyinResult)
            return (
              <Button
                key={radical}
                variant={isSelected ? 'default' : 'secondary'}
                className={cn(
                  'h-auto py-2 transition-all hover:scale-105',
                  !isSelected && 'hover:bg-secondary/80',
                )}
                onClick={() => toggleRadical(radical)}
              >
                <ruby className="text-xl font-serif select-none">
                  {radical}
                  <rt className="text-xs font-normal">{pinyin}</rt>
                </ruby>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
