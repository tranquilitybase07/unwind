"use client"

import { useState } from "react"
import { X, FolderPlus } from "lucide-react"

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (categoryName: string) => void
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  onSubmit,
}: AddCategoryModalProps) {
  const [name, setName] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit(name.trim())
    setName("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-card rounded-2xl shadow-2xl border border-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">New Category</h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit()
                if (e.key === "Escape") onClose()
              }}
              placeholder="e.g., Work, Personal, Finance..."
              autoFocus
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="flex-1 cursor-pointer py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Category
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer px-5 py-3 text-muted-foreground font-medium hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
