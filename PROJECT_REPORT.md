# SmartLease AI — Project Report

**Submitted by:** TANVI  
**Course:** Computer Engineering  
**Project Type:** Full-Stack Web Application (Capstone / Portfolio Project)  
**GitHub:** https://github.com/tanviway48/smartlease-ai  
**Live Demo:** https://smartlease-ai.vercel.app

---

## 1. Project Overview

**Title:** SmartLease AI  
**Tagline:** Understand your lease. Negotiate with confidence.

### Objective

To build a production-grade, AI-powered web platform that empowers Indian tenants to understand their rental agreements without requiring legal expertise, by leveraging large language models, serverless cloud infrastructure, and modern full-stack architecture.

### Problem Statement

India has over 100 million rental households, yet the average tenant signs their rental agreement without truly understanding its implications. Rental agreements in India are notoriously complex legal documents filled with one-sided clauses, ambiguous language, and obligations that disproportionately favour landlords. The problem is compounded by several factors:

First, most tenants do not have access to legal counsel. Hiring a property lawyer to review a single rental agreement costs between ₹2,000 and ₹10,000 — an unaffordable sum for the majority of middle-class and lower-income renters. Second, rental agreements in India are frequently drafted in regional languages — Marathi, Hindi, Tamil, Telugu, Kannada, Bengali, Gujarati, Malayalam, and Punjabi — making it nearly impossible for tenants who relocate from other states to understand what they are signing. Third, awareness of tenant rights under the Model Tenancy Act, 2021 and state-level Rent Control Acts is extremely low among the general population. Tenants unknowingly accept illegal clauses — such as arbitrary eviction within the notice period, forfeiture of the entire security deposit, or waiver of the right to basic amenities. Fourth, even when tenants suspect a clause is unfair, they lack the vocabulary, legal framing, and confidence to negotiate with landlords who are typically more experienced in such transactions.

**SmartLease AI** proposes to solve all four of these problems with a single, accessible digital platform.

### Proposed Solution

SmartLease AI allows a tenant to upload their rental agreement PDF, regardless of the language it is written in, and receive within seconds:
1. A comprehensive clause-by-clause risk analysis
2. A risk score (0–100) with a plain-language verdict
3. Actionable recommendations in the lease's own language
4. A fair market rent estimate for their locality
5. AI-generated negotiation scripts for real-world scenarios

### Target Users

- Urban and semi-urban tenants in India
- Students and young professionals relocating to new cities
- Non-English-speaking tenants unable to interpret English legal documents
- First-time renters who have never dealt with lease agreements before

---

## 2. Objectives

### Primary Objectives

1. Build a functional, production-deployed AI platform that analyses rental agreements and returns structured JSON results.
2. Implement multilingual support for 10+ Indian languages using a single AI model without translation APIs.
3. Design an intuitive dashboard with clear UI for uploading, viewing, and managing past analyses.
4. Provide a rent estimator that gives realistic INR-denominated ranges for any Indian locality.
5. Generate contextually appropriate negotiation scripts across multiple scenarios (rent reduction, deposit reduction, maintenance responsibility, lease duration flexibility).
6. Ensure the platform is secure, scalable, and deployable to a global CDN with zero cold-start latency.

### Secondary Objectives

1. Demonstrate industry-level code organisation, TypeScript type safety, and server-side rendering best practices.
2. Implement a clean and responsive UI using a component-based design system (shadcn/ui + Tailwind CSS).
3. Document the project thoroughly for academic submission, portfolio presentation, and open-source contribution.

---

## 3. Technology Stack

### Why Next.js 15 (App Router)

Next.js 15 with the App Router was chosen over alternatives like Remix, SvelteKit, or a separate React + Express setup because it collocates the frontend and backend in a single deployable unit. Server Components allow data fetching without any client-side JavaScript overhead. Server Actions eliminate the need for a separate REST API layer for mutations — a critical architectural simplification. Vercel's infrastructure is purpose-built for Next.js, enabling zero-config deployment, edge caching, and image optimisation. The App Router's nested layouts also made implementing the authenticated dashboard shell trivially simple with a single `(dashboard)/layout.tsx`.

### Why Google Gemini over GPT-4

