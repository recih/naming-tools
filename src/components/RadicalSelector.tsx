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
    radicalFilter,
    loadRadicals,
    toggleRadical,
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
        <div className="flex items-center justify-between">
          <CardTitle>选择偏旁部首</CardTitle>
          {selectedRadicals.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              清空选择
            </Button>
          )}
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
            const pinyin = cnchar.spell(radical, 'low', 'tone')
            return (
              <button
                key={radical}
                type="button"
                onClick={() => toggleRadical(radical)}
                className={cn(
                  'rounded-md border-2 px-2 py-3 font-medium transition-all hover:scale-105 hover:shadow-md flex flex-col items-center justify-center',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:border-primary/50',
                )}
              >
                <span className="text-xl">{radical}</span>
                <span className="text-xs mt-1 opacity-70">{pinyin}</span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
