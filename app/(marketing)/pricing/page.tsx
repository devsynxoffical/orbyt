import Link from "next/link";
import { getActiveToolsForPricing } from "@/lib/data/tools";
import { resolveToolLogoUrl } from "@/lib/tools/logos";
import { PageHero } from "@/components/home/PageHero";
import { SectionHeader } from "@/components/home/SectionHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans | Orbyt Rush",
  description: "Flexible duration passes in PKR for 1, 3, 7, and 30 days. Pay only for the tool access you need on Orbyt Rush.",
};

export const dynamic = "force-dynamic";

type PricingPageProps = {
  searchParams: { q?: string };
};

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const query = searchParams.q?.trim().toLowerCase() ?? "";
  const allTools = await getActiveToolsForPricing();
  const tools = query
    ? allTools.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.slug.toLowerCase().includes(query) ||
          (t.description?.toLowerCase().includes(query) ?? false)
      )
    : allTools;

  return (
    <div className="bg-white pb-20 sm:pb-28">
      <PageHero
        eyebrow="Pricing"
        title="Pay per tool in PKR"
        description="Choose the tools you need at group-buy rates. Transfer via bank, upload proof, and get access after admin verification."
      />

      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        {query && (
          <p className="mb-6 text-sm text-neutral-600">
            Showing results for &ldquo;{searchParams.q}&rdquo; —{" "}
            <Link href="/pricing" className="font-bold text-collab-dark underline">
              clear filter
            </Link>
          </p>
        )}

        {tools.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-collab-gray px-6 py-16 text-center">
            <p className="text-neutral-600">
              {query
                ? "No tools match your search. Try another name."
                : "No tools are available for purchase yet. Check back soon."}
            </p>
            {query && (
              <Link href="/pricing" className="btn-marketing mt-4 inline-flex">
                View all tools
              </Link>
            )}
          </div>
        ) : (
          <section className="py-12 sm:py-16">
            <SectionHeader
              title={`${tools.length} tool${tools.length === 1 ? "" : "s"} available`}
              description="Each purchase includes the access duration shown. Launch tools from your dashboard after approval."
              align="left"
            />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {tools.map((tool) => {
                const logoUrl =
                  resolveToolLogoUrl({ slug: tool.slug, name: tool.name, iconUrl: tool.iconUrl });

                return (
                  <article key={tool.slug} className="marketing-card group flex flex-col">
                    <div className="relative h-32 bg-collab-gray p-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200/90 bg-white p-2 shadow-sm transition-transform duration-200 group-hover:scale-105">
                        {logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logoUrl}
                            alt={`${tool.name} logo`}
                            className="h-10 w-10 object-contain"
                          />
                        ) : (
                          <span className="text-base font-extrabold text-collab-dark">
                            {tool.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-extrabold text-collab-dark">{tool.name}</h3>
                      {tool.description && (
                        <p className="mt-2 line-clamp-2 flex-1 text-sm text-neutral-600">
                          {tool.description}
                        </p>
                      )}
                      <p className="mt-4 text-xl font-extrabold text-collab-dark">
                        PKR {tool.pricePkr.toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {tool.accessDurationDays} days access
                      </p>
                      <Link
                        href={`/dashboard/buy/${tool.slug}`}
                        className="btn-marketing mt-4 w-full !py-2.5 text-sm"
                      >
                        Buy now
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
