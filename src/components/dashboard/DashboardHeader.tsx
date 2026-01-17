"use client"

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Welcome Back, Akash
        </h1>
        <p className="text-gray-500 mt-1">Let&apos;s check your progress</p>
      </div>

      <div className="flex items-center gap-4">
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
  );
}
