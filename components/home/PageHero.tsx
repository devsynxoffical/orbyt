type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-grid-yellow text-neutral-950 border-b border-yellow-300/70 py-14 sm:py-20">
      <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-yellow-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-container px-4 text-center sm:px-6 lg:px-10">
        {eyebrow && (
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-neutral-900/10 bg-white/70 px-4 py-1 text-xs font-bold uppercase tracking-wider text-neutral-800 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
            <span>{eyebrow}</span>
          </span>
        )}
        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-800 sm:text-lg">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
