import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign In — SmartLease AI",
};

export default function SignInPage() {
  return <SignIn fallbackRedirectUrl="/dashboard" />;
}
