"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const faqs = [
  {
    q: "What is Orbyt Rush?",
    a: "Orbyt Rush is a high-velocity workflow platform providing flexible on-demand access to premium SEO, content, research, and outreach tools via a single, secure Chrome launcher. Pay only for the exact duration you need with local PKR pricing.",
  },
  {
    q: "How does the 1-click Chrome launcher work?",
    a: "After selecting your pass, you can launch tools like Semrush, Ahrefs, and Moz directly in Chrome with one click. Our extension securely authenticates your isolated session without needing to enter shared passwords or deal with broken cookies.",
  },
  {
    q: "Can I buy a tool for just 1, 3, or 7 days?",
    a: "Yes! Orbyt Rush is specifically built around flexible duration passes. If you only have a 1-day client audit or a 7-day sprint, you only pay for those days instead of paying for a full month or year.",
  },
  {
    q: "What payment methods are supported in Pakistan?",
    a: "We support instant Pakistani payment methods including direct local Bank Transfers, Raast, Easypaisa, and JazzCash with manual or automated verification, as well as international debit/credit cards.",
  },
  {
    q: "Are my research projects and client keywords private?",
    a: "Absolutely. Each tool session runs in an isolated container. Your searches, keyword lists, backlink exports, and project folders remain completely private to your account.",
  },
  {
    q: "What happens if a tool goes down or gets rate-limited?",
    a: "Our automated session-management infrastructure continuously monitors uptime and rotates token pools in real-time. If an account flags an issue, our system auto-recovers within seconds with 24/7 engineer coverage.",
  },
];

export function HomeFaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 sm:py-28 border-b border-neutral-200/80">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-neutral-800">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
            <span>Got Questions?</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950">
            Frequently asked questions.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600">
            Everything you need to know about duration passes, the Chrome launcher, and billing.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="transition-colors">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-neutral-50/80 sm:px-8"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-neutral-900">
                    {item.q}
                  </span>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${isOpen ? "bg-yellow-400 text-neutral-950 rotate-180" : "bg-neutral-100 text-neutral-600"}`}>
                    <MaterialIcon name="expand_more" className="text-xl" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base leading-relaxed text-neutral-600 sm:px-8 animate-in-fade">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
