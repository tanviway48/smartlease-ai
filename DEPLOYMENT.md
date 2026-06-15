# Deploying SmartLease AI to Vercel

This guide takes you from a fresh GitHub repo to a fully running production deployment in under 30 minutes.

---

## Prerequisites

Make sure you have accounts on the following services before starting:

| Service | Purpose | Sign up |
|---------|---------|---------|
| GitHub | Source code hosting | github.com |
| Vercel | Hosting and deployment | vercel.com |
| Clerk | Authentication | dashboard.clerk.com |
| Neon | Serverless PostgreSQL | console.neon.tech |
| Uploadthing | File uploads | uploadthing.com |
| Google AI Studio | Gemini API key | aistudio.google.com |

---

## Step 1 — Push Code to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/smartlease-ai.git
git push -u origin main
```

---

## Step 2 — Set Up Clerk (Authentication)

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and create a new application
2. Name it `SmartLease AI`
3. Enable **Google** as a social sign-in provider (optional but recommended)
4. Go to **API Keys** and copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
5. Go to **Webhooks** → **Add Endpoint**
   - We'll fill the URL in Step 6 — skip for now and come back
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret** → this is your `CLERK_WEBHOOK_SECRET`

---

## Step 3 — Set Up Neon (Database)

1. Go to [console.neon.tech](https://console.neon.tech) and create a new project
2. Name it `smartlease-ai`
3. Choose your region (pick one closest to your Vercel region — `us-east-1` is a safe default)
4. After creation, go to **Connection Details**
5. Copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
6. This is your `DATABASE_URL`. Make sure it includes `?sslmode=require`

---

## Step 4 — Set Up Uploadthing (File Storage)

1. Go to [uploadthing.com](https://uploadthing.com) and create a new app
2. Name it `smartlease-ai`
3. Go to **API Keys** and copy the **Token** (single combined token)
4. This is your `UPLOADTHING_TOKEN`
5. Under **Settings** → **Allowed Origins**, add `http://localhost:3000` for now (you'll add the Vercel URL in Step 9)

---

## Step 5 — Get Google Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → **Create API key in new project**
3. Copy the key — this is your `GEMINI_API_KEY`

> The free tier allows 15 requests/minute and 1,500 requests/day — more than enough for a portfolio or production project at small scale.

---

## Step 6 — Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Find and import the `smartlease-ai` repository
4. Framework preset: **Next.js** (auto-detected)
5. Root directory: `./` (default — do not change)
6. **DO NOT click Deploy yet** — add environment variables first (next step)

---

## Step 7 — Add Environment Variables on Vercel

In your Vercel project → **Settings** → **Environment Variables**, add every variable below.

Set the environment to **Production**, **Preview**, and **Development** for all of them.

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key |
| `CLERK_SECRET_KEY` | Your Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Your Clerk webhook signing secret |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/dashboard` |
| `CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/dashboard` |
| `DATABASE_URL` | Your Neon connection string (include `?sslmode=require`) |
| `UPLOADTHING_TOKEN` | Your Uploadthing token |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` (update after first deploy) |

---

## Step 8 — Deploy

1. Click **Deploy**
2. Wait 2–3 minutes for the build to complete
3. Vercel will give you a URL like `https://smartlease-ai-xxx.vercel.app`
4. Go back to the **Environment Variables** in Vercel settings and update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL, then **redeploy** (Deployments → Redeploy)

---

## Step 9 — Update Clerk for Production

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → your SmartLease AI app
2. Go to **Domains** → **Add Domain** → add your Vercel URL (e.g., `smartlease-ai.vercel.app`)
3. Go to **Webhooks** → find the endpoint you created in Step 2
4. Update the URL to:
   ```
   https://your-app.vercel.app/api/webhooks/clerk
   ```
5. Go to **Redirect URLs** and add:
   - `https://your-app.vercel.app/sign-in`
   - `https://your-app.vercel.app/sign-up`
   - `https://your-app.vercel.app/dashboard`

---

## Step 10 — Update Uploadthing for Production

1. Go to [uploadthing.com](https://uploadthing.com) → your app → **Settings**
2. Under **Allowed Origins**, add your Vercel domain:
   ```
   https://your-app.vercel.app
   ```

---

## Step 11 — Run Database Migrations on Production

Your schema is already pushed from local development (`npm run db:push`), but if it's a fresh Neon database:

**Option A (Recommended) — Run locally with production DATABASE_URL:**

```bash
# Temporarily set your production DATABASE_URL in .env.local
# Then run:
npm run db:push
# Revert .env.local back to your local Neon dev branch URL
```

**Option B — Use Neon's SQL editor:**

Open the Neon console → your project → **SQL Editor** and paste the contents of `drizzle/0000_cheerful_the_initiative.sql`.

---

## Step 12 — Verify Deployment

Go through this checklist on your production URL:

- [ ] Landing page loads at `https://your-app.vercel.app`
- [ ] `/sign-up` shows Clerk sign-up form
- [ ] Google OAuth works (if enabled)
- [ ] After sign-up, user is redirected to `/dashboard`
- [ ] Dashboard displays the correct user name/avatar
- [ ] Upload a PDF on `/dashboard/analyze` — file uploads and analysis completes
- [ ] Rent estimator on `/dashboard/rent-estimator` returns results
- [ ] Negotiation coach on `/dashboard/negotiate` generates scripts
- [ ] Past analyses appear on `/dashboard/reports`

---

## Common Issues and Fixes

### Clerk redirect loop (keeps bouncing between /sign-in and /dashboard)

**Fix:** Check that `NEXT_PUBLIC_APP_URL` is set to your exact Vercel URL (no trailing slash) and that the Clerk Redirect URLs include `/dashboard`.

---

### Database connection error: `connection refused` or `SSL required`

**Fix:** Ensure `DATABASE_URL` ends with `?sslmode=require`. Neon requires SSL on all connections.

```
postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

### Upload fails silently or returns 403

**Fix:** 
1. Check that `UPLOADTHING_TOKEN` is correct (not the separate `UPLOADTHING_SECRET` + `UPLOADTHING_APP_ID` format — v7 uses a single token)
2. Verify your Vercel domain is in the Uploadthing allowed origins list

---

### Gemini returns error or analysis never completes

**Fix:** 
1. Verify `GEMINI_API_KEY` is valid by testing at [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Check Vercel function logs (Vercel Dashboard → Deployments → Functions) for the exact error message
3. Ensure the uploaded PDF is not password-protected or corrupted

---

### Webhook not syncing users to database

**Fix:** 
1. Confirm `CLERK_WEBHOOK_SECRET` matches the signing secret in your Clerk webhook dashboard
2. Confirm the webhook URL is exactly `https://your-app.vercel.app/api/webhooks/clerk`
3. Check Clerk → Webhooks → your endpoint → **Logs** for delivery status and response codes

---

## Environment Variable Quick Reference

Copy this checklist when setting up a new deployment:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
DATABASE_URL=postgresql://...?sslmode=require
UPLOADTHING_TOKEN=sk_live_...
GEMINI_API_KEY=AIza...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```
