import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)" }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Start analyzing your lease today
        </h2>
        <p className="text-lg mb-8" style={{ color: "#C7D2FE" }}>
          Free forever. No credit card required.
        </p>
        <Button
          size="lg"
          className="bg-white font-semibold px-8 text-base hover:bg-slate-50"
          style={{ color: "#4F46E5" }}
          nativeButton={false}
          render={<Link href="/sign-up" />}
        >
          Analyze My Lease for Free →
        </Button>
        <p className="mt-6 text-sm" style={{ color: "#C7D2FE" }}>
          ✓ Free tier &nbsp;&nbsp; ✓ No credit card &nbsp;&nbsp; ✓ Instant results
        </p>
      </div>
    </section>
  );
}
