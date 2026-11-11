import { TOOL_CATALOG } from "@/lib/tools/catalog";
import { getToolLogoUrl } from "@/lib/tools/logos";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function IntegrationsSection() {
  const popularTools = TOOL_CATALOG.slice(0, 10);

  return (
    <section className="bg-[#FFFBEB] py-20 sm:py-28 border-b border-yellow-200/80">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/50 bg-white/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-yellow-900 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-600" />
            <span>Connected Tool Ecosystem</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950">
            Built around the way teams work.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-700">
            Access every essential SEO, content, and intelligence platform through a single secure account.
          </p>
        </div>

        {/* Integration Badges Grid matching reference */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
          {popularTools.map((t) => {
            const logoUrl = getToolLogoUrl({ slug: t.slug, name: t.name });
            return (
              <Link
                key={t.slug}
                href={`/tools`}
                className="group flex flex-col items-center justify-center rounded-2xl border border-yellow-300/60 bg-white/90 p-6 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-neutral-900 hover:bg-white hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-50 p-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={t.name}
                      className="h-10 w-10 object-contain"
                    />
                  ) : (
                    <span className="text-xl font-black text-neutral-800">
                      {t.name.charAt(0)}
                    </span>
                  )}
                </div>
                <h4 className="mt-4 text-sm font-extrabold text-neutral-900 group-hover:text-black">
                  {t.name}
                </h4>
                <span className="mt-1 text-[11px] font-medium text-neutral-500">
                  {t.category ?? "SEO Suite"}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sub-note */}
        <div className="mt-12 text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 rounded-full bg-white border border-yellow-400/80 px-6 py-2.5 text-xs sm:text-sm font-bold text-neutral-900 shadow-2xs transition-all hover:bg-neutral-900 hover:text-white"
          >
            <span>Need a custom tool not listed? Request tool access</span>
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </Link>
        </div>
      </div>
    </section>
  );
}