Google Gemini 1.5 Flash was selected over OpenAI's GPT-4 primarily for its **native multimodal capability**: Gemini accepts raw PDF binary data as an inline part, eliminating the need for a separate OCR or PDF-to-text preprocessing step. GPT-4 Vision requires images (not PDFs directly). Additionally, Gemini's generous free tier (15 requests per minute, 1500 per day) made it ideal for a portfolio project, and its response speed for the Flash variant is significantly faster than GPT-4 Turbo. Gemini's multilingual capability for Indian regional scripts (Devanagari, Tamil, Telugu, Kannada, etc.) was also validated during development and found to be excellent.

### Why Neon over Traditional PostgreSQL

Neon is a serverless PostgreSQL platform that provides connection pooling natively via its `@neondatabase/serverless` driver, which uses HTTP rather than persistent TCP connections. This is essential for Vercel's serverless and edge runtime environments, where traditional PostgreSQL drivers that maintain TCP connection pools would exhaust connection limits rapidly. Neon also provides branching (database branches for development/preview), a generous free tier, and sub-millisecond connection latency via HTTP pipelining.

### Why Drizzle ORM over Prisma

Drizzle ORM was chosen over Prisma for two key reasons. First, Drizzle is fully type-safe at the TypeScript level with zero code generation — the schema is plain TypeScript, and query results are automatically typed. Second, Drizzle generates raw SQL queries with no abstraction overhead, making it significantly lighter and faster in serverless environments where cold start time matters. Prisma's query engine is a native binary that adds weight to the serverless bundle. For a Next.js + Neon stack, Drizzle with the `@neondatabase/serverless` driver is the industry-preferred combination.

### Why Clerk over NextAuth

Clerk was chosen over NextAuth (Auth.js) because it provides a complete, hosted authentication solution including pre-built sign-in/sign-up UI components, session management, Google OAuth configuration, webhook events for user lifecycle, and a user management dashboard — all without writing any authentication logic manually. NextAuth requires implementing JWT sessions, callback handlers, and provider configuration from scratch, and does not include production-grade UI. For a project focused on demonstrating AI and full-stack skills rather than auth implementation, Clerk accelerated development without sacrificing security.

### Why Uploadthing over AWS S3

Uploadthing provides a type-safe, serverless file upload solution that integrates natively with Next.js App Router. Unlike AWS S3 which requires IAM roles, bucket policies, presigned URL generation logic, and CORS configuration, Uploadthing handles all of this with a simple file router defined in TypeScript. It validates file types and sizes on both the client and server, provides CDN-backed file URLs immediately after upload, and has a Next.js-specific client library (`@uploadthing/react`) with a drag-and-drop upload component. For a PDF-only upload flow with a 4MB limit, Uploadthing was the appropriate choice over the complexity of a full S3 integration.

---

## 4. System Architecture

### High-Level Architecture

```
Browser (React 19)
    │
    ▼
Next.js 15 App Router (Vercel Edge Network)
    │
    ├── Server Components (read)     ──► Neon PostgreSQL (Drizzle ORM)
    ├── Server Actions (write)        ──► Neon PostgreSQL
    ├── Server Actions (AI)           ──► Google Gemini 1.5 Flash API
    └── API Routes                   ──► Uploadthing CDN / Clerk Webhooks
```

### Primary Data Flow: Lease Analysis

1. **User** opens `/dashboard/analyze` (Server Component fetches user from DB)
2. **User** drags/drops a PDF → Uploadthing client uploads directly to Uploadthing CDN
3. Uploadthing returns a `ufsUrl` (CDN URL) to the client
4. **Client** calls the `analyzeLeaseAction` Server Action with the file URL
5. **Server Action** creates a pending `lease_analyses` row in Neon DB
6. **Server Action** fetches the PDF bytes from the CDN URL and encodes to base64
7. **Server Action** calls Google Gemini 1.5 Flash API with the PDF inline data + prompt
8. **Gemini** returns a structured JSON response (clauses, risk score, verdict, multilingual text)
9. **Server Action** parses, validates, and normalises the JSON response
10. **Server Action** updates the `lease_analyses` row in Neon DB with `status: completed` and the `result` JSONB
11. **Client** receives the typed result and renders `LeaseAnalysisResults` component

### Authentication Flow

