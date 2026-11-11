import { resolveToolLogoUrl } from "@/lib/tools/logos";

type ToolLogoProps = {
  name: string;
  slug?: string | null;
  iconUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
  nameClassName?: string;
};

const sizeClasses = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function ToolLogo({
  name,
  slug,
  iconUrl,
  size = "md",
  showName = true,
  className = "",
  nameClassName = "",
}: ToolLogoProps) {
  const logoUrl = resolveToolLogoUrl({ slug, name, iconUrl });
  const box = sizeClasses[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white font-bold text-collab-dark ring-1 ring-neutral-200/80 ${box}`}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-full w-full object-contain p-0.5" />
        ) : (
          name.charAt(0)
        )}
      </span>
      {showName && (
        <span className={`truncate font-semibold ${nameClassName}`}>{name}</span>
      )}
    </span>
  );
}
