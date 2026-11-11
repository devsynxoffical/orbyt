"use client";

import { useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setDone(true);
  }

  return (
    <section className="relative bg-white pb-0 pt-14 sm:pt-16">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <div className="relative -mb-16 rounded-2xl bg-collab-yellow px-6 py-10 text-center text-white shadow-xl sm:px-12 sm:py-14 lg:-mb-20">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Subscribe now — get notified about new tools &amp; deals
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/85 sm:text-base">
            Be the first to know when we add new SEO tools or run special
            group-buy pricing.
          </p>

          {done ? (
            <p className="mt-6 font-bold text-white">
              Thanks — you&apos;re on the list!
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-lg border-2 border-white/30 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-white focus:outline-none"
              />
              <button type="submit" className="btn-glass-solid w-full shrink-0">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
