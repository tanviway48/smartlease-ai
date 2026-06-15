"use client";

import { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import DashboardTopbar from "@/components/layout/DashboardTopbar";
import LeaseUploader from "@/components/lease/LeaseUploader";
import LeaseAnalysisResults from "@/components/lease/LeaseAnalysisResults";
import type { LeaseAnalysisResult } from "@/lib/gemini";

type PageState =
  | { view: "upload" }
  | { view: "results"; analysisId: string; result: LeaseAnalysisResult; fileName: string };

const featurePills = [
  "🔒 Encrypted Upload",
  "⚡ 30-sec Analysis",
  "🇮🇳 India-specific Laws",
];

export default function AnalyzePage() {
  const [pageState, setPageState] = useState<PageState>({ view: "upload" });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleUploadComplete = (analysisId: string, result: LeaseAnalysisResult, fileName: string) => {
    setPageState({ view: "results", analysisId, result, fileName });
    showToast("✅ Analysis complete! Scroll down to see your full report.");
  };

  const handleError = (error: string) => {
    showToast(`❌ ${error}`);
  };

  const handleReset = () => {
    setPageState({ view: "upload" });
  };

  return (
    <div className="flex flex-col flex-1">
      <DashboardTopbar title="Lease Analyzer" />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg max-w-sm text-center">
          {toastMsg}
        </div>
      )}

      <main className="flex-1 px-4 md:px-6 py-8">
        {pageState.view === "upload" && (
          <div className="max-w-2xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-6">
              <span className="text-slate-400">Dashboard</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-medium">Analyze Lease</span>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">
              Lease Analyzer
            </h1>
            <p className="text-slate-500 mb-6">
              Get an instant AI-powered analysis of your rental agreement
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {featurePills.map((pill) => (
                <span
                  key={pill}
                  className="bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full"
                >
                  {pill}
                </span>
              ))}
            </div>

            {/* Uploader */}
            <LeaseUploader
              onUploadComplete={(analysisId, result, fileName) => {
                handleUploadComplete(analysisId, result, fileName);
              }}
              onError={handleError}
            />

            {/* Trust note */}
            <div className="flex items-center justify-center gap-1.5 mt-5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs text-slate-400">
                Your documents are encrypted and never shared with third parties.
              </p>
            </div>
          </div>
        )}

        {pageState.view === "results" && (
          <div className="max-w-4xl mx-auto">
            {/* Back link */}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Analyze Another Lease
            </button>

            <LeaseAnalysisResults
              result={pageState.result}
              fileName={pageState.fileName || "Lease Agreement"}
              analysisId={pageState.analysisId}
              onReset={handleReset}
            />
          </div>
        )}
      </main>
    </div>
  );
}
