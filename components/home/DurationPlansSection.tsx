"use client";

import { useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type Duration = "1" | "3" | "7" | "30";

export function DurationPlansSection() {
  const [selectedDuration, setSelectedDuration] = useState<Duration>("7");

  const durationDetails: Record<Duration, { label: string; starterPrice: string; proPrice: string; multiplier: string }> = {
    "1": { label: "1-Day Sprint", starterPrice: "Rs. 399", proPrice: "Rs. 1,299", multiplier: "Single day pass" },
    "3": { label: "3-Day Sprint", starterPrice: "Rs. 799", proPrice: "Rs. 2,499", multiplier: "3 full days" },
    "7": { label: "7-Day Sprint", starterPrice: "Rs. 1,499", proPrice: "Rs. 4,490", multiplier: "Weekly campaign pass" },
    "30": { label: "30-Day Pro", starterPrice: "Rs. 3,499", proPrice: "Rs. 9,990", multiplier: "Full monthly pass" },
  };

  const current = durationDetails[selectedDuration];

  return (
    <section className="bg-white py-20 sm:py-28 border-b border-neutral-200/80">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        {/* Header matching reference */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-neutral-800">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
            <span>Predictable Pricing</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950">
            Your next move. Your kind of plan.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600">
            Transparent pricing in PKR. Pick short-term passes for client sprints or full monthly access.
          </p>

          {/* Duration Selector Tabs */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-full bg-neutral-100 p-1.5 border border-neutral-200 shadow-2xs">
            {(["1", "3", "7", "30"] as Duration[]).map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDuration(d)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 ${
                  selectedDuration === d
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                {d === "1" ? "1 Day" : d === "3" ? "3 Days" : d === "7" ? "7 Days (Popular)" : "30 Days"}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Pricing Cards Grid matching reference layout */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Card 1: Starter / Single Tool */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-9 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">Starter</span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                  Single Tool
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-neutral-950">{current.starterPrice}</span>
                <span className="text-xs font-semibold text-neutral-500">/ {current.multiplier}</span>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-neutral-600">
                Ideal for freelancers needing quick access to a single platform for audits or keyword checks.
              </p>

              <div className="mt-8 space-y-3.5 border-t border-neutral-100 pt-6">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-800">
                  <MaterialIcon name="check" className="text-neutral-900 text-base" />
                  <span>Choose any 1 premium tool</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-800">
                  <MaterialIcon name="check" className="text-neutral-900 text-base" />
                  <span>1-click Chrome launcher extension</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-800">
                  <MaterialIcon name="check" className="text-neutral-900 text-base" />
                  <span>Private isolated session</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-800">
                  <MaterialIcon name="check" className="text-neutral-900 text-base" />
                  <span>Standard community support</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6">
              <Link
                href={`/pricing?duration=${selectedDuration}`}
                className="w-full inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all hover:bg-black"
              >
                Choose Starter
              </Link>
            </div>
          </div>

          {/* Card 2: Featured Pro Plan (Warm Yellow #FEF08A matching reference!) */}
          <div className="rounded-3xl border-2 border-yellow-400 bg-[#FEF08A] p-8 sm:p-9 flex flex-col justify-between shadow-xl relative scale-[1.02] transition-transform">
            {/* Most popular tag */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-neutral-950 px-4 py-1 text-xs font-black uppercase tracking-wider text-yellow-400 shadow-sm">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-950">Standard Orbit</span>
                <span className="rounded-full bg-yellow-400/80 border border-yellow-500/50 px-3 py-1 text-xs font-bold text-neutral-950">
                  Full Bundle
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-neutral-950">{current.proPrice}</span>
                <span className="text-xs font-bold text-neutral-800">/ {current.multiplier}</span>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-neutral-800 font-medium">
                Our flagship suite. Complete access to Semrush, Ahrefs, Moz, SpyFu, Canva, and ChatGPT.
              </p>

              <div className="mt-8 space-y-3.5 border-t border-yellow-400/60 pt-6">
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-neutral-950">
                  <MaterialIcon name="check_circle" className="text-neutral-950 text-base" />
                  <span>All 28+ premium SEO &amp; content tools</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-neutral-950">
                  <MaterialIcon name="check_circle" className="text-neutral-950 text-base" />
                  <span>Automated token &amp; proxy rotation</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-neutral-950">
                  <MaterialIcon name="check_circle" className="text-neutral-950 text-base" />
                  <span>Unlimited daily launches</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-neutral-950">
                  <MaterialIcon name="check_circle" className="text-neutral-950 text-base" />
                  <span>99.8% uptime SLA guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-neutral-950">
                  <MaterialIcon name="check_circle" className="text-neutral-950 text-base" />
                  <span>Priority 24/7 WhatsApp &amp; chat support</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6">
              <Link
                href={`/pricing?duration=${selectedDuration}&bundle=pro`}
                className="w-full inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white transition-all hover:bg-black shadow-md"
              >
                Get Started Now &rarr;
              </Link>
            </div>
          </div>

          {/* Card 3: Agency & Custom */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-9 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">Enterprise</span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                  Agencies
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-neutral-950">Let&apos;s talk</span>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-neutral-600">
                Custom setups for agencies with multiple team members, centralized billing, and custom domains.
              </p>

              <div className="mt-8 space-y-3.5 border-t border-neutral-100 pt-6">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-800">
                  <MaterialIcon name="check" className="text-neutral-900 text-base" />
                  <span>Multiple simultaneous team seats</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-800">
                  <MaterialIcon name="check" className="text-neutral-900 text-base" />
                  <span>Dedicated proxy pools for your agency</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-800">
                  <MaterialIcon name="check" className="text-neutral-900 text-base" />
                  <span>Custom tool requests fulfilled in 24h</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-800">
                  <MaterialIcon name="check" className="text-neutral-900 text-base" />
                  <span>Dedicated account manager</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6">
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all hover:bg-black"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
