'use client'

import { FavoritesView } from '@/components/FavoritesView'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/favorites')({
  component: FavoritesPage,
})

function FavoritesPage() {
  return <FavoritesView />
}
