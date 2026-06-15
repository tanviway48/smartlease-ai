"use client";

import { useState, useEffect } from "react";

const BANNER_KEY = "smartlease_multilingual_banner_dismissed";

export default function WhatsNewBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(BANNER_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl p-4 mb-6 border border-indigo-200" style={{ backgroundColor: "#EEF2FF" }}>
      <p className="text-sm text-indigo-800 leading-relaxed">
        🎉{" "}
        <span className="font-semibold">Multilingual support is here!</span> Upload leases in Hindi,
        Marathi, Tamil and more — SmartLease AI now responds in your lease&apos;s language.
      </p>
      <button
        onClick={dismiss}
        className="text-indigo-400 hover:text-indigo-700 font-bold text-lg leading-none shrink-0 cursor-pointer"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
