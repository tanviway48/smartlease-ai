import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ClauseAnalysis {
  title: string;
  originalText: string;
  risk: "low" | "medium" | "high";
  explanation: string;
  suggestion: string;
}

export interface LeaseAnalysisResult {
  riskScore: number;
  summary: string;
  clauses: ClauseAnalysis[];
  recommendations: string[];
  tenantRights: string[];
  negotiationPoints: string[];
  overallVerdict: "safe" | "caution" | "risky";
  detectedLanguage?: string;
}

const PROMPT = `You are an expert tenant rights lawyer specializing in Indian rental laws.
You are fluent in all Indian languages and English.

IMPORTANT LANGUAGE RULE:
- Detect the primary language of the lease document
- Return the "summary", "explanation", "suggestion", "recommendations", 
  "tenantRights", and "negotiationPoints" fields in THE SAME LANGUAGE 
  as the lease document
- If the lease is in Hindi, respond in Hindi
- If the lease is in Marathi, respond in Marathi  
- If the lease is in Tamil, respond in Tamil
- If the lease is in Telugu, respond in Telugu
- If the lease is in Bengali, respond in Bengali
- If the lease is in Gujarati, respond in Gujarati
- If the lease is in Kannada, respond in Kannada
- If the lease is in Malayalam, respond in Malayalam
- If the lease is in Punjabi, respond in Punjabi
- If the lease is in English, respond in English
- The JSON keys must always remain in English regardless of language
- "overallVerdict" value must always be one of: safe, caution, risky (in English)
- "risk" value must always be one of: low, medium, high (in English)

Analyze the rental lease agreement for:
1. Tenant-unfriendly terms
2. Illegal clauses under Indian Rent Control Act
3. Missing important protections for the tenant
4. Unreasonable financial obligations
5. Maintenance and repair responsibilities
6. Early termination penalties

Return ONLY this exact JSON structure with no extra text outside the JSON:
{
  "riskScore": <number 0-100>,
  "summary": "<2-3 sentence plain language summary in detected language>",
  "overallVerdict": "<safe|caution|risky>",
  "detectedLanguage": "<language name in English, e.g. Hindi, Marathi, English>",
  "clauses": [
    {
      "title": "<clause name in detected language>",
      "originalText": "<exact text from lease, max 200 chars>",
      "risk": "<low|medium|high>",
      "explanation": "<plain language explanation in detected language>",
      "suggestion": "<specific action in detected language>"
    }
  ],
  "recommendations": ["<actionable recommendation in detected language>"],
  "tenantRights": ["<relevant Indian tenant right in detected language>"],
  "negotiationPoints": ["<specific negotiation point in detected language>"]
}

Risk score: 0-30 = safe, 31-60 = caution, 61-100 = risky.
Identify minimum 3 and maximum 10 clauses.
Return ONLY valid JSON. No markdown. No backticks. No extra text.`;

function coerceVerdict(v: unknown, score: number): "safe" | "caution" | "risky" {
  if (v === "safe" || v === "caution" || v === "risky") return v;
  if (score <= 30) return "safe";
  if (score <= 60) return "caution";
  return "risky";
}

function coerceRisk(r: unknown): "low" | "medium" | "high" {
  if (r === "low" || r === "medium" || r === "high") return r;
  return "medium";
}

function parseResult(raw: unknown): LeaseAnalysisResult {
  if (typeof raw !== "object" || raw === null) throw new Error("Invalid response shape");
  const d = raw as Record<string, unknown>;

  const riskScore = typeof d.riskScore === "number" ? Math.min(100, Math.max(0, d.riskScore)) : 50;
  const summary = typeof d.summary === "string" ? d.summary : "Analysis completed.";
  const overallVerdict = coerceVerdict(d.overallVerdict, riskScore);
  const detectedLanguage = typeof d.detectedLanguage === "string" ? d.detectedLanguage : "English";

  const clauses: ClauseAnalysis[] = (Array.isArray(d.clauses) ? d.clauses : [])
    .filter((c): c is Record<string, unknown> => typeof c === "object" && c !== null)
    .slice(0, 10)
    .map((c) => ({
      title: typeof c.title === "string" ? c.title : "Unnamed Clause",
      originalText: typeof c.originalText === "string" ? c.originalText : "",
      risk: coerceRisk(c.risk),
      explanation: typeof c.explanation === "string" ? c.explanation : "",
      suggestion: typeof c.suggestion === "string" ? c.suggestion : "",
    }));

  const toStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

  return {
    riskScore,
    summary,
    overallVerdict,
    detectedLanguage,
    clauses,
    recommendations: toStringArray(d.recommendations),
    tenantRights: toStringArray(d.tenantRights),
    negotiationPoints: toStringArray(d.negotiationPoints),
  };
}

export async function analyzeLease(fileUrl: string): Promise<LeaseAnalysisResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

    const fetchResponse = await fetch(fileUrl);
    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${fetchResponse.status} ${fetchResponse.statusText}`);
    }

    const arrayBuffer = await fetchResponse.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      throw new Error("Fetched PDF is empty.");
    }
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const geminiResult = await model.generateContent([
      { inlineData: { mimeType: "application/pdf", data: base64 } },
      PROMPT,
    ]);

    const text = geminiResult.response.text();

    if (!text || text.trim() === "") {
      throw new Error("Gemini returned empty response");
    }
    console.log("Gemini raw response:", text.substring(0, 500));

    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error(`No valid JSON found in response. Got: ${cleaned.substring(0, 200)}`);
    }

    const jsonStr = cleaned.substring(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonStr);

    return parseResult(parsed);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
}
