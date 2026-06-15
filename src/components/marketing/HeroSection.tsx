import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Star } from "lucide-react";

const avatarData = [
  { initials: "AK", bg: "from-violet-500 to-indigo-500" },
  { initials: "SR", bg: "from-pink-500 to-rose-500" },
  { initials: "MR", bg: "from-amber-400 to-orange-500" },
  { initials: "PT", bg: "from-emerald-400 to-teal-500" },
  { initials: "DV", bg: "from-sky-400 to-blue-500" },
];

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* ── Left — Text ── */}
        <div className="flex flex-col items-start gap-6">
          <Badge className="gap-1.5 px-3 py-1 text-sm font-medium border-indigo-200 text-indigo-700 bg-indigo-50">
            🚀 AI-Powered Lease Analysis
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] text-slate-900">
            Understand Your Lease.{" "}
            <span style={{ color: "#6366F1" }}>Protect Your Rights.</span>
          </h1>

          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            Upload your rental agreement and get instant AI-powered analysis.
            Discover unfair clauses, estimate fair market rent, and negotiate
            with confidence.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center text-base font-semibold text-white px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#6366F1" }}
            >
              Analyze My Lease →
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center text-base font-semibold text-slate-700 px-8 py-3.5 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors"
            >
              See How It Works
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex -space-x-2">
              {avatarData.map((a) => (
                <div
                  key={a.initials}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${a.bg} flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white`}
                >
                  {a.initials}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Join 2,000+ tenants who negotiated better leases
              </p>
            </div>
          </div>
        </div>

        {/* ── Right — Mockup Card ── */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md">
            <div
              className="absolute -inset-4 rounded-3xl -z-10 blur-2xl opacity-20"
              style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}
            />
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
              {/* Card header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-sm font-semibold text-slate-800">
                  Lease Analysis Complete
                </span>
                <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
              </div>

              {/* Flagged clauses */}
              <div className="px-5 py-4 flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                  Flagged Clauses
                </p>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Security deposit exceeds 2 months ⚠️
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Clause 4.2 — May violate state tenancy laws
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-rose-900">
                      No notice period clause ❌
                    </p>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Clause 7.1 — Tenant has no eviction protection
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">
                      Rent increase capped at 5% ✅
                    </p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Clause 5.3 — Fair and standard practice
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk score footer */}
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">Overall Risk Score</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800">
                  72 / 100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
