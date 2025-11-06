import { RouterProvider } from '@tanstack/react-router'
import cnchar from 'cnchar'
import info from 'cnchar-info'
import poly from 'cnchar-poly'
import radical from 'cnchar-radical'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter } from './router'

// 初始化 cnchar 插件
cnchar.use(radical, poly, info)

// 创建路由实例
const router = createRouter()

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
