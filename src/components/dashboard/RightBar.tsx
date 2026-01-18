"use client"

import { ArrowUp, Cpu } from "lucide-react"
import { useState } from "react"
import ChatUI from "./ChatUI"

export function RightBar() {
  const [message, setMessage] = useState("")

  const quickActions = [
    { label: "Analyze sleep" },
    { label: "Start meditation" },
    { label: "Daily recap" },
  ]

  return (
    <aside className="w-80 h-full bg-gray-50 flex flex-col">
      <ChatUI />
    </aside>
  )
}

export default RightBar
