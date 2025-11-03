import { FavoritesView } from '@/components/FavoritesView'
import { FiveElementSelector } from '@/components/FiveElementSelector'
import { ModeToggle } from '@/components/ModeToggle'
import { RadicalSelector } from '@/components/RadicalSelector'
import { SearchResults } from '@/components/SearchResults'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Search } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold">汉字偏旁查询工具</h1>
          <p className="text-sm text-muted-foreground mt-1">
            根据偏旁部首查找汉字
          </p>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
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
            <ModeToggle />
            <FiveElementSelector />
            <SearchResults />
          </TabsContent>

          <TabsContent value="favorites">
            <FavoritesView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
