"use client"

import { use } from "react"
import CategoryItemsView from "@/components/dashboard/CategoryItemsView"

export default function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      <CategoryItemsView categoryId={id} />
    </main>
  )
}