1. User visits any route under `(dashboard)`
2. `middleware.ts` (Clerk) checks for valid session token
3. If unauthenticated → redirect to `/sign-in`
4. On first sign-up, Clerk fires a `user.created` webhook to `/api/webhooks/clerk`
5. Webhook handler verifies the Svix signature and inserts the user into the `users` table
6. All subsequent requests use the Clerk `userId` to scope DB queries

### File Upload Flow

1. Client renders `<UploadButton>` from `@uploadthing/react`
2. Client-side file is validated (PDF only, max 4MB) before upload begins
3. Uploadthing server route (`/api/uploadthing`) authorises the upload via Clerk session
4. File is uploaded directly from the browser to Uploadthing's CDN (not through the Next.js server)
5. On completion, `onClientUploadComplete` fires with the `ufsUrl` CDN link

---

## 5. Database Design

### Entity Relationship Description

The database has three tables with the following relationships:
- `users` (1) → (many) `lease_analyses`
- `users` (1) → (many) `rent_estimates`

There is no direct relationship between `lease_analyses` and `rent_estimates` — both belong independently to a user.

### Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT random() | Internal user ID |
| `clerk_id` | varchar(255) | UNIQUE, NOT NULL | Clerk's external user ID |
| `email` | varchar(255) | UNIQUE, NOT NULL | User's email address |
| `full_name` | varchar(255) | nullable | Display name from Clerk |
| `avatar_url` | text | nullable | Profile picture URL from Clerk |
| `plan` | varchar(50) | DEFAULT 'free' | Subscription plan (free/pro) |
| `created_at` | timestamp | DEFAULT now() | Account creation timestamp |
| `updated_at` | timestamp | DEFAULT now() | Last update timestamp |
| `deleted_at` | timestamp | nullable | Soft delete timestamp |

### Table: `lease_analyses`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Analysis ID |
| `user_id` | uuid | FK → users(id) CASCADE | Owner |
| `file_name` | varchar(500) | NOT NULL | Original file name |
| `file_url` | text | NOT NULL | Uploadthing CDN URL |
| `status` | varchar(50) | DEFAULT 'pending' | pending / completed / failed |
| `result` | jsonb | nullable | Full Gemini analysis result |
| `created_at` | timestamp | DEFAULT now() | Upload timestamp |
| `updated_at` | timestamp | DEFAULT now() | Last update |

### Table: `rent_estimates`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Estimate ID |
| `user_id` | uuid | FK → users(id) CASCADE | Owner |
| `locality` | varchar(255) | NOT NULL | Area name (e.g., Andheri West) |
| `city` | varchar(255) | NOT NULL | City name (e.g., Mumbai) |
| `bhk_type` | varchar(50) | NOT NULL | 1BHK / 2BHK / 3BHK etc. |
| `area_sqft` | integer | nullable | Area in square feet |
| `estimated_min` | integer | nullable | Minimum rent in INR |
| `estimated_max` | integer | nullable | Maximum rent in INR |
| `market_rate` | integer | nullable | Median market rate in INR |
| `created_at` | timestamp | DEFAULT now() | Query timestamp |

---

## 6. Features Implementation

### 6.1 AI Lease Analyzer

**How it works technically:**

The lease analyser is built entirely as a Next.js Server Action (`analyzeLeaseAction.ts`). When the user uploads a file, Uploadthing returns a CDN URL. The Server Action receives this URL, fetches the raw PDF bytes, converts them to base64, and passes the base64-encoded PDF as an `inlineData` part directly to the Gemini API — no OCR or text extraction step required.

**Gemini API Usage:**

The model used is `gemini-1.5-flash-latest`. The prompt instructs Gemini to act as an expert tenant rights lawyer specializing in Indian rental laws. It is given a strict JSON output schema with exact field names and value constraints (`risk: "low"|"medium"|"high"`, `overallVerdict: "safe"|"caution"|"risky"`). The prompt explicitly instructs Gemini to keep JSON keys in English while returning all content values in the lease's detected language.

**JSON Response Parsing:**

