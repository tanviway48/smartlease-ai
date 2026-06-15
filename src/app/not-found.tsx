import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-black" style={{ color: "#E0E7FF" }}>
        404
      </p>
      <h1 className="text-2xl font-bold text-slate-900 mt-4">Page not found</h1>
      <p className="text-slate-500 mt-2 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button
        className="mt-8 text-white"
        style={{ backgroundColor: "#6366F1" }}
        nativeButton={false}
        render={<Link href="/" />}
      >
        Go back home
      </Button>
    </div>
  );
}
