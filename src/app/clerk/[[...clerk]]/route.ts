import { createClerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(request: NextRequest) {
  return clerkClient.handleApiRequest(request);
}

export async function POST(request: NextRequest) {
  return clerkClient.handleApiRequest(request);
}
