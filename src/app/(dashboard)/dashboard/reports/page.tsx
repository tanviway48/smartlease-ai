import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { FileText, FolderOpen } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { users, leaseAnalyses } from "@/db/schema";
import DashboardTopbar from "@/components/layout/DashboardTopbar";
import { Button } from "@/components/ui/button";
import type { LeaseAnalysisResult } from "@/lib/gemini";

export const metadata: Metadata = {
  title: "My Reports — SmartLease AI",
};

function SmallScoreCircle({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score <= 30 ? "#16a34a" : score <= 60 ? "#d97706" : "#dc2626";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="5" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 24 24)"
        />
        <text x="24" y="24" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill={color}>
          {score}
        </text>
      </svg>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  if (verdict === "safe")
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Safe</span>;
  if (verdict === "caution")
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Caution</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Risky</span>;
}

export default async function ReportsPage() {
  const { userId: clerkId } = await auth();

  const userRows = clerkId
    ? await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1)
    : [];

  const dbUser = userRows[0] ?? null;

  const analyses = dbUser
    ? await db
        .select()
        .from(leaseAnalyses)
        .where(eq(leaseAnalyses.userId, dbUser.id))
        .orderBy(desc(leaseAnalyses.createdAt))
    : [];

  return (
    <div className="flex flex-col flex-1">
      <DashboardTopbar title="My Reports" />

      <main className="flex-1 px-4 md:px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">My Reports</h2>
          <p className="text-slate-500 mt-1">All your lease analyses in one place.</p>
        </div>

        {analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FolderOpen className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No reports yet</h3>
            <p className="text-slate-400 text-sm mb-6">
              Analyze your first lease to see reports here.
            </p>
            <Button
              className="text-white"
              style={{ backgroundColor: "#6366F1" }}
              nativeButton={false}
              render={<Link href="/dashboard/analyze" />}
            >
              Start Analysis →
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyses.map((analysis) => {
              const result = analysis.result as LeaseAnalysisResult | null;
              const riskScore = result?.riskScore ?? null;
              const verdict = result?.overallVerdict ?? null;
              const clauseCount = result?.clauses?.length ?? 0;

              const shortName =
                analysis.fileName.length > 32
                  ? `${analysis.fileName.slice(0, 32)}...`
                  : analysis.fileName;

              const date = analysis.createdAt
                ? new Date(analysis.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—";

              return (
                <div
                  key={analysis.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <FileText className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-800 text-sm leading-snug">
                        {shortName}
                      </span>
                    </div>
                    {verdict && <VerdictBadge verdict={verdict} />}
                  </div>

                  {/* Score + date */}
                  <div className="flex items-center gap-4">
                    {riskScore !== null ? (
                      <SmallScoreCircle score={riskScore} />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        N/A
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-slate-400">Analyzed on {date}</p>
                      {clauseCount > 0 && (
                        <p className="text-sm text-slate-500">{clauseCount} clauses analyzed</p>
                      )}
                    </div>
                  </div>

                  {/* CTA — now links to the report detail page */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
                    nativeButton={false}
                    render={<Link href={`/dashboard/reports/${analysis.id}`} />}
                  >
                    View Full Report →
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
