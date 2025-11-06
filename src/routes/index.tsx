'use client'

import { createFileRoute } from '@tanstack/react-router'
import { FiveElementSelector } from '@/components/FiveElementSelector'
import { RadicalSelector } from '@/components/RadicalSelector'
import { SearchResults } from '@/components/SearchResults'

export const Route = createFileRoute('/')({
  component: SearchPage,
})

function SearchPage() {
  return (
    <div className="space-y-6">
      <RadicalSelector />
      <FiveElementSelector />
      <SearchResults />
    </div>
  )
}
