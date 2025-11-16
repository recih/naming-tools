import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { Heart, Search, Settings } from 'lucide-react'
import type React from 'react'
import { CharacterDetailPanel } from '@/components/CharacterDetailPanel'
/// <reference types="vite/client" />
import '@/index.css'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
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
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
})

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>汉字偏旁查询工具</title>
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
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="px-2 py-4">
              <h1 className="text-lg font-bold">汉字查询工具</h1>
              <p className="text-xs text-muted-foreground mt-1">
                偏旁部首与五行属性
              </p>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={false}>
                      <Link to="/">
                        <Search className="h-4 w-4" />
                        <span>搜索</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={false}>
                      <Link to="/favorites">
                        <Heart className="h-4 w-4" />
                        <span>收藏</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="h-4 w-4" />
                  <span>设置</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-1 overflow-hidden">
          <main className="flex flex-col flex-1 overflow-hidden">
            <Outlet />
          </main>

          {/* 详情面板 - 仅在选中字符时显示 */}
          {selectedCharacter && <CharacterDetailPanel />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
