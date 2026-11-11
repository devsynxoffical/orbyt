import { MaterialIcon } from "@/components/ui/MaterialIcon";

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group h-full rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200/80 hover:shadow-card">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
        <MaterialIcon name={icon} className="text-2xl" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-neutral-900">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
    </div>
  );
}
