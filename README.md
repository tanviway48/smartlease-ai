# SmartLease AI 🏠

> Understand your lease. Negotiate with confidence.

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8B5CF6?style=for-the-badge&logo=google&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🌟 Overview

**SmartLease AI** is a production-grade, AI-powered SaaS platform that helps tenants in India analyze rental agreements, detect unfair clauses, estimate fair market rent, and generate negotiation scripts — all powered by **Google Gemini 1.5** and built with modern full-stack technologies.

Built as a portfolio project demonstrating industry-level engineering practices including **Server Components**, **Server Actions**, **AI integration**, **multilingual support**, and **cloud-native architecture**.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **AI Lease Analysis** | Upload your PDF rental agreement and get instant clause-by-clause analysis |
| 📊 **Risk Scoring** | 0–100 risk score with color-coded verdict: Safe, Caution, or Risky |
| 🌐 **Multilingual Support** | Analyses returned in the lease's own language — Hindi, Marathi, Tamil, Telugu, and 6+ more |
| 💰 **Rent Estimator** | Get AI-estimated fair rent range for any locality in India |
| 🤝 **Negotiation Coach** | AI-generated negotiation scripts for 4 real-world scenarios |
| 📋 **Report History** | All past analyses saved and accessible from the dashboard |
| 🔐 **Secure Auth** | Clerk authentication with Google OAuth and webhook-synced user DB |
| 📱 **Fully Responsive** | Pixel-perfect on mobile, tablet, and desktop |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| AI | Google Gemini 1.5 Flash |
| Auth | Clerk |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM |
| File Storage | Uploadthing |
| Deployment | Vercel |

---

## 🏗️ Architecture

- **Next.js App Router** with Server Components for zero-JS data fetching
- **Server Actions** for all mutations — no separate REST API layer needed
- **Neon serverless PostgreSQL** for zero-cold-start DB connections in edge environments
- **Google Gemini 1.5 Flash** for PDF analysis, rent estimation, and script generation
- **Clerk webhooks** for DB sync on every user signup/update event
- **Uploadthing** for type-safe, serverless file uploads with PDF validation

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/                  # Clerk sign-in / sign-up pages
│   ├── (dashboard)/             # Protected dashboard routes (layout + pages)
│   │   └── dashboard/
│   │       ├── analyze/         # Lease upload & AI analysis
│   │       ├── rent-estimator/  # Fair rent lookup
│   │       ├── negotiate/       # Negotiation script generator
│   │       ├── reports/         # Saved analysis history
│   │       └── settings/        # Account settings
│   ├── (marketing)/             # Public landing page
│   ├── actions/                 # Server Actions (analyze, rent, negotiate)
│   └── api/                     # Route handlers (uploadthing, clerk webhook)
├── components/
│   ├── layout/                  # Navbar, Sidebar, Topbar, Footer
│   ├── lease/                   # LeaseUploader, LeaseAnalysisResults
│   ├── marketing/               # HeroSection, FeaturesSection, CTASection
│   └── ui/                      # shadcn/ui primitives
├── db/
│   ├── index.ts                 # Neon + Drizzle client setup
│   └── schema.ts                # users, leaseAnalyses, rentEstimates tables
└── lib/
    ├── gemini.ts                # Gemini AI client + prompt engineering
    ├── uploadthing.ts           # File router config
    └── utils.ts                 # cn(), formatters
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Accounts on: [Clerk](https://dashboard.clerk.com), [Neon](https://console.neon.tech), [Uploadthing](https://uploadthing.com), [Google AI Studio](https://aistudio.google.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/tanviway48/smartlease-ai.git
cd smartlease-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in all values — see table below

# 4. Push database schema
npm run db:push

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

### Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk secret key | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `CLERK_WEBHOOK_SECRET` | Webhook signing secret | Clerk Dashboard → Webhooks |
| `DATABASE_URL` | Neon PostgreSQL connection string | [console.neon.tech](https://console.neon.tech) |
| `UPLOADTHING_TOKEN` | Uploadthing API token | [uploadthing.com](https://uploadthing.com) |
| `GEMINI_API_KEY` | Google Gemini API key | [aistudio.google.com](https://aistudio.google.com) |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | `http://localhost:3000` in dev |

> See [DEPLOYMENT.md](./DEPLOYMENT.md) for full production setup guide.

---

## 📸 Screenshots

| Landing Page | Dashboard | Lease Analysis |
|---|---|---|
| ![Landing](public/Screenshot%202026-06-13%20111840.png) | ![Dashboard](public/Screenshot%202026-06-13%20112124.png) | _Analyze your lease_ |

---

## 🗄️ Database Schema

**`users`**
```
id (uuid PK) | clerkId (varchar unique) | email | fullName | avatarUrl | plan | createdAt
```

**`lease_analyses`**
```
id (uuid PK) | userId (FK → users) | fileName | fileUrl | status | result (jsonb) | createdAt
```

**`rent_estimates`**
```
id (uuid PK) | userId (FK → users) | locality | city | bhkType | areaSqft | estimatedMin | estimatedMax | marketRate | createdAt
```

---

## 🔮 Roadmap

- [ ] Phase 5: Stripe payment integration (Pro plan)
- [ ] Phase 6: Mobile app (React Native)
- [ ] Phase 7: Lawyer consultation booking
- [ ] Phase 8: Lease template generator
- [ ] Phase 9: WhatsApp bot integration

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Built by **TANVI** — Computer Engineering Graduate, Mumbai

- GitHub: [@tanviway48](https://github.com/tanviway48)
- LinkedIn: [Add your LinkedIn]

---

## 🙏 Acknowledgements

- [Google Gemini](https://ai.google.dev) for the AI backbone
- [Vercel](https://vercel.com) for seamless deployment
- [Clerk](https://clerk.com) for production-grade authentication
- [Neon](https://neon.tech) for serverless PostgreSQL
- [shadcn/ui](https://ui.shadcn.com) for beautiful, accessible components
- The open source community ❤️
