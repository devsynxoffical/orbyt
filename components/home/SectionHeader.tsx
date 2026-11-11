type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  dark?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  action,
  dark = false,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`mb-10 flex flex-col gap-4 sm:mb-12 ${
        isCenter ? "text-center" : "sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div className={isCenter ? "mx-auto max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <span
            className={`mb-3 inline-block text-xs font-bold uppercase tracking-[0.2em] ${
              dark ? "text-collab-yellow/80" : "marketing-eyebrow"
            }`}
          >
            {eyebrow}
          </span>
        )}
        <h2
          className={`text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl ${
            dark ? "text-white" : "text-collab-dark"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-3 text-sm leading-relaxed sm:text-base ${
              dark ? "text-white/70" : "text-neutral-600"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
