"use client";

import { Bell, Menu, Home, ChevronRight } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useMobileSidebar } from "@/components/layout/MobileSidebarProvider";
import Link from "next/link";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface DashboardTopbarProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
}

export default function DashboardTopbar({ title, breadcrumbs }: DashboardTopbarProps) {
  const { open } = useMobileSidebar();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-6">
      <div className="h-16 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={open}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-slate-900 truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
          </Button>
          <UserButton />
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1.5 pb-2 text-sm overflow-x-auto">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5 shrink-0">
              <ChevronRight className="w-3 h-3 text-slate-300" />
              {crumb.href && i < breadcrumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-700 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
