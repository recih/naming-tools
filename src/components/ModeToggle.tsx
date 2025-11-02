import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useSearchStore } from '@/stores/useSearchStore'

export function ModeToggle() {
  const { searchMode, setSearchMode, selectedRadicals } = useSearchStore()

  const handleModeChange = (checked: boolean) => {
    setSearchMode(checked ? 'AND' : 'OR')
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">搜索模式</div>
            <div className="text-sm text-muted-foreground">
              {searchMode === 'OR'
                ? '包含任一选中的偏旁 (OR)'
                : '包含所有选中的偏旁 (AND)'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm ${searchMode === 'OR' ? 'font-semibold' : 'text-muted-foreground'}`}
            >
              OR
            </span>
            <Switch
              checked={searchMode === 'AND'}
              onCheckedChange={handleModeChange}
              disabled={selectedRadicals.length === 0}
            />
            <span
              className={`text-sm ${searchMode === 'AND' ? 'font-semibold' : 'text-muted-foreground'}`}
            >
              AND
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
