'use client'

import { createFileRoute } from '@tanstack/react-router'
import { FilterToolbar } from '@/components/FilterToolbar'
import { SearchResults } from '@/components/SearchResults'

export const Route = createFileRoute('/')({
  component: SearchPage,
})

function SearchPage() {
  return (
    <div className="flex flex-col h-full">
      <FilterToolbar />
      <div className="flex-1 overflow-y-auto p-4">
        <SearchResults />
      </div>
    </div>
  )
}
