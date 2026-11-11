import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function HomeFinalCta() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#FDE047] p-8 sm:p-14 lg:p-16 shadow-xl border border-yellow-300">
          {/* Decorative radial lighting */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/40 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-10 bottom-0 h-64 w-64 rounded-full bg-amber-400/30 blur-2xl"
            aria-hidden
          />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Copy & Actions */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-900/10 bg-white/60 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-neutral-900 backdrop-blur-xs">
                <span>Start In Under 60 Seconds</span>
              </div>

              <h2 className="mt-4 text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-neutral-950 leading-[1.08]">
                Your next workflow <br className="hidden sm:inline" />
                starts here.
              </h2>

              <p className="mt-4 max-w-xl text-base sm:text-lg text-neutral-800 font-medium leading-relaxed">
                Unlock instant access to Semrush, Ahrefs, Moz, and Canva with zero setup lag. Pick a duration pass and launch right away.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-black active:scale-[0.98]"
                >
                  Start free trial
                </Link>
                <Link
                  href="/tools"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-900/30 bg-white/60 px-6 py-3.5 text-sm font-semibold text-neutral-900 transition-all duration-200 hover:bg-white active:scale-[0.98]"
                >
                  <span>Browse all tools</span>
                  <MaterialIcon name="arrow_forward" className="text-sm" />
                </Link>
              </div>
            </div>

            {/* 3D Orbit Sphere Motif on the right matching reference image */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative flex h-52 w-52 sm:h-64 sm:w-64 items-center justify-center">
                {/* Outer spinning orbit ring */}
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-neutral-900/25 animate-spin [animation-duration:25s]" />
                
                {/* Secondary inclined gold ring */}
                <div className="absolute h-48 w-48 sm:h-56 sm:w-56 rounded-full border-4 border-neutral-900/40 rotate-45" />

                {/* Central Sphere */}
                <div className="relative flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-yellow-100 shadow-xl ring-4 ring-white">
                  <div className="text-center">
                    <span className="text-4xl sm:text-5xl font-black text-neutral-950">O</span>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-800">Orbyt</div>
                  </div>
                </div>

                {/* Floating particle pills */}
                <div className="absolute top-4 left-0 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-neutral-900 shadow-md border border-neutral-100">
                  <MaterialIcon name="bolt" className="text-xs text-neutral-900" />
                  <span>1.2s Launch</span>
                </div>
                <div className="absolute bottom-4 right-0 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-neutral-900 shadow-md border border-neutral-100">
                  <MaterialIcon name="check_circle" className="text-xs text-emerald-600" />
                  <span>99.8% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
