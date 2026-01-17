"use client"

export function RightSidebar() {
  return (
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
  );
}
