import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function DarkVelocitySection() {
  const steps = [
    {
      num: "1",
      title: "Select the tools & duration you need",
      desc: "Choose individual tools or bundles for 1, 3, 7, or 30 days without lock-ins.",
    },
    {
      num: "2",
      title: "Instant activation in PKR or card",
      desc: "Local bank transfer, Easypaisa, JazzCash, or international card payments.",
    },
    {
      num: "3",
      title: "Launch in 1-click via Orbyt Extension",
      desc: "Our automated sandbox injects session cookies directly into your browser.",
    },
    {
      num: "4",
      title: "Deliver high-impact client results",
      desc: "Extract actionable backlink data, keyword insights, and content drafts instantly.",
    },
  ];

  return (
    <section className="bg-[#FAF9F5] text-neutral-900 py-20 sm:py-28 overflow-hidden relative border-b border-neutral-200/80">
      {/* Subtle backdrop light glows */}
      <div
        className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-yellow-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column: Numbered Steps & CTA */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/60 bg-yellow-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-yellow-950">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 animate-pulse" />
              <span>Full Workflow Velocity</span>
            </div>

            <h2 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 leading-[1.12]">
              From first connection to your next breakthrough.
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-neutral-700">
              Experience the friction-free way to research, analyze competitors, and build authority without paying enterprise software penalties.
            </p>

            {/* 4 Numbered Steps with yellow badges */}
            <div className="mt-8 space-y-5">
              {steps.map((s) => (
                <div key={s.num} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-neutral-950 font-black text-sm shadow-xs mt-0.5">
                    {s.num}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-neutral-950">{s.title}</h4>
                    <p className="mt-1 text-xs sm:text-sm text-neutral-600">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-10">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-7 py-3.5 text-sm font-bold text-neutral-950 shadow-sm transition-all duration-200 hover:bg-yellow-300 active:scale-[0.98]"
              >
                <span>Get started now</span>
                <MaterialIcon name="arrow_forward" className="text-base" />
              </Link>
            </div>
          </div>

          {/* Right Column: Crisp White Analytics Card with Yellow Growth Chart */}
          <div className="relative">
            <div className="rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 text-neutral-900 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Live Telemetry</span>
                  <h3 className="mt-1 text-xl font-extrabold text-neutral-950">Active Performance Orbit</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Real-time
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-neutral-50 p-3 text-center border border-neutral-200/70">
                  <div className="text-[11px] font-bold text-neutral-500">Active Passes</div>
                  <div className="mt-1 text-2xl font-black text-neutral-950">988</div>
                </div>
                <div className="rounded-2xl bg-yellow-50 p-3 text-center border border-yellow-300/60">
                  <div className="text-[11px] font-bold text-yellow-800">Daily Audits</div>
                  <div className="mt-1 text-2xl font-black text-neutral-950">1,213</div>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-3 text-center border border-neutral-200/70">
                  <div className="text-[11px] font-bold text-neutral-500">Hours Saved</div>
                  <div className="mt-1 text-2xl font-black text-neutral-950">4,492</div>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-3 text-center border border-neutral-200/70">
                  <div className="text-[11px] font-bold text-neutral-500">Success Rate</div>
                  <div className="mt-1 text-2xl font-black text-emerald-600">99.7%</div>
                </div>
              </div>

              {/* Ascending Yellow Growth Chart Mockup */}
              <div className="mt-6 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-5">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                  <span className="font-bold text-neutral-800">Monthly Research Volume</span>
                  <span className="text-emerald-600 font-bold">+320% ROI vs Direct Billing</span>
                </div>

                {/* SVG Curve Line Chart */}
                <div className="relative h-36 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartYellowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FACC15" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#FACC15" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Area under curve */}
                    <path
                      d="M0,110 Q50,95 100,85 T200,65 T300,35 T400,10 L400,120 L0,120 Z"
                      fill="url(#chartYellowGradient)"
                    />
                    {/* Golden Line */}
                    <path
                      d="M0,110 Q50,95 100,85 T200,65 T300,35 T400,10"
                      fill="none"
                      stroke="#FACC15"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Dots */}
                    <circle cx="100" cy="85" r="4.5" fill="#FFFFFF" stroke="#FACC15" strokeWidth="2.5" />
                    <circle cx="200" cy="65" r="4.5" fill="#FFFFFF" stroke="#FACC15" strokeWidth="2.5" />
                    <circle cx="300" cy="35" r="4.5" fill="#FFFFFF" stroke="#FACC15" strokeWidth="2.5" />
                    <circle cx="400" cy="10" r="5" fill="#FFFFFF" stroke="#FACC15" strokeWidth="3" />
                  </svg>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                  <span>Day 1: Setup</span>
                  <span>Day 3: Audit</span>
                  <span>Day 7: Strategy</span>
                  <span>Day 30: Scale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
