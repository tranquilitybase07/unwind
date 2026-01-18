"use client"

import { useState, useEffect } from "react"
import { Check, ChevronRight, Edit, MoreVertical, Mic, X, Calendar, Lightbulb, AlertCircle, Loader2, ShoppingCart, Heart, Users } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mic01FreeIcons, Play } from "@hugeicons/core-free-icons"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { format, isToday, isYesterday, parseISO } from "date-fns"

interface CategorizedItem {
  id: string
  type: "task" | "idea" | "worry" | "errand" | "health" | "relationship" | "recurring"
  text: string
  categoryName: string
}

interface VoiceRecording {
  id: string
  title: string
  date: string
  time: string
  status: "processed" | "pending" | "failed"
  waveform: number[]
  transcription: string
  categorizedItems: CategorizedItem[]
}

// Map category names to item types
const categoryToType: Record<string, CategorizedItem["type"]> = {
  "Tasks": "task",
  "Ideas": "idea",
  "Worries Vault": "worry",
  "Errands": "errand",
  "Health": "health",
  "Relationships": "relationship",
  "Recurring": "recurring",
}

// Generate random waveform visualization
function generateWaveform(durationSeconds: number | null): number[] {
  // Create bars based on duration (more bars for longer audio)
  const numBars = durationSeconds
    ? Math.min(Math.max(Math.floor(durationSeconds / 5), 15), 35)
    : 20

  // Generate random heights for each bar (20-60% range for visual variety)
  return Array.from({ length: numBars }, () => {
    return Math.floor(Math.random() * 40) + 20
  })
}

// Format date for display
function formatDateLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return "TODAY"
  if (isYesterday(date)) return "YESTERDAY"
  return format(date, "MMM d").toUpperCase()
}

// Format time for display
function formatTimeLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  return format(date, "h:mm a")
}

// Generate title from transcription
function generateTitle(transcription: string, createdAt: string): string {
  const date = parseISO(createdAt)
  const hour = date.getHours()

  let timeOfDay = "Voice Dump"
  if (hour >= 5 && hour < 12) timeOfDay = "Morning Thoughts"
  else if (hour >= 12 && hour < 17) timeOfDay = "Afternoon Clarity"
  else if (hour >= 17 && hour < 21) timeOfDay = "Evening Reflection"
  else timeOfDay = "Late Night Dump"

  return timeOfDay
}

