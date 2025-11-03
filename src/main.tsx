import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import cnchar from 'cnchar'
import poly from 'cnchar-poly'
import radical from 'cnchar-radical'
import App from './App.tsx'

// 初始化 cnchar 插件
cnchar.use(radical, poly)

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
