"use client";

import React from "react";

export function HeroPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] relative overflow-hidden">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e0e0e0 1px, transparent 1px),
            linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Decorative elements */}
      {/* Rain drops - left side */}
      <div className="absolute left-20 top-72 flex flex-col gap-1">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="w-1.5 h-3 bg-gray-800 rounded-full transform rotate-12"
            style={{ 
              marginLeft: `${(i % 3) * 8}px`,
              opacity: 0.7
            }}
          />
        ))}
      </div>

      {/* Squiggle decorations - right side */}
      <svg className="absolute right-24 top-36 w-16 h-16" viewBox="0 0 60 60">
        <path 
          d="M10 30 Q20 10, 30 30 Q40 50, 50 30" 
          stroke="#1a1a1a" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M15 40 Q25 20, 35 40 Q45 60, 55 40" 
          stroke="#1a1a1a" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Star burst - right side */}
      <svg className="absolute right-16 top-56 w-12 h-12" viewBox="0 0 40 40">
        <path d="M20 5 L22 15 L32 12 L24 20 L32 28 L22 25 L20 35 L18 25 L8 28 L16 20 L8 12 L18 15 Z" 
          stroke="#1a1a1a" strokeWidth="2" fill="none" />
      </svg>

      {/* Small star - left side near title */}
      <svg className="absolute left-48 top-40 w-6 h-6" viewBox="0 0 24 24">
        <path d="M12 2 L14 10 L12 8 L10 10 Z" fill="#facc15" />
        <path d="M12 2 L10 10 L12 8 L14 10 Z" fill="#fbbf24" />
        <circle cx="12" cy="6" r="3" fill="#facc15" />
      </svg>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-12 py-6">
        <div className="text-2xl font-bold text-gray-900">Unwind</div>
        
        <div className="flex items-center gap-8">
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
          <a href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Company</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          {/* Arrow decoration */}
          <svg className="w-10 h-6" viewBox="0 0 40 24">
            <path 
              d="M5 12 Q20 12, 30 12" 
              stroke="#1a1a1a" 
              strokeWidth="2" 
              fill="none"
              strokeDasharray="2,2"
            />
            <path d="M28 8 L34 12 L28 16" stroke="#1a1a1a" strokeWidth="2" fill="none" />
          </svg>
          
          <button className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center pt-12 pb-8">
        {/* User avatars */}
        {/* <div className="flex items-center gap-3 mb-6">
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-300 to-green-400 border-2 border-white overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-green-200 to-teal-300 flex items-center justify-center text-xs">👤</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-orange-300 border-2 border-white overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center text-xs">👤</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 border-2 border-white overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center text-xs">👤</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
          <span className="text-gray-600 text-sm">Over 1K happy users</span>
        </div> */}

        {/* Main heading */}
        <h1 className="text-6xl md:text-7xl font-bold text-gray-900 text-center leading-tight mb-6">
          Regulate your mood<br />with our solution
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-center max-w-md mb-8">
          To live your life to the fullest, we're continuing to find ways to prevent mental health problems.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <button className="px-8 py-3 border-2 border-gray-300 rounded-full text-gray-700 font-medium hover:border-gray-400 hover:bg-white transition-all">
            Learn more
          </button>
          <button className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
            Get started
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="relative z-10 flex justify-center gap-6 px-12 pt-8 pb-16">
        {/* Card 1 - Free live support (Yellow) */}
        <div className="w-72 h-96 text-center bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-3xl p-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300 shadow-xl">
          {/* Decorative squiggle */}
          <svg className="w-12 h-8 mb-2" viewBox="0 0 48 32">
            <path 
              d="M8 16 Q16 4, 24 16 Q32 28, 40 16" 
              stroke="#1a1a1a" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          
          <h3 className="text-2xl font-bold text-gray-900 italic mb-3">Free live support</h3>
          <p className="text-gray-800 text-sm leading-relaxed mb-4">
            We're always here when you need us, our free live support will answer all your questions immediately
          </p>
          
          {/* Illustration placeholder */}
          <div className="flex justify-center mt-auto">
            <div className="w-40 h-40 rounded-full bg-yellow-200/50 flex items-center justify-center">
              <span className="text-6xl">🤝</span>
            </div>
          </div>
        </div>

        {/* Card 2 - Increase Security (Coral/Pink) */}
        <div className="w-72 h-96 text-center bg-gradient-to-b from-[#f4a492] to-[#e8937f] rounded-3xl p-6 transform rotate-0 hover:scale-105 transition-transform duration-300 shadow-xl z-10">
          {/* Decorative squiggle */}
          <svg className="w-12 h-8 mb-2" viewBox="0 0 48 32">
            <path 
              d="M8 16 Q16 4, 24 16 Q32 28, 40 16" 
              stroke="#1a1a1a" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          
          <h3 className="text-2xl font-bold text-gray-900 italic mb-3">Increase Security</h3>
          <p className="text-gray-800 text-sm leading-relaxed text-center mb-4">
            All communications done through our platform is highly encrypted and fully secure, we care about privacy
          </p>
          
          {/* Illustration placeholder */}
          <div className="flex justify-center mt-auto">
            <div className="w-40 h-40 rounded-full bg-[#f79f8b] flex items-center justify-center">
              <span className="text-6xl">✋</span>
            </div>
          </div>
        </div>

        {/* Card 3 - Intuitive interface (Purple) */}
        <div className="w-72 h-96 text-center bg-gradient-to-b from-purple-300 to-purple-400 rounded-3xl p-6 transform rotate-6 hover:rotate-0 transition-transform duration-300 shadow-xl">
          {/* Decorative squiggle */}
          <svg className="w-12 h-8 mb-2" viewBox="0 0 48 32">
            <path 
              d="M8 16 Q16 4, 24 16 Q32 28, 40 16" 
              stroke="#1a1a1a" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          
          <h3 className="text-2xl font-bold text-gray-900 italic mb-3">Intuitive interface</h3>
          <p className="text-gray-800 text-sm leading-relaxed text-center mb-4">
            Our system provides the most intuitive interface built based on extensive user interaction and research.
          </p>
          
          {/* Illustration placeholder */}
          <div className="flex justify-center mt-auto">
            <div className="w-40 h-40 rounded-full bg-purple-200/50 flex items-center justify-center">
              <span className="text-6xl">🤖</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroPage;
