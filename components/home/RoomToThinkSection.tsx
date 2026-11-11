import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function RoomToThinkSection() {
  const cards = [
    {
      bg: "bg-[#F5F3FF]",
      border: "border-purple-200/80",
      icon: "bolt",
      iconColor: "text-purple-600",
      title: "Instant Browser Launch",
      description: "Access tools in under 2 seconds directly in Chrome with zero credential friction.",
    },
    {
      bg: "bg-[#FFF7ED]",
      border: "border-orange-200/80",
      icon: "payments",
      iconColor: "text-orange-600",
      title: "Transparent PKR Rates",
      description: "No hidden bank exchange fees or surprise subscriptions. Pay locally with instant receipt.",
    },
    {
      bg: "bg-[#F0F9FF]",
      border: "border-sky-200/80",
      icon: "lock",
      iconColor: "text-sky-600",
      title: "Encrypted & Isolated",
      description: "Dedicated sessions ensure client audits, keyword searches, and exports stay 100% private.",
    },
    {
      bg: "bg-[#F0FDF4]",
      border: "border-emerald-200/80",
      icon: "support_agent",
      iconColor: "text-emerald-600",
      title: "24/7 Fast Support",
      description: "Talk to real engineers and tool specialists whenever you need guidance or session renewal.",
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-24 border-b border-neutral-200/80">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
            Less busywork. More room to think.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600">
            Built for marketers and agencies who value speed, privacy, and budget autonomy.
          </p>
        </div>

        {/* 4 Pastel Cards in a Row matching reference */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => (
            <div
              key={c.title}
              className={`rounded-3xl border ${c.border} ${c.bg} p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-2xs">
                  <MaterialIcon name={c.icon} className={`text-xl ${c.iconColor}`} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-neutral-950">
                  {c.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-neutral-600">
                  {c.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

