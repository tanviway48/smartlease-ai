import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { db } from "@/db";
import { users, leaseAnalyses } from "@/db/schema";
import type { LeaseAnalysisResult } from "@/lib/gemini";
import ReportResultsClient from "@/components/lease/ReportResultsClient";
import DashboardTopbar from "@/components/layout/DashboardTopbar";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Report ${id.slice(0, 8)}... — SmartLease AI` };
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  // Get DB user
  const userRows = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  const dbUser = userRows[0] ?? null;
  if (!dbUser) redirect("/sign-in");

  // Fetch analysis — only if it belongs to this user
  const rows = await db
    .select()
    .from(leaseAnalyses)
    .where(and(eq(leaseAnalyses.id, id), eq(leaseAnalyses.userId, dbUser.id)))
    .limit(1);

  const analysis = rows[0] ?? null;

  if (!analysis) {
    notFound();
  }

  // Not yet completed
  if (analysis.status !== "completed") {
    return (
      <div className="flex flex-col flex-1">
        <DashboardTopbar title="Report" />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
          <Clock className="w-16 h-16 text-amber-400 mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Report is still processing
          </h2>
          <p className="text-slate-500 mb-6 max-w-sm">
            Your lease analysis is currently being processed. Please check back in a few moments.
          </p>
          <Link
            href="/dashboard/reports"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← Back to Reports
          </Link>
        </main>
      </div>
    );
  }

  const result = analysis.result as LeaseAnalysisResult | null;
  if (!result) {
    notFound();
  }

  const analyzedDate = analysis.createdAt
    ? format(new Date(analysis.createdAt), "dd MMM yyyy, hh:mm a")
    : "Unknown date";

  const shortName =
    analysis.fileName.length > 50
      ? `${analysis.fileName.slice(0, 50)}...`
      : analysis.fileName;

  return (
    <div className="flex flex-col flex-1">
      <DashboardTopbar title="Full Report" />

      <main className="flex-1 px-4 md:px-6 py-8 max-w-4xl mx-auto w-full">
        {/* Back */}
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">{shortName}</p>
            <p className="text-sm text-slate-400 mt-0.5">Analyzed on {analyzedDate}</p>
          </div>
        </div>

        {/* Results */}
        <ReportResultsClient
          result={result}
          fileName={analysis.fileName}
          analysisId={analysis.id}
        />
      </main>
    </div>
  );
}
