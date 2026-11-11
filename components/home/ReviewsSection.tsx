import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { AnimateIn } from "@/components/ui/AnimateIn";

const reviews = [
  {
    name: "Sarah K.",
    role: "Digital Marketing Agency",
    initials: "SK",
    text: "Cut our tool costs by 70% while keeping the same workflow. The dashboard makes it dead simple to access everything.",
  },
  {
    name: "Marcus T.",
    role: "SEO Freelancer",
    initials: "MT",
    text: "I was paying for three separate subscriptions. Orbyt Rush replaced all of them for less than the price of one Ahrefs plan.",
  },
  {
    name: "Priya N.",
    role: "Growth Lead, SaaS",
    initials: "PN",
    text: "Provisioning is instant and support is responsive. Our team switched in a day and never looked back.",
  },
  {
    name: "James R.",
    role: "Agency Owner",
    initials: "JR",
    text: "Billing is transparent and the tool catalog keeps growing. Exactly what a small agency needs to stay competitive.",
  },
  {
    name: "Elena V.",
    role: "Content Strategist",
    initials: "EV",
    text: "Surfer, Semrush, and Ahrefs in one place — no more tab chaos. The UI is clean and actually pleasant to use.",
  },
  {
    name: "David L.",
    role: "E-commerce SEO",
    initials: "DL",
    text: "Reliable uptime and fast access. We run client campaigns daily and Orbyt Rush has been rock solid for months.",
  },
];

function Stars() {
  return (
    <div className="mb-3 flex gap-0.5 text-primary-500">
      {[...Array(5)].map((_, i) => (
        <MaterialIcon key={i} name="star" className="text-base" filled />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: (typeof reviews)[number];
}) {
  return (
    <article className="flex w-[min(100vw-2rem,22rem)] shrink-0 flex-col rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:w-80">
      <Stars />
      <blockquote className="flex-1 text-sm leading-relaxed text-neutral-700">
        &ldquo;{review.text}&rdquo;
      </blockquote>
      <footer className="mt-5 flex items-center gap-3 border-t border-neutral-100 pt-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
          {review.initials}
        </div>
        <div>
          <p className="text-sm font-bold text-neutral-900">{review.name}</p>
          <p className="text-xs text-neutral-500">{review.role}</p>
        </div>
      </footer>
    </article>
  );
}

export function ReviewsSection() {
  const loop = [...reviews, ...reviews];

  return (
    <section className="overflow-hidden bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <AnimateIn className="mb-10 text-center">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
            Customer reviews
          </span>
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            Loved by SEO professionals
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-neutral-600 sm:text-base">
            Real feedback from freelancers and agencies using Orbyt Rush every
            day.
          </p>
        </AnimateIn>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20" />

        <div className="marquee-track gap-5 px-4 sm:gap-6">
          {loop.map((review, i) => (
            <ReviewCard key={`${review.name}-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
