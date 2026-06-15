"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { users, rentEstimates } from "@/db/schema";

export interface NearbyArea {
  name: string;
  avgRent: number;
  comparison: "cheaper" | "similar" | "expensive";
}

export interface RentEstimateResult {
  locality: string;
  city: string;
  bhkType: string;
  areaSqft?: number;
  estimatedMin: number;
  estimatedMax: number;
  marketRate: number;
  pricePerSqft: number;
  verdict: "below_market" | "at_market" | "above_market";
  verdictText: string;
  factors: string[];
  nearbyAreas: NearbyArea[];
  tips: string[];
}

const VALID_BHK = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];

function coerceVerdict(v: unknown): "below_market" | "at_market" | "above_market" {
  if (v === "below_market" || v === "at_market" || v === "above_market") return v;
  return "at_market";
}

function coerceComparison(v: unknown): "cheaper" | "similar" | "expensive" {
  if (v === "cheaper" || v === "similar" || v === "expensive") return v;
  return "similar";
}

function parseRentResult(raw: unknown, locality: string, city: string, bhkType: string, areaSqft?: number): RentEstimateResult {
  if (typeof raw !== "object" || raw === null) throw new Error("Invalid response shape");
  const d = raw as Record<string, unknown>;

  const toNumber = (v: unknown, fallback: number): number =>
    typeof v === "number" && isFinite(v) ? Math.round(v) : fallback;

  const toStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

  const nearbyAreas: NearbyArea[] = (Array.isArray(d.nearbyAreas) ? d.nearbyAreas : [])
    .filter((a): a is Record<string, unknown> => typeof a === "object" && a !== null)
    .slice(0, 5)
    .map((a) => ({
      name: typeof a.name === "string" ? a.name : "Nearby Area",
      avgRent: toNumber(a.avgRent, 0),
      comparison: coerceComparison(a.comparison),
    }));

  const estimatedMin = toNumber(d.estimatedMin, 5000);
  const estimatedMax = toNumber(d.estimatedMax, 15000);
  const marketRate = toNumber(d.marketRate, Math.round((estimatedMin + estimatedMax) / 2));
  const pricePerSqft = toNumber(d.pricePerSqft, 0);

  return {
    locality,
    city,
    bhkType,
    areaSqft,
    estimatedMin,
    estimatedMax,
    marketRate,
    pricePerSqft,
    verdict: coerceVerdict(d.verdict),
    verdictText: typeof d.verdictText === "string" ? d.verdictText : "Rent is at market rate.",
    factors: toStringArray(d.factors),
    nearbyAreas,
    tips: toStringArray(d.tips),
  };
}

export async function rentEstimatorAction(
  locality: string,
  city: string,
  bhkType: string,
  areaSqft?: number
): Promise<{ success: true; result: RentEstimateResult } | { success: false; error: string }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false as const, error: "Not authenticated." };

  if (!locality.trim()) return { success: false as const, error: "Locality is required." };
  if (!city.trim()) return { success: false as const, error: "City is required." };
  if (!VALID_BHK.includes(bhkType)) return { success: false as const, error: "Invalid BHK type." };

  // Get or auto-create DB user
  let userRows = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (userRows.length === 0) {
    const clerkUser = await currentUser();
    if (!clerkUser) return { success: false as const, error: "Not authenticated." };
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
    await db.insert(users).values({ clerkId, email, fullName, avatarUrl: clerkUser.imageUrl ?? null, plan: "free" });
    userRows = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  }
  const dbUser = userRows[0];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false as const, error: "AI service not configured." };

  const areaLine = areaSqft ? `- Area: ${areaSqft} sq ft` : "";

  const prompt = `You are an expert Indian real estate analyst with deep knowledge of rental markets across all Indian cities, towns, and localities.

Provide a realistic rent estimate for:
- Locality: ${locality}
- City: ${city}
- Type: ${bhkType}
${areaLine}

Based on current 2024-2025 Indian rental market data, return ONLY this JSON:
{
  "estimatedMin": <minimum monthly rent in INR>,
  "estimatedMax": <maximum monthly rent in INR>,
  "marketRate": <typical/average monthly rent in INR>,
  "pricePerSqft": <price per sqft per month in INR>,
  "verdict": "<below_market|at_market|above_market>",
  "verdictText": "<one sentence explaining the verdict in simple terms>",
  "factors": [
    "<factor affecting rent in this area>"
  ],
  "nearbyAreas": [
    {
      "name": "<nearby locality name>",
      "avgRent": <average rent in INR>,
      "comparison": "<cheaper|similar|expensive>"
    }
  ],
  "tips": [
    "<practical tip for renting in this area>"
  ]
}

Rules:
- estimatedMin and estimatedMax must be realistic INR amounts
- Include 3-5 factors affecting rent
- Include 3 nearby areas for comparison
- Include 3-4 practical tips
- Return ONLY valid JSON, no extra text`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const geminiResult = await model.generateContent(prompt);
    const text = geminiResult.response.text();

    if (!text || text.trim() === "") throw new Error("Empty response from AI");

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No valid JSON in AI response");

    const parsed: unknown = JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1));
    const result = parseRentResult(parsed, locality.trim(), city.trim(), bhkType, areaSqft);

    // Save to DB
    await db.insert(rentEstimates).values({
      userId: dbUser.id,
      locality: result.locality,
      city: result.city,
      bhkType: result.bhkType,
      areaSqft: result.areaSqft ?? null,
      estimatedMin: result.estimatedMin,
      estimatedMax: result.estimatedMax,
      marketRate: result.marketRate,
    });

    return { success: true as const, result };
  } catch (err) {
    console.error("Rent estimator error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("quota") || message.includes("429")) {
      return { success: false as const, error: "AI limit reached. Try again in a minute." };
    }
    return { success: false as const, error: "Failed to estimate rent. Please try again." };
  }
}
