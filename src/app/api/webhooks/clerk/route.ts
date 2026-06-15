/*
 CLERK SETUP INSTRUCTIONS (do these manually before running the app):

 1. Go to https://dashboard.clerk.com
 2. Click "Create application"
 3. Name it "SmartLease AI"
 4. Enable: Email, Google OAuth
 5. Go to API Keys → copy NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
    Paste them into .env.local

 6. To set up webhooks (needed for database sync):
    - Install ngrok: npm install -g ngrok
    - Run: ngrok http 3000
    - Copy the HTTPS URL (e.g. https://abc123.ngrok.io)
    - In Clerk dashboard → Webhooks → Add Endpoint
    - URL: https://abc123.ngrok.io/api/webhooks/clerk
    - Events to subscribe: user.created, user.deleted
    - Copy the Signing Secret → paste as CLERK_WEBHOOK_SECRET in .env.local

 7. Go to https://console.neon.tech
    - Create a new project named "smartlease-ai"
    - Copy the connection string → paste as DATABASE_URL in .env.local

 8. Run migrations:
    npm run db:generate
    npm run db:migrate

 9. Start dev server:
    npm run dev

 10. Visit http://localhost:3000 — you should see the landing page.
     Click "Get Started Free" → you should see Clerk's sign-up form.
     After signing up → you should land on /dashboard.
*/

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ClerkUserCreatedEvent {
  type: "user.created";
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
}

interface ClerkUserDeletedEvent {
  type: "user.deleted";
  data: {
    id: string;
    deleted: boolean;
  };
}

type ClerkWebhookEvent = ClerkUserCreatedEvent | ClerkUserDeletedEvent;

export async function POST(request: Request): Promise<NextResponse> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await request.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    const email = email_addresses[0]?.email_address ?? "";
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;

    await db.insert(users).values({
      clerkId: id,
      email,
      fullName,
      avatarUrl: image_url,
      plan: "free",
    });
  }

  if (event.type === "user.deleted") {
    const { id } = event.data;
    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.clerkId, id));
  }

  return NextResponse.json({ received: true });
}
