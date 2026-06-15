import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign Up — SmartLease AI",
};

export default function SignUpPage() {
  return <SignUp fallbackRedirectUrl="/dashboard" />;
}
