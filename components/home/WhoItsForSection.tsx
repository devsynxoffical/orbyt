import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { SectionHeader } from "@/components/home/SectionHeader";

const audienceList = [
  {
    icon: "person",
    label: "Freelancers",
    detail: "Switch tools per client without buying every platform.",
  },
  {
    icon: "groups",
    label: "Agencies",
    detail: "Centralize keyword, backlink, and competitor research.",
  },
  {
    icon: "storefront",
    label: "E-commerce",
    detail: "Research products, competitors, and search demand.",
  },
  {
    icon: "link",
    label: "Affiliate marketers",
    detail: "Find keywords, content angles, and link opportunities.",
  },
  {
    icon: "language",
    label: "Website owners",
    detail: "Practical SEO tools for blogs, local businesses, and SaaS.",
  },
  {
    icon: "school",
    label: "Learners & marketers",
    detail: "Learn real workflows without long-term software bills.",
  },
];

export function WhoItsForSection() {
  return (
    <section className="marketing-section-gray py-16 sm:py-20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Who it's for"
          title="Built for SEO professionals"
          description="Orbyt Rush is designed for freelancers, agencies, marketers, website owners, and businesses that need professional SEO resources without unnecessary software expenses."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audienceList.map((item) => (
            <div
              key={item.label}
              className="flex gap-4 rounded-xl border border-neutral-200/80 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-collab-yellow text-white">
                <MaterialIcon name={item.icon} className="text-xl" />
              </span>
              <div>
                <p className="text-base font-bold text-collab-dark">
                  {item.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
