"use client"

import { useState } from "react"
import { Check, ChevronRight, Edit, MoreVertical, Mic, X, Calendar, Lightbulb, AlertCircle} from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mic01FreeIcons, Play } from "@hugeicons/core-free-icons"

interface VoiceRecording {
  id: number
  title: string
  date: string
  time: string
  status: "organized" | "processing"
  waveform?: number[]
  transcription?: string
  categorizedItems?: {
    type: "task" | "idea" | "worry"
    text: string
  }[]
}

const voiceRecordings: VoiceRecording[] = [
  {
    id: 1,
    title: "Morning Coffee Clarity",
    date: "TODAY",
    time: "8:42 AM",
    status: "organized",
    waveform: [20, 35, 45, 30, 55, 40, 60, 35, 50, 45, 30, 55, 40, 25, 45, 35, 50, 30, 40, 55],
    transcription: "I think I finally figured out the structure for the proposal. It's not about the features, it's about the mental load we're reducing for users. Also need to remember to pick up eggs on the way home. Oh, and I've been feeling a bit anxious about the meeting with Mark on Friday, but I should probably just prepare the slides and it'll be fine.",
    categorizedItems: [
      { type: "task", text: "Restructure proposal by value prop" },
      { type: "idea", text: "Focus on 'mental load' reduction" },
      { type: "worry", text: "Meeting with Mark on Friday" },
    ]
  },
  {
    id: 2,
    title: "Late Night Worry Dump",
    date: "YESTERDAY",
    time: "11:15 PM",
    status: "organized",
    waveform: [20, 35, 45, 30, 55, 40, 60, 35, 50, 45, 30, 55, 40, 25, 45, 35, 50, 30, 40, 55],
    transcription: "the proposal. It's not about the features, it's about the mental load we're reducing for users. Also need to remember to pick up eggs on the way home. Oh, and I've been feeling a bit anxious about the meeting with Mark on Friday, but I should probably just prepare the slides and it'll be fine.",
    categorizedItems: [
      { type: "task", text: "Restructure proposal by value prop" },
      { type: "idea", text: "Focus on 'mental load' reduction" },
      { type: "worry", text: "Meeting with Mark on Friday" },
    ]
  }
]

export function VoiceInboxContent() {
  const [selectedRecording, setSelectedRecording] = useState<VoiceRecording | null>(voiceRecordings[0])

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
          {voiceRecordings.map((recording) => (
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
                      {recording.status === "organized" ? (
                        <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                          ORGANIZED
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
                          +PROCESSING
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

                  {/* Processing indicator */}
                  {recording.status === "processing" && (
                    <div className="w-1/3 h-1 bg-gray-300 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-primary rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
          {selectedRecording.categorizedItems && (
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Categorized Items
              </p>
              <div className="space-y-3">
                {selectedRecording.categorizedItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.type === "task" ? "bg-primary text-white" :
                      item.type === "idea" ? "bg-secondary text-secondary-foreground" :
                      "bg-accent text-primary"
                    }`}>
                      {item.type === "task" && <Check className="w-3 h-3" />}
                      {item.type === "idea" && <Lightbulb className="w-3 h-3" />}
                      {item.type === "worry" && <AlertCircle className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">
                        {item.type}
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
