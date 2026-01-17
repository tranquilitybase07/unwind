"use client"

import { Mic } from "lucide-react";
import UpcomingSchedule from "./UpcomingSchedule";
import HealthChart from "./HealthChart";
import FeatureCard from "./FeatureCard";
import ScheduleWithCalendar from "./ScheduleWithCalendar";
import { VoiceDumpCard } from "./VoiceDumpCard";

export function HomeContent() {
  return (
    <>
      <div className="grid grid-cols-2 gap-6 mb-6 auto-rows-[380px] ">
        <VoiceDumpCard />
        {/* Featured Card */}
        <FeatureCard />

        {/* Schedule Details with Calendar Picker */}
        <ScheduleWithCalendar />
      </div>

      {/* Bottom Section */}
      <HealthChart />
    </>
  );
}
