import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import {
  FileSearch,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Upload,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardTopbar from "@/components/layout/DashboardTopbar";
import TimeGreeting from "@/components/dashboard/TimeGreeting";
import WhatsNewBanner from "@/components/dashboard/WhatsNewBanner";
import Link from "next/link";
import { db } from "@/db";
import { users, leaseAnalyses } from "@/db/schema";
import type { LeaseAnalysisResult } from "@/lib/gemini";

export const metadata: Metadata = {
  title: "Dashboard — SmartLease AI",
};

function RiskBadge({ score }: { score: number }) {
  if (score <= 30)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        {score} Safe
      </span>
    );
  if (score <= 60)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        {score} Caution
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      {score} Risky
    </span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === "completed")
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Completed
      </span>
    );
  if (status === "processing")
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        Processing
      </span>
    );
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      Failed
    </span>
  );
}

const quickActions = [
  {
    title: "Analyze a Lease",
    description: "Upload your rental agreement PDF and get an instant AI-powered risk analysis.",
    icon: Upload,
    cta: "Start Analysis →",
    href: "/dashboard/analyze",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    title: "Check Fair Rent",
    description: "Enter your locality and BHK type to see if your rent is fair compared to market rates.",
    icon: Search,
    cta: "Check Now →",
    href: "/dashboard/rent-estimator",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();

  const userRows = clerkId
    ? await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1)
    : [];

  const dbUser = userRows[0] ?? null;
  const firstName = dbUser?.fullName?.split(" ")[0] ?? "there";

  const analyses = dbUser
    ? await db
        .select()
        .from(leaseAnalyses)
        .where(eq(leaseAnalyses.userId, dbUser.id))
        .orderBy(desc(leaseAnalyses.createdAt))
    : [];

  const completed = analyses.filter((a) => a.status === "completed");

  let totalHighRisk = 0;
  let totalRiskScore = 0;

  for (const analysis of completed) {
    const result = analysis.result as LeaseAnalysisResult | null;
    if (result) {
      totalRiskScore += result.riskScore ?? 0;
      totalHighRisk += (result.clauses ?? []).filter((c) => c.risk === "high").length;
    }
  }

  const avgRiskScore =
    completed.length > 0 ? Math.round(totalRiskScore / completed.length) : null;

  const stats = [
    {
      label: "Leases Analyzed",
      value: completed.length.toString(),
      icon: FileSearch,
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      label: "Clauses Flagged",
      value: totalHighRisk.toString(),
      icon: AlertTriangle,
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Avg Risk Score",
      value: avgRiskScore !== null ? avgRiskScore.toString() : "N/A",
      icon: ShieldAlert,
      bg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
    {
      label: "Rent Checks",
      value: "0",
      icon: TrendingUp,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  const recentAnalyses = analyses.slice(0, 5);

  return (
    <div className="flex flex-col flex-1">
      <DashboardTopbar title="Dashboard" />

      <main className="flex-1 px-4 md:px-6 py-8 max-w-6xl mx-auto w-full">
        {/* What's New banner */}
        <WhatsNewBanner />

        {/* Welcome — time-based greeting rendered client-side */}
        <div className="mb-8">
          <TimeGreeting firstName={firstName} />
          <p className="text-slate-500 mt-1">Here&apos;s your lease protection overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, bg, iconColor }) => (
            <Card key={label} className="border-slate-200">
              <CardContent className="p-5">
                <div className={`inline-flex w-10 h-10 rounded-xl ${bg} items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map(({ title, description, icon: Icon, cta, href, iconBg, iconColor }) => (
              <Card key={title} className="border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className={`inline-flex w-12 h-12 rounded-xl ${iconBg} items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
                    <p className="text-sm text-slate-500">{description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start border-slate-300"
                    nativeButton={false}
                    render={<Link href={href} />}
                  >
                    {cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Analyses */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Analyses</h3>
          {recentAnalyses.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
              <FileSearch className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No lease analyses yet.</p>
              <p className="text-sm text-slate-400 mt-1">Upload your first lease to get started.</p>
              <Button
                size="sm"
                className="mt-5 text-white"
                style={{ backgroundColor: "#6366F1" }}
                nativeButton={false}
                render={<Link href="/dashboard/analyze" />}
              >
                Analyze My First Lease
              </Button>
            </div>
          ) : (
            <Card className="border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        File
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">
                        Date
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Risk
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">
                        Status
                      </th>
                      <th className="px-5 py-3.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentAnalyses.map((analysis) => {
                      const result = analysis.result as LeaseAnalysisResult | null;
                      const riskScore = result?.riskScore ?? null;
                      const shortName =
                        analysis.fileName.length > 30
                          ? `${analysis.fileName.slice(0, 30)}...`
                          : analysis.fileName;
                      const date = analysis.createdAt
                        ? new Date(analysis.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—";

                      return (
                        <tr key={analysis.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="font-medium text-slate-800">{shortName}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 hidden sm:table-cell">
                            {date}
                          </td>
                          <td className="px-5 py-4">
                            {riskScore !== null ? (
                              <RiskBadge score={riskScore} />
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <StatusBadge status={analysis.status} />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/dashboard/reports/${analysis.id}`}
                              className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
