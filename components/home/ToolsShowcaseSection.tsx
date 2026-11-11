import Link from "next/link";
import { SectionHeader } from "@/components/home/SectionHeader";
import { getActiveToolsForPricing } from "@/lib/data/tools";
import { resolveToolLogoUrl } from "@/lib/tools/logos";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export async function ToolsShowcaseSection() {
  const tools = (await getActiveToolsForPricing()).slice(0, 6);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Our tools"
          title="Popular SEO tools in one place"
          description="Semrush, Moz, SpyFu, Majestic, KWFinder, Ahrefs, Keywords Everywhere, and more — browse what’s available and pick your duration."
          action={
            <Link
              href="/pricing"
              className="btn-marketing-outline inline-flex items-center gap-2 !py-2.5"
            >
              Explore tools
              <MaterialIcon name="arrow_forward" className="text-base" />
            </Link>
          }
          align="left"
        />

        {tools.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-collab-gray px-6 py-16 text-center">
            <p className="text-neutral-600">
              Tools will appear here once the admin adds pricing.
            </p>
            <Link href="/signup" className="btn-marketing mt-4 inline-flex">
              Sign up to get notified
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => {
              const logoUrl = resolveToolLogoUrl({
                slug: tool.slug,
                name: tool.name,
                iconUrl: tool.iconUrl,
              });

              return (
                <article key={tool.id} className="marketing-card group">
                  <div className="relative h-44 bg-collab-gray p-5">
                    <span className="inline-flex rounded-md bg-collab-yellow px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      SEO Tool
                    </span>
                    <div className="absolute bottom-5 left-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200/90 bg-white p-2.5 shadow-sm transition-transform duration-200 group-hover:scale-105">
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoUrl}
                          alt={`${tool.name} logo`}
                          className="h-11 w-11 object-contain"
                        />
                      ) : (
                        <span className="text-xl font-black text-collab-dark">
                          {tool.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-extrabold text-collab-dark">
                      {tool.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm text-neutral-600">
                      {tool.description ?? "Premium SEO access via group buy."}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                      <div>
                        <p className="text-xl font-extrabold text-collab-dark">
                          PKR {tool.pricePkr.toLocaleString()}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {tool.accessDurationDays} days access
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/buy/${tool.slug}`}
                        className="btn-marketing-pill !px-4 !py-2 text-xs"
                      >
                        Buy now
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
