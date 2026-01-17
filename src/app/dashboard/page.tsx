"use client"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HomeContent } from "@/components/dashboard/HomeContent";

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto px-10 py-8 scrollbar-hidden hover:scrollbar-auto">
      <DashboardHeader />
      <HomeContent />
    </main>
  );
}
