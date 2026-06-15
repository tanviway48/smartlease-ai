const steps = [
  {
    number: "01",
    title: "Upload Your Lease",
    description: "Drop your PDF rental agreement. We support all formats.",
  },
  {
    number: "02",
    title: "AI Analyzes It",
    description:
      "Our AI reads every clause, compares with tenant law, and flags risks.",
  },
  {
    number: "03",
    title: "Act With Confidence",
    description:
      "Get a full report, negotiation scripts, and fair rent estimate.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "#6366F1" }}
          >
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            From lease to clarity in 3 steps
          </h2>
        </div>

        <div className="relative flex flex-col md:flex-row gap-10 md:gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex-1 flex flex-col items-center text-center px-6">
              {/* Dashed connector line (desktop only, between steps) */}
              {index < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-8 left-[60%] right-0 h-px"
                  style={{
                    borderTop: "2px dashed #C7D2FE",
                    zIndex: 0,
                  }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-5">
                <span
                  className="text-6xl font-black leading-none"
                  style={{ color: "#E0E7FF" }}
                >
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg -mt-4"
                  style={{ backgroundColor: "#6366F1" }}
                >
                  {parseInt(step.number)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 max-w-xs">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
