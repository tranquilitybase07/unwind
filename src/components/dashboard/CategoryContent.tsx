"use client"

import { useState } from "react"
import { Plus, Search, Check, Lightbulb, ShoppingBag, Heart, AlertCircle, RotateCcw } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { HealthIcon } from "@hugeicons/core-free-icons"

interface Category {
  id: number
  title: string
  itemCount: number
  icon: React.ReactNode
  bgColor: string
  iconBgColor: string
  tags: string[]
}

const categories: Category[] = [
  {
    id: 1,
    title: "Tasks",
    itemCount: 14,
    icon: <Check className="w-5 h-5 text-white" />,
    bgColor: "bg-accent",
    iconBgColor: "bg-primary",
    tags: ["#work", "#deadline"]
  },
  {
    id: 2,
    title: "Ideas",
    itemCount: 28,
    icon: <Lightbulb className="w-5 h-5 text-white" />,
    bgColor: "bg-gray-800",
    iconBgColor: "bg-amber-500",
    tags: ["#creative", "#future"]
  },
  {
    id: 3,
    title: "Errands",
    itemCount: 9,
    icon: <ShoppingBag className="w-5 h-5 text-white" />,
    bgColor: "bg-gray-800",
    iconBgColor: "bg-rose-500",
    tags: ["#grocery"]
  },
  {
    id: 4,
    title: "Health",
    itemCount: 12,
    icon: <HugeiconsIcon icon={HealthIcon} size={20} color="white" />,
    bgColor: "bg-gray-800",
    iconBgColor: "bg-primary",
    tags: ["#meditation", "#sleep"]
  },
  {
    id: 5,
    title: "Relationships",
    itemCount: 7,
    icon: <Heart className="w-5 h-5 text-white" />,
    bgColor: "bg-gray-800",
    iconBgColor: "bg-rose-400",
    tags: ["#family"]
  },
  {
    id: 6,
    title: "Worries Vault",
    itemCount: 42,
    icon: <AlertCircle className="w-5 h-5 text-white" />,
    bgColor: "bg-gray-800",
    iconBgColor: "bg-secondary-foreground",
    tags: ["#anxiety", "#spiral"]
  },
  {
    id: 7,
    title: "Recurring",
    itemCount: 5,
    icon: <RotateCcw className="w-5 h-5 text-white" />,
    bgColor: "bg-gray-800",
    iconBgColor: "bg-gray-600",
    tags: ["#routine"]
  },
]

export function CategoryContent() {
  const [searchQuery, setSearchQuery] = useState("")

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
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            NEW CATEGORY
          </button>
        </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search by tags (e.g., #spiral, #clarity)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-gray-800 rounded-2xl p-5 border border-gray-700 hover:border-primary/50 transition-all cursor-pointer group"
          >
            {/* Icon and Count */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${category.iconBgColor} flex items-center justify-center`}>
                {category.icon}
              </div>
              <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">
                {category.itemCount} ITEMS
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-3">{category.title}</h3>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {category.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* New Space Card */}
        <div className="bg-gray-800/10 rounded-2xl p-5 border border-dashed border-gray-600 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
          <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center mb-3">
            <Plus className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-400">New Space</h3>
        </div>
      </div>

      {/* Floating Action Button */}
      {/* <div className="fixed bottom-6 right-96 mr-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LISTENING FOR THOUGHTS
        </button>
      </div> */}
    </div>
  )
}

export default CategoryContent
