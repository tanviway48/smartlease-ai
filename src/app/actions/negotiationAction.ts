"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface CounterArgument {
  landlordMightSay: string;
  youShouldRespond: string;
}

export interface DialogueLine {
  speaker: "tenant" | "landlord";
  text: string;
}

export interface NegotiationScript {
  title: string;
  scenario: string;
  language: string;
  openingStatement: string;
  keyPoints: string[];
  counterArguments: CounterArgument[];
  closingStatement: string;
  dos: string[];
  donts: string[];
  sampleDialogue: DialogueLine[];
}

function parseSpeaker(v: unknown): "tenant" | "landlord" {
  if (v === "tenant" || v === "landlord") return v;
  return "tenant";
}

function parseScript(raw: unknown): NegotiationScript {
  if (typeof raw !== "object" || raw === null) throw new Error("Invalid script shape");
  const d = raw as Record<string, unknown>;

  const toStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

  const counterArguments: CounterArgument[] = (Array.isArray(d.counterArguments) ? d.counterArguments : [])
    .filter((c): c is Record<string, unknown> => typeof c === "object" && c !== null)
    .map((c) => ({
      landlordMightSay: typeof c.landlordMightSay === "string" ? c.landlordMightSay : "",
      youShouldRespond: typeof c.youShouldRespond === "string" ? c.youShouldRespond : "",
    }));

  const sampleDialogue: DialogueLine[] = (Array.isArray(d.sampleDialogue) ? d.sampleDialogue : [])
    .filter((l): l is Record<string, unknown> => typeof l === "object" && l !== null)
    .map((l) => ({
      speaker: parseSpeaker(l.speaker),
      text: typeof l.text === "string" ? l.text : "",
    }));

  return {
    title: typeof d.title === "string" ? d.title : "Negotiation Script",
    scenario: typeof d.scenario === "string" ? d.scenario : "",
    language: typeof d.language === "string" ? d.language : "English",
    openingStatement: typeof d.openingStatement === "string" ? d.openingStatement : "",
    keyPoints: toStringArray(d.keyPoints),
    counterArguments,
    closingStatement: typeof d.closingStatement === "string" ? d.closingStatement : "",
    dos: toStringArray(d.dos),
    donts: toStringArray(d.donts),
    sampleDialogue,
  };
}

export async function generateNegotiationScript(
  scenario: string,
  currentRent?: number,
  targetRent?: number,
  city?: string,
  language?: string
): Promise<{ success: true; script: NegotiationScript } | { success: false; error: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false as const, error: "AI service not configured." };

  const currentRentLine = currentRent ? `Current Rent: ₹${currentRent}/month` : "";
  const targetRentLine = targetRent ? `Target Rent: ₹${targetRent}/month` : "";
  const cityLine = city ? `City: ${city}` : "";
  const langLine = language
    ? `Language preference: ${language} (respond in this language)`
    : "Language preference: English";

  const prompt = `You are an expert negotiation coach specializing in Indian rental market negotiations.
You help tenants negotiate better deals with landlords.

Generate a detailed negotiation script for this scenario:
Scenario: ${scenario}
${currentRentLine}
${targetRentLine}
${cityLine}
${langLine}

Return ONLY this JSON:
{
  "title": "<script title>",
  "scenario": "<scenario description>",
  "language": "<language used>",
  "openingStatement": "<how to start the conversation>",
  "keyPoints": ["<key negotiation point>"],
  "counterArguments": [
    {
      "landlordMightSay": "<what landlord might say>",
      "youShouldRespond": "<how you should respond>"
    }
  ],
  "closingStatement": "<how to close the negotiation>",
  "dos": ["<do this>"],
  "donts": ["<don't do this>"],
  "sampleDialogue": [
    {
      "speaker": "<tenant|landlord>",
      "text": "<dialogue line>"
    }
  ]
}

Include:
- 4-6 key negotiation points
- 3-4 counter arguments
- 5-6 dos and donts each
- 6-8 lines of sample dialogue
Return ONLY valid JSON.`;

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
    const script = parseScript(parsed);

    return { success: true as const, script };
  } catch (err) {
    console.error("Negotiation script error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("quota") || message.includes("429")) {
      return { success: false as const, error: "AI limit reached. Try again in a minute." };
    }
    return { success: false as const, error: "Failed to generate script. Please try again." };
  }
}
