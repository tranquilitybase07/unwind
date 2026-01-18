"use client"

import HealthChart from "./HealthChart";
import ScheduleWithCalendar from "./ScheduleWithCalendar";
import { VoiceDumpCard } from "./VoiceDumpCard";

export function HomeContent() {
  return (
    <>
      <div className="grid grid-cols-2 gap-6 mb-6 auto-rows-[380px] ">
        {/* Featured Card */}
        <VoiceDumpCard />


        {/* Schedule Details with Calendar Picker */}
        <ScheduleWithCalendar />
      </div>

      {/* Bottom Section */}
      <HealthChart />
    </>
  );
}
