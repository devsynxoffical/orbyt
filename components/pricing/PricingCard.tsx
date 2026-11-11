import Link from "next/link";
import { getToolLogoUrl } from "@/lib/tools/logos";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type PricingCardProps = {
  id: string;
  name: string;
  description: string | null;
  pricePkr: number;
  durationDays: number;
  tools: { tool: { name: string; slug?: string } }[];
  featured?: boolean;
};

export function PricingCard({
  name,
  description,
  pricePkr,
  durationDays,
  tools,
  featured = false,
}: PricingCardProps) {
  return (
    <div
      className={`pricing-card ${featured ? "border-2 border-yellow-400 bg-yellow-50/50 shadow-xl lg:scale-105" : "border border-neutral-200/80 bg-white"}`}
    >
      {featured && (
        <span className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-xl bg-neutral-950 px-4 py-1 text-xs font-bold text-yellow-400 shadow-sm">
          Most popular
        </span>
      )}
      <h3 className="text-xl font-extrabold text-neutral-950">{name}</h3>
      {description && (
        <p className="mt-2 text-sm text-neutral-600">{description}</p>
      )}
      <div className="mt-8">
        <span className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-950">
          PKR {pricePkr.toLocaleString()}
        </span>
        <span className="text-sm font-semibold text-neutral-500"> / {durationDays} days</span>
      </div>
      <ul className="mt-8 flex-1 space-y-3.5">
        {tools.map(({ tool }) => {
          const logoUrl = getToolLogoUrl({ slug: tool.slug, name: tool.name });
          return (
            <li
              key={tool.name}
              className="flex items-center gap-2.5 text-sm font-medium text-neutral-700"
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={`${tool.name} logo`}
                  className="h-5 w-5 shrink-0 rounded object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-400/30 text-neutral-900 font-bold">
                  <MaterialIcon name="check" className="text-xs" />
                </span>
              )}
              <span>{tool.name}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-8">
        <Link
          href="/signup"
          className={
            featured
              ? "inline-flex w-full items-center justify-center rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-black transition-all"
              : "inline-flex w-full items-center justify-center rounded-full bg-white border border-neutral-300 px-6 py-3.5 text-sm font-bold text-neutral-900 hover:bg-neutral-50 transition-all"
          }
        >
          Select {name}
        </Link>
      </div>
    </div>
  );
}
