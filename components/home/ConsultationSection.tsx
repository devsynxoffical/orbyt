"use client";

import Link from "next/link";
import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function ConsultationSection() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="relative overflow-hidden bg-[#FAF9F5] text-neutral-900 py-16 sm:py-24 border-b border-neutral-200/80">
      <div className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-yellow-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-amber-100/50 blur-2xl" />

      <div className="relative mx-auto grid max-w-container items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/60 bg-yellow-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-yellow-950">
            Need help choosing?
          </span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl text-neutral-950">
            To help you choose the right tools, speak with a specialist
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600 sm:text-base">
            Tell us about your project requirements &mdash; we&apos;ll recommend the best duration passes and tools for your workflow.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Tool recommendations for your specific niche",
              "Assistance with Pakistani bank transfer / Raast / JazzCash",
              "Custom agency & multi-seat account planning",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-neutral-800">
                <MaterialIcon name="check_circle" className="text-yellow-500" filled />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xl sm:p-8 text-neutral-900">
          {submitted ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-neutral-950">
                <MaterialIcon name="check_circle" filled className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">
                Request received!
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Our support team will get back to you via WhatsApp or email within a few hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 inline-flex rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-black transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-neutral-900">
                Request a recommendation
              </h3>
              <p className="text-xs text-neutral-500">
                Leave your details and we&apos;ll guide you to the right setup.
              </p>

              <div>
                <label
                  htmlFor="consultation-name"
                  className="mb-1 block text-xs font-bold text-neutral-700"
                >
                  Name
                </label>
                <input
                  id="consultation-name"
                  name="name"
                  required
                  placeholder="Your full name"
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="consultation-contact"
                  className="mb-1 block text-xs font-bold text-neutral-700"
                >
                  Email or WhatsApp
                </label>
                <input
                  id="consultation-contact"
                  name="contact"
                  required
                  placeholder="your@email.com or +92 300 1234567"
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="consultation-needs"
                  className="mb-1 block text-xs font-bold text-neutral-700"
                >
                  What tools or tasks do you need help with?
                </label>
                <textarea
                  id="consultation-needs"
                  name="needs"
                  rows={3}
                  placeholder="e.g. Need Semrush and Ahrefs for a 7-day client audit"
                  className="input-field resize-none"
                />
              </div>

              <button
                type="submit"
                className="btn-marketing w-full text-center"
              >
                Request guidance
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
