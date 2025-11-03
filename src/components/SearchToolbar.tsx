import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSearchStore } from '@/stores/useSearchStore'

export function SearchToolbar() {
  const { searchResults, sortBy, setSortBy } = useSearchStore()

  // 格式化数字显示
  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      {/* 左侧：结果统计 */}
      <div className="text-sm text-muted-foreground">
        找到{' '}
        <span className="font-medium text-foreground">
          {formatCount(searchResults.length)}
        </span>{' '}
        个汉字
      </div>

      {/* 右侧：排序控件 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">排序：</span>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">默认顺序</SelectItem>
            <SelectItem value="stroke-asc">笔画数 ↑</SelectItem>
            <SelectItem value="stroke-desc">笔画数 ↓</SelectItem>
            <SelectItem value="pinyin-asc">拼音 A-Z</SelectItem>
            <SelectItem value="pinyin-desc">拼音 Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
