"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Check, Lightbulb, ShoppingBag, Heart, AlertCircle, RotateCcw, Loader2, Users } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { HealthIcon } from "@hugeicons/core-free-icons"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import AddCategoryModal from "./AddCategoryModal"

interface Category {
  id: string
  title: string
  itemCount: number
  icon: React.ReactNode
  bgColor: string
  iconBgColor: string
  tagBgColor: string // Lighter hex color for tags
  tags: string[]
}

interface SearchItem {
  id: string
  title: string
  category_name: string
  category_id: string
  custom_tags: string[] | null
  priority: string
  icon_color: string
}

// Icon mapping for categories with tag colors
const categoryIconMap: Record<string, { icon: React.ReactNode; color: string; tagBgColor: string }> = {
  "Tasks": { icon: <Check className="w-5 h-5 text-white" />, color: "bg-primary", tagBgColor: "#22a977ff" },
  "Ideas": { icon: <Lightbulb className="w-5 h-5 text-white" />, color: "bg-amber-500", tagBgColor: "#ab8015ff" },
  "Errands": { icon: <ShoppingBag className="w-5 h-5 text-white" />, color: "bg-rose-500", tagBgColor: "#d1384fff" },
  "Health": { icon: <HugeiconsIcon icon={HealthIcon} size={20} color="white" />, color: "bg-teal-500", tagBgColor: "#20a190ff" },
  "Relationships": { icon: <Users className="w-5 h-5 text-white" />, color: "bg-rose-400", tagBgColor: "#d4707bff" },
  "Worries Vault": { icon: <AlertCircle className="w-5 h-5 text-white" />, color: "bg-blue-500", tagBgColor: "#4686d5ff" },
  "Recurring": { icon: <RotateCcw className="w-5 h-5 text-white" />, color: "bg-gray-600", tagBgColor: "#4e535fff" },
}

