import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { SectionHeader } from "@/components/home/SectionHeader";

const benefits = [
  {
    icon: "rocket_launch",
    title: "Quick access",
    description:
      "Sign up, pay via bank transfer, and get tools after admin verification.",
  },
  {
    icon: "dashboard",
    title: "One dashboard",
    description:
      "Launch every tool from a single workspace — no password sharing.",
  },
  {
    icon: "verified",
    title: "Trusted platform",
    description:
      "Encrypted sessions, secure proxy launch, and transparent order history.",
  },
  {
    icon: "support_agent",
    title: "Real support",
    description:
      "Contact us for billing, tool requests, and access help anytime.",
  },
];

export function BenefitsStrip() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Why Orbyt Rush"
          title="A team with high technical skills helps you access premium tools"
          description="We handle the infrastructure so you can focus on SEO results."
        />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-collab-yellow text-white">
                <MaterialIcon name={item.icon} className="text-2xl" />
              </div>
              <h3 className="text-base font-extrabold text-collab-dark">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
