"use client";

import { useState } from "react";
import {
  MessageSquare,
  TrendingDown,
  FileX,
  RefreshCw,
  Shield,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Flag,
} from "lucide-react";
import DashboardTopbar from "@/components/layout/DashboardTopbar";
import {
  generateNegotiationScript,
  type NegotiationScript,
} from "@/app/actions/negotiationAction";
import { cn } from "@/lib/utils";

type ScenarioKey = "rent_reduction" | "clause_removal" | "lease_renewal" | "deposit_reduction";

type PageState =
  | { view: "form" }
  | { view: "loading" }
  | { view: "script"; script: NegotiationScript };

const SCENARIOS: {
  key: ScenarioKey;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    key: "rent_reduction",
    label: "Reduce Monthly Rent",
    description: "Negotiate a lower rent with your landlord",
    icon: TrendingDown,
  },
  {
    key: "clause_removal",
    label: "Remove Unfair Clause",
    description: "Get an unfair clause removed from your lease",
    icon: FileX,
  },
  {
    key: "lease_renewal",
    label: "Negotiate Lease Renewal",
    description: "Get better terms when renewing your lease",
    icon: RefreshCw,
  },
  {
    key: "deposit_reduction",
    label: "Security Deposit Reduction",
    description: "Negotiate a lower security deposit amount",
    icon: Shield,
  },
];

const LANGUAGES = [
  "English", "Hindi", "Marathi", "Tamil", "Telugu",
  "Bengali", "Gujarati", "Kannada", "Malayalam", "Punjabi",
];

