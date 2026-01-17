"use client"

import { Bell, Download, HugeiconsFreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react"

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Welcome Back, <span className="text-primary">Akash</span>
        </h1>
        <p className="text-gray-500 mt-1">Let&apos;s check your progress</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="hover:cursor-pointer w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <HugeiconsIcon icon={Bell}/>
        </button>
      </div>
    </div>
  );
}
