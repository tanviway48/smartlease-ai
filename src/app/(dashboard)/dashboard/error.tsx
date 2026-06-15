"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-24 text-center">
      <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-slate-500 mb-1 max-w-sm">
        We encountered an error loading this page.
      </p>
      {error.digest && (
        <p className="text-xs text-slate-400 mb-6">Error ID: {error.digest}</p>
      )}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: "#6366F1" }}
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
