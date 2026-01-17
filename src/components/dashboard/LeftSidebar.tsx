"use client"

import { BarChart, CatalogueIcon, HealthIcon, Home, MenuSquareFreeIcons, Mic, SettingsIcon, VoiceIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function LeftSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
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
        <span className="text-xs font-bold text-gray-900">HEAL</span>
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col items-center space-y-4 pt-4">
        <Link 
          href="/dashboard"
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isActive("/dashboard") 
              ? "bg-primary text-white" 
              : "text-gray-400 hover:bg-gray-100"
          }`}
        >
          <HugeiconsIcon icon={Home} color={isActive("/dashboard") ? "white" : "currentColor"}/>
        </Link>

        <Link 
          href="/dashboard/voice-inbox"
          className={`w-12 h-12 rounded-full flex items-center justify-center hover:cursor-pointer transition-colors ${
            isActive("/dashboard/voice-inbox") 
              ? "bg-primary text-white" 
              : "text-gray-400 hover:bg-gray-100"
          }`}
        >
          <HugeiconsIcon icon={Mic} color={isActive("/dashboard/voice-inbox") ? "white" : "currentColor"}/>
        </Link>

        <Link 
          href="/dashboard/category"
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isActive("/dashboard/category") 
              ? "bg-primary text-white" 
              : "text-gray-400 hover:bg-gray-100"
          }`}
        >
          <HugeiconsIcon icon={MenuSquareFreeIcons} color={isActive("/dashboard/category") ? "white" : "currentColor"}/>
        </Link>
      </div>

      {/* Settings at bottom */}
      <Link 
        href="/dashboard/settings"
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          isActive("/dashboard/settings") 
            ? "bg-primary text-white" 
            : "text-gray-400 hover:bg-gray-100"
        }`}
      >
        <HugeiconsIcon icon={SettingsIcon} color={isActive("/dashboard/settings") ? "white" : "currentColor"}/>
      </Link>
    </aside>
  );
}