export default function NegotiatePage() {
  const [pageState, setPageState] = useState<PageState>({ view: "form" });
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>("rent_reduction");
  const [currentRent, setCurrentRent] = useState("");
  const [targetRent, setTargetRent] = useState("");
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("English");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setPageState({ view: "loading" });

    const scenarioLabel = SCENARIOS.find((s) => s.key === selectedScenario)?.label ?? selectedScenario;

    const result = await generateNegotiationScript(
      scenarioLabel,
      currentRent ? parseInt(currentRent, 10) : undefined,
      targetRent ? parseInt(targetRent, 10) : undefined,
      city || undefined,
      language
    );

    if (result.success) {
      setPageState({ view: "script", script: result.script });
    } else {
      setError(result.error);
      setPageState({ view: "form" });
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <DashboardTopbar title="Negotiation Coach" />

      <main className="flex-1 px-4 md:px-6 py-8 max-w-4xl mx-auto w-full">

        {/* FORM VIEW */}
        {pageState.view === "form" && (
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Negotiation Coach</h2>
              </div>
              <p className="text-slate-500">Get an AI-generated script to negotiate your lease</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Scenario selection */}
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-700 mb-3">
                What do you want to negotiate?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCENARIOS.map(({ key, label, description, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedScenario(key)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer",
                      selectedScenario === key
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        selectedScenario === key ? "bg-indigo-100" : "bg-slate-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          selectedScenario === key ? "text-indigo-600" : "text-slate-500"
                        )}
                      />
                    </div>
                    <div>
                      <p
                        className={cn(
                          "font-semibold text-sm",
                          selectedScenario === key ? "text-indigo-700" : "text-slate-800"
                        )}
                      >
                        {label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional fields */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-medium text-slate-700 mb-4">
                Additional details{" "}
                <span className="text-slate-400 font-normal">(optional — improves accuracy)</span>
              </p>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Current Rent (₹/mo)</label>
                    <input
                      type="number"
                      value={currentRent}
                      onChange={(e) => setCurrentRent(e.target.value)}
                      placeholder="e.g. 25000"
                      min={0}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {selectedScenario === "rent_reduction" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Target Rent (₹/mo)</label>
                      <input
                        type="number"
                        value={targetRent}
                        onChange={(e) => setTargetRent(e.target.value)}
                        placeholder="e.g. 22000"
                        min={0}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Delhi, Bangalore"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Script Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 cursor-pointer mt-2"
                  style={{ backgroundColor: "#6366F1" }}
                >
                  Generate My Script →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOADING VIEW */}
        {pageState.view === "loading" && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <MessageSquare
              className="w-12 h-12 mb-5 animate-pulse"
              style={{ color: "#6366F1" }}
            />
            <p className="text-xl font-semibold text-slate-800 mb-2">
              Crafting your negotiation script...
            </p>
            <p className="text-slate-500">Preparing counter-arguments and talking points</p>
          </div>
        )}

        {/* SCRIPT VIEW */}
        {pageState.view === "script" && (
          <div className="flex flex-col gap-5 pb-10">
            <button
              onClick={() => setPageState({ view: "form" })}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Generate Another Script
            </button>

            {/* Section 1 — Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                {pageState.script.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                  {pageState.script.scenario}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  {pageState.script.language}
                </span>
              </div>
            </div>

            {/* Section 2 — Opening Statement */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Flag className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900">How to Start</h3>
              </div>
              <div
                className="rounded-xl p-4 italic text-slate-700 leading-relaxed text-sm"
                style={{ backgroundColor: "#EEF2FF", borderLeft: "4px solid #6366F1" }}
              >
                &ldquo;{pageState.script.openingStatement}&rdquo;
              </div>
            </div>

            {/* Section 3 — Key Points */}
            {pageState.script.keyPoints.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Your Key Arguments</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {pageState.script.keyPoints.map((point, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3"
                    >
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: "#6366F1" }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4 — Counter Arguments */}
            {pageState.script.counterArguments.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Handle Objections</h3>
                </div>
                <div className="flex flex-col gap-4">
                  {pageState.script.counterArguments.map((ca, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="bg-red-50 px-4 py-3 border-b border-red-100">
                        <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">
                          They might say:
                        </p>
                        <p className="text-sm text-red-800 italic">&ldquo;{ca.landlordMightSay}&rdquo;</p>
                      </div>
                      <div className="bg-green-50 px-4 py-3">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                          You respond:
                        </p>
                        <p className="text-sm text-green-800 font-medium">{ca.youShouldRespond}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 5 — Sample Dialogue */}
            {pageState.script.sampleDialogue.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Practice Conversation</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {pageState.script.sampleDialogue.map((line, i) => (
                    <div
                      key={i}
                      className={cn("flex flex-col gap-1", line.speaker === "tenant" ? "items-end" : "items-start")}
                    >
                      <span className="text-xs text-slate-400 px-1">
                        {line.speaker === "tenant" ? "You (Tenant)" : "Landlord"}
                      </span>
                      <div
                        className={cn(
                          "px-4 py-2.5 max-w-xs sm:max-w-sm text-sm leading-relaxed",
                          line.speaker === "tenant"
                            ? "text-white rounded-2xl rounded-br-none"
                            : "text-slate-700 bg-slate-100 rounded-2xl rounded-bl-none"
                        )}
                        style={line.speaker === "tenant" ? { backgroundColor: "#6366F1" } : {}}
                      >
                        {line.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 6 — Dos and Don'ts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pageState.script.dos.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <p className="font-semibold text-green-700 mb-3">✓ Do This</p>
                  <div className="flex flex-col gap-2">
                    {pageState.script.dos.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pageState.script.donts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <p className="font-semibold text-red-700 mb-3">✗ Avoid This</p>
                  <div className="flex flex-col gap-2">
                    {pageState.script.donts.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 7 — Closing Statement */}
            {pageState.script.closingStatement && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Flag className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">How to Close</h3>
                </div>
                <div
                  className="rounded-xl p-4 italic text-slate-700 leading-relaxed text-sm"
                  style={{ backgroundColor: "#EEF2FF", borderLeft: "4px solid #6366F1" }}
                >
                  &ldquo;{pageState.script.closingStatement}&rdquo;
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
