"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";
import Logo from "@/components/shared/Logo";
import { marketingNavLinks } from "@/lib/constants";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled || mobileOpen
            ? "bg-white shadow-sm border-b border-slate-200"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-8">
            {marketingNavLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#6366F1" }}
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16 px-4 flex flex-col md:hidden">
          <ul className="flex flex-col gap-1 mt-4">
            {marketingNavLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-4 py-3 rounded-xl transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="w-full text-center text-base font-semibold text-white py-3.5 rounded-xl transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#6366F1" }}
                onClick={() => setMobileOpen(false)}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="w-full text-center text-base font-semibold text-slate-800 py-3.5 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="w-full text-center text-base font-semibold text-white py-3.5 rounded-xl transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#6366F1" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {isSignedIn && (
            <div className="flex items-center gap-3 mt-4 px-1">
              <UserButton />
              <span className="text-sm text-slate-500">Signed in</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
