import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Orbyt Rush",
  description: "Learn about Orbyt Rush — the high-velocity tool workflow platform built for SEO pros, agencies, and growth teams.",
};
import { AnimateIn } from "@/components/ui/AnimateIn";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { PageHero } from "@/components/home/PageHero";
import { TOOL_CATALOG } from "@/lib/tools/catalog";

const stats = [
  { value: "2,000+", label: "SEO professionals", icon: "groups" },
  { value: String(TOOL_CATALOG.length), label: "Tools available", icon: "apps" },
  { value: "70%", label: "Average savings", icon: "savings" },
  { value: "99.9%", label: "Platform uptime", icon: "monitoring" },
];

const highlights = [
  "Built for freelancers & agencies",
  "One subscription, full SEO stack",
  "Transparent group-buy pricing",
];

const values = [
  {
    icon: "savings",
    title: "Affordable access",
    description:
      "We negotiate group licenses so freelancers and agencies get enterprise tools without enterprise prices.",
  },
  {
    icon: "bolt",
    title: "Instant setup",
    description:
      "No waiting lists or manual provisioning. Subscribe and your tools are ready in seconds.",
  },
  {
    icon: "support_agent",
    title: "Human support",
    description:
      "Real people behind the platform — help with billing, access issues, and tool requests.",
  },
  {
    icon: "verified_user",
    title: "Trust & security",
    description:
      "Encrypted sessions, reliable infrastructure, and transparent policies you can count on.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative bg-white">
      <PageHero
        eyebrow="About us"
        title="Making premium SEO tools accessible to all"
        description="GroupBuy Tools helps freelancers, agencies, and growth teams access the full SEO stack through simple, affordable per-tool pricing."
      >
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
          {highlights.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full border border-collab-dark/20 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-neutral-700 shadow-sm sm:text-sm"
            >
              <MaterialIcon
                name="check_circle"
                className="text-sm text-collab-dark"
                filled
              />
              {item}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="border-b border-neutral-200/50 bg-white">
        <div className="mx-auto max-w-container px-4 pb-10 sm:px-6 sm:pb-12 lg:px-10 lg:pb-14">
          <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {stats.map((stat, i) => (
              <AnimateIn key={stat.label} delay={i * 80}>
                <div className="group rounded-2xl border border-neutral-200/80 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card sm:p-5">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-collab-dark transition-colors group-hover:bg-collab-dark group-hover:text-white">
                    <MaterialIcon name={stat.icon} className="text-xl" />
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-collab-dark sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 sm:text-xs">
                    {stat.label}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="relative mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <AnimateIn>
            <span className="inline-flex items-center gap-2 rounded-full bg-collab-yellow px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-950">
              <MaterialIcon name="flag" className="text-sm" />
              Our mission
            </span>
            <h2 className="mt-4 text-2xl font-bold text-neutral-900 sm:text-3xl">
              Level the playing field for SEO professionals
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
              Orbyt Rush was founded with a simple mission: make premium SEO
              software accessible to everyone — from solo freelancers to growing
              agencies — without the sticker shock of individual subscriptions.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
              We negotiate group licenses and pass the savings directly to you. Our
              platform handles provisioning, billing, and access management so you
              can focus on what matters: ranking your clients higher.
            </p>
          </AnimateIn>

          <AnimateIn delay={120}>
            <div className="relative overflow-hidden rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-card sm:p-8">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-collab-dark to-neutral-900 text-white shadow-glow-sm">
                  <MaterialIcon name="lightbulb" className="text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">What we believe</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  Great SEO shouldn&apos;t require a five-figure tool budget. Every
                  marketer deserves access to the same data and insights that power
                  the world&apos;s top agencies.
                </p>
                <ul className="mt-5 space-y-3">
                  {[
                    "Transparent pricing",
                    "One dashboard for all tools",
                    "No lock-in contracts",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
                    >
                      <MaterialIcon
                        name="check_circle"
                        className="text-lg text-accent-500"
                        filled
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-neutral-200/40 bg-neutral-50 py-12 sm:py-14">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
          <AnimateIn className="mb-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-collab-dark">
              Our values
            </span>
            <h2 className="mt-3 text-2xl font-bold text-neutral-900 sm:text-3xl">
              Why teams choose us
            </h2>
          </AnimateIn>

          <div className="grid gap-5 sm:grid-cols-2">
            {values.map((value, i) => (
              <AnimateIn key={value.title} delay={i * 80}>
                <div className="feature-card group h-full border-neutral-200/80 bg-white/90 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-collab-yellow/30 text-collab-dark transition-colors group-hover:bg-collab-dark group-hover:text-white">
                    <MaterialIcon name={value.icon} className="text-xl" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-neutral-900">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {value.description}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-4 py-12 sm:px-6 lg:px-10 lg:py-14">
        <AnimateIn className="mx-auto max-w-2xl rounded-2xl border border-neutral-200/70 bg-white p-8 text-center shadow-card sm:p-10">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
              Ready to join us?
            </h2>
            <p className="mt-3 text-sm text-neutral-600 sm:text-base">
              Start your free trial today and see why thousands of SEO professionals
              trust GroupBuy Tools.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn-marketing min-w-[140px]">
                Get started
              </Link>
              <Link href="/contact" className="btn-secondary min-w-[140px]">
                Contact us
              </Link>
            </div>
          </div>
        </AnimateIn>
      </section>
    </div>
  );
}
