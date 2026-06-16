import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmartLease AI — Understand Your Lease",
  description:
    "AI-powered platform that analyzes rental agreements, flags risky clauses, estimates fair rent, and generates negotiation scripts.",
  openGraph: {
    title: "SmartLease AI — Understand Your Lease",
    description:
      "Upload your rental agreement and get instant AI-powered analysis.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      clerkJSUrl="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@6/dist/clerk.browser.js"
    >
      <html lang="en" className={inter.variable}>
        <body className="min-h-screen antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
