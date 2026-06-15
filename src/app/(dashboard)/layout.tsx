import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebarProvider from "@/components/layout/MobileSidebarProvider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar provider wraps main content */}
      <MobileSidebarProvider>
        <div className="md:pl-60 flex flex-col min-h-screen">{children}</div>
      </MobileSidebarProvider>
    </div>
  );
}
