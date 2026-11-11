import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function FeaturedTestimonial() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="relative mx-auto w-full max-w-sm lg:mx-0">
            <div className="absolute -left-4 -top-4 h-full w-full rounded-2xl bg-collab-yellow" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-4 border-white bg-collab-gray shadow-xl">
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-collab-yellow text-3xl font-extrabold text-white shadow-lg ring-4 ring-collab-yellow/20">
                  SK
                </div>
                <p className="mt-6 text-lg font-extrabold text-collab-dark">
                  Agency owner
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  Uses Semrush, Moz & SpyFu daily
                </p>
                <div className="mt-6 flex gap-1 text-collab-dark">
                  {[...Array(5)].map((_, i) => (
                    <MaterialIcon key={i} name="star" filled />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <MaterialIcon
              name="format_quote"
              className="text-6xl text-collab-yellow"
            />
            <blockquote className="mt-2 text-2xl font-bold leading-snug text-collab-dark sm:text-3xl lg:text-4xl">
              &ldquo;We cut our SEO tool spend by 70% while keeping the exact
              same workflow. The dashboard makes it effortless to launch
              everything.&rdquo;
            </blockquote>
            <footer className="mt-8">
              <p className="text-lg font-extrabold text-collab-dark">Sarah Khan</p>
              <p className="text-sm text-neutral-600">
                Digital Marketing Agency, Karachi
              </p>
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}
