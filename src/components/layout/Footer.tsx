import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { siteConfig } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo size="sm" className="[&_span]:text-white [&_span_span]:text-indigo-400" />
          <p className="text-sm text-slate-400">{siteConfig.tagline}</p>
        </div>

        <nav className="flex flex-wrap gap-6 justify-center md:justify-end text-sm">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-700 text-center text-sm text-slate-500">
        © 2025 SmartLease AI. Built for tenants.
      </div>
    </footer>
  );
}
