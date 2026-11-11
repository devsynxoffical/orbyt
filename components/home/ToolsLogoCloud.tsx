import { TOOL_CATALOG } from "@/lib/tools/catalog";
import { getToolLogoUrl } from "@/lib/tools/logos";

const featured = TOOL_CATALOG.filter((t) => t.popular).slice(0, 14);

export function ToolsLogoCloud() {
  const loop = [...featured, ...featured];

  return (
    <section className="border-b border-neutral-200/80 bg-white py-10">
      <div className="mx-auto max-w-container px-4 text-center sm:px-6 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
          Trusted by over 5,000+ marketing teams, agency leads, &amp; growth hackers
        </p>
      </div>

      <div className="relative mt-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

        <div className="marquee-track items-center gap-10 px-4">
          {loop.map((tool, i) => {
            const logoUrl = getToolLogoUrl({ slug: tool.slug, name: tool.name });
            return (
              <div
                key={`${tool.slug}-${i}`}
                className="group flex shrink-0 items-center gap-3 rounded-full border border-neutral-200/80 bg-neutral-50/70 px-4 py-2 transition-all duration-200 hover:border-neutral-900 hover:bg-white hover:shadow-sm"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white p-1 shadow-2xs">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={`${tool.name} logo`}
                      className="h-5 w-5 object-contain"
                    />
                  ) : (
                    <span className="text-xs font-black text-neutral-800">
                      {tool.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-neutral-800">
                  {tool.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
