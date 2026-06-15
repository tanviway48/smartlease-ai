import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Negotiation Coach | SmartLease AI",
  description: "Get AI-generated negotiation scripts for your lease",
};

export default function NegotiateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
