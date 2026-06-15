import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { eq, and, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { User, Shield, BarChart2, CheckCircle, Mail } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/db";
import { users, leaseAnalyses, rentEstimates } from "@/db/schema";
import DashboardTopbar from "@/components/layout/DashboardTopbar";

export const metadata: Metadata = {
  title: "Settings — SmartLease AI",
};

const FREE_LEASE_LIMIT = 10;
const FREE_RENT_LIMIT = 20;

export default async function SettingsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const userRows = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  const dbUser = userRows[0] ?? null;
  if (!dbUser) redirect("/sign-in");

  // Fetch usage counts
  const [leaseCountRow] = await db
    .select({ value: count() })
    .from(leaseAnalyses)
    .where(and(eq(leaseAnalyses.userId, dbUser.id), eq(leaseAnalyses.status, "completed")));

  const [rentCountRow] = await db
    .select({ value: count() })
    .from(rentEstimates)
    .where(eq(rentEstimates.userId, dbUser.id));

  const leaseCount = Number(leaseCountRow?.value ?? 0);
  const rentCount = Number(rentCountRow?.value ?? 0);
  const storageEstimateMB = (leaseCount * 0.5).toFixed(1);

  const memberSince = dbUser.createdAt
    ? format(new Date(dbUser.createdAt), "dd MMM yyyy")
    : "—";

  const leasePercent = Math.min(100, Math.round((leaseCount / FREE_LEASE_LIMIT) * 100));
  const rentPercent = Math.min(100, Math.round((rentCount / FREE_RENT_LIMIT) * 100));

  const initials = dbUser.fullName
    ? dbUser.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : dbUser.email.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col flex-1">
      <DashboardTopbar title="Settings" />

      <main className="flex-1 px-4 md:px-6 py-8 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          <p className="text-slate-500 mt-1">Manage your account and preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar nav */}
          <aside className="lg:w-48 shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1">
              {[
                { label: "Profile", icon: User, href: "#profile" },
                { label: "Account", icon: Shield, href: "#account" },
                { label: "Usage", icon: BarChart2, href: "#usage" },
              ].map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-150"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">

            {/* PROFILE SECTION */}
            <section id="profile" className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-5">Profile Information</h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {/* Clerk UserButton as avatar with large size */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                    {initials}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {dbUser.fullName ?? "—"}
                  </p>
                  <p className="text-sm text-slate-500">{dbUser.email}</p>
                </div>
                <div className="ml-auto">
                  <UserButton />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-500 sm:w-32 shrink-0">Full Name</span>
                  <span className="text-sm text-slate-800">{dbUser.fullName ?? "—"}</span>
                  <span className="text-xs text-slate-400 sm:ml-auto">Managed by Clerk</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-500 sm:w-32 shrink-0">Email</span>
                  <span className="text-sm text-slate-800 truncate">{dbUser.email}</span>
                  <span className="text-xs text-slate-400 sm:ml-auto">Managed by Clerk</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-500 sm:w-32 shrink-0">Member Since</span>
                  <span className="text-sm text-slate-800">{memberSince}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3">
                  <span className="text-sm font-medium text-slate-500 sm:w-32 shrink-0">Plan</span>
                  {dbUser.plan === "pro" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                      Pro Plan
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      Free Plan
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                Profile details like name and email are managed through Clerk. Click the profile icon in the top right to update them.
              </div>
            </section>

            {/* ACCOUNT SECTION */}
            <section id="account" className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-5">Account &amp; Security</h3>

              <div className="flex flex-col gap-4">
                {/* Email verified */}
                <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">Email</p>
                    <p className="text-xs text-slate-500">{dbUser.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                </div>

                {/* Change password */}
                <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                  <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">Password</p>
                    <p className="text-xs text-slate-500">Managed via Clerk profile</p>
                  </div>
                  <span className="text-xs text-indigo-600 font-medium cursor-default">
                    Change via Profile →
                  </span>
                </div>

                {/* Danger zone */}
                <div className="mt-2 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-700 mb-1">Danger Zone</p>
                  <p className="text-xs text-red-500 mb-3">
                    This will permanently delete all your lease analyses and data.
                  </p>
                  <button
                    disabled
                    title="Contact support to delete your account"
                    className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium opacity-50 cursor-not-allowed"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </section>

            {/* USAGE SECTION */}
            <section id="usage" className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-5">Your Usage</h3>

              <div className="flex flex-col gap-6">
                {/* Lease analyses */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">Lease Analyses</p>
                    <p className="text-sm text-slate-500">
                      {leaseCount} / {FREE_LEASE_LIMIT}
                    </p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${leasePercent}%`, backgroundColor: "#6366F1" }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{FREE_LEASE_LIMIT - leaseCount} remaining on free tier</p>
                </div>

                {/* Rent checks */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">Rent Checks</p>
                    <p className="text-sm text-slate-500">
                      {rentCount} / {FREE_RENT_LIMIT}
                    </p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${rentPercent}%`, backgroundColor: "#6366F1" }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{FREE_RENT_LIMIT - rentCount} remaining on free tier</p>
                </div>

                {/* Storage */}
                <div className="py-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">Storage Used</p>
                    <p className="text-sm text-slate-500">~{storageEstimateMB} MB</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Estimate based on uploaded lease files</p>
                </div>

                {/* Upgrade CTA */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-700 mb-3">
                    Upgrade to Pro for unlimited analyses, priority support, and advanced features.
                  </p>
                  <button
                    disabled
                    className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold opacity-80 cursor-not-allowed"
                    style={{ backgroundColor: "#6366F1" }}
                  >
                    Upgrade to Pro → (Coming Soon)
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
