"use client"

import { Bell, Download, HugeiconsFreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react"
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function DashboardHeader() {
  const { user, loading } = useAuth();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Welcome Back{mounted && user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-gray-500 mt-1">Let&apos;s check your progress</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="hover:cursor-pointer w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <HugeiconsIcon icon={Bell} />
        </button>

        {/* Sign Out Button */}
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4 " />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
