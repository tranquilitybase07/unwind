"use client";

import React from "react";
import Link from "next/link";

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5f0] via-[#f0faf7] to-[#e5f7f1] relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #10B981 1px, transparent 1px),
            linear-gradient(to bottom, #10B981 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Decorative elements */}
      {/* Leaves/drops - left side */}
      <div className="absolute left-20 top-72 flex flex-col gap-1">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-3 bg-emerald-600 rounded-full transform rotate-12"
            style={{
              marginLeft: `${(i % 3) * 8}px`,
              opacity: 0.5 + (i % 3) * 0.15
            }}
          />
        ))}
      </div>

      {/* Squiggle decorations - right side */}
      <svg className="absolute right-24 top-36 w-16 h-16" viewBox="0 0 60 60">
        <path
          d="M10 30 Q20 10, 30 30 Q40 50, 50 30"
          stroke="#059669"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M15 40 Q25 20, 35 40 Q45 60, 55 40"
          stroke="#10B981"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Star burst - right side */}
      <svg className="absolute right-16 top-56 w-12 h-12" viewBox="0 0 40 40">
        <path d="M20 5 L22 15 L32 12 L24 20 L32 28 L22 25 L20 35 L18 25 L8 28 L16 20 L8 12 L18 15 Z"
          stroke="#10B981" strokeWidth="2" fill="none" />
      </svg>

      {/* Small leaf decoration - left side near title */}
      <svg className="absolute left-48 top-40 w-8 h-8" viewBox="0 0 24 24">
        <path
          d="M12 2C12 2 4 8 4 14C4 18 8 22 12 22C16 22 20 18 20 14C20 8 12 2 12 2Z"
          fill="#34D399"
          opacity="0.6"
        />
        <path
          d="M12 6V18M8 10C10 12 12 14 12 14M16 10C14 12 12 14 12 14"
          stroke="#059669"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Floating circles decoration */}
      <div className="absolute right-32 bottom-32 w-20 h-20 rounded-full bg-emerald-400/20 blur-xl" />
      <div className="absolute left-24 bottom-48 w-16 h-16 rounded-full bg-teal-400/20 blur-xl" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-12 py-6">
        <div className="text-2xl font-bold text-emerald-800">Unwind</div>

        <div className="flex items-center gap-8">
          <Link href="/" className="text-emerald-700 hover:text-emerald-900 transition-colors">Home</Link>
          <Link href="/dashboard" className="text-emerald-700 hover:text-emerald-900 transition-colors">Dashboard</Link>
          <Link href="#" className="text-emerald-700 hover:text-emerald-900 transition-colors">Company</Link>
          <Link href="#" className="text-emerald-700 hover:text-emerald-900 transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Arrow decoration */}
          <svg className="w-10 h-6" viewBox="0 0 40 24">
            <path
              d="M5 12 Q20 12, 30 12"
              stroke="#10B981"
              strokeWidth="2"
              fill="none"
              strokeDasharray="2,2"
            />
            <path d="M28 8 L34 12 L28 16" stroke="#10B981" strokeWidth="2" fill="none" />
          </svg>

          <Link
            href="/auth/login"
            className="bg-emerald-600 text-white px-6 py-3 rounded-full font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/25"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center pt-12 pb-8">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-emerald-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-sm font-medium">Mental wellness made simple</span>
        </div>

        {/* Main heading */}
        <h1 className="text-6xl md:text-7xl font-bold text-emerald-900 text-center leading-tight mb-6">
          Your Mind <br />Deserves to Rest
        </h1>

        {/* Subtitle */}
        <p className="text-emerald-700/80 text-center max-w-md mb-8">
          Stop holding everything in your head. Get it out, organized, and done.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <button className="px-8 py-3 border-2 border-emerald-300 rounded-full text-emerald-700 font-medium hover:border-emerald-400 hover:bg-white/50 transition-all backdrop-blur-sm">
            Learn more
          </button>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30"
          >
            Get started
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="relative z-10 flex justify-center gap-6 px-12 pt-8 pb-16">
        {/* Card 1 - Free live support (Light Green) */}
        <div className="w-72 h-96 text-center bg-gradient-to-b from-emerald-300 to-emerald-400 rounded-3xl p-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300 shadow-xl">
          {/* Decorative squiggle */}
          <svg className="w-12 h-8 mb-2" viewBox="0 0 48 32">
            <path
              d="M8 16 Q16 4, 24 16 Q32 28, 40 16"
              stroke="#065F46"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <h3 className="text-2xl font-bold text-emerald-900 italic mb-3">Voice Dump Without Judgment</h3>
          <p className="text-emerald-800 text-sm leading-relaxed mb-4">
            Unfiltered. Messy. Raw. Talk for as long as you need. No judgment, no formatting required. Just pure, unstructured thoughts—we handle the rest.
          </p>

          {/* Illustration placeholder */}
          <div className="flex justify-center mt-auto">
            <div className="w-24 h-24 rounded-full bg-emerald-200/50 flex items-center justify-center">
              <span className="text-5xl">🤝</span>
            </div>
          </div>
        </div>

        {/* Card 2 - Increase Security (Teal) */}
        <div className="w-72 h-96 text-center bg-gradient-to-b from-teal-400 to-teal-500 rounded-3xl p-6 transform rotate-0 hover:scale-105 transition-transform duration-300 shadow-xl z-10">
          {/* Decorative squiggle */}
          <svg className="w-12 h-8 mb-2" viewBox="0 0 48 32">
            <path
              d="M8 16 Q16 4, 24 16 Q32 28, 40 16"
              stroke="#134E4A"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <h3 className="text-2xl font-bold text-teal-900 italic mb-3">AI That Understands Anxiety</h3>
          <p className="text-teal-800 text-sm leading-relaxed text-center mb-4">
            AI that gets anxiety. Detects spirals. Separates real threats from catastrophizing. Validates, doesn't dismiss.          </p>

          {/* Illustration placeholder */}
          <div className="flex justify-center mt-auto">
            <div className="w-24 h-24 rounded-full bg-teal-300/50 flex items-center justify-center">
              <span className="text-5xl">🔒</span>
            </div>
          </div>
        </div>

        {/* Card 3 - Intuitive interface (Mint) */}
        <div className="w-72 h-96 text-center bg-gradient-to-b from-green-300 to-green-400 rounded-3xl p-6 transform rotate-6 hover:rotate-0 transition-transform duration-300 shadow-xl">
          {/* Decorative squiggle */}
          <svg className="w-12 h-8 mb-2" viewBox="0 0 48 32">
            <path
              d="M8 16 Q16 4, 24 16 Q32 28, 40 16"
              stroke="#166534"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <h3 className="text-2xl font-bold text-green-900 italic mb-3">Focus on What Matters Today</h3>
          <p className="text-green-800 text-sm leading-relaxed text-center mb-4">
            See only what's due today. Not 47 things. Not next month. Just 3-5 items that actually need your attention. Everything else is safely stored and hidden.
          </p>

          {/* Illustration placeholder */}
          <div className="flex justify-center mt-auto">
            <div className="w-22 h-22 rounded-full bg-green-200/50 flex items-center justify-center">
              <span className="text-5xl">✨</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
