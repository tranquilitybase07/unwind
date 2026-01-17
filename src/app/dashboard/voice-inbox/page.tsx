"use client"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import VoiceInboxContent from "@/components/dashboard/VoiceInboxContent"

export default function VoiceInboxPage() {
  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      <VoiceInboxContent />
    </main>
  )
}
