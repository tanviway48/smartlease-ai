export const siteConfig = {
  name: "SmartLease AI",
  tagline: "Understand your lease. Negotiate with confidence.",
  description:
    "AI-powered platform that analyzes rental agreements, flags risky clauses, estimates fair rent, and generates negotiation scripts for tenants and landlords.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export const marketingNavLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export const dashboardNavLinks = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Analyze Lease", href: "/dashboard/analyze", icon: "FileSearch" },
  { label: "Rent Estimator", href: "/dashboard/rent-estimator", icon: "TrendingUp" },
  { label: "Negotiation Coach", href: "/dashboard/negotiate", icon: "MessageSquare" },
  { label: "My Reports", href: "/dashboard/reports", icon: "FolderOpen" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
];
