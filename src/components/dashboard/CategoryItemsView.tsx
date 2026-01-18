"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Tag, Loader2, Clock, Plus, MoreVertical, Check } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { HealthIcon } from "@hugeicons/core-free-icons"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { format, parseISO, isPast, isToday, isTomorrow } from "date-fns"

interface DashboardItem {
  id: string
  title: string
  description: string | null
  due_date: string | null
  due_time: string | null
  status: string | null
  priority: string | null
  custom_tags: string[] | null
  urgency_score: number | null
  importance_score: number | null
  emotional_weight_score: number | null
}

interface Category {
  id: string
  name: string
}

interface CategoryItemsViewProps {
  categoryId: string
}

// Priority colors
const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
}

// Status colors
const statusColors = {
  pending: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
}

export default function CategoryItemsView({ categoryId }: CategoryItemsViewProps) {
  const router = useRouter()
  const [items, setItems] = useState<DashboardItem[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "today" | "week">("all")
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function fetchCategoryAndItems() {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)

      // Fetch category details
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('id', categoryId)
        .single()

      if (categoryError) {
        console.error('Error fetching category:', categoryError)
        setLoading(false)
        return
      }

      setCategory(categoryData)

      // Fetch items for this category
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('category_id', categoryId)
        .neq('status', 'completed')
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })

      if (itemsError) {
        console.error('Error fetching items:', itemsError)
        setLoading(false)
        return
      }

      setItems((itemsData as unknown as DashboardItem[]) || [])
      setLoading(false)
    }

    fetchCategoryAndItems()
  }, [user, supabase, categoryId])

  // Format due date for display
  function formatDueDate(dateStr: string | null, timeStr: string | null): string {
    if (!dateStr) return "No due date"

    const date = parseISO(dateStr)
    let formatted = ""

    if (isToday(date)) {
      formatted = "Today"
    } else if (isTomorrow(date)) {
      formatted = "Tomorrow"
    } else {
      formatted = format(date, "MMM d, yyyy")
    }

    if (timeStr) {
      const [hours, minutes] = timeStr.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 || 12
      formatted += ` at ${hour12}:${minutes} ${ampm}`
    }

    return formatted
  }

  // Check if item is overdue
  function isOverdue(dateStr: string | null): boolean {
    if (!dateStr) return false
    const date = parseISO(dateStr)
    return isPast(date) && !isToday(date)
  }

  // Filter items based on selected filter
  const filteredItems = items.filter(item => {
    if (filter === "all") return true
    if (filter === "today") return item.due_date && isToday(parseISO(item.due_date))
    if (filter === "week") {
      if (!item.due_date) return false
      const date = parseISO(item.due_date)
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      return date <= weekFromNow
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 mb-3 text-primary animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{category?.name}</h1>
              <p className="text-sm text-gray-500">{filteredItems.length} items</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("today")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "today"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter("week")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "week"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden hover:scrollbar-auto px-8 py-6">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Check className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">No items found</p>
            <p className="text-xs">Add your first item to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    )}
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Priority Badge */}
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium border ${priorityColors[item.priority as keyof typeof priorityColors] || priorityColors.low
                      }`}
                  >
                    {item.priority?.toUpperCase()}
                  </span>

                  {/* Due Date */}
                  {item.due_date && (
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${isOverdue(item.due_date)
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDueDate(item.due_date, item.due_time)}
                    </div>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${statusColors[item.status as keyof typeof statusColors] || statusColors.pending
                      }`}
                  >
                    {item.status?.replace('_', ' ').toUpperCase()}
                  </span>

                  {/* Tags */}
                  {item.custom_tags && item.custom_tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      {item.custom_tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          #{tag}
                        </span>
                      ))}
                      {item.custom_tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{item.custom_tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Score Indicators */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Urgency</span>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${item.urgency_score || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Importance</span>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${item.importance_score || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Emotional</span>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${item.emotional_weight_score || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
