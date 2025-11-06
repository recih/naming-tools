'use client'

import { createFileRoute } from '@tanstack/react-router'
import { FavoritesView } from '@/components/FavoritesView'

export const Route = createFileRoute('/favorites')({
  component: FavoritesPage,
})

function FavoritesPage() {
  return <FavoritesView />
}
