"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle,
  MessageSquare,
  Shield,
  Download,
  ChevronDown,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import type { LeaseAnalysisResult, ClauseAnalysis } from "@/lib/gemini";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LeaseAnalysisResultsProps {
  result: LeaseAnalysisResult;
  fileName: string;
  analysisId: string;
  onReset: () => void;
}

type RiskFilter = "all" | "high" | "medium" | "low";

function RiskBadge({ risk }: { risk: ClauseAnalysis["risk"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        risk === "high" && "bg-red-100 text-red-700",
        risk === "medium" && "bg-amber-100 text-amber-700",
        risk === "low" && "bg-green-100 text-green-700"
      )}
    >
      {risk.charAt(0).toUpperCase() + risk.slice(1)}
    </span>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const [dashOffset, setDashOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      const targetOffset = circumference - (score / 100) * circumference;
      setDashOffset(targetOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const color =
    score <= 30 ? "#16a34a" : score <= 60 ? "#d97706" : "#dc2626";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="10"
        />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 56 56)"
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
        <text
          x="56"
          y="52"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="22"
          fontWeight="700"
          fill={color}
        >
          {score}
        </text>
        <text
          x="56"
          y="68"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill="#94a3b8"
        >
          /100
        </text>
      </svg>
      <span className="text-xs font-medium text-slate-500">Risk Score</span>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: LeaseAnalysisResult["overallVerdict"] }) {
  if (verdict === "safe")
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-700">
        ✓ SAFE
      </span>
    );
  if (verdict === "caution")
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-amber-100 text-amber-700">
        ⚠ CAUTION
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-700">
      ✗ HIGH RISK
    </span>
  );
}

function ClauseCard({ clause }: { clause: ClauseAnalysis }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-slate-50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <RiskBadge risk={clause.risk} />
          <span className="font-medium text-slate-800 text-sm truncate">{clause.title}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
          {clause.originalText && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Original text
              </p>
              <div className="bg-white border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-600 leading-relaxed">
                {clause.originalText}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              What this means
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{clause.explanation}</p>
          </div>
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                What to do
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">{clause.suggestion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeaseAnalysisResults({
  result,
  fileName,
  onReset,
}: LeaseAnalysisResultsProps) {
  const [filter, setFilter] = useState<RiskFilter>("all");

  const filteredClauses =
    filter === "all"
      ? result.clauses
      : result.clauses.filter((c) => c.risk === filter);

  const highCount = result.clauses.filter((c) => c.risk === "high").length;

  const filters: { key: RiskFilter; label: string }[] = [
    { key: "all", label: `All (${result.clauses.length})` },
    { key: "high", label: `High Risk (${highCount})` },
    { key: "medium", label: `Medium (${result.clauses.filter((c) => c.risk === "medium").length})` },
    { key: "low", label: `Low Risk (${result.clauses.filter((c) => c.risk === "low").length})` },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Risk Score Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Score circle */}
          <div className="flex justify-center sm:justify-start">
            <ScoreCircle score={result.riskScore} />
          </div>

          {/* Verdict */}
          <div className="flex flex-col items-center gap-2 text-center">
            <VerdictBadge verdict={result.overallVerdict} />
            <p className="text-sm text-slate-500 truncate max-w-[200px]" title={fileName}>
              {fileName.length > 30 ? `${fileName.slice(0, 30)}...` : fileName}
            </p>
            <p className="text-xs text-slate-400">Analyzed just now</p>
          </div>

          {/* Quick stats */}
          <div className="flex flex-col gap-3 sm:items-end">
            {[
              { label: "Clauses analyzed", value: result.clauses.length },
              { label: "High risk", value: highCount },
              { label: "Recommendations", value: result.recommendations.length },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2 sm:justify-end">
                <span className="text-slate-500 text-sm">{label}</span>
                <span className="font-semibold text-slate-900 text-sm w-6 text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-900">Summary</h3>
        </div>
        <p className="text-slate-700 leading-relaxed">{result.summary}</p>
      </div>

      {/* Clause Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <h3 className="font-semibold text-slate-900">Clause Analysis</h3>
          <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            {result.clauses.length}
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer",
                filter === key
                  ? "bg-indigo-500 text-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {filteredClauses.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">
              No {filter} risk clauses found.
            </p>
          ) : (
            filteredClauses.map((clause, i) => (
              <ClauseCard key={i} clause={clause} />
            ))
          )}
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-900">What To Do Next</h3>
          </div>
          <ol className="flex flex-col gap-4">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-700 text-sm leading-relaxed">{rec}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Negotiation Points */}
      {result.negotiationPoints.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-900">Negotiation Coach</h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              New
            </span>
          </div>
          <div className="flex flex-col gap-3 mb-5">
            {result.negotiationPoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-xl p-3"
              >
                <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            nativeButton={false}
            render={<Link href="/dashboard/negotiate" />}
          >
            Generate Full Script →
          </Button>
        </div>
      )}

      {/* Tenant Rights */}
      {result.tenantRights.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-900">Know Your Rights</h3>
          </div>
          <div className="flex flex-col gap-3">
            {result.tenantRights.map((right, i) => (
              <div key={i} className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed">{right}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 italic mt-5">
            Based on Indian Rent Control Act and general tenancy laws. Consult a lawyer for legal advice.
          </p>
        </div>
      )}

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-60 bg-white border-t border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between gap-3 z-20">
        <Button variant="outline" className="gap-2 border-slate-300">
          <Download className="w-4 h-4" />
          Download Report
        </Button>
        <Button
          className="text-white gap-2"
          style={{ backgroundColor: "#6366F1" }}
          onClick={onReset}
        >
          Analyze Another Lease
        </Button>
      </div>
    </div>
  );
}
