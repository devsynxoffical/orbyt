import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { SectionHeader } from "@/components/home/SectionHeader";

const reasons = [
  {
    icon: "schedule",
    title: "Flexible access",
    description:
      "Pick 1, 3, 7, or 30 days on eligible tools — pay for the window you actually need.",
  },
  {
    icon: "payments",
    title: "Affordable PKR pricing",
    description:
      "Clear prices in Pakistani Rupees for freelancers, agencies, and businesses.",
  },
  {
    icon: "apps",
    title: "Multiple SEO tools",
    description:
      "Semrush, Moz, SpyFu, Majestic, KWFinder, Ahrefs, Keywords Everywhere, and more when available.",
  },
  {
    icon: "dashboard",
    title: "One dashboard",
    description:
      "Browse, purchase, and launch your tools from a single Rankmora workspace.",
  },
];

export function WhyRankmoraSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Why Rankmora"
          title="Affordable SEO tools for professionals"
          description="Professional SEO software gets expensive when you need several platforms. Rankmora lets you choose the tools and durations that match each project."
        />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((item) => (
            <div key={item.title} className="text-center sm:text-left">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-collab-yellow text-white sm:mx-0">
                <MaterialIcon name={item.icon} className="text-2xl" />
              </div>
              <h3 className="text-base font-extrabold text-collab-dark">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
