"use client"

import { Orb } from "@/components/ui/orb";
import Image from "next/image";
import { VoiceButton } from "@/components/ui/voice-button"
import { useState } from "react";
import { Mic } from "lucide-react";

export default function ServicesPage() {
  const [state, setState] = useState<"idle" | "recording" | "processing">("idle")

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      {/* Left Sidebar */}
      <aside className="w-20 bg-white flex flex-col items-center py-6 space-y-6 shadow-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 3.5L13 2v6l-3 1.5L7 8V2l3 1.5z" />
              <path d="M10 11l3-1.5v6l-3 1.5-3-1.5v-6L10 11z" />
            </svg>
          </div>

          {/* <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 4.354l-6 5.4V19h4v-5h4v5h4V9.754l-6-5.4M12 2l8 7.2V20a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5H11v5a1 1 0 01-1 1H5a1 1 0 01-1-1V9.2l8-7.2z" />
            </svg>
          </div> */}
          <span className="text-xs font-bold text-gray-900">HEAL</span>
        </div>

        {/* Navigation Icons */}
        <div className="flex-1 flex flex-col items-center space-y-4 pt-4">
          <button className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-600 transition-colors">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>

          <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>

          <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>

        {/* Settings at bottom */}
        <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12M8 12h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01"
            />
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-10 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {/* <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Sukabumi, Indonesia</span>
            </div> */}
            <h1 className="text-3xl font-semibold text-gray-900">
              Welcome Back, Akash
            </h1>
            <p className="text-gray-500 mt-1">Let&apos;s check your progress</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            {/* <div className="relative">
              <input
                type="text"
                placeholder="Search anything ..."
                className="w-96 px-5 py-3 bg-gray-100 rounded-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute right-5 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div> */}
            {/* Notification Bell */}
            <button className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Featured Pet Card */}
          <div className="relative items-start rounded-[2rem]  shadow-xl bg-cover" style={{backgroundImage: "url('/images/nature.jpg')"}}>
             
             <div className="flex flex-col items-center p-15 rounded-[2rem] bg-black/20 backdrop-blur-xs border border-white/30 shadow-2xl w-full h-full">
             
              
                {/* Mic Button */}
              <div className="mb-5">
                <button className="w-20 h-20 hover:cursor-pointer rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Mic className="w-10 h-10 text-gray-800" />
                </button>
              </div>

              <div className="flex-1 mb-4 p-4 text-center">
                <h2 className="text-xl font-bold text-white mb-1">
                  What is in your mind?
                </h2>
                <p className="text-sm text-white/90">
                  Let&apos;s take a deep breath and relax your mind.
                </p>
              </div>


              </div>
              
          </div>

          {/* Pet Details */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  Mariana Mikey
                </h3>
                <p className="text-sm text-gray-400">Chihuahua pets</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    AGE
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">3 years</p>
                    <p className="text-xs text-gray-400">Animal age</p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      87.5 centimeters
                    </p>
                    <p className="text-xs text-gray-400">Animal height</p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-[1.5fr,1fr] gap-6">
          {/* Pets Growth Health */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Pets growth health
              </h3>
              <button className="text-blue-500 text-sm font-medium inline-flex items-center gap-2 hover:text-blue-600">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Download report
              </button>
            </div>

            <div className="relative h-64">
              {/* Tooltip */}
              <div className="absolute left-40 top-12 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm z-10 shadow-lg">
                <p className="text-xs text-gray-400 mb-0.5">12 Jan 2022</p>
                <p className="font-semibold">50 adopted</p>
              </div>

              {/* Chart SVG */}
              <svg
                className="w-full h-full"
                viewBox="0 0 700 250"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                    <stop
                      offset="100%"
                      stopColor="#3B82F6"
                      stopOpacity="0.05"
                    />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line
                  x1="60"
                  y1="40"
                  x2="680"
                  y2="40"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
                <line
                  x1="60"
                  y1="90"
                  x2="680"
                  y2="90"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
                <line
                  x1="60"
                  y1="140"
                  x2="680"
                  y2="140"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
                <line
                  x1="60"
                  y1="190"
                  x2="680"
                  y2="190"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />

                {/* Y-axis labels */}
                <text
                  x="20"
                  y="45"
                  fill="#9CA3AF"
                  fontSize="14"
                  fontFamily="sans-serif"
                >
                  100
                </text>
                <text
                  x="30"
                  y="95"
                  fill="#9CA3AF"
                  fontSize="14"
                  fontFamily="sans-serif"
                >
                  50
                </text>
                <text
                  x="30"
                  y="145"
                  fill="#9CA3AF"
                  fontSize="14"
                  fontFamily="sans-serif"
                >
                  25
                </text>
                <text
                  x="38"
                  y="195"
                  fill="#9CA3AF"
                  fontSize="14"
                  fontFamily="sans-serif"
                >
                  0
                </text>

                {/* Area path */}
                <path
                  d="M 60 140 L 120 135 L 180 120 L 240 110 L 300 95 L 360 85 L 420 95 L 480 70 L 540 55 L 600 50 L 660 48 L 660 190 L 60 190 Z"
                  fill="url(#chartGradient)"
                />

                {/* Line path */}
                <path
                  d="M 60 140 L 120 135 L 180 120 L 240 110 L 300 95 L 360 85 L 420 95 L 480 70 L 540 55 L 600 50 L 660 48"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data point marker */}
                <circle cx="180" cy="120" r="5" fill="#3B82F6" />

                {/* X-axis labels */}
                <text
                  x="75"
                  y="220"
                  fill="#9CA3AF"
                  fontSize="13"
                  fontFamily="sans-serif"
                >
                  Jan
                </text>
                <text
                  x="165"
                  y="220"
                  fill="#9CA3AF"
                  fontSize="13"
                  fontFamily="sans-serif"
                >
                  Feb
                </text>
                <text
                  x="255"
                  y="220"
                  fill="#9CA3AF"
                  fontSize="13"
                  fontFamily="sans-serif"
                >
                  Mar
                </text>
                <text
                  x="345"
                  y="220"
                  fill="#9CA3AF"
                  fontSize="13"
                  fontFamily="sans-serif"
                >
                  Apr
                </text>
                <text
                  x="435"
                  y="220"
                  fill="#9CA3AF"
                  fontSize="13"
                  fontFamily="sans-serif"
                >
                  May
                </text>
                <text
                  x="525"
                  y="220"
                  fill="#3B82F6"
                  fontSize="13"
                  fontFamily="sans-serif"
                  fontWeight="600"
                >
                  Jun
                </text>
                <text
                  x="620"
                  y="220"
                  fill="#9CA3AF"
                  fontSize="13"
                  fontFamily="sans-serif"
                >
                  Jul
                </text>
              </svg>
            </div>
          </div>

          {/* Weight Details */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Weight details
                </h3>
                <p className="text-sm text-gray-500">
                  On last week, January 12,2022
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Mariana Mikey</p>
                    <p className="text-sm text-gray-400">4 month old</p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-2xl hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Jack Grealish</p>
                    <p className="text-sm text-gray-400">4 month old</p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-96 bg-white p-6 space-y-6 overflow-y-auto shadow-sm">
        {/* User Profile Card */}
        <div className="relative rounded-3xl overflow-hidden h-80">
          <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-teal-700 to-green-900"></div>

          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-400 rounded-full blur-2xl"></div>
            <div className="absolute top-20 right-0 w-40 h-40 bg-pink-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-20 w-36 h-36 bg-purple-500 rounded-full blur-2xl"></div>
          </div>

          {/* Menu button */}
          <button className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
            <svg
              className="w-5 h-5 text-gray-700"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          <div className="relative z-10 p-6 h-full flex flex-col">
            {/* User info */}
            <div className="flex items-center gap-3 mb-auto">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full"></div>
              <div>
                <p className="text-white font-semibold text-lg">
                  Takehiro Tomiyasu
                </p>
                <p className="text-emerald-300 text-sm">Member premium</p>
              </div>
            </div>

            {/* Adopt card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 inline-block self-start">
              <div className="flex gap-2 mb-3">
                <span className="text-4xl">🐻</span>
                <span className="text-4xl">🦝</span>
              </div>
              <button className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-orange-500 hover:to-orange-600 flex items-center gap-2 shadow-lg transition-all">
                ADOPT ME
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                    clipRule="evenodd"
                  />
                  <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-lg">January 2022</h3>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="text-center text-xs text-gray-400 font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar dates */}
          <div className="grid grid-cols-7 gap-2">
            {[10, 11, 12, 13, 14, 15, 16].map((date) => (
              <button
                key={date}
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${date === 12
                    ? "bg-blue-500 text-white shadow-lg scale-105"
                    : "text-gray-400 hover:bg-white/5"
                  }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white">
          <h3 className="font-semibold text-lg mb-1">Upcoming schedule</h3>
          <p className="text-sm text-gray-400 mb-5">
            Wednesday, 12 January, 2022
          </p>

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl backdrop-blur">
              <div className="text-center min-w-[70px]">
                <p className="text-sm font-medium text-gray-300">08:00 AM</p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  Health checkup
                </p>
                <p className="text-xs text-gray-400">Health adoption 1</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl backdrop-blur">
              <div className="text-center min-w-[70px]">
                <p className="text-sm font-medium text-gray-300">10:00 AM</p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  Health checkup
                </p>
                <p className="text-xs text-gray-400">Health adoption 2</p>
              </div>
            </div>
          </div>

          <button className="w-full bg-blue-500 text-white px-6 py-3.5 rounded-full font-semibold hover:bg-blue-600 flex items-center justify-center gap-2 shadow-lg transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Book now
          </button>
        </div>
      </aside>
    </div>
  );
}
