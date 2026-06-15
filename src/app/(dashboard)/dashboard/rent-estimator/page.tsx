"use client";

import { useState } from "react";
import {
  TrendingUp,
  ArrowLeft,
  MapPin,
  Lightbulb,
  Info,
} from "lucide-react";
import Link from "next/link";
import DashboardTopbar from "@/components/layout/DashboardTopbar";
import { rentEstimatorAction, type RentEstimateResult } from "@/app/actions/rentEstimatorAction";

type PageState =
  | { view: "form" }
  | { view: "loading"; bhkType: string; locality: string; city: string }
  | { view: "results"; result: RentEstimateResult };

const BHK_OPTIONS = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];

function VerdictBadge({ verdict }: { verdict: RentEstimateResult["verdict"] }) {
  if (verdict === "below_market")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
        ✓ Below Market
      </span>
    );
  if (verdict === "at_market")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
        ~ At Market Rate
      </span>
    );
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
      ↑ Above Market
    </span>
  );
}

function ComparisonBadge({ comparison }: { comparison: "cheaper" | "similar" | "expensive" }) {
  if (comparison === "cheaper")
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Cheaper</span>;
  if (comparison === "similar")
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Similar</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Expensive</span>;
}

export default function RentEstimatorPage() {
  const [pageState, setPageState] = useState<PageState>({ view: "form" });
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [bhkType, setBhkType] = useState("2 BHK");
  const [areaSqft, setAreaSqft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPageState({ view: "loading", bhkType, locality, city });

    const result = await rentEstimatorAction(
      locality,
      city,
      bhkType,
      areaSqft ? parseInt(areaSqft, 10) : undefined
    );

    if (result.success) {
      setPageState({ view: "results", result: result.result });
    } else {
      setError(result.error);
      setPageState({ view: "form" });
    }
  };

  const handleReset = () => {
    setPageState({ view: "form" });
    setError(null);
  };

  return (
    <div className="flex flex-col flex-1">
      <DashboardTopbar title="Rent Estimator" />

      <main className="flex-1 px-4 md:px-6 py-8 max-w-4xl mx-auto w-full">
        {/* FORM VIEW */}
        {pageState.view === "form" && (
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Rent Estimator</h2>
              </div>
              <p className="text-slate-500">Find out if you&apos;re paying a fair rent for your area</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* City */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Pune, Bangalore, Delhi"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Locality */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Locality / Area <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Andheri West, Koramangala, Sector 62"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* BHK Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      BHK Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bhkType}
                      onChange={(e) => setBhkType(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                    >
                      {BHK_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area sq ft */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Carpet Area{" "}
                      <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={areaSqft}
                      onChange={(e) => setAreaSqft(e.target.value)}
                      placeholder="e.g. 650"
                      min={100}
                      max={10000}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-slate-400">Helps us give a more accurate estimate</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: "#6366F1" }}
                >
                  Check Fair Rent →
                </button>
              </form>
            </div>
          </div>
        )}

        {/* LOADING VIEW */}
        {pageState.view === "loading" && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <TrendingUp
              className="w-12 h-12 mb-5 animate-bounce"
              style={{ color: "#6366F1" }}
            />
            <p className="text-xl font-semibold text-slate-800 mb-2">
              Analyzing rental market data...
            </p>
            <p className="text-slate-500 mb-1">
              Checking {pageState.bhkType} prices in {pageState.locality}, {pageState.city}
            </p>
            <p className="text-sm text-slate-400">This takes about 10 seconds</p>
          </div>
        )}

        {/* RESULTS VIEW */}
        {pageState.view === "results" && (
          <div className="flex flex-col gap-5">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Check Another
            </button>

            {/* Card 1 — Main estimate */}
            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Range */}
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-slate-400">Fair Rent Range</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">
                    ₹{pageState.result.estimatedMin.toLocaleString("en-IN")} —{" "}
                    ₹{pageState.result.estimatedMax.toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-slate-400">per month</p>
                </div>

                {/* Market rate + verdict */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-slate-400">Market Rate</p>
                  <p className="text-2xl font-semibold text-slate-800">
                    ₹{pageState.result.marketRate.toLocaleString("en-IN")}/mo
                  </p>
                  <VerdictBadge verdict={pageState.result.verdict} />
                </div>

                {/* Price per sqft + location */}
                <div className="flex flex-col gap-1 sm:items-end">
                  <p className="text-sm text-slate-400">Price per sq ft</p>
                  <p className="text-xl font-semibold text-slate-800">
                    ₹{pageState.result.pricePerSqft}/sqft
                  </p>
                  <p className="text-sm text-slate-400">
                    {pageState.result.locality}, {pageState.result.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 — Verdict explanation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div
                className="flex items-start gap-3 rounded-xl p-4"
                style={{ backgroundColor: "#EEF2FF", borderLeft: "4px solid #6366F1" }}
              >
                <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#6366F1" }} />
                <p className="text-slate-700 text-sm leading-relaxed">
                  {pageState.result.verdictText}
                </p>
              </div>
            </div>

            {/* Card 3 — Nearby Areas */}
            {pageState.result.nearbyAreas.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Nearby Areas Comparison</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {pageState.result.nearbyAreas.map((area) => (
                    <div
                      key={area.name}
                      className="border border-slate-200 rounded-xl p-4 flex flex-col gap-2"
                    >
                      <p className="font-medium text-slate-800 text-sm">{area.name}</p>
                      <p className="text-lg font-semibold text-slate-700">
                        ₹{area.avgRent.toLocaleString("en-IN")}/mo
                      </p>
                      <ComparisonBadge comparison={area.comparison} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 4 — Factors */}
            {pageState.result.factors.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Factors affecting rent in {pageState.result.locality}
                </h3>
                <ul className="flex flex-col gap-3">
                  {pageState.result.factors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#6366F1" }} />
                      <span className="text-sm text-slate-700">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Card 5 — Tips */}
            {pageState.result.tips.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5" style={{ color: "#6366F1" }} />
                  <h3 className="font-semibold text-slate-900">Smart Renting Tips</h3>
                </div>
                <ol className="flex flex-col gap-3">
                  {pageState.result.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 border-l-4 border-indigo-200 pl-4 py-1"
                    >
                      <span className="text-xs font-bold text-indigo-500 mt-0.5 shrink-0 w-4">
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-700">{tip}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard/analyze"
                className="flex-1 text-center py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#6366F1" }}
              >
                Analyze Your Lease Agreement →
              </Link>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl text-slate-700 font-semibold text-sm border-2 border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Check Another Area
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
