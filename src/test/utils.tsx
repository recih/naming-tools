import { type RenderOptions, render } from '@testing-library/react'
import type { ReactElement } from 'react'

// Custom render function that can be extended with providers if needed
const customRender = (ui: ReactElement, options?: RenderOptions) => {
  return render(ui, { ...options })
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

// Override render method
export { customRender as render }