export function VoiceInboxContent() {
  const [voiceRecordings, setVoiceRecordings] = useState<VoiceRecording[]>([])
  const [selectedRecording, setSelectedRecording] = useState<VoiceRecording | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  // Fetch voice dumps and their categorized items
  useEffect(() => {
    async function fetchVoiceDumps() {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)

      // Fetch voice dumps
      const { data: dumps, error: dumpsError } = await supabase
        .from('voice_dumps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (dumpsError) {
        console.error('Error fetching voice dumps:', dumpsError)
        setLoading(false)
        return
      }

      // Fetch items for each voice dump with their categories
      const recordingsWithItems: VoiceRecording[] = await Promise.all(
        (dumps || []).map(async (dump) => {
          const { data: items } = await supabase
            .from('items')
            .select(`
              id,
              title,
              category_id,
              categories (
                name
              )
            `)
            .eq('voice_dump_id', dump.id)

          const categorizedItems: CategorizedItem[] = (items || []).map((item) => {
            const categoryName = (item.categories as { name: string } | null)?.name || 'Tasks'
            return {
              id: item.id,
              type: categoryToType[categoryName] || 'task',
              text: item.title,
              categoryName,
            }
          })

          // Map database status values directly
          const status = (dump.processing_status || 'pending') as "processed" | "pending" | "failed"

          return {
            id: dump.id,
            title: generateTitle(dump.transcription, dump.created_at!),
            date: formatDateLabel(dump.created_at!),
            time: formatTimeLabel(dump.created_at!),
            status,
            waveform: generateWaveform(dump.audio_duration_seconds),
            transcription: dump.transcription,
            categorizedItems,
          }
        })
      )

      setVoiceRecordings(recordingsWithItems)
      if (recordingsWithItems.length > 0) {
        setSelectedRecording(recordingsWithItems[0])
      }
      setLoading(false)
    }

    fetchVoiceDumps()
  }, [user, supabase])

  return (
    <div className="flex mt-8 flex-1 h-full overflow-hidden">
      {/* Main Voice Inbox List */}
      <div className="flex-1 px-8 py-6 overflow-y-auto scrollbar-hidden hover:scrollbar-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Voice Inbox</h1>
            <p className="text-gray-500 text-sm">Your raw thoughts, sorted by AI.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
            <HugeiconsIcon icon={Mic01FreeIcons} size={18} />
            Start Voice Dump
          </button>
        </div>

        {/* Voice Recordings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-8 h-8 mb-3 text-gray-300 animate-spin" />
              <p className="text-sm font-medium">Loading voice dumps...</p>
            </div>
          ) : voiceRecordings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Mic className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm font-medium">No voice dumps yet</p>
              <p className="text-xs">Start your first voice dump to see it here</p>
            </div>
          ) : (
            voiceRecordings.map((recording) => (
              <div
                key={recording.id}
                onClick={() => setSelectedRecording(recording)}
                className={`p-4 rounded-2xl cursor-pointer transition-all ${
                  selectedRecording?.id === recording.id
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-white border border-gray-200 hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Play Button */}
                  <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    <HugeiconsIcon icon={Play} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{recording.title}</h3>
                      <div className="flex items-center gap-2">
                        {recording.status === "processed" ? (
                          <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            PROCESSED
                          </span>
                        ) : recording.status === "failed" ? (
                          <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                            FAILED
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                            PENDING
                          </span>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {recording.date} {recording.time && `• ${recording.time}`}
                    </p>

                    {/* Waveform visualization */}
                    {recording.waveform && (
                      <div className="flex items-end gap-0.5 h-8">
                        {recording.waveform.map((height, index) => (
                          <div
                            key={index}
                            className="w-1 bg-primary rounded-full"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transcription Details Panel */}
      {selectedRecording && selectedRecording.transcription && (
        <div className="w-96 border-l mt-8 border-gray-200 bg-white p-6 h-fit scrollbar-hidden hover:scrollbar-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Transcription Details</h2>
            <button 
              onClick={() => setSelectedRecording(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full AI Transcription */}
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Full AI Transcription
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              "{selectedRecording.transcription}"
            </p>
          </div>

          {/* Categorized Items */}
          {selectedRecording.categorizedItems && selectedRecording.categorizedItems.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Categorized Items
              </p>
              <div className="space-y-3">
                {selectedRecording.categorizedItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.type === "task" ? "bg-primary text-white" :
                      item.type === "idea" ? "bg-yellow-100 text-yellow-600" :
                      item.type === "worry" ? "bg-orange-100 text-orange-600" :
                      item.type === "errand" ? "bg-blue-100 text-blue-600" :
                      item.type === "health" ? "bg-red-100 text-red-600" :
                      item.type === "relationship" ? "bg-pink-100 text-pink-600" :
                      "bg-purple-100 text-purple-600"
                    }`}>
                      {item.type === "task" && <Check className="w-3 h-3" />}
                      {item.type === "idea" && <Lightbulb className="w-3 h-3" />}
                      {item.type === "worry" && <AlertCircle className="w-3 h-3" />}
                      {item.type === "errand" && <ShoppingCart className="w-3 h-3" />}
                      {item.type === "health" && <Heart className="w-3 h-3" />}
                      {item.type === "relationship" && <Users className="w-3 h-3" />}
                      {item.type === "recurring" && <Calendar className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">
                        {item.categoryName}
                      </p>
                      <p className="text-sm text-gray-800">{item.text}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.type === "task" && (
                        <button className="px-2 py-1 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-primary/10">
                          MOVE TO TODAY
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {/* <div className="space-y-3 mt-8">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-categorize All
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
              <Calendar className="w-4 h-4" />
              Schedule Selected Tasks
            </button>
          </div> */}
        </div>
      )}
    </div>
  )
}

export default VoiceInboxContent
