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
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden mb-6 shadow-lg">
          <img 
            src="/images/2.png" 
            alt="AI Assistant" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Greeting */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          Hey, how you<br />feeling today?
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed">
          I'm your personal Unwind companion.<br />
          Tell me anything, or just breathe with me.
        </p>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-100 hover:border-gray-300 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Chat Input Section */}
      {/* <div className="px-4 pb-6"> */}
        {/* Mode Badge */}
        {/* <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded-full">
            <Cpu className="w-3 h-3 text-white" />
            <span className="text-xs font-medium text-white">GPT-5</span>
            <span className="text-xs text-primary font-medium">MAX</span>
          </div>
          <span className="text-xs text-gray-400 tracking-wide">SYNERGY MODE ACTIVE</span>
        </div> */}

        {/* Input Field */}
        {/* <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl">
          <input
            type="text"
            placeholder="Ask anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
          /> */}
          
          {/* Sparkle Icon */}
          {/* <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </button> */}

          {/* Send Button */}
          {/* <button className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
            <ArrowUp className="w-4 h-4 text-white" />
          </button>
        </div>
      </div> */}

      <ChatUI /> 
    </aside>
  )
}

export default RightBar
