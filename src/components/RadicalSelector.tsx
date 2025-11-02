import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useSearchStore } from '@/stores/useSearchStore'
import { X } from 'lucide-react'
import { useEffect } from 'react'

export function RadicalSelector() {
  const {
    allRadicals,
    selectedRadicals,
    loadRadicals,
    toggleRadical,
    clearSelection,
  } = useSearchStore()

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
        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
          {allRadicals.map((radical) => {
            const isSelected = selectedRadicals.includes(radical)
            return (
              <button
                key={radical}
                type="button"
                onClick={() => toggleRadical(radical)}
                className={cn(
                  'aspect-square rounded-md border-2 text-lg font-medium transition-all hover:scale-110 hover:shadow-md',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:border-primary/50',
                )}
              >
                {radical}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
