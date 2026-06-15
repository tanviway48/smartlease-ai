import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 24, text: "text-base" },
  md: { icon: 32, text: "text-xl" },
  lg: { icon: 40, text: "text-2xl" },
};

export default function Logo({ size = "md", showText = true, className }: LogoProps) {
  const { icon, text } = sizeMap[size];
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="SmartLease AI logo"
      >
        {/* House shape */}
        <path
          d="M20 4L4 16V36H16V26H24V36H36V16L20 4Z"
          fill="#6366F1"
          fillOpacity="0.15"
          stroke="#6366F1"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Document overlay */}
        <rect x="14" y="18" width="12" height="14" rx="1.5" fill="#6366F1" fillOpacity="0.9" />
        <line x1="17" y1="22" x2="23" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="17" y1="25" x2="23" y2="25" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="17" y1="28" x2="21" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {showText && (
        <span className={cn("font-semibold tracking-tight", text)}>
          SmartLease<span style={{ color: "#6366F1" }}> AI</span>
        </span>
      )}
    </Link>
  );
}
