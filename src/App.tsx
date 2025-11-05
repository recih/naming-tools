import { CharacterDetailPanel } from '@/components/CharacterDetailPanel'
import { FavoritesView } from '@/components/FavoritesView'
import { FiveElementSelector } from '@/components/FiveElementSelector'
import { RadicalSelector } from '@/components/RadicalSelector'
import { SearchResults } from '@/components/SearchResults'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDetailPanelStore } from '@/stores/useDetailPanelStore'
import { Heart, Search } from 'lucide-react'

function App() {
  const { selectedCharacter } = useDetailPanelStore()

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b bg-card flex-shrink-0">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold">汉字偏旁与五行查询工具</h1>
          <p className="text-sm text-muted-foreground mt-1">
            根据偏旁部首和五行属性查找汉字
          </p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6 px-4">
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="search" className="gap-2">
                  <Search className="h-4 w-4" />
                  搜索
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-2">
                  <Heart className="h-4 w-4" />
                  收藏
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-6">
                <RadicalSelector />
                <FiveElementSelector />
                <SearchResults />
              </TabsContent>

              <TabsContent value="favorites">
                <FavoritesView />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* 详情面板 - 仅在选中字符时显示 */}
        {selectedCharacter && <CharacterDetailPanel />}
      </div>
    </div>
  )
}

export default App