Gemini occasionally wraps its JSON in markdown code fences (` ```json `). The parser strips these using regex before calling `JSON.parse`. A two-pass extraction finds the first `{` and last `}` to isolate valid JSON even if surrounding text leaks through. A `parseResult` validator function enforces type safety — coercing unknown values to valid union literals and ensuring array fields are actual arrays.

**Multilingual Support:**

The prompt includes explicit language detection instructions. Gemini detects the primary language of the input document and returns `summary`, `explanation`, `suggestion`, `recommendations`, `tenantRights`, and `negotiationPoints` all in that language. JSON structural keys remain English for programmatic access. This approach requires no translation API and no separate language detection step.

---

### 6.2 Rent Estimator

**How Gemini estimates rent:**

The rent estimator uses a separate Server Action (`rentEstimatorAction.ts`) that sends a structured prompt to Gemini with locality, city, BHK type, and optional area. Gemini is trained on a vast corpus of Indian real estate data and returns a realistic INR range based on current market conditions for that micro-market.

**Data returned:**

The response includes `estimatedMin`, `estimatedMax`, `marketRate` (median), `confidence` (low/medium/high), and `explanation` in English. The estimate is saved to the `rent_estimates` table for history.

**INR Formatting:**

All monetary values are formatted using the Indian numbering system (`en-IN` locale) with the `₹` symbol using `Intl.NumberFormat`. This correctly formats values like ₹25,000 and ₹1,50,000 in Indian comma notation.

---

### 6.3 Negotiation Coach

**Scenario-based script generation:**

The negotiation coach (`negotiationAction.ts`) accepts the analysed lease data and a scenario type (one of: `rent_reduction`, `deposit_reduction`, `maintenance_responsibility`, `lease_duration`). It sends the relevant context to Gemini, which generates a realistic dialogue script with suggested opening statements, counterarguments, and fallback positions.

**Multilingual Output:**

Like the analyser, the negotiation output is returned in the lease's detected language so tenants can negotiate in the language the agreement was written in.

**Sample Dialogue Implementation:**

Gemini returns structured dialogue turns with `role: "tenant" | "landlord"` and `text` fields. The frontend renders these as a WhatsApp-style chat bubble UI with distinct visual treatment for each party.

---

### 6.4 Authentication and Security

**Clerk Integration:**

Clerk is configured via `<ClerkProvider>` wrapping the root layout. All protected routes are inside the `(dashboard)` route group, protected by `middleware.ts` which calls Clerk's `clerkMiddleware` with a matcher that protects `/dashboard` and its sub-paths.

**Webhook-based DB Sync:**

When a new user signs up, Clerk fires a `user.created` webhook to `/api/webhooks/clerk`. The route handler verifies the webhook payload using the Svix library and the `CLERK_WEBHOOK_SECRET` environment variable. On successful verification, it upserts the user into the Neon `users` table using Drizzle ORM.

**Route Protection with Middleware:**

`src/middleware.ts` uses `clerkMiddleware` to protect all dashboard routes. Unauthenticated users are automatically redirected to `/sign-in`. All Server Actions also call `auth()` from `@clerk/nextjs/server` to independently verify the session and retrieve the `userId` before performing any DB operations — preventing Server Action abuse even if the middleware layer is bypassed.

---

### 6.5 File Upload Pipeline

**Uploadthing Integration:**

The file router is defined in `src/lib/uploadthing.ts` with a single endpoint `leaseUploader` that accepts PDF files up to 4MB. The router calls `auth()` to verify the user is authenticated before permitting any upload.

**PDF Validation:**

File type validation (`application/pdf`) is enforced by Uploadthing on both client and server. The client-side `<UploadButton>` component also restricts the browser file picker to `.pdf` files only.

**File Size Limits:**

The `maxFileSize` is set to `4MB` — enough to accommodate multi-page rental agreements while keeping Gemini API payload sizes reasonable. Attempts to upload larger files are rejected before they reach the server.

---

## 7. UI/UX Design

### Design System

- **Primary colour:** Indigo (`#6366F1`) — conveys trust and professionalism
- **Background:** Off-white / dark slate for dashboard (system-level dark mode not implemented in v1)
- **Typography:** Inter (Google Fonts, variable font) — excellent readability for legal text
- **Border radius:** `0.5rem` (rounded corners, modern card style)

### Component Library

shadcn/ui was used as the component library, which provides accessible, unstyled-by-default primitives built on Radix UI and styled with Tailwind. Components used include: `Button`, `Card`, `Badge`, `Sheet` (mobile sidebar), `DropdownMenu`, `Separator`, and `Avatar`. All components are copied into the project's `src/components/ui/` directory and are fully customisable.

### Responsive Design

- Mobile sidebar is implemented using a `Sheet` component triggered by a hamburger button in the `DashboardTopbar`
- The desktop sidebar is a fixed `aside` visible at `lg:` breakpoint and above
- Dashboard content columns use CSS Grid and Flexbox for responsive stacking
- The marketing landing page uses responsive typography (`text-4xl md:text-6xl`) and stacked-to-row feature grids

### Accessibility

- All interactive elements have appropriate `aria-label` attributes
- Colour contrast ratios meet WCAG AA standards for the primary text/background combinations
- Focus rings are preserved (not removed) to support keyboard navigation
- The `<html lang="en">` attribute is set on the root layout

---

## 8. Challenges and Solutions

### Challenge 1: Gemini Model Deprecation

**Problem:** During development, the initially specified model `gemini-1.5-flash` was deprecated and replaced. API calls began returning 404 errors mid-development.

**Solution:** Updated the model identifier to `gemini-1.5-flash-latest`, which always resolves to the latest stable Flash variant. Added a comment in `gemini.ts` to document this and added model version to the project's changelog to prevent future breakage.

---

### Challenge 2: Uploadthing File URL Deprecation

**Problem:** Uploadthing deprecated the `file.url` property on upload response objects in favour of `file.ufsUrl`. Code that destructured `url` silently received `undefined`, causing downstream PDF fetch failures.

**Solution:** Updated all upload callback handlers to use `file.ufsUrl` as the canonical file URL. Added a TypeScript type assertion to catch this at compile time. Noted this breaking change in `AGENTS.md` for future developers.

---

### Challenge 3: JSON Parsing from Gemini Responses

**Problem:** Despite the prompt explicitly stating "Return ONLY valid JSON", Gemini occasionally wrapped responses in markdown code fences (` ```json ... ``` `) or included preamble text like "Here is the analysis:". `JSON.parse` would throw on these malformed responses.

**Solution:** Implemented a two-step cleaning pipeline: first strip known markdown patterns with regex (`/```json\n?/g`, `/```\n?/g`), then locate the first `{` and last `}` in the remaining string and extract only that substring before parsing. This is resilient to both markdown fences and surrounding text.

---

### Challenge 4: Multilingual JSON Structure

**Problem:** When instructing Gemini to respond in the lease's language, early prompt versions resulted in Gemini also translating the JSON keys themselves (e.g., `"रिस्कस्कोर"` instead of `"riskScore"`), breaking `JSON.parse` and all downstream field access.

**Solution:** Explicitly added `"The JSON keys must always remain in English regardless of language"` to the prompt with examples. Also added `"overallVerdict" value must always be one of: safe, caution, risky (in English)` to prevent localised enum values from breaking the discriminated union type.

---

### Challenge 5: Server Action Serialization

**Problem:** TypeScript's Server Action boundary requires all return types to be serialisable. The `overallVerdict` field was initially typed as `string`, which allowed `"unknown"` to be returned and broke the conditional rendering logic in `LeaseAnalysisResults.tsx`.

**Solution:** Changed the return type to use `"safe" | "caution" | "risky"` as a discriminated union with `as const`. Added a `coerceVerdict` utility that validates the raw Gemini string against the allowed values and falls back to a score-based default if the value is invalid.

---

## 9. Testing

### Manual Testing Approach

The project was tested manually across the following dimensions:

- **Happy path:** Upload valid English PDF → analysis completes → results display correctly
- **Multilingual path:** Upload Hindi, Marathi, and Telugu lease PDFs → analysis returned in respective language
- **Error states:** Upload non-PDF file → validation error shown; Gemini API key invalid → error toast displayed
- **Auth flows:** Sign up → Clerk webhook fires → user created in DB; Sign out → dashboard redirects to sign-in

### Test Cases Covered

| Test Case | Expected | Result |
|-----------|----------|--------|
| Upload PDF < 4MB | Analysis completes | ✅ Pass |
| Upload PDF > 4MB | Upload rejected with error | ✅ Pass |
| Upload non-PDF file | Rejected by Uploadthing | ✅ Pass |
| Hindi lease analysis | Response in Hindi | ✅ Pass |
| Invalid GEMINI_API_KEY | Error state rendered | ✅ Pass |
| Unauthenticated dashboard access | Redirect to /sign-in | ✅ Pass |
| New user signup webhook | User inserted in DB | ✅ Pass |
| Rent estimate for Mumbai locality | INR range returned | ✅ Pass |

### Edge Cases Handled

- Empty PDF (0 bytes) → caught in `analyzeLease` function, throws `"Fetched PDF is empty."`
- Gemini returns no JSON brackets → caught by `jsonStart === -1` check, throws descriptive error
- `overallVerdict` not in allowed values → coerced via `coerceVerdict` using `riskScore` fallback
- `risk` field not in allowed values → coerced to `"medium"` via `coerceRisk`
- Webhook replay attacks → Svix timestamp validation rejects events older than 5 minutes

---

## 10. Deployment

### Vercel Deployment

The application is deployed on Vercel using the Next.js preset with zero additional configuration. All environment variables are configured in the Vercel project dashboard under Environment Variables. The deployment triggers automatically on every push to the `main` branch via GitHub integration.

### Environment Variable Management

Environment variables are stored exclusively in Vercel's encrypted environment variable store — never committed to source control. The `.env.example` file provides a template with all required keys (with empty values) for local development setup.

### Production Considerations

- `NEXT_PUBLIC_APP_URL` is set to the Vercel deployment URL in production
- Clerk's allowed origins list includes the Vercel domain
- Clerk's webhook endpoint is updated from the local ngrok URL to the production Vercel URL
- Neon's serverless driver uses HTTP/WebSocket connections compatible with Vercel's edge runtime
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy) are added via `next.config.ts`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete step-by-step deployment guide.

