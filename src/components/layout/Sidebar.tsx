"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSearch,
  TrendingUp,
  MessageSquare,
  FolderOpen,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";
import { UserButton, useUser } from "@clerk/nextjs";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze Lease", href: "/dashboard/analyze", icon: FileSearch },
  { label: "Rent Estimator", href: "/dashboard/rent-estimator", icon: TrendingUp },
  { label: "Negotiation Coach", href: "/dashboard/negotiate", icon: MessageSquare },
  { label: "My Reports", href: "/dashboard/reports", icon: FolderOpen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ alwaysVisible = false }: { alwaysVisible?: boolean }) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside
      className={cn(
        "h-full w-60 bg-white border-r border-slate-200 flex flex-col z-40",
        alwaysVisible ? "relative" : "fixed left-0 top-0 hidden md:flex"
      )}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-200">
        <Logo size="sm" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="flex flex-col gap-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative",
                    isActive
                      ? "bg-indigo-50 text-indigo-600 font-medium border-l-2 border-indigo-500 rounded-l-none"
                      : "text-slate-600 font-normal hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors duration-150",
                      isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Pro upgrade banner */}
      <div className="px-3 py-3">
        <div
          className="rounded-xl p-4 text-white"
          style={{ background: "linear-gradient(135deg, #6366F1 0%, #9333ea 100%)" }}
        >
          <p className="text-sm font-semibold mb-0.5">Upgrade to Pro</p>
          <p className="text-xs opacity-80 mb-3">Unlimited analyses + priority support</p>
          <button className="w-full bg-white text-indigo-600 text-xs font-semibold rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors duration-150 cursor-pointer">
            Upgrade →
          </button>
        </div>
      </div>

      {/* User section */}
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <UserButton />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-800 truncate">
              {user?.fullName ?? user?.firstName ?? "User"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
