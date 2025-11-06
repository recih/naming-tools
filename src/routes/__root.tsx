import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { Heart, Search } from 'lucide-react'
import { CharacterDetailPanel } from '@/components/CharacterDetailPanel'
/// <reference types="vite/client" />
import appCss from '@/index.css?url'
import { useDetailPanelStore } from '@/stores/useDetailPanelStore'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h2 className="text-2xl font-bold mb-2">页面未找到</h2>
      <p className="text-muted-foreground mb-4">您访问的页面不存在</p>
      <Link to="/" className="text-primary hover:underline">
        返回首页
      </Link>
    </div>
  )
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: '汉字偏旁查询工具',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
  ssr: false,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
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
            {/* 导航栏 */}
            <nav className="mb-6">
              <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2 [&.active]:bg-background [&.active]:text-foreground [&.active]:shadow"
                  activeProps={{
                    className: 'bg-background text-foreground shadow',
                  }}
                >
                  <Search className="h-4 w-4" />
                  搜索
                </Link>
                <Link
                  to="/favorites"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2 [&.active]:bg-background [&.active]:text-foreground [&.active]:shadow"
                  activeProps={{
                    className: 'bg-background text-foreground shadow',
                  }}
                >
                  <Heart className="h-4 w-4" />
                  收藏
                </Link>
              </div>
            </nav>

            {/* 路由内容 */}
            <Outlet />
          </div>
        </main>

        {/* 详情面板 - 仅在选中字符时显示 */}
        {selectedCharacter && <CharacterDetailPanel />}
      </div>
    </div>
  )
}
