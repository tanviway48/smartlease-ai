"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, leaseAnalyses } from "@/db/schema";
import { analyzeLease, type LeaseAnalysisResult } from "@/lib/gemini";

export type ActionResult =
  | { success: true; analysisId: string; result: LeaseAnalysisResult }
  | { success: false; error: string };

export async function analyzeLeaseAction(
  fileUrl: string,
  fileName: string
): Promise<ActionResult> {
  // 1. Auth check
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false as const, error: "Not authenticated." };

  // 2. Get or auto-create DB user (handles case where webhook hasn't fired)
  let userRows = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);

  if (userRows.length === 0) {
    const clerkUser = await currentUser();
    if (!clerkUser) return { success: false as const, error: "Not authenticated." };

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

    await db.insert(users).values({
      clerkId,
      email,
      fullName,
      avatarUrl: clerkUser.imageUrl ?? null,
      plan: "free",
    });

    userRows = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  }

  const dbUser = userRows[0];

  // 3. Validate inputs
  if (!fileUrl || typeof fileUrl !== "string") {
    return { success: false as const, error: "Invalid file URL." };
  }

  // 4. Insert processing row and get back the id
  const [inserted] = await db
    .insert(leaseAnalyses)
    .values({
      userId: dbUser.id,
      fileName,
      fileUrl,
      status: "processing",
    })
    .returning();

  const analysisId = inserted.id;

  // 5. Run AI analysis
  try {
    const analysisResult = await analyzeLease(fileUrl);

    // Ensure plain serializable object — round-trip through JSON to strip any class instances
    const plainResult: LeaseAnalysisResult = JSON.parse(JSON.stringify(analysisResult));

    // 6. Update row with result
    await db
      .update(leaseAnalyses)
      .set({
        status: "completed",
        result: plainResult as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(leaseAnalyses.id, analysisId));

    console.log("Action returning:", JSON.stringify({ success: true, analysisId }));

    return { success: true as const, analysisId, result: plainResult };
  } catch (err) {
    console.error("Full error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";

    await db
      .update(leaseAnalyses)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(leaseAnalyses.id, analysisId));

    if (message.includes("quota") || message.includes("429")) {
      return { success: false as const, error: "AI analysis limit reached. Try again in a minute." };
    }
    return { success: false as const, error: "AI analysis failed. Please try again." };
  }
}
