import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function FourPastelFeaturesSection() {
  const cards = [
    {
      bg: "bg-[#E0F2FE]",
      border: "border-[#BAE6FD]",
      badgeBg: "bg-sky-100",
      badgeText: "text-sky-900",
      tag: "1-Click Launch",
      title: "Seamless Browser Launcher",
      description:
        "Open Semrush, Ahrefs, Moz, and Canva with zero credential friction. Our Chrome extension auto-injects secure session tokens.",
      icon: "rocket_launch",
      accentColor: "text-sky-700",
      href: "/tools",
      cta: "Explore launcher",
    },
    {
      bg: "bg-[#FFEDD5]",
      border: "border-[#FED7AA]",
      badgeBg: "bg-orange-100",
      badgeText: "text-orange-950",
      tag: "Deep Intel",
      title: "SERP & Competitor Radar",
      description:
        "Track keyword movements, analyze backlink gaps, and reverse-engineer competitor campaigns with industry-standard accuracy.",
      icon: "query_stats",
      accentColor: "text-orange-700",
      href: "/tools",
      cta: "View SEO tools",
    },
    {
      bg: "bg-[#F3E8FF]",
      border: "border-[#DDD6FE]",
      badgeBg: "bg-purple-100",
      badgeText: "text-purple-950",
      tag: "Flexible Access",
      title: "Adaptive Duration Passes",
      description:
        "Never get locked into an overpriced annual contract. Choose 1, 3, 7, or 30-day passes tailored precisely to your client needs.",
      icon: "timelapse",
      accentColor: "text-purple-700",
      href: "/pricing",
      cta: "Compare durations",
    },
    {
      bg: "bg-[#DCFCE7]",
      border: "border-[#BBF7D0]",
      badgeBg: "bg-emerald-100",
      badgeText: "text-emerald-950",
      tag: "High Uptime",
      title: "Automated Session Health",
      description:
        "Our intelligent proxy rotation and live session monitors guarantee 99.8% uninterrupted uptime without broken logins.",
      icon: "security_update_good",
      accentColor: "text-emerald-700",
      href: "/about",
      cta: "Learn about security",
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-28 border-b border-neutral-200/80">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-neutral-800">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950">
            One platform. A bigger orbit.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600">
            Everything your team needs to scale research, optimize budgets, and launch campaigns at breakthrough velocity.
          </p>
        </div>

        {/* 2x2 Grid of pastel cards matching reference */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {cards.map((c) => (
            <div
              key={c.title}
              className={`rounded-3xl border ${c.border} ${c.bg} p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block rounded-full ${c.badgeBg} ${c.badgeText} px-3.5 py-1 text-xs font-bold uppercase tracking-wider border border-black/5`}
                  >
                    {c.tag}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-xs">
                    <MaterialIcon name={c.icon} className={`text-2xl ${c.accentColor}`} />
                  </div>
                </div>

                <h3 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  {c.title}
                </h3>

                <p className="mt-4 text-sm sm:text-base leading-relaxed text-neutral-700">
                  {c.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-black/10 flex items-center justify-between">
                <Link
                  href={c.href}
                  className="inline-flex items-center gap-2 text-sm font-bold text-neutral-950 hover:underline"
                >
                  <span>{c.cta}</span>
                  <MaterialIcon name="arrow_forward" className="text-sm" />
                </Link>
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Active System
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
