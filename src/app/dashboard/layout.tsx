import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { RightBar } from "@/components/dashboard/RightBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <LeftSidebar />
      {children}
      <RightBar />
    </div>
  );
}
