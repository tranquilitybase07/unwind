"use client"

import { VoiceDumpCard } from "./VoiceDumpCard";

export function HomeContent() {
  return (
    <>
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Voice Dump Card */}
        <VoiceDumpCard />

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
    </>
  );
}
