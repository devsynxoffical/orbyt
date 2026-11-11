import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function KnowledgeIdeasSection() {
  const articles = [
    {
      category: "SEO Strategy",
      title: "How to run high-impact competitor backlink audits in 48 hours",
      excerpt: "Step-by-step framework to identify and reverse-engineer your rival's top-performing referral channels using Semrush and Ahrefs.",
      readTime: "5 min read",
      badgeColor: "bg-blue-100 text-blue-900",
    },
    {
      category: "Tool Velocity",
      title: "Why duration passes are replacing bloated SaaS annual commitments",
      excerpt: "How modern agencies cut software overhead by over 70% by paying solely for project-specific research windows.",
      readTime: "4 min read",
      badgeColor: "bg-amber-100 text-amber-900",
    },
    {
      category: "Outreach & Growth",
      title: "The modern guide to LinkedIn prospecting with automated tools",
      excerpt: "Organize your outreach pipelines, enrich contact data, and maintain 100% account safety with dedicated proxies.",
      readTime: "6 min read",
      badgeColor: "bg-purple-100 text-purple-900",
    },
    {
      category: "Agency Playbook",
      title: "Scaling client deliverables without multiplying software expenses",
      excerpt: "Manage multi-account access across decentralized teams without sharing root credentials or risking session flags.",
      readTime: "7 min read",
      badgeColor: "bg-emerald-100 text-emerald-900",
    },
    {
      category: "SERP Intelligence",
      title: "Decoding Google AI Overviews and adapting your keyword strategy",
      excerpt: "Extract high-intent search queries that withstand zero-click SERPs and maintain organic pipeline health.",
      readTime: "5 min read",
      badgeColor: "bg-sky-100 text-sky-900",
    },
    {
      category: "Security & Sessions",
      title: "How Orbyt Rush protects your research data with isolated sandboxes",
      excerpt: "Under the hood of our anti-fingerprinting technology and automated session rotation engine.",
      readTime: "4 min read",
      badgeColor: "bg-rose-100 text-rose-900",
    },
  ];

  return (
    <section className="bg-[#F0F9FF] py-20 sm:py-28 border-b border-sky-200/80">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-white/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-900 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
              <span>Guides &amp; Playbooks</span>
            </div>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950">
              Fresh ideas for smarter workflows.
            </h2>
            <p className="mt-3 text-base text-neutral-600 max-w-xl">
              Practical guides and battle-tested frameworks to help you research faster, rank higher, and scale efficiently.
            </p>
          </div>

          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-900 hover:underline"
          >
            <span>Read all articles</span>
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </Link>
        </div>

        {/* 6 Article Cards Grid matching reference */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <article
              key={a.title}
              className="rounded-3xl border border-sky-200/90 bg-white p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${a.badgeColor}`}>
                    {a.category}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">{a.readTime}</span>
                </div>

                <h3 className="mt-5 text-xl font-extrabold tracking-tight text-neutral-950 leading-snug">
                  {a.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {a.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-900">
                <span className="group-hover:underline">Read playbook</span>
                <MaterialIcon name="arrow_forward" className="text-sm text-neutral-500" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

