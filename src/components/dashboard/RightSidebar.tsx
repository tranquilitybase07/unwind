"use client"

import { ChevronLeft, MoreHorizontal, Edit3 } from "lucide-react"
import ChatUI from "./ChatUI";

export function RightSidebar() {
  return (
    <aside style={{ backgroundImage: "url('/images/right_side.jpg')" }} className="w-96 h-full bg-cover bg-bottom bg-gradient-to-b from-teal-800 via-teal-700 to-teal-600 overflow-hidden shadow-sm relative flex flex-col">
      {/* Gradient overlay - transparent at top, black at bottom */}
      <div 
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 40%, transparent 100%)' }}
      />
      
      {/* Background cityscape image */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-72 bg-cover bg-bottom z-0"
        
      />
      
      {/* Decorative stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 left-8 w-1 h-1 bg-white/60 rounded-full" />
        <div className="absolute top-12 left-20 w-0.5 h-0.5 bg-white/40 rounded-full" />
        <div className="absolute top-6 right-16 w-1.5 h-1.5 bg-white/50 rounded-full" />
        <div className="absolute top-16 right-8 w-0.5 h-0.5 bg-white/30 rounded-full" />
        <div className="absolute top-20 left-12 w-0.5 h-0.5 bg-white/40 rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-8">
          <button className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-white" />
          </button>
        </div> */}

        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden mb-4">
            <img 
              src="/images/2.png" 
              alt="Profile" 
              className="w-full h-full object-cover bg-white"
            />
          </div>
          
          {/* Name */}
          <h2 className="text-2xl font-bold text-white mb-1">Akash Yadav</h2>
          <p className="text-white text-sm mb-4">Software Engineer</p>
          
          
          {/* Edit Profile Button */}
          {/* <button className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-gray-700 font-medium hover:bg-gray-100 transition-colors shadow-lg">
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button> */}
        </div>

        {/* Working Hours Section */}
        {/* <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-6">
          <h3 className="text-white/80 text-sm font-medium text-center mb-4">Working hours:</h3>
          <div className="flex gap-3"> */}
            {/* Work Start */}
            {/* <div className="flex-1 bg-white rounded-xl p-4 text-center">
              <p className="text-gray-500 text-xs mb-1">Work Start</p>
              <p className="text-gray-900 text-lg font-bold">09:00 am</p> */}
            </div>
            {/* Work End */}
            {/* <div className="flex-1 bg-white rounded-xl p-4 text-center">
              <p className="text-gray-500 text-xs mb-1">Work End</p>
              <p className="text-gray-900 text-lg font-bold">05:00 pm</p>
            </div>
          </div>
        </div> */}

        {/* Spacer to push location to bottom */}
        {/* <div className="flex-1" /> */}

        {/* Location Section */}
        {/* <div className="text-center mb-4 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Sukabumi City</h2>
          <div className="flex items-center justify-center gap-2 text-white/80">
            <span className="text-sm">Sukabumi, Indonesia</span>
            <span className="text-white/50">•</span>
            <span className="text-sm">GMT+7</span>
          </div>
        </div> */}
      <ChatUI />
    </aside>
  );
}
