"use client";

import { useMemo } from "react";

export default function TimeGreeting({ firstName }: { firstName: string }) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${firstName}! ☀️`;
    if (hour < 17) return `Good afternoon, ${firstName}! 👋`;
    return `Good evening, ${firstName}! 🌙`;
  }, [firstName]);

  return <h2 className="text-2xl font-bold text-slate-900">{greeting}</h2>;
}
