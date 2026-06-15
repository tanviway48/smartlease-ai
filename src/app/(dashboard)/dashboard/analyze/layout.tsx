import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyze Lease | SmartLease AI",
  description: "Upload your rental agreement for instant AI-powered analysis",
};

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
