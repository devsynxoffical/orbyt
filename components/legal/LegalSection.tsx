import { ReactNode } from "react";

type LegalSectionProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  index?: number;
};

const defaultIcons = [
  <svg key="0" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
  <svg key="1" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>,
  <svg key="2" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>,
  <svg key="3" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>,
];

export function LegalSection({ title, icon, children, index = 0 }: LegalSectionProps) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-neutral-200/70 bg-neutral-0/80 p-6 shadow-card transition-all duration-300 hover:border-primary-200/60 hover:shadow-card-hover sm:p-7">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-500/5 transition-transform duration-500 group-hover:scale-125" />
      <div className="relative flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-neutral-0 shadow-glow-sm">
          {icon ?? defaultIcons[index % defaultIcons.length]}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-collab-yellow sm:text-lg">{title}</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
