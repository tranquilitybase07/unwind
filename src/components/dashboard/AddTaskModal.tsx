"use client"

import { useState, useEffect } from "react"
import { X, Check, Mic, Plus, ChevronDown, Sparkles } from "lucide-react"

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: {
    title: string
    note: string
    categoryId: string
    tags: string[]
    priority: "low" | "medium" | "high"
  }) => void
  categories?: { id: string; name: string }[]
  defaultCategoryId?: string
}

export default function AddTaskModal({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  defaultCategoryId,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [tags, setTags] = useState<string[]>([])
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [newTag, setNewTag] = useState("")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)

  // Set default category when modal opens
  useEffect(() => {
    if (isOpen && defaultCategoryId) {
      setSelectedCategoryId(defaultCategoryId)
    }
  }, [isOpen, defaultCategoryId])

  const selectedCategory = categories.find(c => c.id === selectedCategoryId)

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!title.trim() || !selectedCategoryId) return
    onSubmit({
      title,
      note,
      categoryId: selectedCategoryId,
      tags,
      priority,
    })
    // Reset form
    setTitle("")
    setNote("")
    setTags([])
    setPriority("medium")
    onClose()
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
      setShowTagInput(false)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - using dark card background */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-card dark:bg-[#0f1f17] rounded-3xl shadow-2xl border border-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
            </div>
            <h2 className="text-xl font-semibold text-foreground">New Task</h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5">
          {/* Task Name */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Task Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task name..."
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none "
            />
          </div>

          {/* Quick Note */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick Note
              </label>
              <span className="flex items-center gap-1 text-xs text-primary">
                <Sparkles className="w-3 h-3" />
                AI will organize this
              </span>
            </div>
            <div className="relative">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add some context or just dump your thoughts..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none "
              />
              {/* <button className="absolute bottom-3 right-3 w-8 h-8 bg-primary rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Mic className="w-4 h-4 text-primary-foreground" />
              </button> */}
            </div>
          </div>

          {/* Category and Tags Row */}
          <div className="flex gap-4">
            {/* Category */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="cursor-pointer w-full px-4 py-2.5 bg-gray-100 rounded-xl text-foreground text-left flex items-center justify-between hover:border-primary transition-colors"
                >
                  <span>{selectedCategory?.name || "Select..."}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                {showCategoryDropdown && (
                  <div className="cursor-pointer absolute top-full left-0 right-0 mt-1 bg-card border border-primary/20 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto scrollbar-hidden">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategoryId(cat.id)
                          setShowCategoryDropdown(false)
                        }}
                        className="cursor-pointer w-full px-4 py-2.5 text-left text-foreground hover:bg-accent transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Tags
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => handleRemoveTag(tag)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
                {showTagInput ? (
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTag()
                      if (e.key === "Escape") setShowTagInput(false)
                    }}
                    onBlur={handleAddTag}
                    placeholder="tag"
                    autoFocus
                    className="w-16 px-2 py-1 bg-accent border border-primary rounded-lg text-foreground text-sm focus:outline-none"
                  />
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="cursor-pointer w-8 h-8 bg-gray-100 border rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPriority("low")}
                className={`cursor-pointer flex-1 py-2.5 rounded-xl font-medium transition-all ${
                  priority === "low"
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-100 text-muted-foreground hover:text-foreground"
                }`}
              >
                Low
              </button>
              <button
                onClick={() => setPriority("medium")}
                className={`cursor-pointer flex-1 py-2.5 rounded-xl font-medium transition-all ${
                  priority === "medium"
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-100 text-muted-foreground hover:text-foreground"
                }`}
              >
                Mid
              </button>
              <button
                onClick={() => setPriority("high")}
                className={`cursor-pointer flex-1 py-2.5 rounded-xl font-medium transition-all ${
                  priority === "high"
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-100 text-muted-foreground hover:text-foreground"
                }`}
              >
                High
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              Add Task
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer px-6 py-3.5 text-muted-foreground font-medium hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Tip */}
          <div className="flex items-center gap-2 pt-2">
            <div className="w-2 h-2 bg-chart-4 rounded-full" />
            <p className="text-xs text-muted-foreground">
              Tip: Don&apos;t overthink the details. Just dump the thought and let the AI sort it later.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
