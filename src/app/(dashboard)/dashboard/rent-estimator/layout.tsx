import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rent Estimator | SmartLease AI",
  description: "Check fair market rent for any Indian locality",
};

export default function RentEstimatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
