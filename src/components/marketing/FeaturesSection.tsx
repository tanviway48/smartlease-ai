import { FileSearch, TrendingUp, MessageSquare, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    icon: FileSearch,
    title: "Instant Lease Analysis",
    description:
      "Upload any PDF lease. AI reads every clause and flags risks in under 30 seconds.",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    icon: TrendingUp,
    title: "Fair Rent Estimator",
    description:
      "Know if you're overpaying. Compare your rent against real market data for your locality.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: MessageSquare,
    title: "Negotiation Coach",
    description:
      "Get exact scripts to negotiate rent reduction or remove unfair clauses.",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: Bell,
    title: "Renewal Alerts",
    description:
      "Never miss your lease renewal. Get smart reminders and auto-generated talking points.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "#6366F1" }}
          >
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 max-w-2xl mx-auto">
            Everything you need to protect yourself as a tenant
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white border border-slate-200 rounded-xl p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.iconBg} mb-5`}>
                  <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
