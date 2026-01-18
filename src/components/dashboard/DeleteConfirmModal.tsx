"use client"

import { AlertTriangle, X } from "lucide-react"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemTitle: string
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemTitle,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-card rounded-2xl shadow-2xl border border-destructive/20">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Delete Task</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <p className="text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{itemTitle}&quot;</span>? This action cannot be undone.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-accent text-foreground rounded-xl font-medium hover:bg-accent/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="flex-1 py-3 bg-destructive text-white rounded-xl font-semibold hover:bg-destructive/90 transition-colors"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
