import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { RightSidebar } from "@/components/dashboard/RightSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <LeftSidebar />
      {children}
      <RightSidebar />
    </div>
  );
}