export function CategoryContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [searchResults, setSearchResults] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  // Refresh categories after adding new one
  const refreshCategories = async () => {
    if (!user) return

    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name')
      .order('display_order', { ascending: true })

    if (!categoriesData) return

    const categoriesWithCounts = await Promise.all(
      categoriesData.map(async (category) => {
        const { count } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('category_id', category.id)
          .neq('status', 'completed')

        const iconConfig = categoryIconMap[category.name] || categoryIconMap["Tasks"]

        return {
          id: category.id,
          title: category.name,
          itemCount: count || 0,
          icon: iconConfig.icon,
          bgColor: "bg-gray-800",
          iconBgColor: iconConfig.color,
          tagBgColor: iconConfig.tagBgColor,
          tags: [`#${category.name.toLowerCase()}`]
        }
      })
    )

    setAllCategories(categoriesWithCounts)
    setCategories(categoriesWithCounts)
  }

  // Handle creating new category
  const handleAddCategory = async (name: string) => {
    if (!user) return

    const { error } = await supabase.from('categories').insert({
      name: name,
      display_order: allCategories.length + 1,
    })

    if (error) {
      console.error('Error creating category:', error)
      return
    }

    await refreshCategories()
  }

  // Fetch categories and item counts
  useEffect(() => {
    async function fetchCategories() {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .order('display_order', { ascending: true })

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError)
        setLoading(false)
        return
      }

      // For each category, count items and get popular tags
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          // Count items in this category
          const { count } = await supabase
            .from('items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('category_id', category.id)
            .neq('status', 'completed')

          // Get top 2-3 tags for this category
          const { data: itemsWithTags } = await supabase
            .from('items')
            .select('custom_tags')
            .eq('user_id', user.id)
            .eq('category_id', category.id)
            .neq('status', 'completed')
            .not('custom_tags', 'is', null)
            .limit(10)

          // Extract and count tags
          const tagCounts: Record<string, number> = {}
          itemsWithTags?.forEach((item) => {
            const tags = item.custom_tags as string[] || []
            tags.forEach((tag) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1
            })
          })

          // Get top 2 tags
          const topTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([tag]) => `#${tag}`)

          const iconConfig = categoryIconMap[category.name] || categoryIconMap["Tasks"]

          return {
            id: category.id,
            title: category.name,
            itemCount: count || 0,
            icon: iconConfig.icon,
            bgColor: "bg-gray-800",
            iconBgColor: iconConfig.color,
            tagBgColor: iconConfig.tagBgColor,
            tags: topTags.length > 0 ? topTags : [`#${category.name.toLowerCase()}`]
          }
        })
      )

      setAllCategories(categoriesWithCounts)
      setCategories(categoriesWithCounts)
      setLoading(false)
    }

    fetchCategories()
  }, [user, supabase])

  // Filter categories when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setCategories(allCategories)
      setSearchResults([])
      return
    }

    async function searchAll() {
      if (!user) return

      const searchTerm = searchQuery.toLowerCase().replace(/^#/, '').trim()

      if (searchTerm.length === 0) {
        setCategories(allCategories)
        setSearchResults([])
        return
      }

      // Filter categories by tags
      const matchingCategories = allCategories.filter(cat => 
        cat.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )

      // Search for items with matching tags
      const { data: matchingItems } = await supabase
        .from('items')
        .select(`
          id,
          title,
          category_id,
          custom_tags,
          priority,
          categories (
            name
          )
        `)
        .eq('user_id', user.id)
        .neq('status', 'completed')
        .overlaps('custom_tags', [searchTerm])
        .limit(20)

      // Map to SearchItem format
      const items: SearchItem[] = (matchingItems || []).map((item) => {
        const categoryName = (item.categories as { name: string } | null)?.name || 'Tasks'
        const iconConfig = categoryIconMap[categoryName] || categoryIconMap["Tasks"]
        return {
          id: item.id,
          title: item.title,
          category_name: categoryName,
          category_id: item.category_id,
          custom_tags: item.custom_tags,
          priority: item.priority || 'medium',
          icon_color: iconConfig.color,
        }
      })

      setSearchResults(items)
      setCategories(matchingCategories.length > 0 ? matchingCategories : allCategories)
    }

    searchAll()
  }, [searchQuery, allCategories, user, supabase])

  return (
    <div className="flex-1 mt-8 h-full overflow-y-auto scrollbar-hidden hover:scrollbar-auto px-8 py-6">
      {/* Header */}
      {/* <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Personal Vaults</h1>
          <p className="text-gray-400 text-sm mt-1">Your mental spaces, artfully curated.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          NEW CATEGORY
        </button>
      </div> */}

      <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Personal Vaults</h1>
            <p className="text-gray-500 text-sm">Your mental spaces, artfully curated.</p>
          </div>
          {/* <button 
            onClick={() => setIsAddModalOpen(true)}
            className=" cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            NEW CATEGORY
          </button> */}
        </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search by tags (e.g., #spiral, #clarity)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white shadow-sm rounded-xl text-black placeholder-gray-400 focus:outline-none "
        />
      </div>

      {/* Category Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-8 h-8 mb-3 text-gray-300 animate-spin" />
          <p className="text-sm font-medium">Loading categories...</p>
        </div>
      ) : categories.length === 0 && searchQuery.trim() ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Search className="w-12 h-12 mb-3 text-gray-300" />
          <p className="text-sm font-medium">No categories found matching "{searchQuery}"</p>
          <p className="text-xs">Try different tags or clear the search</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => router.push(`/dashboard/category/${category.id}`)}
              className="bg-white rounded-2xl p-5 border-2 transition-all cursor-pointer group hover:shadow-lg"
            >
              {/* Icon and Count */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${category.iconBgColor} flex items-center justify-center`}>
                  {category.icon}
                </div>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full">
                  {category.itemCount} ITEMS
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-black mb-3">{category.title}</h3>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {category.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-white text-xs rounded-lg font-medium" style={{ backgroundColor: category.tagBgColor }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* New Space Card */}
          {/* <div className="bg-gray-800/10 rounded-2xl p-5 border border-dashed border-gray-600 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
            <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400">New Space</h3>
          </div> */}
        </div>
      )}

      {/* Search Results - Matching Items */}
      {searchQuery.trim() && searchResults.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Matching Items ({searchResults.length})
          </h2>
          <div className="space-y-3">
            {searchResults.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/dashboard/category/${item.category_id}`)}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary/50 transition-all cursor-pointer flex items-center gap-4"
              >
                {/* Priority indicator */}
                <div className={`w-2 h-10 rounded-full ${
                  item.priority === 'high' ? 'bg-red-500' :
                  item.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                
                {/* Item info */}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 ${item.icon_color} text-white text-xs rounded-full`}>
                      {item.category_name}
                    </span>
                    {item.custom_tags && item.custom_tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {/* <div className="fixed bottom-6 right-96 mr-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LISTENING FOR THOUGHTS
        </button>
      </div> */}

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCategory}
      />
    </div>
  )
}

export default CategoryContent