---

## 11. Future Enhancements

| Enhancement | Description |
|-------------|-------------|
| **Stripe Integration** | Pro plan with unlimited analyses (free tier: 3/month) |
| **Mobile App** | React Native app with camera-based lease scanning using OCR |
| **WhatsApp Bot** | Send lease PDF via WhatsApp, receive analysis as a message |
| **Lawyer Consultation** | In-app booking system to connect tenants with verified property lawyers |
| **Lease Template Generator** | Generate balanced, tenant-friendly lease templates |
| **OCR for Scanned PDFs** | Handle image-based/scanned PDFs using Google Cloud Vision API |
| **Comparison Mode** | Side-by-side comparison of two lease agreements |
| **Landlord Portal** | Allow landlords to check if their agreement is compliant and fair |

---

## 12. Conclusion

SmartLease AI is a full-stack, AI-powered SaaS application that demonstrates the practical application of modern web technologies to solve a real, pressing problem for millions of tenants in India. The project successfully integrates Google Gemini's multimodal capabilities with a Next.js 15 Server Component architecture, Neon serverless PostgreSQL, Clerk authentication, and Uploadthing file management into a cohesive, production-deployed product.

Building SmartLease AI provided deep practical experience in several areas that are not typically covered in academic coursework: designing AI prompts for structured JSON output, handling the unpredictability of LLM responses with robust parsing and validation, architecting serverless-first applications that avoid cold start and connection pool issues, and deploying production web applications to global CDN infrastructure.

The multilingual feature — where a single AI model reads a lease in any Indian language and returns the analysis in that same language — is particularly noteworthy because it solves a genuine accessibility gap without requiring any translation APIs, language detection libraries, or additional infrastructure. This is the kind of practical, thoughtful product decision that the project aims to demonstrate.

The codebase is structured, documented, and type-safe enough to serve as a reference for future full-stack projects and as a portfolio piece that demonstrates industry-level engineering competence.

---

## 13. References

1. Next.js 15 Documentation — https://nextjs.org/docs
2. Google Gemini API Documentation — https://ai.google.dev/docs
3. Clerk Authentication Documentation — https://clerk.com/docs
4. Drizzle ORM Documentation — https://orm.drizzle.team/docs
5. Neon Serverless PostgreSQL — https://neon.tech/docs
6. Uploadthing Documentation — https://docs.uploadthing.com
7. shadcn/ui Component Library — https://ui.shadcn.com
8. The Model Tenancy Act, 2021 — Ministry of Housing and Urban Affairs, Government of India
9. The Transfer of Property Act, 1882 — Government of India (Chapter V: Leases of Immovable Property)
10. Tailwind CSS v4 Documentation — https://tailwindcss.com/docs
